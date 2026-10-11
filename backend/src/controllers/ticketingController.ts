/**
 * Member 2 — Passenger Ticketing controller
 *
 * CRUD for passenger tickets plus payments:
 *   C  POST   /api/ticketing/tickets            book a ticket (pending payment)
 *   R  GET    /api/ticketing/tickets            list a passenger's tickets
 *   R  GET    /api/ticketing/tickets/:id        ticket details / QR pass
 *   U  PATCH  /api/ticketing/tickets/:id        reschedule / change booking
 *   D  DELETE /api/ticketing/tickets/:id        discard draft or remove from history
 *      POST   /api/ticketing/tickets/:id/pay    pay with MetroPay wallet or card
 *      POST   /api/ticketing/tickets/:id/cancel cancel with refund
 *
 * Paid tickets are also registered with the conductor scanner registry
 * (db.issueTicket) so Member 3's QR scanner can validate them.
 */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { db } from '../db/database.js';
import { PassengerModel } from '../models/Passenger.js';
import {
  FARE_CATEGORIES,
  FareCategory,
  TERMINAL_STATUSES,
  calculateFare,
  cancellationPreview,
  cardBrand,
  categoryFromConcession,
  isValidCardNumber,
  isValidExpiry,
  validatePassengers,
  validateTravelDate,
  validityWindow,
} from '../ticketing/fareRules.js';
import { PassengerTicket, generateTicketNumber, ticketStore } from '../ticketing/ticketStore.js';

const MAX_RESCHEDULES = 2;
/** Test card that always gets declined, so the failure path can be demonstrated. */
const DECLINED_TEST_CARD_SUFFIX = '0002';

type Req = Request<Record<string, string>>;

function fail(res: Response, status: number, error: string, extra: Record<string, unknown> = {}) {
  return res.status(status).json({ success: false, error, ...extra });
}

function findRouteAndStops(routeId: string, fromStopId: string, toStopId: string) {
  const route = db.getRouteById(routeId);
  if (!route) return { error: 'Selected route was not found.' } as const;
  const from = route.stops.find((s) => s.id === fromStopId);
  const to = route.stops.find((s) => s.id === toStopId);
  if (!from || !to) return { error: 'Boarding and destination stops must belong to the selected route.' } as const;
  if (from.id === to.id) return { error: 'Boarding and destination stops must be different.' } as const;
  return { route, from, to } as const;
}

function parseCategory(value: unknown, fallback: FareCategory = 'ADULT'): FareCategory | null {
  if (value === undefined || value === null || value === '') return fallback;
  const v = String(value).toUpperCase() as FareCategory;
  return FARE_CATEGORIES.includes(v) ? v : null;
}

/** Keeps the ticket status in line with the scanner registry and the clock. */
async function refreshStatus(ticket: PassengerTicket): Promise<PassengerTicket> {
  if (ticket.status !== 'ACTIVE') return ticket;
  const registry = db.lookupTicketPreview(ticket.ticketNumber);
  if (registry?.status === 'USED') {
    const usedAt = registry.usedAt ? new Date(registry.usedAt).toISOString() : new Date().toISOString();
    return (await ticketStore.updateTicket(ticket.id, { status: 'USED', usedAt })) || ticket;
  }
  if (Date.now() > new Date(ticket.validUntil).getTime()) {
    return (await ticketStore.updateTicket(ticket.id, { status: 'EXPIRED' })) || ticket;
  }
  return ticket;
}

function serialize(ticket: PassengerTicket) {
  const cancellation = cancellationPreview(ticket);
  const isTerminal = TERMINAL_STATUSES.includes(ticket.status);
  return {
    ...ticket,
    qrPayload: ticket.ticketNumber,
    actions: {
      canPay: ticket.status === 'PENDING_PAYMENT',
      canShowQr: ticket.status === 'ACTIVE',
      canReschedule:
        ticket.status === 'PENDING_PAYMENT' ||
        (ticket.status === 'ACTIVE' &&
          ticket.rescheduleCount < MAX_RESCHEDULES &&
          Date.now() < new Date(ticket.validFrom).getTime()),
      canCancel: ticket.status === 'ACTIVE' && cancellation.allowed,
      canDelete: isTerminal || ticket.status === 'PENDING_PAYMENT',
    },
    cancellation,
  };
}

async function findPassengerWallet(passengerId: string) {
  const memory = db.findPassengerById(passengerId);
  if (memory) return { balance: memory.metroPayBalance || 0, memory };
  if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(passengerId)) {
    const doc = await PassengerModel.findById(passengerId);
    if (doc) return { balance: Number(doc.metroPayBalance) || 0, memory: null };
  }
  return null;
}

async function adjustWallet(passengerId: string, delta: number) {
  const memory = db.findPassengerById(passengerId);
  if (memory) memory.metroPayBalance = Math.max(0, (memory.metroPayBalance || 0) + delta);
  if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(passengerId)) {
    await PassengerModel.findByIdAndUpdate(passengerId, { $inc: { metroPayBalance: delta } });
  }
}

export const ticketingController = {
  // GET /api/ticketing/routes — routes and their stops for the booking form
  async getRoutes(_req: Req, res: Response) {
    const routes = db.getRoutes().map((r) => ({
      id: r.id,
      routeNumber: r.routeNumber,
      name: r.name,
      type: r.type === 'train' ? 'train' : 'bus',
      stops: [...r.stops]
        .sort((a, b) => a.sequence - b.sequence)
        .map((s) => ({ id: s.id, name: s.name, sequence: s.sequence })),
    }));
    res.json({ success: true, count: routes.length, routes });
  },

  // POST /api/ticketing/quote — fare breakdown before booking
  async quote(req: Req, res: Response) {
    const { routeId, fromStopId, toStopId, passengers = 1 } = req.body || {};
    const category = parseCategory(req.body?.fareCategory);
    if (!category) return fail(res, 400, 'Unknown fare category.');
    const passengerError = validatePassengers(passengers);
    if (passengerError) return fail(res, 400, passengerError);
    const found = findRouteAndStops(String(routeId || ''), String(fromStopId || ''), String(toStopId || ''));
    if ('error' in found) return fail(res, 400, found.error as string);

    const quote = calculateFare({
      transportType: found.route.type === 'train' ? 'train' : 'bus',
      routeNumber: found.route.routeNumber,
      fromSequence: found.from.sequence,
      toSequence: found.to.sequence,
      fareCategory: category,
      passengers: Number(passengers),
    });
    return res.json({ success: true, quote });
  },

  // C — POST /api/ticketing/tickets
  async createTicket(req: Req, res: Response) {
    try {
      const { passengerId, passengerName, routeId, fromStopId, toStopId, travelDate, passengers = 1 } = req.body || {};
      if (!passengerId) return fail(res, 400, 'Passenger ID is required.');

      const memoryPassenger = db.findPassengerById(String(passengerId));
      const category = parseCategory(
        req.body?.fareCategory,
        categoryFromConcession(memoryPassenger?.concessionType)
      );
      if (!category) return fail(res, 400, 'Unknown fare category.');

      const passengerError = validatePassengers(passengers);
      if (passengerError) return fail(res, 400, passengerError);
      const dateError = validateTravelDate(travelDate);
      if (dateError) return fail(res, 400, dateError);

      const found = findRouteAndStops(String(routeId || ''), String(fromStopId || ''), String(toStopId || ''));
      if ('error' in found) return fail(res, 400, found.error as string);
      const { route, from, to } = found;

      const quote = calculateFare({
        transportType: route.type === 'train' ? 'train' : 'bus',
        routeNumber: route.routeNumber,
        fromSequence: from.sequence,
        toSequence: to.sequence,
        fareCategory: category,
        passengers: Number(passengers),
      });
      const travelIso = new Date(String(travelDate)).toISOString();

      const ticket = await ticketStore.createTicket({
        ticketNumber: generateTicketNumber(),
        passengerId: String(passengerId),
        passengerName: String(passengerName || memoryPassenger?.name || 'TransitPulse Passenger').trim(),
        routeId: route.id,
        routeNumber: route.routeNumber,
        routeName: route.name,
        transportType: route.type === 'train' ? 'train' : 'bus',
        fromStopId: from.id,
        fromStop: from.name,
        fromSequence: from.sequence,
        toStopId: to.id,
        toStop: to.name,
        toSequence: to.sequence,
        fareCategory: category,
        passengers: Number(passengers),
        unitFare: quote.unitFare,
        totalFare: quote.totalFare,
        travelDate: travelIso,
        ...validityWindow(travelIso),
        status: 'PENDING_PAYMENT',
        rescheduleCount: 0,
        refundAmount: 0,
      });

      return res.status(201).json({
        success: true,
        message: 'Ticket reserved. Complete payment to activate it.',
        source: ticketStore.source(),
        data: serialize(ticket),
        quote,
      });
    } catch (error) {
      return fail(res, 500, error instanceof Error ? error.message : 'Failed to create ticket.');
    }
  },

  // R — GET /api/ticketing/tickets?passengerId=...&view=active|history
  async listTickets(req: Req, res: Response) {
    try {
      const passengerId = String(req.query.passengerId || '');
      if (!passengerId) return fail(res, 400, 'passengerId query parameter is required.');
      const view = String(req.query.view || 'all');

      const tickets = await Promise.all((await ticketStore.listTickets(passengerId)).map(refreshStatus));
      const filtered = tickets.filter((t) => {
        if (view === 'active') return t.status === 'ACTIVE' || t.status === 'PENDING_PAYMENT';
        if (view === 'history') return TERMINAL_STATUSES.includes(t.status);
        return true;
      });
      if (view === 'active') filtered.sort((a, b) => a.travelDate.localeCompare(b.travelDate));

      return res.json({ success: true, source: ticketStore.source(), count: filtered.length, data: filtered.map(serialize) });
    } catch (error) {
      return fail(res, 500, error instanceof Error ? error.message : 'Failed to load tickets.');
    }
  },

  // R — GET /api/ticketing/tickets/:id
  async getTicket(req: Req, res: Response) {
    try {
      const ticket = await ticketStore.findTicket(req.params.id);
      if (!ticket) return fail(res, 404, 'Ticket not found.');
      const fresh = await refreshStatus(ticket);
      const payment = fresh.paymentId ? await ticketStore.findPayment(fresh.paymentId) : null;
      return res.json({ success: true, data: serialize(fresh), payment });
    } catch (error) {
      return fail(res, 500, error instanceof Error ? error.message : 'Failed to load ticket.');
    }
  },

  // U — PATCH /api/ticketing/tickets/:id
  async updateTicket(req: Req, res: Response) {
    try {
      const existing = await ticketStore.findTicket(req.params.id);
      if (!existing) return fail(res, 404, 'Ticket not found.');
      const ticket = await refreshStatus(existing);
      const { travelDate, passengers, fareCategory } = req.body || {};

      if (ticket.status !== 'ACTIVE' && ticket.status !== 'PENDING_PAYMENT') {
        return fail(res, 409, `A ${ticket.status.toLowerCase().replace('_', ' ')} ticket cannot be changed.`);
      }
      if (travelDate === undefined && passengers === undefined && fareCategory === undefined) {
        return fail(res, 400, 'Nothing to update. Provide travelDate, passengers or fareCategory.');
      }

      const changes: Partial<PassengerTicket> = {};

      if (ticket.status === 'ACTIVE') {
        if (passengers !== undefined || fareCategory !== undefined) {
          return fail(res, 400, 'Paid tickets can only be rescheduled. Cancel and rebook to change passengers or fare type.');
        }
        if (ticket.rescheduleCount >= MAX_RESCHEDULES) {
          return fail(res, 409, `A ticket can be rescheduled at most ${MAX_RESCHEDULES} times.`);
        }
        if (Date.now() >= new Date(ticket.validFrom).getTime()) {
          return fail(res, 409, 'The travel window has started — this ticket can no longer be rescheduled.');
        }
      }

      if (travelDate !== undefined) {
        const dateError = validateTravelDate(travelDate);
        if (dateError) return fail(res, 400, dateError);
        const iso = new Date(String(travelDate)).toISOString();
        Object.assign(changes, { travelDate: iso, ...validityWindow(iso) });
        if (ticket.status === 'ACTIVE') changes.rescheduleCount = ticket.rescheduleCount + 1;
      }

      if (ticket.status === 'PENDING_PAYMENT' && (passengers !== undefined || fareCategory !== undefined)) {
        const nextPassengers = passengers !== undefined ? Number(passengers) : ticket.passengers;
        const passengerError = validatePassengers(nextPassengers);
        if (passengerError) return fail(res, 400, passengerError);
        const nextCategory = parseCategory(fareCategory, ticket.fareCategory);
        if (!nextCategory) return fail(res, 400, 'Unknown fare category.');
        const quote = calculateFare({
          transportType: ticket.transportType,
          routeNumber: ticket.routeNumber,
          fromSequence: ticket.fromSequence,
          toSequence: ticket.toSequence,
          fareCategory: nextCategory,
          passengers: nextPassengers,
        });
        Object.assign(changes, {
          passengers: nextPassengers,
          fareCategory: nextCategory,
          unitFare: quote.unitFare,
          totalFare: quote.totalFare,
        });
      }

      const updated = await ticketStore.updateTicket(ticket.id, changes);
      if (!updated) return fail(res, 404, 'Ticket not found.');

      // Keep the conductor scanner registry in sync with the new validity window
      const registry = db.lookupTicketPreview(updated.ticketNumber);
      if (registry) registry.expiresAt = new Date(updated.validUntil).getTime();

      return res.json({
        success: true,
        message: ticket.status === 'ACTIVE' ? 'Ticket rescheduled.' : 'Booking updated.',
        data: serialize(updated),
      });
    } catch (error) {
      return fail(res, 500, error instanceof Error ? error.message : 'Failed to update ticket.');
    }
  },

  // D — DELETE /api/ticketing/tickets/:id
  async deleteTicket(req: Req, res: Response) {
    try {
      const existing = await ticketStore.findTicket(req.params.id);
      if (!existing) return fail(res, 404, 'Ticket not found.');
      const ticket = await refreshStatus(existing);
      if (ticket.status === 'ACTIVE') {
        return fail(res, 409, 'Active tickets cannot be deleted. Cancel the ticket first.');
      }
      await ticketStore.deleteTicket(ticket.id);
      return res.json({
        success: true,
        message: ticket.status === 'PENDING_PAYMENT' ? 'Unpaid booking discarded.' : 'Ticket removed from history.',
        deletedId: ticket.id,
      });
    } catch (error) {
      return fail(res, 500, error instanceof Error ? error.message : 'Failed to delete ticket.');
    }
  },

  // POST /api/ticketing/tickets/:id/pay  { method: 'WALLET' | 'CARD', card?: { number, expiry, cvv, holderName } }
  async payForTicket(req: Req, res: Response) {
    try {
      const ticket = await ticketStore.findTicket(req.params.id);
      if (!ticket) return fail(res, 404, 'Ticket not found.');
      if (ticket.status !== 'PENDING_PAYMENT') return fail(res, 409, 'This ticket has already been paid.');
      if (validateTravelDate(ticket.travelDate)) {
        return fail(res, 409, 'The travel time for this booking has passed. Please edit the date before paying.');
      }

      const method = String(req.body?.method || '').toUpperCase();
      if (method !== 'WALLET' && method !== 'CARD') return fail(res, 400, 'Payment method must be WALLET or CARD.');

      const base = {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        passengerId: ticket.passengerId,
        amount: ticket.totalFare,
        method: method as 'WALLET' | 'CARD',
        transactionRef: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        refundAmount: 0,
      };

      let cardInfo: { cardBrand?: string; cardLast4?: string } = {};
      let failureReason: string | null = null;

      if (method === 'CARD') {
        const card = req.body?.card || {};
        const number = String(card.number || '').replace(/\s+/g, '');
        if (!String(card.holderName || '').trim()) return fail(res, 400, 'Cardholder name is required.');
        if (!isValidCardNumber(number)) return fail(res, 400, 'Card number is not valid.');
        if (!isValidExpiry(String(card.expiry || ''))) return fail(res, 400, 'Card expiry must be a future date in MM/YY format.');
        if (!/^\d{3,4}$/.test(String(card.cvv || ''))) return fail(res, 400, 'CVV must be 3 or 4 digits.');
        cardInfo = { cardBrand: cardBrand(number), cardLast4: number.slice(-4) };
        if (number.endsWith(DECLINED_TEST_CARD_SUFFIX)) failureReason = 'Card declined by the issuing bank.';
      } else {
        const wallet = await findPassengerWallet(ticket.passengerId);
        if (!wallet) failureReason = 'MetroPay wallet not found for this account.';
        else if (wallet.balance < ticket.totalFare) {
          failureReason = `Insufficient MetroPay balance (Rs. ${wallet.balance.toFixed(2)} available).`;
        }
      }

      if (failureReason) {
        const failed = await ticketStore.createPayment({ ...base, ...cardInfo, status: 'FAILED', failureReason });
        return fail(res, 402, failureReason, { payment: failed, data: serialize(ticket) });
      }

      if (method === 'WALLET') await adjustWallet(ticket.passengerId, -ticket.totalFare);

      const payment = await ticketStore.createPayment({
        ...base,
        ...cardInfo,
        status: 'SUCCESS',
        receiptNumber: `RCPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      const activated = await ticketStore.updateTicket(ticket.id, { status: 'ACTIVE', paymentId: payment.id });
      if (!activated) return fail(res, 404, 'Ticket not found.');

      // Register with the conductor scanner registry (Member 3) so the QR validates on board
      db.issueTicket({
        ticketId: activated.ticketNumber,
        type: `Digital ${activated.fareCategory.charAt(0)}${activated.fareCategory.slice(1).toLowerCase()} x${activated.passengers}`,
        routeId: activated.routeNumber,
        fareAmount: activated.totalFare,
        passengerName: activated.passengerName,
        expiresAt: new Date(activated.validUntil).getTime(),
        originStop: activated.fromStop,
        destinationStop: activated.toStop,
        paymentMethod: method === 'WALLET' ? 'MetroPay Wallet' : `${cardInfo.cardBrand} •••• ${cardInfo.cardLast4}`,
      });

      return res.json({
        success: true,
        message: 'Payment successful. Your QR ticket is ready.',
        data: serialize(activated),
        payment,
      });
    } catch (error) {
      return fail(res, 500, error instanceof Error ? error.message : 'Payment failed.');
    }
  },

  // GET /api/ticketing/tickets/:id/cancellation-preview
  async cancellationPreview(req: Req, res: Response) {
    const existing = await ticketStore.findTicket(req.params.id);
    if (!existing) return fail(res, 404, 'Ticket not found.');
    const ticket = await refreshStatus(existing);
    return res.json({ success: true, data: cancellationPreview(ticket) });
  },

  // POST /api/ticketing/tickets/:id/cancel
  async cancelTicket(req: Req, res: Response) {
    try {
      const existing = await ticketStore.findTicket(req.params.id);
      if (!existing) return fail(res, 404, 'Ticket not found.');
      const ticket = await refreshStatus(existing);
      if (ticket.status !== 'ACTIVE') {
        return fail(res, 409, ticket.status === 'PENDING_PAYMENT'
          ? 'Unpaid bookings are discarded, not cancelled.'
          : 'Only active, unused tickets can be cancelled.');
      }
      const preview = cancellationPreview(ticket);

      let payment = ticket.paymentId ? await ticketStore.findPayment(ticket.paymentId) : null;
      if (payment && preview.refundAmount > 0) {
        if (payment.method === 'WALLET') await adjustWallet(ticket.passengerId, preview.refundAmount);
        payment = await ticketStore.updatePayment(payment.id, {
          status: 'REFUNDED',
          refundAmount: preview.refundAmount,
          refundedAt: new Date().toISOString(),
        });
      }

      const cancelled = await ticketStore.updateTicket(ticket.id, {
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
        refundAmount: preview.refundAmount,
      });

      // Make sure the conductor scanner rejects the cancelled QR
      const registry = db.lookupTicketPreview(ticket.ticketNumber);
      if (registry) registry.status = 'EXPIRED';

      return res.json({
        success: true,
        message: preview.refundAmount > 0
          ? `Ticket cancelled. Rs. ${preview.refundAmount.toFixed(2)} will be refunded.`
          : 'Ticket cancelled. No refund applies.',
        data: cancelled ? serialize(cancelled) : null,
        refund: preview,
        payment,
      });
    } catch (error) {
      return fail(res, 500, error instanceof Error ? error.message : 'Failed to cancel ticket.');
    }
  },

  // GET /api/ticketing/payments?passengerId=...
  async listPayments(req: Req, res: Response) {
    const passengerId = String(req.query.passengerId || '');
    if (!passengerId) return fail(res, 400, 'passengerId query parameter is required.');
    const payments = await ticketStore.listPayments(passengerId);
    const totalSpent = payments
      .filter((p) => p.status !== 'FAILED')
      .reduce((sum, p) => sum + p.amount - (p.refundAmount || 0), 0);
    return res.json({ success: true, count: payments.length, totalSpent, data: payments });
  },

  // GET /api/ticketing/payments/:id — receipt
  async getPayment(req: Req, res: Response) {
    const payment = await ticketStore.findPayment(req.params.id);
    if (!payment) return fail(res, 404, 'Payment not found.');
    const ticket = await ticketStore.findTicket(payment.ticketId);
    return res.json({ success: true, data: payment, ticket: ticket ? serialize(ticket) : null });
  },

  // GET /api/ticketing/wallet/:passengerId
  async getWallet(req: Req, res: Response) {
    const wallet = await findPassengerWallet(req.params.passengerId);
    if (!wallet) return fail(res, 404, 'Wallet not found.');
    return res.json({ success: true, balance: wallet.balance });
  },
};
