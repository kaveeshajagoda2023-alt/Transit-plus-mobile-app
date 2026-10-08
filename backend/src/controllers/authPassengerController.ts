import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { db } from '../db/database.js';
import { signToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { PassengerModel } from '../models/Passenger.js';

export const authPassengerController = {
  async register(req: Request, res: Response): Promise<void> {
    const { fullName, email, password, concessionType, agreeToTerms } = req.body;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ success: false, error: 'Full name is required.' });
      return;
    }

    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'A valid email address is required.' });
      return;
    }

    if (!password || password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with letters, numbers and symbols.',
      });
      return;
    }

    if (!agreeToTerms) {
      res.status(400).json({
        success: false,
        error: 'You must agree to the Transit Bylaws & Privacy Policy to continue.',
      });
      return;
    }

    const existing = db.findPassengerByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      });
      return;
    }

    const user = db.createPassenger({
      fullName,
      email,
      password,
      concessionType: concessionType || 'STANDARD_ADULT',
    });

    // Save to MongoDB Atlas collection: 'passengers'
    if (mongoose.connection.readyState === 1) {
      try {
        await PassengerModel.create({
          name: user.name,
          email: user.email,
          phone: user.phone,
          concessionType: user.concessionType,
          status: user.status,
          metroPayBalance: user.metroPayBalance,
          digitalTicketsCount: user.digitalTicketsCount,
          emailVerified: user.emailVerified,
          passwordHash: user.passwordHash,
          otpCode: user.otpCode,
        });
      } catch (err) {
        console.warn('MongoDB passenger sync notice:', err);
      }
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: 'PASSENGER',
      name: user.name,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, otpCode, ...cleanUser } = user;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Verification OTP dispatched.',
      token,
      user: cleanUser,
      requiresVerification: true,
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const { identifier, password } = req.body;

    const cleanId = (identifier || '').trim();
    if (!cleanId || !password) {
      res.status(400).json({
        success: false,
        error: 'Please enter both your Transit ID / Email and password.',
      });
      return;
    }

    const user = db.findPassengerByEmail(cleanId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Account not found. Please verify credentials or register.',
      });
      return;
    }

    const isValid = db.verifyPassengerPassword(user, password);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Incorrect password entered. Please try again.',
      });
      return;
    }

    user.lastLoginAt = new Date().toISOString();
    const token = signToken({
      id: user.id,
      email: user.email,
      role: 'PASSENGER',
      name: user.name,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, otpCode, ...cleanUser } = user;

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: cleanUser,
    });
  },

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        error: 'Email and verification code are required.',
      });
      return;
    }

    const result = db.verifyPassengerEmail(email, code);
    if (!result.success || !result.user) {
      res.status(400).json({
        success: false,
        error: result.error || 'Verification failed.',
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, otpCode, ...cleanUser } = result.user;

    res.json({
      success: true,
      message: 'Account verified successfully.',
      user: cleanUser,
    });
  },

  async socialLogin(req: Request, res: Response): Promise<void> {
    const { provider } = req.body;

    if (!['GOOGLE', 'APPLE'].includes(provider)) {
      res.status(400).json({
        success: false,
        error: 'Unsupported social identity provider.',
      });
      return;
    }

    const email = provider === 'GOOGLE' ? 'alex.river@gmail.com' : 'apple.commuter@privaterelay.appleid.com';
    let user = db.findPassengerByEmail(email);
    if (!user) {
      user = db.createPassenger({
        fullName: provider === 'GOOGLE' ? 'Alex River' : 'Apple Commuter',
        email,
        password: 'SocialLoginSecuredPass123!',
        concessionType: 'STANDARD_ADULT',
      });
      user.emailVerified = true;
      user.status = 'ACTIVE';
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: 'PASSENGER',
      name: user.name,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, otpCode, ...cleanUser } = user;

    res.json({
      success: true,
      token,
      user: cleanUser,
    });
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      res.status(400).json({
        success: false,
        error: 'Please enter a valid commuter email address.',
      });
      return;
    }

    res.json({
      success: true,
      message: `Password reset instructions dispatched to ${cleanEmail}.`,
    });
  },

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const user = db.findPassengerById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, otpCode, ...cleanUser } = user;
    res.json({ success: true, user: cleanUser });
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const updated = db.updatePassenger(req.user.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, otpCode, ...cleanUser } = updated;
    res.json({ success: true, user: cleanUser });
  },
};
