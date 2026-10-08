import {
  AuthResponse,
  LoginPayload,
  RegistrationPayload,
  VerificationResponse,
  PortalRole,
  OnboardingState,
  PassengerUser,
} from '@/types/auth';
import { passengerDatabase } from '../mock/passengerDatabase';
import { secureStorage } from '../storage/secureStorage';
import { terminalApi } from './terminalApi';

class PassengerAuthApiService {
  /**
   * Commuter / Passenger Login
   */
  public async login(payload: LoginPayload): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (terminalApi.isOffline()) {
      return {
        success: false,
        error: 'Network offline. Please check your data or Wi-Fi connection and retry.',
      };
    }

    const cleanIdentifier = payload.identifier.trim();
    if (!cleanIdentifier || !payload.password) {
      return {
        success: false,
        error: 'Please enter both your Transit ID / Email and password.',
      };
    }

    const response = await passengerDatabase.login({
      ...payload,
      identifier: cleanIdentifier,
    });

    if (response.success && response.token && response.user) {
      await secureStorage.savePassengerToken(response.token);
      await secureStorage.savePassengerUser(response.user);
      if (payload.rememberMe) {
        await secureStorage.setRememberMe(true, cleanIdentifier);
      }
    }

    return response;
  }

  /**
   * Commuter Registration
   */
  public async register(payload: RegistrationPayload): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (terminalApi.isOffline()) {
      return {
        success: false,
        error: 'Network offline. Unable to complete registration right now.',
      };
    }

    if (!payload.fullName.trim()) {
      return { success: false, error: 'Full name is required.' };
    }

    if (!payload.email.trim() || !payload.email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    if (!payload.password || payload.password.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters with letters, numbers and symbols.',
      };
    }

    if (!payload.agreeToTerms) {
      return {
        success: false,
        error: 'You must agree to the Transit Bylaws & Privacy Policy to continue.',
      };
    }

    const response = await passengerDatabase.register(payload);
    if (response.success && response.token && response.user) {
      await secureStorage.savePassengerToken(response.token);
      await secureStorage.savePassengerUser(response.user);
    }

    return response;
  }

  /**
   * Email OTP verification
   */
  public async verifyEmail(email: string, code: string): Promise<VerificationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (terminalApi.isOffline()) {
      return {
        success: false,
        error: 'Network offline. Could not contact verification server.',
      };
    }

    const res = await passengerDatabase.verifyEmail(email, code);
    if (res.success && res.user) {
      await secureStorage.savePassengerUser(res.user);
    }
    return res;
  }

  /**
   * Social SSO (Apple ID / Google)
   */
  public async socialLogin(provider: 'GOOGLE' | 'APPLE'): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (terminalApi.isOffline()) {
      return {
        success: false,
        error: 'Network offline. Social sign-in requires an active internet connection.',
      };
    }

    const response = await passengerDatabase.socialLogin(provider);
    if (response.success && response.token && response.user) {
      await secureStorage.savePassengerToken(response.token);
      await secureStorage.savePassengerUser(response.user);
    }
    return response;
  }

  /**
   * Password Reset Request
   */
  public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (terminalApi.isOffline()) {
      return {
        success: false,
        message: '',
        error: 'Network offline. Unable to send password reset link.',
      };
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return {
        success: false,
        message: '',
        error: 'Please enter a valid commuter email address.',
      };
    }

    return {
      success: true,
      message: `A password reset link and verification code have been dispatched to ${cleanEmail}. Check your inbox.`,
    };
  }

  /**
   * Onboarding State Management
   */
  public async getOnboardingState(): Promise<OnboardingState> {
    const hasCompleted = await secureStorage.hasCompletedOnboarding();
    const role = (await secureStorage.getSelectedRole()) as PortalRole | null;
    return {
      hasCompletedOnboarding: hasCompleted,
      selectedRole: role || undefined,
    };
  }

  public async completeOnboarding(): Promise<void> {
    await secureStorage.setOnboardingCompleted(true);
  }

  public async resetOnboarding(): Promise<void> {
    await secureStorage.resetOnboarding();
  }

  public async setSelectedRole(role: PortalRole): Promise<void> {
    await secureStorage.setSelectedRole(role);
  }

  public async getSelectedRole(): Promise<PortalRole | null> {
    const role = await secureStorage.getSelectedRole();
    return (role as PortalRole) || null;
  }

  public async getStoredSession(): Promise<{ user: PassengerUser | null; token: string | null }> {
    const token = await secureStorage.getPassengerToken();
    const user = await secureStorage.getPassengerUser<PassengerUser>();
    return { user, token };
  }

  public async logout(): Promise<void> {
    await secureStorage.clearPassengerSession();
  }
}

export const passengerAuthApi = new PassengerAuthApiService();
