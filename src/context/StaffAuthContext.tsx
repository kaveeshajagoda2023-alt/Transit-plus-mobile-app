import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  StaffUser,
  StaffSession,
  TerminalStatus,
  StaffAuthTab,
  StaffLoginCredentials,
  StaffAuthResponse,
  NfcAuthResponse,
  ForgotPasswordResponse,
} from '@/types/staff';
import { staffAuthApi } from '@/services/api/staffAuthApi';
import { terminalApi } from '@/services/api/terminalApi';
import { secureStorage } from '@/services/storage/secureStorage';

interface StaffAuthContextType {
  user: StaffUser | null;
  session: StaffSession | null;
  terminalStatus: TerminalStatus;
  isLoadingSession: boolean;
  isAuthenticating: boolean;
  activeTab: StaffAuthTab;
  errorMessage: string | null;
  rememberMe: boolean;
  savedIdentifier: string;
  isNetworkOffline: boolean;
  setActiveTab: (tab: StaffAuthTab) => void;
  setErrorMessage: (msg: string | null) => void;
  setRememberMe: (val: boolean) => void;
  login: (credentials: StaffLoginCredentials) => Promise<StaffAuthResponse>;
  loginWithNfc: (badgeId?: string) => Promise<NfcAuthResponse>;
  logout: () => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (identifier: string, pin: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  refreshTerminalStatus: () => Promise<void>;
  toggleSimulatedOffline: () => void;
}

const defaultTerminalStatus: TerminalStatus = {
  terminalId: 'TERM-4028-V4',
  vehicleId: 'veh-bus-4028',
  vehicleNumber: 'Bus #4028',
  transitAuthority: 'Metro Transit Authority (MTA)',
  dispatchZone: 'DISPATCH ZONE 4',
  terminalState: 'READY',
  version: 'v4.8.2-ops',
  connectionStatus: 'CONNECTED',
  gpsLock: true,
  pingMs: 18,
  lastHeartbeat: new Date().toISOString(),
};

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [session, setSession] = useState<StaffSession | null>(null);
  const [terminalStatus, setTerminalStatus] = useState<TerminalStatus>(defaultTerminalStatus);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<StaffAuthTab>('normal');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMeState] = useState<boolean>(true);
  const [savedIdentifier, setSavedIdentifier] = useState<string>('DRV-84920@transitpulse.gov');
  const [isNetworkOffline, setIsNetworkOffline] = useState<boolean>(false);

  // Synchronize terminal status and restore remembered sessions on boot
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        // 1. Fetch terminal telemetry
        const status = await terminalApi.getTerminalStatus();
        if (mounted) setTerminalStatus(status);
      } catch (e) {
        // Fallback default
      }

      try {
        // 2. Check remembered identifier
        const remembered = await secureStorage.getRememberedIdentifier();
        const rememberEnabled = await secureStorage.isRememberMeEnabled();
        if (mounted) {
          setRememberMeState(rememberEnabled);
          if (remembered) {
            setSavedIdentifier(remembered);
          }
        }

        // 3. Check active session
        const token = await secureStorage.getAuthToken();
        const storedUser = await secureStorage.getStaffUser<StaffUser>();
        if (token && storedUser && mounted) {
          setUser(storedUser);
          setSession({
            token,
            user: storedUser,
            expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
            terminalId: defaultTerminalStatus.terminalId,
            loginTime: new Date().toISOString(),
            authMethod: 'CREDENTIALS',
          });
        }
      } catch (err) {
        // Session init error
      } finally {
        if (mounted) setIsLoadingSession(false);
      }
    }

    initialize();

    // Heartbeat subscription
    const unsubscribe = terminalApi.subscribeTerminalStatus((newStatus) => {
      if (mounted) {
        setTerminalStatus(newStatus);
        setIsNetworkOffline(newStatus.connectionStatus === 'OFFLINE');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const setActiveTab = useCallback((tab: StaffAuthTab) => {
    setActiveTabState(tab);
    if (tab === 'normal') {
      setErrorMessage(null);
    } else if (tab === 'error' && !errorMessage) {
      setErrorMessage('Invalid Staff ID or password. (4 attempts remaining)');
    }
  }, [errorMessage]);

  const setRememberMe = useCallback(async (val: boolean) => {
    setRememberMeState(val);
    await secureStorage.setRememberMe(val, val ? savedIdentifier : undefined);
  }, [savedIdentifier]);

  const refreshTerminalStatus = useCallback(async () => {
    try {
      const status = await terminalApi.getTerminalStatus();
      setTerminalStatus(status);
      setIsNetworkOffline(false);
    } catch (err: any) {
      setIsNetworkOffline(true);
      setTerminalStatus((prev) => ({
        ...prev,
        connectionStatus: 'OFFLINE',
        pingMs: 0,
      }));
    }
  }, []);

  const toggleSimulatedOffline = useCallback(() => {
    const nextState = !isNetworkOffline;
    setIsNetworkOffline(nextState);
    terminalApi.setSimulatedOffline(nextState);
    setTerminalStatus((prev) => ({
      ...prev,
      connectionStatus: nextState ? 'OFFLINE' : 'CONNECTED',
      pingMs: nextState ? 0 : 18,
    }));
  }, [isNetworkOffline]);

  const login = useCallback(
    async (credentials: StaffLoginCredentials): Promise<StaffAuthResponse> => {
      setIsAuthenticating(true);
      setActiveTabState('authenticating');
      setErrorMessage(null);

      try {
        const response = await staffAuthApi.login(credentials.identifier, credentials.password);

        if (response.success && response.user && response.session) {
          setUser(response.user);
          setSession(response.session);
          setActiveTabState('normal');

          // Secure storage
          await secureStorage.saveAuthToken(response.accessToken || 'token');
          await secureStorage.saveStaffUser(response.user);

          if (credentials.rememberMe) {
            await secureStorage.setRememberMe(true, credentials.identifier);
            setSavedIdentifier(credentials.identifier);
          } else {
            await secureStorage.setRememberMe(false);
          }

          return response;
        } else {
          const err = response.error || 'Authentication failed. Please verify credentials.';
          setErrorMessage(err);
          setActiveTabState('error');
          return response;
        }
      } catch (err: any) {
        const errStr = err?.message || 'Authentication service error. Try again.';
        setErrorMessage(errStr);
        setActiveTabState('error');
        return { success: false, error: errStr };
      } finally {
        setIsAuthenticating(false);
      }
    },
    []
  );

  const loginWithNfc = useCallback(
    async (badgeId?: string): Promise<NfcAuthResponse> => {
      setIsAuthenticating(true);
      setActiveTabState('authenticating');
      setErrorMessage(null);

      try {
        const targetBadge = badgeId || 'NFC-COND-55219';
        const response = await staffAuthApi.loginWithNfc(targetBadge);

        if (response.success && response.user && response.session) {
          setUser(response.user);
          setSession(response.session);
          setActiveTabState('normal');

          await secureStorage.saveAuthToken(response.accessToken || 'token');
          await secureStorage.saveStaffUser(response.user);

          return response;
        } else {
          const err = response.error || 'Unable to verify conductor badge.';
          setErrorMessage(err);
          setActiveTabState('error');
          return response;
        }
      } catch (err: any) {
        const errStr = err?.message || 'NFC reader hardware communication failure.';
        setErrorMessage(errStr);
        setActiveTabState('error');
        return { success: false, error: errStr };
      } finally {
        setIsAuthenticating(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await secureStorage.clearSession();
    setUser(null);
    setSession(null);
    setActiveTabState('normal');
    setErrorMessage(null);
  }, []);

  const requestPasswordReset = useCallback(
    async (identifier: string): Promise<ForgotPasswordResponse> => {
      return await staffAuthApi.requestPasswordReset(identifier);
    },
    []
  );

  const resetPassword = useCallback(
    async (identifier: string, pin: string, newPass: string) => {
      return await staffAuthApi.resetPassword(identifier, pin, newPass);
    },
    []
  );

  return (
    <StaffAuthContext.Provider
      value={{
        user,
        session,
        terminalStatus,
        isLoadingSession,
        isAuthenticating,
        activeTab,
        errorMessage,
        rememberMe,
        savedIdentifier,
        isNetworkOffline,
        setActiveTab,
        setErrorMessage,
        setRememberMe,
        login,
        loginWithNfc,
        logout,
        requestPasswordReset,
        resetPassword,
        refreshTerminalStatus,
        toggleSimulatedOffline,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
};

export function useStaffAuth(): StaffAuthContextType {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}
