let expoApiUrl: string | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Constants = require('expo-constants');
  expoApiUrl = Constants?.default?.expoConfig?.extra?.apiUrl || Constants?.expoConfig?.extra?.apiUrl;
} catch {
  // In Node.js or test runner environments
}

/**
 * TransitPulse Central Backend API Client
 * Configurable via EXPO_PUBLIC_API_URL or app.json extra config.
 * Defaults to http://localhost:5000 (standard local server port).
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  expoApiUrl ||
  'http://localhost:5000';

export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws';

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 4000, token, ...fetchOpts } = options;
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((fetchOpts.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOpts,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || `HTTP error ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Network timeout. Server did not respond in time.');
      }
      throw err;
    }
  }

  public async get<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public async post<T = unknown>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T = unknown>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T = unknown>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await this.get<{ status: string }>('/api/health', { timeoutMs: 1500 });
      return res?.status === 'ONLINE';
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
