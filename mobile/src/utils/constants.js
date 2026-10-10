import { colors } from '../theme';

export const COLORS = {
  primary: '#0D6EFD',
  secondary: '#6C757D',
  background: '#F8F9FA',
  text: '#1A1D20',
  white: '#FFFFFF',
  border: '#E9ECEF',
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  ROUTES: '/routes',
  TICKETS: '/tickets',
  PAYMENTS: '/payments',
  VALIDATION: '/validation',
  PROFILE: '/users/me',
};

export const PASSENGER_TYPES = [
  { value: 'adult', label: 'Adult', note: 'Full fare' },
  { value: 'student', label: 'Student', note: '50% off' },
  { value: 'senior', label: 'Senior', note: '25% off' },
  { value: 'child', label: 'Child', note: '50% off' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'සිංහල' },
  { value: 'ta', label: 'தமிழ்' },
];

// Status is always shown as colour + icon + text (never colour alone)
export const TICKET_STATUS = {
  PENDING_PAYMENT: { label: 'Awaiting payment', icon: 'clock', fg: colors.warning, bg: colors.warningBg },
  ACTIVE: { label: 'Active', icon: 'check-circle', fg: colors.success, bg: colors.successBg },
  USED: { label: 'Used', icon: 'check-double', fg: '#344054', bg: colors.mutedBg },
  EXPIRED: { label: 'Expired', icon: 'hourglass', fg: '#475467', bg: '#F2F4F7' },
  CANCELLED: { label: 'Cancelled', icon: 'x-circle', fg: colors.danger, bg: colors.dangerBg },
  REFUNDED: { label: 'Refunded', icon: 'refund', fg: '#5B21B6', bg: '#F4F3FF' },
};

export const PAYMENT_STATUS = {
  SUCCESS: { label: 'Paid', icon: 'check-circle', fg: colors.success, bg: colors.successBg },
  PENDING: { label: 'Pay on board', icon: 'clock', fg: colors.warning, bg: colors.warningBg },
  FAILED: { label: 'Failed', icon: 'x-circle', fg: colors.danger, bg: colors.dangerBg },
  REFUNDED: { label: 'Refunded', icon: 'refund', fg: '#5B21B6', bg: '#F4F3FF' },
};

export const SCAN_RESULT = {
  VALID: { label: 'Valid ticket', icon: 'check-circle', fg: colors.success, bg: colors.successBg },
  ALREADY_USED: { label: 'Already used', icon: 'check-double', fg: colors.warning, bg: colors.warningBg },
  EXPIRED: { label: 'Expired', icon: 'hourglass', fg: colors.warning, bg: colors.warningBg },
  INVALID: { label: 'Invalid ticket', icon: 'x-circle', fg: colors.danger, bg: colors.dangerBg },
};

export const PAYMENT_METHOD_LABEL = {
  CARD: 'Card',
  WALLET: 'TransitPulse Wallet',
  CASH_ON_BOARD: 'Cash on board',
};

// Filter tabs on My Tickets. "Cancelled" also covers refunded tickets.
export const TICKET_FILTERS = [
  { key: 'ALL', label: 'All', status: undefined },
  { key: 'ACTIVE', label: 'Active', status: 'ACTIVE,PENDING_PAYMENT' },
  { key: 'USED', label: 'Used', status: 'USED' },
  { key: 'CANCELLED', label: 'Cancelled', status: 'CANCELLED,REFUNDED' },
  { key: 'EXPIRED', label: 'Expired', status: 'EXPIRED' },
];
