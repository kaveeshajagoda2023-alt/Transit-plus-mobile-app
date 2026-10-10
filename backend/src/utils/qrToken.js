// Signed, short-lived QR token: "TP1.<base64url payload>.<base64url HMAC-SHA256>".
// The payload only holds ids and timestamps; the scanner looks the ticket up
// on the server, so a screenshot stops working once expiresAt has passed or
// the ticket's qrVersion has been bumped (rotate).
const crypto = require('crypto');

const PREFIX = 'TP1';
const QR_TTL_SECONDS = 30;

const getSecret = () => {
  const secret = process.env.QR_SIGNING_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('QR_SIGNING_SECRET is not configured');
  return secret;
};

const sign = (data) => crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');

const createQrToken = (ticket, now = Date.now()) => {
  const payload = {
    ticketId: String(ticket._id),
    qrVersion: ticket.qrVersion,
    issuedAt: now,
    expiresAt: now + QR_TTL_SECONDS * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { token: `${PREFIX}.${body}.${sign(`${PREFIX}.${body}`)}`, ...payload };
};

// Returns { valid: true, payload } or { valid: false, reason, payload? }
const verifyQrToken = (token, now = Date.now()) => {
  if (typeof token !== 'string') return { valid: false, reason: 'MALFORMED' };
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== PREFIX) return { valid: false, reason: 'MALFORMED' };

  // Constant-time compare so the signature cannot be guessed byte by byte
  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`));
  const given = Buffer.from(parts[2]);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    return { valid: false, reason: 'BAD_SIGNATURE' };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch (e) {
    return { valid: false, reason: 'MALFORMED' };
  }
  if (!payload.ticketId || typeof payload.expiresAt !== 'number') return { valid: false, reason: 'MALFORMED' };
  if (now > payload.expiresAt) return { valid: false, reason: 'QR_EXPIRED', payload };

  return { valid: true, payload };
};

module.exports = { createQrToken, verifyQrToken, QR_TTL_SECONDS };
