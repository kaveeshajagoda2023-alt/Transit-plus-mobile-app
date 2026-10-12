import { getRuntimePlatform } from '../utils/platform';

const VEHICLES_STORAGE_KEY = 'transitpulse_admin_fleet_vehicles';
const ALERTS_STORAGE_KEY = 'transitpulse_admin_disruption_alerts';

const memoryStore = new Map<string, string>();

async function getSecureStoreModule(): Promise<any | null> {
  const platform = getRuntimePlatform();
  if (platform !== 'ios' && platform !== 'android') {
    return null;
  }
  try {
    return require('expo-secure-store');
  } catch {
    return null;
  }
}

async function getStoredItem(key: string): Promise<string | null> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const val = window.localStorage.getItem(key);
      if (val) return val;
    } catch {}
  }

  const store = await getSecureStoreModule();
  if (store) {
    try {
      const val = await store.getItemAsync(key);
      if (val) return val;
    } catch {}
  }

  return memoryStore.get(key) || null;
}

async function setStoredItem(key: string, value: string): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }

  const store = await getSecureStoreModule();
  if (store) {
    try {
      await store.setItemAsync(key, value);
    } catch {}
  }

  memoryStore.set(key, value);
}

export const adminDataStorage = {
  async getVehicles<T>(defaultVehicles: T): Promise<T> {
    try {
      const raw = await getStoredItem(VEHICLES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as T;
        }
      }
    } catch {}
    return defaultVehicles;
  },

  async saveVehicles(vehicles: any[]): Promise<void> {
    try {
      await setStoredItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    } catch {}
  },

  async getAlerts<T>(defaultAlerts: T): Promise<T> {
    try {
      const raw = await getStoredItem(ALERTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as T;
        }
      }
    } catch {}
    return defaultAlerts;
  },

  async saveAlerts(alerts: any[]): Promise<void> {
    try {
      await setStoredItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch {}
  },
};
