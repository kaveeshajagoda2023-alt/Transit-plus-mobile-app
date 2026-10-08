import { StaffUser } from '@/types/staff';
import { sha256 } from '../utils/cryptoUtils';

export interface InternalStaffRecord extends StaffUser {
  passwordHash: string;
  salt: string;
  failedAttempts: number;
  lockoutUntil?: number;
}

const SALT_DEFAULT = 'mta_transit_salt_2026';

// Seeded staff accounts
const INITIAL_STAFF_USERS: InternalStaffRecord[] = [
  {
    id: 'staff-drv-84920',
    staffId: 'DRV-84920',
    name: 'M. Kavi',
    email: 'DRV-84920@transitpulse.gov',
    passwordHash: sha256('TransitSecure2024!' + SALT_DEFAULT),
    salt: SALT_DEFAULT,
    role: 'DRIVER',
    status: 'ACTIVE',
    terminalAccess: true,
    vehicleAccess: ['#4028', '#4208', '#1382'],
    assignedVehicle: '#4028',
    nfcBadgeId: 'NFC-MTA-84920',
    dispatchZone: 'DISPATCH ZONE 4',
    badgeLabel: 'MTA Senior Operator #84920',
    shiftHours: '06:00 - 14:30',
    failedAttempts: 0,
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff-cnd-55219',
    staffId: 'CND-55219',
    name: 'Elena Rostova',
    email: 'cnd.rostova@transitpulse.gov',
    passwordHash: sha256('ConductorPass2024!' + SALT_DEFAULT),
    salt: SALT_DEFAULT,
    role: 'CONDUCTOR',
    status: 'ACTIVE',
    terminalAccess: true,
    vehicleAccess: ['#4028', '#4208', 'TRN-8801'],
    assignedVehicle: '#4028',
    nfcBadgeId: 'NFC-COND-55219',
    dispatchZone: 'DISPATCH ZONE 4',
    badgeLabel: 'MTA Conductor Lead #55219',
    shiftHours: '07:00 - 15:30',
    failedAttempts: 0,
    createdAt: '2023-04-10T09:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff-dsp-10382',
    staffId: 'DSP-10382',
    name: 'David Sterling',
    email: 'dispatch.sterling@transitpulse.gov',
    passwordHash: sha256('DispatchHQ2024!' + SALT_DEFAULT),
    salt: SALT_DEFAULT,
    role: 'DISPATCHER',
    status: 'ACTIVE',
    terminalAccess: true,
    vehicleAccess: ['#4028', '#4208', 'TRN-8801', '#1382', 'TRN-4420'],
    assignedVehicle: 'HQ Terminal 04',
    nfcBadgeId: 'NFC-DSP-10382',
    dispatchZone: 'DISPATCH ZONE 4',
    badgeLabel: 'Zone 4 Dispatch Supervisor',
    shiftHours: '05:00 - 13:00',
    failedAttempts: 0,
    createdAt: '2022-09-01T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff-adm-99001',
    staffId: 'ADM-99001',
    name: 'Sarah Chen',
    email: 'admin.chen@transitpulse.gov',
    passwordHash: sha256('AdminTransit2024!' + SALT_DEFAULT),
    salt: SALT_DEFAULT,
    role: 'ADMIN',
    status: 'ACTIVE',
    terminalAccess: true,
    vehicleAccess: ['ALL'],
    assignedVehicle: 'System-Wide',
    nfcBadgeId: 'NFC-ADM-99001',
    dispatchZone: 'ALL ZONES',
    badgeLabel: 'TransitOps Security Admin',
    shiftHours: 'Flexible',
    failedAttempts: 0,
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  // Passenger account (unauthorized for terminal access)
  {
    id: 'pass-usr-1049',
    staffId: 'PASS-1049',
    name: 'John Miller (Passenger)',
    email: 'passenger.john@gmail.com',
    passwordHash: sha256('Passenger123!' + SALT_DEFAULT),
    salt: SALT_DEFAULT,
    role: 'PASSENGER',
    status: 'ACTIVE',
    terminalAccess: false,
    vehicleAccess: [],
    assignedVehicle: 'None',
    dispatchZone: 'None',
    failedAttempts: 0,
    createdAt: '2024-02-14T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  // Suspended staff member
  {
    id: 'staff-sus-99999',
    staffId: 'DRV-99999',
    name: 'Thomas Hall (Suspended)',
    email: 'suspended.staff@transitpulse.gov',
    passwordHash: sha256('Password123!' + SALT_DEFAULT),
    salt: SALT_DEFAULT,
    role: 'DRIVER',
    status: 'SUSPENDED',
    terminalAccess: false,
    vehicleAccess: [],
    assignedVehicle: 'None',
    dispatchZone: 'DISPATCH ZONE 4',
    failedAttempts: 0,
    createdAt: '2023-06-20T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

class StaffDatabase {
  private users: InternalStaffRecord[] = [...INITIAL_STAFF_USERS];
  private passwordResetRequests = new Map<string, { pin: string; expiresAt: number }>();

  public findByIdentifier(identifier: string): InternalStaffRecord | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.staffId.toLowerCase() === clean
    );
  }

  public findByBadgeId(badgeId: string): InternalStaffRecord | undefined {
    const clean = badgeId.trim().toUpperCase();
    return this.users.find(
      (u) => u.nfcBadgeId && u.nfcBadgeId.toUpperCase() === clean
    );
  }

  public verifyPassword(record: InternalStaffRecord, plainPassword: string): boolean {
    const computedHash = sha256(plainPassword + record.salt);
    return computedHash === record.passwordHash;
  }

  public registerFailedAttempt(userId: string): { locked: boolean; remainingAttempts: number } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { locked: false, remainingAttempts: 5 };

    user.failedAttempts += 1;
    if (user.failedAttempts >= 5) {
      user.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 minute lockout
      return { locked: true, remainingAttempts: 0 };
    }
    return { locked: false, remainingAttempts: 5 - user.failedAttempts };
  }

  public resetFailedAttempts(userId: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.failedAttempts = 0;
      user.lockoutUntil = undefined;
      user.lastLogin = new Date().toISOString();
    }
  }

  public isLockedOut(record: InternalStaffRecord): boolean {
    if (!record.lockoutUntil) return false;
    if (Date.now() > record.lockoutUntil) {
      record.lockoutUntil = undefined;
      record.failedAttempts = 0;
      return false;
    }
    return true;
  }

  public createPasswordResetPin(identifier: string): string {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    this.passwordResetRequests.set(identifier.toLowerCase(), {
      pin,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
    });
    return pin;
  }

  public verifyAndResetPassword(identifier: string, pin: string, newPass: string): boolean {
    const record = this.passwordResetRequests.get(identifier.toLowerCase());
    if (!record || record.pin !== pin || Date.now() > record.expiresAt) {
      return false;
    }

    const user = this.findByIdentifier(identifier);
    if (!user) return false;

    user.passwordHash = sha256(newPass + user.salt);
    user.updatedAt = new Date().toISOString();
    this.passwordResetRequests.delete(identifier.toLowerCase());
    return true;
  }

  public sanitizeUser(record: InternalStaffRecord): StaffUser {
    const { passwordHash, salt, failedAttempts, lockoutUntil, ...sanitized } = record;
    return sanitized;
  }
}

export const staffDatabase = new StaffDatabase();
