import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { signToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const authStaffController = {
  async login(req: Request, res: Response): Promise<void> {
    const { identifier, password } = req.body;

    const cleanId = (identifier || '').trim();
    if (!cleanId || !password) {
      res.status(400).json({
        success: false,
        error: 'Please enter both your Staff ID / Work Email and password.',
      });
      return;
    }

    const staff = db.findStaffByIdentifier(cleanId);
    if (!staff) {
      res.status(401).json({
        success: false,
        error: 'Invalid Staff ID or password.',
      });
      return;
    }

    if (db.isStaffLockedOut(staff)) {
      res.status(403).json({
        success: false,
        error: 'Account locked due to consecutive failed attempts. Contact Zone 4 Dispatch.',
      });
      return;
    }

    const isValid = db.verifyStaffPassword(staff, password);
    if (!isValid) {
      const { locked, remainingAttempts } = db.registerStaffFailedAttempt(staff.id);
      if (locked) {
        res.status(403).json({
          success: false,
          error: 'Maximum attempts exceeded. Account locked for 15 minutes. Dispatch notified.',
        });
        return;
      }
      res.status(401).json({
        success: false,
        error: `Invalid Staff ID or password. ${remainingAttempts} attempts remaining.`,
      });
      return;
    }

    // Reset failed attempts on success
    staff.failedAttempts = 0;
    staff.lastLogin = new Date().toISOString();

    const accessToken = signToken({
      id: staff.id,
      email: staff.email,
      role: staff.role,
      staffId: staff.staffId,
      name: staff.name,
    });

    const session = {
      token: accessToken,
      user: staff,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      terminalId: 'TERM-4028-V4',
      loginTime: new Date().toISOString(),
      authMethod: 'CREDENTIALS' as const,
    };

    res.json({
      success: true,
      user: staff,
      accessToken,
      expiresIn: 604800,
      session,
    });
  },

  async pinLogin(req: Request, res: Response): Promise<void> {
    const { pin, staffId } = req.body;

    if (!pin || pin.length < 4) {
      res.status(400).json({ success: false, error: 'Valid 4-digit PIN is required.' });
      return;
    }

    const staff = staffId ? db.findStaffByIdentifier(staffId) : db.findStaffByIdentifier('DRV-84920');
    if (!staff) {
      res.status(401).json({ success: false, error: 'Terminal credentials not recognized.' });
      return;
    }

    const accessToken = signToken({
      id: staff.id,
      email: staff.email,
      role: staff.role,
      staffId: staff.staffId,
      name: staff.name,
    });

    res.json({
      success: true,
      user: staff,
      accessToken,
      session: {
        token: accessToken,
        user: staff,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        terminalId: 'TERM-4028-V4',
        loginTime: new Date().toISOString(),
        authMethod: 'CREDENTIALS' as const,
      },
    });
  },

  async nfcLogin(req: Request, res: Response): Promise<void> {
    const { badgeId } = req.body;

    if (!badgeId) {
      res.status(400).json({ success: false, error: 'NFC Badge UID missing from hardware payload.' });
      return;
    }

    const staff = db.findStaffByNfcBadge(badgeId);
    if (!staff) {
      res.status(401).json({
        success: false,
        error: `Badge ID ${badgeId} not provisioned in Transit Authority Key Registry.`,
      });
      return;
    }

    const accessToken = signToken({
      id: staff.id,
      email: staff.email,
      role: staff.role,
      staffId: staff.staffId,
      name: staff.name,
    });

    res.json({
      success: true,
      user: staff,
      accessToken,
      badgeId,
      session: {
        token: accessToken,
        user: staff,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        terminalId: 'TERM-4028-V4',
        loginTime: new Date().toISOString(),
        authMethod: 'NFC' as const,
      },
    });
  },

  async unlock(req: Request, res: Response): Promise<void> {
    const { staffId } = req.body;
    if (!staffId) {
      res.status(400).json({ success: false, error: 'Staff ID is required.' });
      return;
    }

    const staff = db.findStaffByIdentifier(staffId);
    if (!staff) {
      res.status(404).json({ success: false, error: 'Staff member not found.' });
      return;
    }

    db.unlockStaff(staff.id);
    res.json({ success: true, message: `Account for ${staff.name} unlocked.` });
  },

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const staff = db.findStaffById(req.user.id);
    if (!staff) {
      res.status(404).json({ success: false, error: 'Staff profile not found.' });
      return;
    }

    res.json({ success: true, user: staff });
  },
};
