/**
 * Member 2 — Passenger Ticketing (offline demo engine)
 *
 * Used only when the TransitPulse backend cannot be reached (for example
 * during usability testing on a phone without the server running). It follows
 * the same rules as the backend so the screens behave identically, but data
 * lives in memory and is lost when the app restarts.
 */
import {
  CardDetails,
  FareCategory,
  PassengerTicket,
  TicketPayment,
  TicketStatus,
  TicketingRoute,
  UpdateTicketPayload,
  CreateTicketPayload,
} from '@/types/ticketing';
import {
  TERMINAL_STATUSES,
  calculateFare,
  cancellationPreview,
  cardBrand,
  isValidCardNumber,
  isValidExpiry,
  validatePassengers,
  validateTravelDate,
  validityWindow,
} from './fareRules';

export class TicketingError extends Error {
  status: number;
  payment?: TicketPayment;
  constructor(message: string, status = 400, payment?: TicketPayment) {
    super(message);
    this.status = status;
    this.payment = payment;
  }
}

export const OFFLINE_ROUTES: TicketingRoute[] = [
  {
    id: 'route-line-42',
    routeNumber: 'LINE 42',
    name: 'Downtown - Univ Express',
    type: 'bus',
    stops: [
      { id: 'stp-01', name: 'Market St & 4th', sequence: 1 },
      { id: 'stp-02', name: 'Malabe Center', sequence: 2 },
      { id: 'stp-03', name: 'Terminal 6', sequence: 3 },
      { id: 'stp-04', name: 'Tech Campus', sequence: 4 },
    ],
  },
  {
    id: 'route-exp-8',
    routeNumber: 'EXPRESS 8',
    name: 'Harbor Gateway - Airport Fastlink',
    type: 'bus',
    stops: [
      { id: 'stp-e8-1', name: 'Harbor Gateway Station', sequence: 1 },
      { id: 'stp-e8-2', name: 'International Airport T1', sequence: 2 },
    ],
  },
  {
    id: 'route-metro-blue',
    routeNumber: 'METRO BLUE',
    name: 'Coastal Highspeed Light Rail',
    type: 'train',
    stops: [
      { id: 'stp-mb-1', name: 'Fort Central Rail Station', sequence: 1 },
      { id: 'stp-mb-2', name: 'Kollupitiya Junction', sequence: 2 },
      { id: 'stp-mb-3', name: 'Mount Lavinia Coastal', sequence: 3 },
    ],
  },
  {
    id: 'route-jaffna-nallur',
    routeNumber: 'LINE 765',
    name: 'Jaffna - Nallur Express Link',
    type: 'bus',
    stops: [
      { id: 'stp-jn-1', name: 'Jaffna Central Bus Stand', sequence: 1 },
      { id: 'stp-jn-2', name: 'Teaching Hospital Junction', sequence: 2 },
      { id: 'stp-jn-3', name: 'Clock Tower Junction', sequence: 3 },
      { id: 'stp-jn-4', name: 'Nallur Kandaswamy Kovil', sequence: 4 },
    ],
  },
];

type StoredTicket = Omit<PassengerTicket, 'qrPayload' | 'actions' | 'cancellation'>;

const tickets = new Map<string, StoredTicket>();
const payments = new Map<string, TicketPayment>();
let walletBalance = 1500;

const nowIso = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function ticketNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `TP-${code}`;
}

function refresh(t: StoredTicket): StoredTicket {
  if (t.status === 'ACTIVE' && Date.now() > new Date(t.validUntil).getTime()) {
    t.status = 'EXPIRED';
  }
  return t;
}

export function serializeTicket(t: StoredTicket): PassengerTicket {
  const cancellation = cancellationPreview(t);
  return {
    ...t,
    qrPayload: t.ticketNumber,
    cancellation,
    actions: {
      canPay: t.status === 'PENDING_PAYMENT',
      canShowQr: t.status === 'ACTIVE',
      canReschedule:
        t.status === 'PENDING_PAYMENT' ||
        (t.status === 'ACTIVE' && t.rescheduleCount < 2 && Date.now() < new Date(t.validFrom).getTime()),
      canCancel: t.status === 'ACTIVE' && cancellation.allowed,
      canDelete: TERMINAL_STATUSES.includes(t.status as TicketStatus) || t.status === 'PENDING_PAYMENT',
    },
  };
}

function getStored(id: string): StoredTicket {
  const t = tickets.get(id);
  if (!t) throw new TicketingError('Ticket not found.', 404);
  return refresh(t);
}

function quoteFor(route: TicketingRoute, fromSeq: number, toSeq: number, category: FareCategory, passengers: number) {
  return calculateFare({
    transportType: route.type,
    routeNumber: route.routeNumber,
    fromSequence: fromSeq,
    toSequence: toSeq,
    fareCategory: category,
    passengers,
  });
}

export const offlineTicketing = {
  getRoutes: async () => OFFLINE_ROUTES,

  getWallet: async () => walletBalance,

  createTicket: async (p: CreateTicketPayload): Promise<PassengerTicket> => {
    const route = OFFLINE_ROUTES.find((r) => r.id === p.routeId);
    const from = route?.stops.find((s) => s.id === p.fromStopId);
    const to = route?.stops.find((s) => s.id === p.toStopId);
    if (!route || !from || !to) throw new TicketingError('Boarding and destination stops must belong to the selected route.');
    if (from.id === to.id) throw new TicketingError('Boarding and destination stops must be different.');
    const pErr = validatePassengers(p.passengers);
    if (pErr) throw new TicketingError(pErr);
    const dErr = validateTravelDate(p.travelDate);
    if (dErr) throw new TicketingError(dErr);

    const q = quoteFor(route, from.sequence, to.sequence, p.fareCategory, p.passengers);
    const travelDate = new Date(p.travelDate).toISOString();
    const t: StoredTicket = {
      id: uid('tkt'),
      ticketNumber: ticketNumber(),
      passengerId: p.passengerId,
      passengerName: p.passengerName,
      routeId: route.id,
      routeNumber: route.routeNumber,
      routeName: route.name,
      transportType: route.type,
      fromStopId: from.id,
      fromStop: from.name,
      fromSequence: from.sequence,
      toStopId: to.id,
      toStop: to.name,
      toSequence: to.sequence,
      fareCategory: p.fareCategory,
      passengers: p.passengers,
      unitFare: q.unitFare,
      totalFare: q.totalFare,
      travelDate,
      ...validityWindow(travelDate),
      status: 'PENDING_PAYMENT',
      rescheduleCount: 0,
      refundAmount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    tickets.set(t.id, t);
    return serializeTicket(t);
  },

  listTickets: async (passengerId: string, view: 'active' | 'history' | 'all') => {
    const list = [...tickets.values()].filter((t) => t.passengerId === passengerId).map(refresh);
    const filtered = list.filter((t) => {
      if (view === 'active') return t.status === 'ACTIVE' || t.status === 'PENDING_PAYMENT';
      if (view === 'history') return TERMINAL_STATUSES.includes(t.status as TicketStatus);
      return true;
    });
    filtered.sort((a, b) =>
      view === 'active' ? a.travelDate.localeCompare(b.travelDate) : b.travelDate.localeCompare(a.travelDate)
    );
    return filtered.map(serializeTicket);
  },

  getTicket: async (id: string) => {
    const t = getStored(id);
    return { ticket: serializeTicket(t), payment: t.paymentId ? payments.get(t.paymentId) || null : null };
  },

  updateTicket: async (id: string, u: UpdateTicketPayload) => {
    const t = getStored(id);
    if (t.status !== 'ACTIVE' && t.status !== 'PENDING_PAYMENT') throw new TicketingError('This ticket cannot be changed.', 409);
    if (t.status === 'ACTIVE') {
      if (u.passengers !== undefined || u.fareCategory !== undefined) {
        throw new TicketingError('Paid tickets can only be rescheduled. Cancel and rebook to change passengers or fare type.');
      }
      if (t.rescheduleCount >= 2) throw new TicketingError('A ticket can be rescheduled at most 2 times.', 409);
      if (Date.now() >= new Date(t.validFrom).getTime()) {
        throw new TicketingError('The travel window has started — this ticket can no longer be rescheduled.', 409);
      }
    }
    if (u.travelDate !== undefined) {
      const dErr = validateTravelDate(u.travelDate);
      if (dErr) throw new TicketingError(dErr);
      const iso = new Date(u.travelDate).toISOString();
      Object.assign(t, { travelDate: iso, ...validityWindow(iso) });
      if (t.status === 'ACTIVE') t.rescheduleCount += 1;
    }
    if (t.status === 'PENDING_PAYMENT' && (u.passengers !== undefined || u.fareCategory !== undefined)) {
      const passengers = u.passengers ?? t.passengers;
      const pErr = validatePassengers(passengers);
      if (pErr) throw new TicketingError(pErr);
      const route = OFFLINE_ROUTES.find((r) => r.id === t.routeId)!;
      const category = u.fareCategory ?? t.fareCategory;
      const q = quoteFor(route, t.fromSequence, t.toSequence, category, passengers);
      Object.assign(t, { passengers, fareCategory: category, unitFare: q.unitFare, totalFare: q.totalFare });
    }
    t.updatedAt = nowIso();
    return serializeTicket(t);
  },

  deleteTicket: async (id: string) => {
    const t = getStored(id);
    if (t.status === 'ACTIVE') throw new TicketingError('Active tickets cannot be deleted. Cancel the ticket first.', 409);
    tickets.delete(id);
    return t.status === 'PENDING_PAYMENT' ? 'Unpaid booking discarded.' : 'Ticket removed from history.';
  },

  pay: async (id: string, method: 'WALLET' | 'CARD', card?: CardDetails) => {
    const t = getStored(id);
    if (t.status !== 'PENDING_PAYMENT') throw new TicketingError('This ticket has already been paid.', 409);
    let cardInfo: { cardBrand?: string; cardLast4?: string } = {};
    let failureReason: string | null = null;
    if (method === 'CARD') {
      const number = (card?.number || '').replace(/\s+/g, '');
      if (!card?.holderName.trim()) throw new TicketingError('Cardholder name is required.');
      if (!isValidCardNumber(number)) throw new TicketingError('Card number is not valid.');
      if (!isValidExpiry(card.expiry)) throw new TicketingError('Card expiry must be a future date in MM/YY format.');
      if (!/^\d{3,4}$/.test(card.cvv)) throw new TicketingError('CVV must be 3 or 4 digits.');
      cardInfo = { cardBrand: cardBrand(number), cardLast4: number.slice(-4) };
      if (number.endsWith('0002')) failureReason = 'Card declined by the issuing bank.';
    } else if (walletBalance < t.totalFare) {
      failureReason = `Insufficient MetroPay balance (Rs. ${walletBalance.toFixed(2)} available).`;
    }
    const payment: TicketPayment = {
      id: uid('pay'),
      ticketId: t.id,
      ticketNumber: t.ticketNumber,
      passengerId: t.passengerId,
      amount: t.totalFare,
      method,
      status: failureReason ? 'FAILED' : 'SUCCESS',
      ...cardInfo,
      transactionRef: `TXN-${Date.now()}`,
      receiptNumber: failureReason ? undefined : `RCPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      failureReason: failureReason || undefined,
      refundAmount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    payments.set(payment.id, payment);
    if (failureReason) throw new TicketingError(failureReason, 402, payment);
    if (method === 'WALLET') walletBalance -= t.totalFare;
    Object.assign(t, { status: 'ACTIVE', paymentId: payment.id, updatedAt: nowIso() });
    return { ticket: serializeTicket(t), payment };
  },

  cancel: async (id: string) => {
    const t = getStored(id);
    if (t.status !== 'ACTIVE') throw new TicketingError('Only active, unused tickets can be cancelled.', 409);
    const preview = cancellationPreview(t);
    const payment = t.paymentId ? payments.get(t.paymentId) : undefined;
    if (payment && preview.refundAmount > 0) {
      if (payment.method === 'WALLET') walletBalance += preview.refundAmount;
      Object.assign(payment, { status: 'REFUNDED', refundAmount: preview.refundAmount, refundedAt: nowIso() });
    }
    Object.assign(t, { status: 'CANCELLED', cancelledAt: nowIso(), refundAmount: preview.refundAmount, updatedAt: nowIso() });
    return { ticket: serializeTicket(t), refund: preview };
  },

  listPayments: async (passengerId: string) =>
    [...payments.values()]
      .filter((p) => p.passengerId === passengerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  getPayment: async (id: string) => {
    const p = payments.get(id);
    if (!p) throw new TicketingError('Payment not found.', 404);
    const t = tickets.get(p.ticketId);
    return { payment: p, ticket: t ? serializeTicket(t) : null };
  },
};
