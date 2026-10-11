/** Member 2 — Passenger Ticketing shared types */

export type FareCategory = 'ADULT' | 'STUDENT' | 'SENIOR' | 'CHILD';
export type TicketStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
export type PaymentMethod = 'WALLET' | 'CARD';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface TicketingStop {
  id: string;
  name: string;
  sequence: number;
}

export interface TicketingRoute {
  id: string;
  routeNumber: string;
  name: string;
  type: 'bus' | 'train';
  stops: TicketingStop[];
}

export interface FareQuote {
  stopsTravelled: number;
  baseFare: number;
  perStopFare: number;
  expressMultiplier: number;
  discountPercent: number;
  unitFare: number;
  passengers: number;
  totalFare: number;
  currency: 'LKR';
}

export interface CancellationPreview {
  allowed: boolean;
  refundPercent: number;
  refundAmount: number;
  reason: string;
}

export interface TicketActions {
  canPay: boolean;
  canShowQr: boolean;
  canReschedule: boolean;
  canCancel: boolean;
  canDelete: boolean;
}

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
  qrPayload: string;
  actions: TicketActions;
  cancellation: CancellationPreview;
}

export interface TicketPayment {
  id: string;
  ticketId: string;
  ticketNumber: string;
  passengerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
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

export interface CardDetails {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}

export interface CreateTicketPayload {
  passengerId: string;
  passengerName: string;
  routeId: string;
  fromStopId: string;
  toStopId: string;
  fareCategory: FareCategory;
  passengers: number;
  travelDate: string;
}

export interface UpdateTicketPayload {
  travelDate?: string;
  passengers?: number;
  fareCategory?: FareCategory;
}

export const FARE_CATEGORY_LABELS: Record<FareCategory, string> = {
  ADULT: 'Adult',
  STUDENT: 'Student',
  SENIOR: 'Senior',
  CHILD: 'Child',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  ACTIVE: 'Active',
  USED: 'Used',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};
