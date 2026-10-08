import { getRuntimePlatform } from '../utils/platform';

const TOKEN_KEY = 'transitpulse_staff_token';
const USER_KEY = 'transitpulse_staff_user';
const REMEMBER_ME_KEY = 'transitpulse_remember_me';
const REMEMBERED_IDENTIFIER_KEY = 'transitpulse_remembered_identifier';
const SESSION_EXPIRY_KEY = 'transitpulse_session_expiry';

// In-memory fallback if platform storage is restricted or during headless tests
const memoryFallback = new Map<string, string>();

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

async function isSecureStoreAvailable(): Promise<boolean> {
  const store = await getSecureStoreModule();
  if (!store) return false;
  try {
    return await store.isAvailableAsync();
  } catch {
    return false;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  const store = await getSecureStoreModule();
  if (store) {
    try {
      const available = await store.isAvailableAsync();
      if (available) {
        await store.setItemAsync(key, value, {
          keychainAccessible: store.AFTER_FIRST_UNLOCK,
        });
        return;
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      // Fallback
    }
  }

  memoryFallback.set(key, value);
}

async function getItem(key: string): Promise<string | null> {
  const store = await getSecureStoreModule();
  if (store) {
    try {
      const available = await store.isAvailableAsync();
      if (available) {
        return await store.getItemAsync(key);
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Fallback
    }
  }

  return memoryFallback.get(key) || null;
}

async function deleteItem(key: string): Promise<void> {
  const store = await getSecureStoreModule();
  if (store) {
    try {
      await store.deleteItemAsync(key);
      return;
    } catch {
      // Fallback
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
      return;
    } catch {
      // Fallback
    }
  }

  memoryFallback.delete(key);
}

export const secureStorage = {
  async saveAuthToken(token: string, expiresInSeconds: number = 86400): Promise<void> {
    const expiresAt = (Date.now() + expiresInSeconds * 1000).toString();
    await setItem(TOKEN_KEY, token);
    await setItem(SESSION_EXPIRY_KEY, expiresAt);
  },

  async getAuthToken(): Promise<string | null> {
    const expiresAtStr = await getItem(SESSION_EXPIRY_KEY);
    if (expiresAtStr) {
      const expiresAt = parseInt(expiresAtStr, 10);
      if (Date.now() > expiresAt) {
        // Expired
        await this.clearSession();
        return null;
      }
    }
    return await getItem(TOKEN_KEY);
  },

  async saveStaffUser(user: any): Promise<void> {
    await setItem(USER_KEY, JSON.stringify(user));
  },

  async getStaffUser<T = any>(): Promise<T | null> {
    const userStr = await getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as T;
    } catch {
      return null;
    }
  },

  async setRememberMe(enabled: boolean, identifier?: string): Promise<void> {
    await setItem(REMEMBER_ME_KEY, enabled ? 'true' : 'false');
    if (enabled && identifier) {
      await setItem(REMEMBERED_IDENTIFIER_KEY, identifier);
    } else if (!enabled) {
      await deleteItem(REMEMBERED_IDENTIFIER_KEY);
    }
  },

  async isRememberMeEnabled(): Promise<boolean> {
    const val = await getItem(REMEMBER_ME_KEY);
    return val === 'true';
  },

  async getRememberedIdentifier(): Promise<string | null> {
    const enabled = await this.isRememberMeEnabled();
    if (!enabled) return null;
    return await getItem(REMEMBERED_IDENTIFIER_KEY);
  },

  async clearSession(): Promise<void> {
    await deleteItem(TOKEN_KEY);
    await deleteItem(USER_KEY);
    await deleteItem(SESSION_EXPIRY_KEY);
  },

  // --- Passenger Auth & Onboarding Storage ---
  async savePassengerToken(token: string): Promise<void> {
    await setItem('transitpulse_passenger_token', token);
  },

  async getPassengerToken(): Promise<string | null> {
    return await getItem('transitpulse_passenger_token');
  },

  async savePassengerUser(user: any): Promise<void> {
    await setItem('transitpulse_passenger_user', JSON.stringify(user));
  },

  async getPassengerUser<T = any>(): Promise<T | null> {
    const userStr = await getItem('transitpulse_passenger_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as T;
    } catch {
      return null;
    }
  },

  async clearPassengerSession(): Promise<void> {
    await deleteItem('transitpulse_passenger_token');
    await deleteItem('transitpulse_passenger_user');
  },

  async setOnboardingCompleted(completed: boolean = true): Promise<void> {
    await setItem('transitpulse_onboarding_completed', completed ? 'true' : 'false');
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    const val = await getItem('transitpulse_onboarding_completed');
    return val === 'true';
  },

  async setSelectedRole(role: string): Promise<void> {
    await setItem('transitpulse_selected_role', role);
  },

  async getSelectedRole(): Promise<string | null> {
    return await getItem('transitpulse_selected_role');
  },

  async resetOnboarding(): Promise<void> {
    await deleteItem('transitpulse_onboarding_completed');
    await deleteItem('transitpulse_selected_role');
  },
};
