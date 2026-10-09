// Mock payment gateway. Card details are validated in memory only and are
// never written to the database or logs - only brand + last4 + expiry are kept.
const AppError = require('./AppError');

// Demo test cards
const ALWAYS_DECLINE_LAST4 = '0002'; // 4000 0000 0000 0002
const ALWAYS_APPROVE_LAST4 = '4242'; // 4242 4242 4242 4242

const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

const luhnValid = (number) => {
  if (number.length < 12 || number.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let d = Number(number[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
};

const detectBrand = (number) => {
  if (/^4/.test(number)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'MASTERCARD';
  if (/^3[47]/.test(number)) return 'AMEX';
  return 'CARD';
};

// expiry is "MM/YY"; a card is valid until the end of that month
const parseExpiry = (expiry) => {
  const match = /^(\d{2})\/(\d{2})$/.exec(String(expiry || '').trim());
  if (!match) return null;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return null;
  return new Date(2000 + Number(match[2]), month, 1); // first day of the following month
};

const isExpired = (expiry, now = new Date()) => {
  const end = parseExpiry(expiry);
  return !end || end <= now;
};

// Validates a full card and returns only the safe-to-store summary.
const validateCard = ({ cardNumber, expiry, cvv }) => {
  const digits = digitsOnly(cardNumber);
  const brand = detectBrand(digits);
  const errors = [];
  if (!luhnValid(digits)) errors.push({ field: 'cardNumber', message: 'Card number is not valid' });
  if (!parseExpiry(expiry)) errors.push({ field: 'expiry', message: 'Use MM/YY format' });
  else if (isExpired(expiry)) errors.push({ field: 'expiry', message: 'Card has expired' });
  const cvvLength = brand === 'AMEX' ? 4 : 3;
  if (!new RegExp(`^\\d{${cvvLength}}$`).test(String(cvv || ''))) {
    errors.push({ field: 'cvv', message: `CVV must be ${cvvLength} digits` });
  }
  if (errors.length) throw new AppError('Card details are not valid', 422, errors);
  return { brand, last4: digits.slice(-4), expiry: String(expiry).trim() };
};

const successRate = () => {
  const rate = Number(process.env.PAYMENT_SUCCESS_RATE);
  return process.env.PAYMENT_SUCCESS_RATE !== undefined && Number.isFinite(rate) ? rate : 0.9;
};

// Decide whether the mock bank approves the charge
const authorize = ({ method, last4 }) => {
  if (method === 'CARD' && last4 === ALWAYS_DECLINE_LAST4) {
    return { approved: false, reason: 'Card declined by the issuing bank (test card 0002).' };
  }
  if (method === 'CARD' && last4 === ALWAYS_APPROVE_LAST4) return { approved: true };
  if (Math.random() < successRate()) return { approved: true };
  return { approved: false, reason: 'The payment gateway did not respond. No money was taken - please try again.' };
};

module.exports = { validateCard, authorize, isExpired, luhnValid, ALWAYS_DECLINE_LAST4, ALWAYS_APPROVE_LAST4 };
