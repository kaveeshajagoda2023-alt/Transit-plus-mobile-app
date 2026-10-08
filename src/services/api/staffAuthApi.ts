import {
  StaffAuthResponse,
  NfcAuthResponse,
  ForgotPasswordResponse,
  StaffSession,
  StaffUser,
} from '@/types/staff';
import { staffDatabase } from '../mock/staffDatabase';
import { terminalApi } from './terminalApi';
import { generateSecureToken } from '../utils/cryptoUtils';

class StaffAuthApiService {
  /**
   * POST /api/auth/staff/login
   * Validates credentials, enforces role-based access, rate limits brute force,
   * and creates a secure session token.
   */
  public async login(identifier: string, password: string): Promise<StaffAuthResponse> {
    // Micro delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 350));

    // 1. Connection check
    if (terminalApi.isOffline()) {
      return {
        success: false,
        error: 'Unable to connect to the TransitPulse server. Check your connection and try again.',
      };
    }

    // 2. Validate input format
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      return {
        success: false,
        error: 'Please enter both your Staff ID / Work Email and password.',
      };
    }

    // 3. User lookup
    const record = staffDatabase.findByIdentifier(cleanId);
    if (!record) {
      return {
        success: false,
        error: 'Invalid Staff ID or password.',
      };
    }

    // 4. Lockout check
    if (staffDatabase.isLockedOut(record)) {
      return {
        success: false,
        error: 'Account locked due to consecutive failed attempts. Contact Zone 4 Dispatch.',
      };
    }

    // 5. Password verification
    const isValidPass = staffDatabase.verifyPassword(record, password);
    if (!isValidPass) {
      const { locked, remainingAttempts } = staffDatabase.registerFailedAttempt(record.id);
      if (locked) {
        return {
          success: false,
          error: 'Maximum login attempts exceeded. Account locked for 15 minutes.',
        };
      }
      return {
        success: false,
        error: `Invalid Staff ID or password. (${remainingAttempts} attempts remaining)`,
      };
    }

    // 6. Account status verification
    if (record.status === 'SUSPENDED') {
      return {
        success: false,
        error: 'Account is suspended. Contact MTA Dispatch Operations.',
      };
    }

    // 7. Role-Based Access Control (RBAC) - Block non-staff
    if (record.role === 'PASSENGER' || !record.terminalAccess) {
      return {
        success: false,
        error: 'This account is not authorized for terminal access.',
      };
    }

    // 8. Successful authentication
    staffDatabase.resetFailedAttempts(record.id);
    const sanitizedUser = staffDatabase.sanitizeUser(record);
    const accessToken = generateSecureToken('mta_auth_token');
    const terminal = await terminalApi.getTerminalStatus();

    const session: StaffSession = {
      token: accessToken,
      user: sanitizedUser,
      expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      terminalId: terminal.terminalId,
      loginTime: new Date().toISOString(),
      authMethod: 'CREDENTIALS',
    };

    return {
      success: true,
      user: sanitizedUser,
      accessToken,
      expiresIn: 86400,
      session,
      message: `Welcome aboard, ${sanitizedUser.name}. Terminal authorized.`,
    };
  }

  /**
   * POST /api/auth/staff/nfc-login
   * Contactless conductor/operator badge authentication.
   */
  public async loginWithNfc(badgeId: string): Promise<NfcAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (terminalApi.isOffline()) {
      return {
        success: false,
        error: 'Unable to connect to the TransitPulse server. Check your connection and try again.',
      };
    }

    const cleanBadge = badgeId.trim().toUpperCase();
    const record = staffDatabase.findByBadgeId(cleanBadge);

    if (!record) {
      return {
        success: false,
        error: 'Unable to verify conductor badge. Unrecognized RFID credential.',
      };
    }

    if (record.status !== 'ACTIVE' || !record.terminalAccess || record.role === 'PASSENGER') {
      return {
        success: false,
        error: 'This conductor badge is not authorized for terminal access.',
      };
    }

    const sanitizedUser = staffDatabase.sanitizeUser(record);
    const accessToken = generateSecureToken('mta_nfc_token');
    const terminal = await terminalApi.getTerminalStatus();

    const session: StaffSession = {
      token: accessToken,
      user: sanitizedUser,
      expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      terminalId: terminal.terminalId,
      loginTime: new Date().toISOString(),
      authMethod: 'NFC',
    };

    return {
      success: true,
      user: sanitizedUser,
      accessToken,
      badgeId: cleanBadge,
      session,
    };
  }

  /**
   * POST /api/auth/staff/forgot-password
   */
  public async requestPasswordReset(identifier: string): Promise<ForgotPasswordResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (terminalApi.isOffline()) {
      return {
        success: false,
        message: '',
        error: 'Unable to connect to the TransitPulse server.',
      };
    }

    const cleanId = identifier.trim();
    if (!cleanId) {
      return {
        success: false,
        message: '',
        error: 'Please enter your Staff ID or registered Work Email.',
      };
    }

    const record = staffDatabase.findByIdentifier(cleanId);
    if (!record || record.role === 'PASSENGER') {
      // Do not disclose user existence to external probes
      return {
        success: true,
        message:
          'If this Staff ID or email is registered with MTA, emergency recovery instructions and PIN have been dispatched.',
      };
    }

    const pin = staffDatabase.createPasswordResetPin(cleanId);
    return {
      success: true,
      message: `Recovery PIN generated for ${record.name}. Contact Dispatch Zone 4 or use PIN below.`,
      recoveryPin: pin,
      contactDispatch: 'MTA Dispatch Zone 4 (Radio #12 / Ext 4028)',
    };
  }

  /**
   * POST /api/auth/staff/reset-password
   */
  public async resetPassword(
    identifier: string,
    pin: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (newPass.length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 alphanumeric characters.',
      };
    }

    const ok = staffDatabase.verifyAndResetPassword(identifier, pin, newPass);
    if (!ok) {
      return {
        success: false,
        error: 'Invalid or expired recovery PIN. Please request a new code.',
      };
    }

    return { success: true };
  }
}

export const staffAuthApi = new StaffAuthApiService();
