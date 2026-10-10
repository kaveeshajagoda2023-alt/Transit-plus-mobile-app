// Small formatting helpers (no Intl dependency, so output is the same on every Android version)
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatLKR = (amount) => {
  const n = Math.round(Number(amount) || 0);
  return `Rs. ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatShortDate = (value) => {
  const d = new Date(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const formatTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${((h + 11) % 12) + 1}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};

export const formatDateTime = (value) => (value ? `${formatDate(value)} · ${formatTime(value)}` : '-');

export const isSameDay = (a, b) => {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
};

export const dayLabel = (date) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return `${DAYS[date.getDay()]} ${formatShortDate(date)}`;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const passengerTypeLabel = (type) =>
  ({ adult: 'Adult', student: 'Student', senior: 'Senior', child: 'Child' }[type] || 'Adult');

export const routeLabel = (route) => (route ? `${route.code} · ${route.name}` : 'Route');
