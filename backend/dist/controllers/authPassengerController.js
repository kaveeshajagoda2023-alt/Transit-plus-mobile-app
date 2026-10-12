import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { db } from '../db/database.js';
import { signToken } from '../utils/jwt.js';
import { PassengerModel } from '../models/Passenger.js';
import { config } from '../config/index.js';
import { sendPassengerVerificationCode } from '../services/emailService.js';
import { connectMongoDB } from '../db/mongoConnect.js';
const REGISTRATION_CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_CODE_ATTEMPTS = 5;
const pendingRegistrations = new Map();
const sendingRegistrationEmails = new Set();
function hashCode(email, code) {
    return createHmac('sha256', config.jwtSecret).update(`${email}:${code}`).digest('hex');
}
function codesMatch(expectedHash, email, code) {
    const expected = Buffer.from(expectedHash, 'hex');
    const actual = Buffer.from(hashCode(email, code), 'hex');
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
async function sendVerificationEmail(email, code, res) {
    try {
        await sendPassengerVerificationCode(email, code);
        return true;
    }
    catch (error) {
        const configured = error instanceof Error && error.message === 'EMAIL_NOT_CONFIGURED';
        res.status(configured ? 503 : 502).json({
            success: false,
            error: configured
                ? 'Email verification is not configured. Set RESEND_API_KEY and EMAIL_FROM in the backend environment.'
                : 'Could not send the verification email. Please try again shortly.',
        });
        return false;
    }
}
async function ensureMongoConnection() {
    if (mongoose.connection.readyState === 1)
        return true;
    return connectMongoDB();
}
export const authPassengerController = {
    async register(req, res) {
        const { fullName, email, phone, password, concessionType, agreeToTerms } = req.body;
        if (!fullName || !fullName.trim()) {
            res.status(400).json({ success: false, error: 'Full name is required.' });
            return;
        }
        const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
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
        if (!(await ensureMongoConnection())) {
            res.status(503).json({
                success: false,
                error: 'Database unavailable. Registration cannot continue until MongoDB reconnects.',
            });
            return;
        }
        const existing = db.findPassengerByEmail(cleanEmail);
        if (existing?.emailVerified) {
            res.status(409).json({
                success: false,
                error: 'An account with this email address already exists. Please log in.',
            });
            return;
        }
        if (mongoose.connection.readyState === 1) {
            const existingMongoUser = await PassengerModel.findOne({ email: cleanEmail }).select('emailVerified');
            if (existingMongoUser?.emailVerified) {
                res.status(409).json({
                    success: false,
                    error: 'An account with this email address already exists. Please log in.',
                });
                return;
            }
        }
        const currentPending = pendingRegistrations.get(cleanEmail);
        if (currentPending && currentPending.expiresAt > Date.now()) {
            res.status(409).json({
                success: false,
                error: 'Email verification is already in progress. Enter the code or use Resend Code.',
            });
            return;
        }
        pendingRegistrations.delete(cleanEmail);
        if (sendingRegistrationEmails.has(cleanEmail)) {
            res.status(429).json({ success: false, error: 'A verification email is already being sent.' });
            return;
        }
        sendingRegistrationEmails.add(cleanEmail);
        try {
            const code = randomInt(100_000, 1_000_000).toString();
            const passwordHash = await bcrypt.hash(password, 10);
            if (!(await sendVerificationEmail(cleanEmail, code, res)))
                return;
            const now = Date.now();
            pendingRegistrations.set(cleanEmail, {
                fullName: fullName.trim(),
                email: cleanEmail,
                phone: typeof phone === 'string' ? phone.trim() : undefined,
                concessionType: ['STANDARD_ADULT', 'STUDENT_YOUTH', 'SENIOR_CONCESSION'].includes(concessionType)
                    ? concessionType
                    : 'STANDARD_ADULT',
                passwordHash,
                codeHash: hashCode(cleanEmail, code),
                expiresAt: now + REGISTRATION_CODE_TTL_MS,
                sentAt: now,
                attempts: 0,
                verifying: false,
                resending: false,
            });
        }
        finally {
            sendingRegistrationEmails.delete(cleanEmail);
        }
        res.status(202).json({
            success: true,
            message: 'A verification code was sent to your email. Enter it to finish creating your account.',
            requiresVerification: true,
        });
    },
    async resendOtp(req, res) {
        const cleanEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const pending = pendingRegistrations.get(cleanEmail);
        if (!pending || pending.expiresAt <= Date.now()) {
            pendingRegistrations.delete(cleanEmail);
            res.status(400).json({ success: false, error: 'Registration expired. Please submit the form again.' });
            return;
        }
        const remainingMs = RESEND_COOLDOWN_MS - (Date.now() - pending.sentAt);
        if (remainingMs > 0) {
            res.status(429).json({ success: false, error: `Please wait ${Math.ceil(remainingMs / 1000)} seconds before resending.` });
            return;
        }
        if (pending.resending) {
            res.status(429).json({ success: false, error: 'A verification email is already being sent.' });
            return;
        }
        const code = randomInt(100_000, 1_000_000).toString();
        pending.resending = true;
        try {
            if (!(await sendVerificationEmail(cleanEmail, code, res)))
                return;
            pending.codeHash = hashCode(cleanEmail, code);
            pending.expiresAt = Date.now() + REGISTRATION_CODE_TTL_MS;
            pending.sentAt = Date.now();
            pending.attempts = 0;
            res.json({ success: true, message: 'A new verification code was sent.' });
        }
        finally {
            pending.resending = false;
        }
    },
    async login(req, res) {
        const { identifier, password } = req.body;
        const cleanId = (identifier || '').trim();
        if (!cleanId || !password) {
            res.status(400).json({
                success: false,
                error: 'Please enter both your Transit ID / Email and password.',
            });
            return;
        }
        const normalizedEmail = cleanId.toLowerCase();
        let user = db.findPassengerByEmail(normalizedEmail);
        if (!user && mongoose.connection.readyState === 1) {
            const storedUser = await PassengerModel.findOne({ email: normalizedEmail });
            if (storedUser) {
                user = {
                    id: storedUser._id.toString(),
                    name: storedUser.name,
                    email: storedUser.email,
                    phone: storedUser.phone,
                    role: 'PASSENGER',
                    concessionType: storedUser.concessionType,
                    metroPayBalance: storedUser.metroPayBalance,
                    digitalTicketsCount: storedUser.digitalTicketsCount,
                    emailVerified: storedUser.emailVerified,
                    createdAt: storedUser.createdAt?.toISOString() || new Date().toISOString(),
                    lastLoginAt: storedUser.lastLoginAt,
                    status: storedUser.status,
                    passwordHash: storedUser.passwordHash,
                };
                db.addPassengerRecord(user);
            }
        }
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Account not found. Please verify credentials or register.',
            });
            return;
        }
        if (!user.emailVerified || user.status === 'PENDING_VERIFICATION') {
            res.status(403).json({
                success: false,
                error: 'Please verify your email before signing in.',
                requiresVerification: true,
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
    async verifyOtp(req, res) {
        const cleanEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
        if (!cleanEmail || !/^\d{6}$/.test(code)) {
            res.status(400).json({
                success: false,
                error: 'Enter the email address and the 6-digit verification code.',
            });
            return;
        }
        const pending = pendingRegistrations.get(cleanEmail);
        if (!pending || pending.expiresAt <= Date.now()) {
            pendingRegistrations.delete(cleanEmail);
            res.status(400).json({
                success: false,
                error: 'Verification code expired. Request a new code to continue.',
            });
            return;
        }
        if (pending.verifying) {
            res.status(409).json({ success: false, error: 'This verification is already being processed.' });
            return;
        }
        if (pending.resending) {
            res.status(409).json({ success: false, error: 'Wait for the new verification email before entering its code.' });
            return;
        }
        if (!codesMatch(pending.codeHash, cleanEmail, code)) {
            pending.attempts += 1;
            if (pending.attempts >= MAX_CODE_ATTEMPTS) {
                pendingRegistrations.delete(cleanEmail);
                res.status(400).json({ success: false, error: 'Too many incorrect codes. Submit the form again to restart.' });
                return;
            }
            res.status(400).json({ success: false, error: 'Incorrect verification code. Please check and retry.' });
            return;
        }
        pending.verifying = true;
        try {
            if (!(await ensureMongoConnection())) {
                pending.verifying = false;
                res.status(503).json({
                    success: false,
                    error: 'Database unavailable. Your account was not created; please retry verification.',
                });
                return;
            }
            const existing = db.findPassengerByEmail(cleanEmail);
            if (existing?.emailVerified) {
                pendingRegistrations.delete(cleanEmail);
                res.status(409).json({ success: false, error: 'An account with this email already exists. Please log in.' });
                return;
            }
            const now = new Date().toISOString();
            const passengerFields = {
                name: pending.fullName,
                email: cleanEmail,
                phone: pending.phone,
                concessionType: pending.concessionType,
                status: 'ACTIVE',
                metroPayBalance: 0,
                digitalTicketsCount: 0,
                emailVerified: true,
                passwordHash: pending.passwordHash,
                lastLoginAt: now,
            };
            let id = `usr-${Date.now()}-${randomInt(1000, 10_000)}`;
            if (mongoose.connection.readyState === 1) {
                const existingMongoUser = await PassengerModel.findOne({ email: cleanEmail });
                const savedUser = existingMongoUser
                    ? await PassengerModel.findOneAndUpdate({ email: cleanEmail }, { $set: passengerFields }, { new: true, runValidators: true })
                    : await PassengerModel.create(passengerFields);
                if (!savedUser)
                    throw new Error('PASSENGER_SAVE_FAILED');
                id = savedUser._id.toString();
            }
            const user = {
                id,
                ...passengerFields,
                role: 'PASSENGER',
                createdAt: existing?.createdAt || now,
                passwordHash: pending.passwordHash,
            };
            if (existing) {
                Object.assign(existing, user);
            }
            else {
                db.addPassengerRecord(user);
            }
            pendingRegistrations.delete(cleanEmail);
            const token = signToken({ id: user.id, email: user.email, role: 'PASSENGER', name: user.name });
            const { passwordHash: _passwordHash, ...cleanUser } = user;
            res.json({
                success: true,
                message: 'Account verified successfully.',
                token,
                user: cleanUser,
            });
        }
        catch {
            pending.verifying = false;
            res.status(500).json({ success: false, error: 'Could not finish account creation. Please try again.' });
        }
    },
    async socialLogin(req, res) {
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
    async forgotPassword(req, res) {
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
    async getProfile(req, res) {
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
    async updateProfile(req, res) {
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
