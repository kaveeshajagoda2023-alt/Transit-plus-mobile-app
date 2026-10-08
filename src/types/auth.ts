export type PortalRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';

export type ConcessionType = 'STANDARD_ADULT' | 'STUDENT_YOUTH' | 'SENIOR_CONCESSION';

export interface PassengerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'PASSENGER';
  concessionType: ConcessionType;
  metroPayBalance: number;
  digitalTicketsCount: number;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  savedRoutesCount?: number;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  user: PassengerUser;
  expiresAt: string;
  loginTime: string;
  authMethod: 'PASSWORD' | 'GOOGLE' | 'APPLE' | 'BIOMETRIC';
}

export interface RegistrationPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  concessionType: ConcessionType;
  agreeToTerms: boolean;
  disruptionAlertsEnabled: boolean;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerificationResponse {
  success: boolean;
  message?: string;
  user?: PassengerUser;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: PassengerUser;
  token?: string;
  session?: AuthSession;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
}

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  selectedRole?: PortalRole;
  completedAt?: string;
}
