/**
 * Member 2 — Passenger Ticketing
 * Persistence for tickets and payments. Uses MongoDB Atlas when connected and
 * falls back to an in-memory store otherwise (same pattern as the rest of the
 * backend), so the app keeps working during demos without a database.
 */
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import { PassengerTicketModel } from '../models/PassengerTicket.js';
import { TicketPaymentModel } from '../models/TicketPayment.js';
import { FareCategory, TicketStatus } from './fareRules.js';

export interface PassengerTicket {
  id: string;
  ticketNumber: string;
  passengerId: string;
  passengerName: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  transportType: 'bus' | 'train';
  fromStopId: string;
  fromStop: string;
  fromSequence: number;
  toStopId: string;
  toStop: string;
  toSequence: number;
  fareCategory: FareCategory;
  passengers: number;
  unitFare: number;
  totalFare: number;
  travelDate: string;
  validFrom: string;
  validUntil: string;
  status: TicketStatus;
  paymentId?: string;
  rescheduleCount: number;
  usedAt?: string;
  cancelledAt?: string;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPayment {
  id: string;
  ticketId: string;
  ticketNumber: string;
  passengerId: string;
  amount: number;
  method: 'WALLET' | 'CARD';
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  cardBrand?: string;
  cardLast4?: string;
  transactionRef: string;
  receiptNumber?: string;
  failureReason?: string;
  refundAmount: number;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

type NewTicket = Omit<PassengerTicket, 'id' | 'createdAt' | 'updatedAt'>;
type NewPayment = Omit<TicketPayment, 'id' | 'createdAt' | 'updatedAt'>;

const useMongo = () => mongoose.connection.readyState === 1;

const memTickets = new Map<string, PassengerTicket>();
const memPayments = new Map<string, TicketPayment>();

export function generateTicketNumber(): string {
  // e.g. TP-42-7F3K9Q — short enough to type in the conductor's manual entry
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `TP-${code}`;
}

const nowIso = () => new Date().toISOString();

export const ticketStore = {
  source(): 'mongodb' | 'in-memory' {
    return useMongo() ? 'mongodb' : 'in-memory';
  },

  async createTicket(data: NewTicket): Promise<PassengerTicket> {
    if (useMongo()) {
      const doc = await PassengerTicketModel.create(data);
      return doc.toJSON() as PassengerTicket;
    }
    const ticket: PassengerTicket = { ...data, id: `tkt_${randomUUID()}`, createdAt: nowIso(), updatedAt: nowIso() };
    memTickets.set(ticket.id, ticket);
    return { ...ticket };
  },

  async findTicket(id: string): Promise<PassengerTicket | null> {
    if (useMongo()) {
      const doc = mongoose.isValidObjectId(id)
        ? await PassengerTicketModel.findById(id)
        : await PassengerTicketModel.findOne({ ticketNumber: id.toUpperCase() });
      return doc ? (doc.toJSON() as PassengerTicket) : null;
    }
    const direct = memTickets.get(id);
    if (direct) return { ...direct };
    const byNumber = [...memTickets.values()].find((t) => t.ticketNumber === id.toUpperCase());
    return byNumber ? { ...byNumber } : null;
  },

  async listTickets(passengerId: string): Promise<PassengerTicket[]> {
    if (useMongo()) {
      const docs = await PassengerTicketModel.find({ passengerId }).sort({ travelDate: -1 });
      return docs.map((d: { toJSON: () => unknown }) => d.toJSON() as PassengerTicket);
    }
    return [...memTickets.values()]
      .filter((t) => t.passengerId === passengerId)
      .sort((a, b) => b.travelDate.localeCompare(a.travelDate))
      .map((t) => ({ ...t }));
  },

  async updateTicket(id: string, changes: Partial<PassengerTicket>): Promise<PassengerTicket | null> {
    const clean = { ...changes };
    delete clean.id;
    delete clean.createdAt;
    if (useMongo()) {
      const doc = await PassengerTicketModel.findByIdAndUpdate(id, { $set: clean }, { new: true });
      return doc ? (doc.toJSON() as PassengerTicket) : null;
    }
    const existing = memTickets.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...clean, updatedAt: nowIso() };
    memTickets.set(id, updated);
    return { ...updated };
  },

  async deleteTicket(id: string): Promise<boolean> {
    if (useMongo()) {
      const res = await PassengerTicketModel.findByIdAndDelete(id);
      return !!res;
    }
    return memTickets.delete(id);
  },

  async createPayment(data: NewPayment): Promise<TicketPayment> {
    if (useMongo()) {
      const doc = await TicketPaymentModel.create(data);
      return doc.toJSON() as TicketPayment;
    }
    const payment: TicketPayment = { ...data, id: `pay_${randomUUID()}`, createdAt: nowIso(), updatedAt: nowIso() };
    memPayments.set(payment.id, payment);
    return { ...payment };
  },

  async findPayment(id: string): Promise<TicketPayment | null> {
    if (useMongo()) {
      if (!mongoose.isValidObjectId(id)) return null;
      const doc = await TicketPaymentModel.findById(id);
      return doc ? (doc.toJSON() as TicketPayment) : null;
    }
    const p = memPayments.get(id);
    return p ? { ...p } : null;
  },

  async listPayments(passengerId: string): Promise<TicketPayment[]> {
    if (useMongo()) {
      const docs = await TicketPaymentModel.find({ passengerId }).sort({ createdAt: -1 });
      return docs.map((d: { toJSON: () => unknown }) => d.toJSON() as TicketPayment);
    }
    return [...memPayments.values()]
      .filter((p) => p.passengerId === passengerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => ({ ...p }));
  },

  async updatePayment(id: string, changes: Partial<TicketPayment>): Promise<TicketPayment | null> {
    if (useMongo()) {
      const doc = await TicketPaymentModel.findByIdAndUpdate(id, { $set: changes }, { new: true });
      return doc ? (doc.toJSON() as TicketPayment) : null;
    }
    const existing = memPayments.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...changes, updatedAt: nowIso() };
    memPayments.set(id, updated);
    return { ...updated };
  },
};
