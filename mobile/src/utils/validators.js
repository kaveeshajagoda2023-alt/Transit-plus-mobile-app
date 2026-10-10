// Client-side checks that mirror the backend rules, for instant inline messages.
// The server still validates everything.
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
export const isPhone = (v) => !v || /^\+?[0-9 ]{9,15}$/.test(String(v).trim());

export const passwordError = (v) => {
  if (!v || v.length < 8) return 'Use at least 8 characters';
  if (!/\d/.test(v)) return 'Include at least one number';
  return null;
};

export const digitsOnly = (v) => String(v || '').replace(/\D/g, '');

export const luhnValid = (value) => {
  const n = digitsOnly(value);
  if (n.length < 12 || n.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let d = Number(n[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

export const cardBrand = (value) => {
  const n = digitsOnly(value);
  if (/^4/.test(n)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'MASTERCARD';
  if (/^3[47]/.test(n)) return 'AMEX';
  return 'CARD';
};

// "4242424242424242" -> "4242 4242 4242 4242"
export const formatCardNumber = (value) =>
  digitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

// "1230" -> "12/30"
export const formatExpiry = (value) => {
  const d = digitsOnly(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export const expiryError = (value) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(value || '');
  if (!m) return 'Use MM/YY';
  const month = Number(m[1]);
  if (month < 1 || month > 12) return 'Month must be 01-12';
  const end = new Date(2000 + Number(m[2]), month, 1);
  if (end <= new Date()) return 'This card has expired';
  return null;
};

export const cardErrors = ({ cardNumber, expiry, cvv }) => {
  const errors = {};
  if (!luhnValid(cardNumber)) errors.cardNumber = 'Check the card number';
  const exp = expiryError(expiry);
  if (exp) errors.expiry = exp;
  const cvvLength = cardBrand(cardNumber) === 'AMEX' ? 4 : 3;
  if (!new RegExp(`^\\d{${cvvLength}}$`).test(cvv || '')) errors.cvv = `${cvvLength} digits on the back`;
  return errors;
};
