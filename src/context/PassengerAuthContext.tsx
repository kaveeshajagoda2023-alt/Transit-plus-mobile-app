import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PassengerUser,
  PortalRole,
  LoginPayload,
  RegistrationPayload,
  AuthResponse,
  VerificationResponse,
} from '@/types/auth';
import { passengerAuthApi } from '@/services/api/passengerAuthApi';
import { terminalApi } from '@/services/api/terminalApi';

interface PassengerAuthContextType {
  user: PassengerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  selectedRole: PortalRole | null;
  isOffline: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegistrationPayload) => Promise<AuthResponse>;
  verifyEmail: (email: string, code: string) => Promise<VerificationResponse>;
  socialLogin: (provider: 'GOOGLE' | 'APPLE') => Promise<AuthResponse>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  setSelectedRole: (role: PortalRole) => Promise<void>;
  setOffline: (offline: boolean) => void;
}

const PassengerAuthContext = createContext<PassengerAuthContextType | undefined>(undefined);

export const PassengerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PassengerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [selectedRole, setSelectedRoleState] = useState<PortalRole | null>(null);
  const [isOffline, setIsOfflineState] = useState<boolean>(terminalApi.isOffline());

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      try {
        setIsLoading(true);
        const [onboarding, session] = await Promise.all([
          passengerAuthApi.getOnboardingState(),
          passengerAuthApi.getStoredSession(),
        ]);

        if (isMounted) {
          setHasCompletedOnboarding(onboarding.hasCompletedOnboarding);
          if (onboarding.selectedRole) {
            setSelectedRoleState(onboarding.selectedRole);
          }
          if (session.user && session.token) {
            setUser(session.user);
            setToken(session.token);
          }
        }
      } catch (err) {
        console.error('Failed to initialize passenger session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await passengerAuthApi.login(payload);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegistrationPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await passengerAuthApi.register(payload);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string): Promise<VerificationResponse> => {
    setIsLoading(true);
    try {
      const res = await passengerAuthApi.verifyEmail(email, code);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const socialLogin = useCallback(async (provider: 'GOOGLE' | 'APPLE'): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await passengerAuthApi.socialLogin(provider);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await passengerAuthApi.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    await passengerAuthApi.completeOnboarding();
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await passengerAuthApi.resetOnboarding();
    setHasCompletedOnboarding(false);
    setSelectedRoleState(null);
  }, []);

  const setSelectedRole = useCallback(async (role: PortalRole) => {
    await passengerAuthApi.setSelectedRole(role);
    setSelectedRoleState(role);
  }, []);

  const setOffline = useCallback((offline: boolean) => {
    terminalApi.setOfflineMode(offline);
    setIsOfflineState(offline);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    hasCompletedOnboarding,
    selectedRole,
    isOffline,
    login,
    register,
    verifyEmail,
    socialLogin,
    logout,
    completeOnboarding,
    resetOnboarding,
    setSelectedRole,
    setOffline,
  };

  return <PassengerAuthContext.Provider value={value}>{children}</PassengerAuthContext.Provider>;
};

export const usePassengerAuth = (): PassengerAuthContextType => {
  const context = useContext(PassengerAuthContext);
  if (!context) {
    throw new Error('usePassengerAuth must be used within a PassengerAuthProvider');
  }
  return context;
};
