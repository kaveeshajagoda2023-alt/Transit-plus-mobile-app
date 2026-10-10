import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

const TOKEN_KEY = 'transitpulse.token';
const USER_KEY = 'transitpulse.user';

const AuthContext = createContext(null);

// Storage failures must never crash the app: the worst case is the passenger
// has to log in again next time.
const safeStorage = async (action, fallback = null) => {
  try {
    return await action();
  } catch (e) {
    console.warn('[AuthContext] AsyncStorage failed:', e?.message);
    return fallback;
  }
};

// status: 'loading' (restoring session) | 'signedOut' | 'signedIn'
export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessionMessage, setSessionMessage] = useState(null);

  const saveSession = useCallback(async (token, nextUser) => {
    setAuthToken(token);
    await safeStorage(() =>
      AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [USER_KEY, JSON.stringify(nextUser)],
      ])
    );
    setUser(nextUser);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async (message = null) => {
    setAuthToken(null);
    await safeStorage(() => AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]));
    setUser(null);
    setStats(null);
    setSessionMessage(message);
    setStatus('signedOut');
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await userService.getMe();
    setUser(data.user);
    setStats(data.stats);
    await safeStorage(() => AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)));
    return data;
  }, []);

  // Restore a saved session on app start
  useEffect(() => {
    setUnauthorizedHandler(() => signOut('Your session has expired. Please log in again.'));

    (async () => {
      // If storage can't be read, fall back to "signed out" instead of crashing
      const pairs = await safeStorage(() => AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]), []);
      const token = pairs?.[0]?.[1];
      let cachedUser = null;
      try {
        cachedUser = pairs?.[1]?.[1] ? JSON.parse(pairs[1][1]) : null;
      } catch (e) {
        cachedUser = null; // corrupted cache - ignore it
      }
      if (!token) {
        setStatus('signedOut');
        return;
      }
      setAuthToken(token);
      if (cachedUser) setUser(cachedUser);
      try {
        await refreshUser();
        setStatus('signedIn');
      } catch (e) {
        // A 401 already triggered signOut through the interceptor. Otherwise (offline /
        // server down) keep the cached profile; screens show their own retry states.
        if (e.status === 401) return;
        if (cachedUser) setStatus('signedIn');
        else await signOut();
      }
    })();
  }, [refreshUser, signOut]);

  const signIn = useCallback(
    async (email, password) => {
      const { token, user: nextUser } = await authService.login(email, password);
      setSessionMessage(null);
      await saveSession(token, nextUser);
    },
    [saveSession]
  );

  const signUp = useCallback(
    async (form) => {
      const { token, user: nextUser } = await authService.register(form);
      await saveSession(token, nextUser);
    },
    [saveSession]
  );

  const updateUser = useCallback(async (nextUser) => {
    setUser(nextUser);
    await safeStorage(() => AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser)));
  }, []);

  const value = useMemo(
    () => ({ status, user, stats, sessionMessage, signIn, signUp, signOut, refreshUser, updateUser }),
    [status, user, stats, sessionMessage, signIn, signUp, signOut, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
