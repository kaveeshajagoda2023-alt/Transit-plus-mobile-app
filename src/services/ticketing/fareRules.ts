// Mirror of backend/src/ticketing/fareRules.ts — used for live fare previews and offline demo mode.
// Keep both files in sync when fare rules change.
/**
 * Member 2 — Passenger Ticketing
 * Fare, validity and refund rules kept in one place so the API, the
 * refund preview and the automated tests always agree.
 */

export type FareCategory = 'ADULT' | 'STUDENT' | 'SENIOR' | 'CHILD';
export type TicketStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';

export const FARE_CATEGORIES: FareCategory[] = ['ADULT', 'STUDENT', 'SENIOR', 'CHILD'];
export const TERMINAL_STATUSES: TicketStatus[] = ['USED', 'EXPIRED', 'CANCELLED'];

export const MAX_PASSENGERS = 10;
export const MAX_DAYS_AHEAD = 30;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** QR is accepted from 30 minutes before the planned departure ... */
export const BOARDING_WINDOW_BEFORE_MS = 30 * MINUTE;
/** ... until 3 hours after it. */
export const VALID_AFTER_DEPARTURE_MS = 3 * HOUR;
/** Cancelling more than 2 hours before the window opens gives a full refund. */
export const FULL_REFUND_NOTICE_MS = 2 * HOUR;

const BASE_FARE = { bus: 40, train: 60 } as const;
const PER_STOP_FARE = { bus: 30, train: 45 } as const;
const EXPRESS_MULTIPLIER = 1.5;
const MIN_UNIT_FARE = 20;

export const CATEGORY_DISCOUNT: Record<FareCategory, number> = {
  ADULT: 0,
  STUDENT: 50,
  SENIOR: 50,
  CHILD: 50,
};

/** Maps the account concession type (from registration) to a default fare category. */
export function categoryFromConcession(concession?: string): FareCategory {
  if (concession === 'STUDENT_YOUTH') return 'STUDENT';
  if (concession === 'SENIOR_CONCESSION') return 'SENIOR';
  return 'ADULT';
}

export interface FareInput {
  transportType: 'bus' | 'train';
  routeNumber: string;
  fromSequence: number;
  toSequence: number;
  fareCategory: FareCategory;
  passengers: number;
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

export function calculateFare(input: FareInput): FareQuote {
  const type = input.transportType === 'train' ? 'train' : 'bus';
  const stopsTravelled = Math.abs(input.toSequence - input.fromSequence);
  const isExpress = /express/i.test(input.routeNumber);
  const multiplier = isExpress ? EXPRESS_MULTIPLIER : 1;
  const discount = CATEGORY_DISCOUNT[input.fareCategory] ?? 0;

  const gross = (BASE_FARE[type] + PER_STOP_FARE[type] * stopsTravelled) * multiplier;
  const unitFare = Math.max(MIN_UNIT_FARE, Math.round(gross * (1 - discount / 100)));

  return {
    stopsTravelled,
    baseFare: BASE_FARE[type],
    perStopFare: PER_STOP_FARE[type],
    expressMultiplier: multiplier,
    discountPercent: discount,
    unitFare,
    passengers: input.passengers,
    totalFare: unitFare * input.passengers,
    currency: 'LKR',
  };
}

export function validityWindow(travelDate: Date | string) {
  const departure = new Date(travelDate).getTime();
  return {
    validFrom: new Date(departure - BOARDING_WINDOW_BEFORE_MS).toISOString(),
    validUntil: new Date(departure + VALID_AFTER_DEPARTURE_MS).toISOString(),
  };
}

/** Returns an error message, or null when the travel date is acceptable. */
export function validateTravelDate(travelDate: unknown, now = new Date()): string | null {
  if (!travelDate) return 'Travel date and time is required.';
  const d = new Date(String(travelDate));
  if (isNaN(d.getTime())) return 'Travel date is not a valid date.';
  if (d.getTime() < now.getTime() - 5 * MINUTE) return 'Travel date cannot be in the past.';
  if (d.getTime() > now.getTime() + MAX_DAYS_AHEAD * 24 * HOUR) {
    return `Tickets can be booked at most ${MAX_DAYS_AHEAD} days ahead.`;
  }
  return null;
}

export function validatePassengers(value: unknown): string | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > MAX_PASSENGERS) {
    return `Number of passengers must be between 1 and ${MAX_PASSENGERS}.`;
  }
  return null;
}

export interface CancellationPreview {
  allowed: boolean;
  refundPercent: number;
  refundAmount: number;
  reason: string;
}

interface CancellableTicket {
  status: TicketStatus;
  validFrom: string;
  totalFare: number;
}

/** Refund policy: 100% if > 2 h before validFrom, 50% if less, 0% once the window has started. */
export function cancellationPreview(ticket: CancellableTicket, now = new Date()): CancellationPreview {
  if (ticket.status === 'PENDING_PAYMENT') {
    return { allowed: true, refundPercent: 0, refundAmount: 0, reason: 'Not paid yet — nothing to refund.' };
  }
  if (ticket.status !== 'ACTIVE') {
    return { allowed: false, refundPercent: 0, refundAmount: 0, reason: 'Only active, unused tickets can be cancelled.' };
  }
  const msBeforeStart = new Date(ticket.validFrom).getTime() - now.getTime();
  let refundPercent = 0;
  let reason = 'The travel window has already started — no refund.';
  if (msBeforeStart > FULL_REFUND_NOTICE_MS) {
    refundPercent = 100;
    reason = 'More than 2 hours before the ticket becomes valid — full refund.';
  } else if (msBeforeStart > 0) {
    refundPercent = 50;
    reason = 'Less than 2 hours before the ticket becomes valid — 50% refund.';
  }
  return {
    allowed: true,
    refundPercent,
    refundAmount: Math.round((ticket.totalFare * refundPercent) / 100),
    reason,
  };
}

/** Luhn checksum used to reject mistyped card numbers before "charging". */
export function isValidCardNumber(raw: string): boolean {
  const digits = raw.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function cardBrand(raw: string): string {
  const d = raw.replace(/\s+/g, '');
  if (/^4/.test(d)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'MASTERCARD';
  if (/^3[47]/.test(d)) return 'AMEX';
  return 'CARD';
}

/** Expiry in MM/YY; returns true when the card has not expired. */
export function isValidExpiry(expiry: string, now = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const endOfMonth = new Date(year, month, 1).getTime();
  return endOfMonth > now.getTime();
}
