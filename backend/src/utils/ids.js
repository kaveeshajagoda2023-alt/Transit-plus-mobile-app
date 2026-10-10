const crypto = require('crypto');

// No 0/O/1/I so codes are easy to read out to a conductor
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const randomCode = (length) => {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
};

const datePart = (date = new Date()) => date.toISOString().slice(0, 10).replace(/-/g, '');

const ticketNumber = (date) => `TP-${datePart(date)}-${randomCode(4)}`;
const transactionRef = () => `TXN-${Date.now()}-${randomCode(6)}`;
const receiptNumber = () => `RCPT-${datePart()}-${randomCode(6)}`;

module.exports = { ticketNumber, transactionRef, receiptNumber };
