// Business rules for ticket validity, editing and cancellation.
// Kept in one place so the API, the refund preview and the tests agree.
const { TERMINAL_STATUSES } = require('../models/Ticket');

const HOUR = 60 * 60 * 1000;
const BOARDING_WINDOW_BEFORE_MS = 30 * 60 * 1000; // QR accepted from 30 min before departure
const VALID_AFTER_DEPARTURE_MS = 3 * HOUR; // ...until 3 h after departure
const FULL_REFUND_NOTICE_MS = 2 * HOUR;

const validityWindow = (travelDate) => {
  const departure = new Date(travelDate).getTime();
  return {
    validFrom: new Date(departure - BOARDING_WINDOW_BEFORE_MS),
    validUntil: new Date(departure + VALID_AFTER_DEPARTURE_MS),
  };
};

const isUnusedActive = (ticket) => ticket.status === 'ACTIVE' && !ticket.usedAt;

// Refund policy: 100% if > 2 h before validFrom, 50% if less, 0% once the validity window starts
const cancellationPreview = (ticket, now = new Date()) => {
  if (ticket.status === 'PENDING_PAYMENT') {
    return { allowed: true, refundPercent: 0, refundAmount: 0, reason: 'Not paid yet - nothing to refund' };
  }
  if (!isUnusedActive(ticket)) {
    return { allowed: false, refundPercent: 0, refundAmount: 0, reason: 'Only active, unused tickets can be cancelled' };
  }
  const msBeforeStart = new Date(ticket.validFrom).getTime() - now.getTime();
  let refundPercent = 0;
  let reason = 'Journey window has started - no refund';
  if (msBeforeStart > FULL_REFUND_NOTICE_MS) {
    refundPercent = 100;
    reason = 'More than 2 hours before the ticket becomes valid - full refund';
  } else if (msBeforeStart > 0) {
    refundPercent = 50;
    reason = 'Less than 2 hours before the ticket becomes valid - 50% refund';
  }
  const refundAmount = Math.round((ticket.totalFare * refundPercent) / 100);
  return { allowed: true, refundPercent, refundAmount, reason };
};

const canEdit = (ticket) => ticket.status === 'PENDING_PAYMENT' || isUnusedActive(ticket);
const canHide = (ticket) => TERMINAL_STATUSES.includes(ticket.status);

// Lazily move ACTIVE tickets whose window has passed to EXPIRED
const expireIfNeeded = async (ticket, now = new Date()) => {
  if (ticket.status === 'ACTIVE' && new Date(ticket.validUntil) < now) {
    ticket.status = 'EXPIRED';
    await ticket.save();
  }
  return ticket;
};

// Ticket JSON plus the flags the mobile app needs to decide which buttons to show
const serializeTicket = (ticket, now = new Date()) => ({
  ...ticket.toJSON(),
  actions: {
    canCancel: cancellationPreview(ticket, now).allowed,
    canEdit: canEdit(ticket),
    canHide: canHide(ticket),
    canPay: ticket.status === 'PENDING_PAYMENT',
    canShowQr: ticket.status === 'ACTIVE',
  },
  cancellation: cancellationPreview(ticket, now),
});

module.exports = {
  validityWindow,
  cancellationPreview,
  canEdit,
  canHide,
  expireIfNeeded,
  serializeTicket,
  isUnusedActive,
};
