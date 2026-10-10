import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config/env';

// Re-exported so existing imports of API_BASE_URL from this file keep working
export { API_BASE_URL };

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

let authToken = null;
let onUnauthorized = null;

// Called by AuthContext after login/logout
export const setAuthToken = (token) => {
  authToken = token;
};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// Error shape used across the app: err.message is always safe to show to the user
export class ApiError extends Error {
  constructor(message, { status = 0, errors = [], data = null } = {}) {
    super(message);
    this.status = status;
    this.errors = errors; // [{ field, message }]
    this.data = data;
  }

  // { fieldName: 'message' } for inline form errors
  get fieldErrors() {
    return this.errors.reduce((acc, e) => ({ ...acc, [String(e.field || '').replace(/^card\./, '')]: e.message }), {});
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data, // the { success, message, data } envelope
  (error) => {
    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED';
      return Promise.reject(
        new ApiError(
          timedOut
            ? 'The server is taking too long to respond. Please try again.'
            : 'Unable to connect to TransitPulse server. Check your Wi-Fi and that the backend is running.'
        )
      );
    }

    const { status, data = {}, config } = error.response;
    // A 401 on any call except login/register means the saved session is no longer valid
    if (status === 401 && onUnauthorized && !config.url.startsWith('/auth/')) onUnauthorized();

    return Promise.reject(
      new ApiError(data.message || 'Something went wrong. Please try again.', {
        status,
        errors: data.errors || [],
        data: data.data || null,
      })
    );
  }
);

export default api;

// ---- Functions kept from the first version (now backed by the authenticated API) ----

export const checkApiHealth = () => api.get('/health');

export const createTicket = async (ticketData) => (await api.post('/tickets', ticketData)).data;

export const getUserTickets = async (params = {}) => (await api.get('/tickets', { params })).data;

export const getTicketById = async (id) => (await api.get(`/tickets/${id}`)).data;

export const cancelTicket = async (id) => (await api.post(`/tickets/${id}/cancel`)).data;

export const processPayment = async (paymentData) => (await api.post('/payments/checkout', paymentData)).data;

// The scanner sends the signed QR token; the verdict is in data.result
export const validateQrTicket = async (token) => api.post('/validation/scan', { token });
