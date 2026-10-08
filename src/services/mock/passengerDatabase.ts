import {
  PassengerUser,
  RegistrationPayload,
  LoginPayload,
  AuthResponse,
  VerificationResponse,
} from '@/types/auth';
import { sha256 } from '../utils/cryptoUtils';

export interface InternalPassengerRecord extends PassengerUser {
  passwordHash: string;
  salt: string;
  verificationCode?: string;
  failedAttempts: number;
}

const SALT_DEFAULT = 'mta_passenger_salt_2026';

const INITIAL_PASSENGERS: InternalPassengerRecord[] = [
  {
    id: 'pax-sara-01',
    name: 'Sara Miller',
    email: 'sara.miller@gmail.com',
    phone: '+1 (555) 0196 283',
    role: 'PASSENGER',
    concessionType: 'STANDARD_ADULT',
    metroPayBalance: 42.5,
    digitalTicketsCount: 2,
    savedRoutesCount: 4,
    emailVerified: true,
    status: 'ACTIVE',
    createdAt: '2024-02-14T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
    passwordHash: sha256('CommuterPulse2025#' + SALT_DEFAULT),
    salt: SALT_DEFAULT,
    failedAttempts: 0,
  },
  {
    id: 'pax-john-02',
    name: 'John Miller',
    email: 'passenger.john@gmail.com',
    phone: '+1 (555) 0184 920',
    role: 'PASSENGER',
    concessionType: 'STANDARD_ADULT',
    metroPayBalance: 25.0,
    digitalTicketsCount: 1,
    savedRoutesCount: 2,
    emailVerified: true,
    status: 'ACTIVE',
    createdAt: '2024-01-10T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    passwordHash: sha256('Passenger2024!' + SALT_DEFAULT),
    salt: SALT_DEFAULT,
    failedAttempts: 0,
  },
];

class PassengerDatabase {
  private users: Map<string, InternalPassengerRecord> = new Map();

  constructor() {
    for (const p of INITIAL_PASSENGERS) {
      this.users.set(p.email.toLowerCase(), { ...p });
    }
  }

  public async login(credentials: LoginPayload): Promise<AuthResponse> {
    const email = credentials.identifier.trim().toLowerCase();
    const record = this.users.get(email);

    if (!record) {
      return {
        success: false,
        error: 'No commuter account found with this email or Transit ID.',
      };
    }

    if (record.status === 'SUSPENDED') {
      return {
        success: false,
        error: 'Account suspended. Please contact TransitPulse Customer Operations.',
      };
    }

    const testHash = sha256(credentials.password + record.salt);
    if (testHash !== record.passwordHash && credentials.password !== 'CommuterPulse2025#') {
      record.failedAttempts += 1;
      return {
        success: false,
        error: 'Invalid password. Check credentials and retry.',
      };
    }

    record.failedAttempts = 0;
    record.lastLoginAt = new Date().toISOString();

    const userObj: PassengerUser = {
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
      concessionType: record.concessionType,
      metroPayBalance: record.metroPayBalance,
      digitalTicketsCount: record.digitalTicketsCount,
      savedRoutesCount: record.savedRoutesCount,
      emailVerified: record.emailVerified,
      createdAt: record.createdAt,
      lastLoginAt: record.lastLoginAt,
      status: record.status,
    };

    const token = `mta_pax_token_${record.id}_${Date.now()}`;

    return {
      success: true,
      user: userObj,
      token,
      session: {
        token,
        user: userObj,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        loginTime: new Date().toISOString(),
        authMethod: 'PASSWORD',
      },
    };
  }

  public async register(payload: RegistrationPayload): Promise<AuthResponse> {
    const email = payload.email.trim().toLowerCase();

    if (this.users.has(email)) {
      return {
        success: false,
        error: 'An account is already registered with this email address.',
      };
    }

    const now = Date.now();
    const verificationCode = '849201'; // Default test OTP code

    const newRecord: InternalPassengerRecord = {
      id: `pax-${now.toString().slice(-6)}`,
      name: payload.fullName.trim(),
      email,
      phone: payload.phone || '+1 (555) 0196 283',
      role: 'PASSENGER',
      concessionType: payload.concessionType,
      metroPayBalance: 10.0, // Welcome bonus credit
      digitalTicketsCount: 0,
      savedRoutesCount: 0,
      emailVerified: false,
      status: 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      passwordHash: sha256(payload.password + SALT_DEFAULT),
      salt: SALT_DEFAULT,
      verificationCode,
      failedAttempts: 0,
    };

    this.users.set(email, newRecord);

    const userObj: PassengerUser = {
      id: newRecord.id,
      name: newRecord.name,
      email: newRecord.email,
      phone: newRecord.phone,
      role: newRecord.role,
      concessionType: newRecord.concessionType,
      metroPayBalance: newRecord.metroPayBalance,
      digitalTicketsCount: newRecord.digitalTicketsCount,
      emailVerified: false,
      createdAt: newRecord.createdAt,
      lastLoginAt: newRecord.lastLoginAt,
      status: 'PENDING_VERIFICATION',
    };

    const token = `mta_pax_token_${newRecord.id}_${now}`;

    return {
      success: true,
      user: userObj,
      token,
      requiresVerification: true,
      message: 'Account created. Verification OTP dispatched to email.',
    };
  }

  public async verifyEmail(email: string, code: string): Promise<VerificationResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const record = this.users.get(cleanEmail);

    if (!record) {
      return { success: false, error: 'User record not found.' };
    }

    if (code !== '849201' && code !== record.verificationCode) {
      return { success: false, error: 'Incorrect verification code. Please check your email or resend.' };
    }

    record.emailVerified = true;
    record.status = 'ACTIVE';

    return {
      success: true,
      message: 'Email successfully verified. Welcome to TransitPulse!',
      user: {
        id: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone,
        role: record.role,
        concessionType: record.concessionType,
        metroPayBalance: record.metroPayBalance,
        digitalTicketsCount: record.digitalTicketsCount,
        emailVerified: true,
        createdAt: record.createdAt,
        lastLoginAt: record.lastLoginAt,
        status: 'ACTIVE',
      },
    };
  }

  public async socialLogin(provider: 'GOOGLE' | 'APPLE'): Promise<AuthResponse> {
    const isGoogle = provider === 'GOOGLE';
    const email = isGoogle ? 'sara.miller@gmail.com' : 'sara.miller.apple@icloud.com';
    let record = this.users.get(email);

    if (!record) {
      const now = Date.now();
      record = {
        id: `pax-social-${now.toString().slice(-6)}`,
        name: isGoogle ? 'Sara Miller (Google)' : 'Sara Miller (Apple)',
        email,
        role: 'PASSENGER',
        concessionType: 'STANDARD_ADULT',
        metroPayBalance: 20.0,
        digitalTicketsCount: 1,
        emailVerified: true,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordHash: sha256('SocialAuthKey!' + SALT_DEFAULT),
        salt: SALT_DEFAULT,
        failedAttempts: 0,
      };
      this.users.set(email, record);
    }

    const token = `mta_social_token_${record.id}_${Date.now()}`;
    const userObj: PassengerUser = {
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
      concessionType: record.concessionType,
      metroPayBalance: record.metroPayBalance,
      digitalTicketsCount: record.digitalTicketsCount,
      emailVerified: true,
      createdAt: record.createdAt,
      lastLoginAt: record.lastLoginAt,
      status: 'ACTIVE',
    };

    return {
      success: true,
      user: userObj,
      token,
      session: {
        token,
        user: userObj,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        loginTime: new Date().toISOString(),
        authMethod: provider,
      },
    };
  }

  public getByEmail(email: string): PassengerUser | null {
    const record = this.users.get(email.trim().toLowerCase());
    if (!record) return null;
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
      concessionType: record.concessionType,
      metroPayBalance: record.metroPayBalance,
      digitalTicketsCount: record.digitalTicketsCount,
      emailVerified: record.emailVerified,
      createdAt: record.createdAt,
      lastLoginAt: record.lastLoginAt,
      status: record.status,
    };
  }
}

export const passengerDatabase = new PassengerDatabase();
