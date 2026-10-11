/**
 * Member 2 — Passenger Ticketing API client
 * Talks to /api/ticketing on the TransitPulse backend. If the server cannot be
 * reached, it switches to the offline demo engine for the rest of the session.
 */
import { apiClient } from './apiClient';
import {
  CardDetails,
  CreateTicketPayload,
  FareCategory,
  FareQuote,
  PassengerTicket,
  TicketPayment,
  TicketingRoute,
  UpdateTicketPayload,
} from '@/types/ticketing';
import { TicketingError, offlineTicketing, OFFLINE_ROUTES } from '@/services/ticketing/offlineTicketing';
import { calculateFare } from '@/services/ticketing/fareRules';

export { TicketingError };

let offlineMode = false;
const listeners = new Set<(offline: boolean) => void>();

function setOffline(value: boolean) {
  if (offlineMode === value) return;
  offlineMode = value;
  listeners.forEach((fn) => fn(value));
}

class NetworkError extends Error {}

async function call<T>(path: string, init: RequestInit = {}, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${apiClient.getBaseUrl()}/api/ticketing${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
  } catch {
    throw new NetworkError('Server unreachable');
  } finally {
    clearTimeout(timer);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new TicketingError(body?.error || `Request failed (${response.status})`, response.status, body?.payment);
  }
  return body as T;
}

/** Runs the online request, falling back to the offline engine on network failure. */
async function withFallback<T>(online: () => Promise<T>, offline: () => Promise<T>): Promise<T> {
  if (offlineMode) return offline();
  try {
    return await online();
  } catch (err) {
    if (err instanceof NetworkError) {
      setOffline(true);
      return offline();
    }
    throw err;
  }
}

const json = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });

export const ticketingApi = {
  isOfflineMode: () => offlineMode,

  onOfflineModeChange(fn: (offline: boolean) => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /** Retry the server (used by the "Reconnect" button on the offline banner). */
  async reconnect(): Promise<boolean> {
    try {
      await call('/routes', {}, 2500);
      setOffline(false);
      return true;
    } catch {
      return false;
    }
  },

  getRoutes(): Promise<TicketingRoute[]> {
    return withFallback(
      async () => (await call<{ routes: TicketingRoute[] }>('/routes')).routes,
      offlineTicketing.getRoutes
    );
  },

  /** Instant local fare preview — the server recalculates the fare when booking. */
  previewFare(
    route: TicketingRoute | undefined,
    fromSequence: number | undefined,
    toSequence: number | undefined,
    fareCategory: FareCategory,
    passengers: number
  ): FareQuote | null {
    if (!route || fromSequence === undefined || toSequence === undefined || fromSequence === toSequence) return null;
    return calculateFare({
      transportType: route.type,
      routeNumber: route.routeNumber,
      fromSequence,
      toSequence,
      fareCategory,
      passengers,
    });
  },

  createTicket(payload: CreateTicketPayload): Promise<PassengerTicket> {
    return withFallback(
      async () => (await call<{ data: PassengerTicket }>('/tickets', json(payload))).data,
      () => offlineTicketing.createTicket(payload)
    );
  },

  listTickets(passengerId: string, view: 'active' | 'history' | 'all' = 'all'): Promise<PassengerTicket[]> {
    const qs = `?passengerId=${encodeURIComponent(passengerId)}&view=${view}`;
    return withFallback(
      async () => (await call<{ data: PassengerTicket[] }>(`/tickets${qs}`)).data,
      () => offlineTicketing.listTickets(passengerId, view)
    );
  },

  getTicket(id: string): Promise<{ ticket: PassengerTicket; payment: TicketPayment | null }> {
    return withFallback(
      async () => {
        const res = await call<{ data: PassengerTicket; payment: TicketPayment | null }>(`/tickets/${id}`);
        return { ticket: res.data, payment: res.payment };
      },
      () => offlineTicketing.getTicket(id)
    );
  },

  updateTicket(id: string, payload: UpdateTicketPayload): Promise<PassengerTicket> {
    return withFallback(
      async () =>
        (await call<{ data: PassengerTicket }>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })).data,
      () => offlineTicketing.updateTicket(id, payload)
    );
  },

  deleteTicket(id: string): Promise<string> {
    return withFallback(
      async () => (await call<{ message: string }>(`/tickets/${id}`, { method: 'DELETE' })).message,
      () => offlineTicketing.deleteTicket(id)
    );
  },

  pay(id: string, method: 'WALLET' | 'CARD', card?: CardDetails) {
    return withFallback(
      async () => {
        const res = await call<{ data: PassengerTicket; payment: TicketPayment }>(
          `/tickets/${id}/pay`,
          json({ method, card }),
          10000
        );
        return { ticket: res.data, payment: res.payment };
      },
      () => offlineTicketing.pay(id, method, card)
    );
  },

  cancel(id: string) {
    return withFallback(
      async () => {
        const res = await call<{ data: PassengerTicket; refund: { refundAmount: number; refundPercent: number; reason: string; allowed: boolean } }>(
          `/tickets/${id}/cancel`,
          json({})
        );
        return { ticket: res.data, refund: res.refund };
      },
      () => offlineTicketing.cancel(id)
    );
  },

  listPayments(passengerId: string): Promise<TicketPayment[]> {
    return withFallback(
      async () => (await call<{ data: TicketPayment[] }>(`/payments?passengerId=${encodeURIComponent(passengerId)}`)).data,
      () => offlineTicketing.listPayments(passengerId)
    );
  },

  getPayment(id: string): Promise<{ payment: TicketPayment; ticket: PassengerTicket | null }> {
    return withFallback(
      async () => {
        const res = await call<{ data: TicketPayment; ticket: PassengerTicket | null }>(`/payments/${id}`);
        return { payment: res.data, ticket: res.ticket };
      },
      () => offlineTicketing.getPayment(id)
    );
  },

  /** Wallet balance, or null when this account has no MetroPay wallet on the server. */
  getWalletBalance(passengerId: string): Promise<number | null> {
    return withFallback(
      async () => {
        try {
          return (await call<{ balance: number }>(`/wallet/${encodeURIComponent(passengerId)}`)).balance;
        } catch (err) {
          if (err instanceof TicketingError && err.status === 404) return null;
          throw err;
        }
      },
      offlineTicketing.getWallet
    );
  },
};

export { OFFLINE_ROUTES };
