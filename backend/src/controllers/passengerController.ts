import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { PassengerModel } from '../models/Passenger.js';
import mongoose from 'mongoose';

export const passengerController = {
  // GET /api/passengers - List all commuters with search, filter, pagination
  getAll: async (req: Request, res: Response) => {
    try {
      const { search, status, concessionType, page, limit } = req.query;

      // Check if MongoDB is connected
      if (mongoose.connection.readyState === 1) {
        const query: Record<string, unknown> = {};
        if (status) query.status = status;
        if (concessionType) query.concessionType = concessionType;
        if (search) {
          const s = String(search).trim();
          query.$or = [
            { name: { $regex: s, $options: 'i' } },
            { email: { $regex: s, $options: 'i' } },
            { phone: { $regex: s, $options: 'i' } },
          ];
        }

        const p = Math.max(1, parseInt(String(page || '1'), 10));
        const l = Math.max(1, Math.min(100, parseInt(String(limit || '20'), 10)));
        const skip = (p - 1) * l;

        const [items, total] = await Promise.all([
          PassengerModel.find(query).skip(skip).limit(l).sort({ createdAt: -1 }),
          PassengerModel.countDocuments(query),
        ]);

        if (total > 0) {
          return res.json({
            success: true,
            source: 'mongodb',
            data: items.map((doc) => doc.toJSON()),
            pagination: {
              total,
              page: p,
              limit: l,
              totalPages: Math.ceil(total / l) || 1,
            },
          });
        }
      }

      // Memory DB fallback
      const result = db.getAllPassengers({
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        concessionType: concessionType ? String(concessionType) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 20,
      });

      return res.json({
        success: true,
        source: 'in-memory',
        data: result.passengers,
        pagination: {
          total: result.total,
          page: result.page,
          limit: limit ? parseInt(String(limit), 10) : 20,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve passengers';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // GET /api/passengers/:id - Get single commuter by ID
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        const doc = await PassengerModel.findById(id);
        if (doc) {
          return res.json({ success: true, source: 'mongodb', data: doc.toJSON() });
        }
      }

      const passenger = db.findPassengerById(id) || db.findPassengerByEmail(id);
      if (!passenger) {
        return res.status(404).json({ success: false, error: `Passenger with ID '${id}' not found.` });
      }

      return res.json({ success: true, source: 'in-memory', data: passenger });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve passenger';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // POST /api/passengers - Create new commuter
  create: async (req: Request, res: Response) => {
    try {
      const { name, fullName, email, phone, password, concessionType, status, metroPayBalance } = req.body;

      const passengerName = (name || fullName || '').trim();
      if (!passengerName) {
        return res.status(400).json({ success: false, error: 'Full name is required.' });
      }

      if (!email || !String(email).includes('@')) {
        return res.status(400).json({ success: false, error: 'Valid email address is required.' });
      }

      const existing = db.findPassengerByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      }

      const newPassenger = db.createPassenger({
        fullName: passengerName,
        email,
        phone,
        password: password || 'CommuterPulse2025#',
        concessionType: concessionType || 'STANDARD_ADULT',
      });

      if (status) newPassenger.status = status;
      if (typeof metroPayBalance === 'number') newPassenger.metroPayBalance = metroPayBalance;

      // MongoDB sync
      if (mongoose.connection.readyState === 1) {
        try {
          const doc = await PassengerModel.create({
            name: newPassenger.name,
            email: newPassenger.email,
            phone: newPassenger.phone,
            concessionType: newPassenger.concessionType,
            status: newPassenger.status,
            metroPayBalance: newPassenger.metroPayBalance,
            digitalTicketsCount: newPassenger.digitalTicketsCount,
            emailVerified: true,
            passwordHash: newPassenger.passwordHash,
          });
          return res.status(201).json({
            success: true,
            message: 'Passenger created successfully.',
            source: 'mongodb',
            data: doc.toJSON(),
          });
        } catch {
          // Keep in-memory result if MongoDB sync encounters error
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Passenger created successfully.',
        source: 'in-memory',
        data: newPassenger,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create passenger';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // PUT / PATCH /api/passengers/:id - Update commuter
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove restricted properties
      delete updates.id;
      delete updates._id;

      let updatedDoc = null;
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        updatedDoc = await PassengerModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
      }

      const updated = db.updatePassenger(id, updates);

      if (!updated && !updatedDoc) {
        return res.status(404).json({ success: false, error: `Passenger with ID '${id}' not found.` });
      }

      return res.json({
        success: true,
        message: 'Passenger profile updated successfully.',
        data: updatedDoc ? updatedDoc.toJSON() : updated,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update passenger';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // DELETE /api/passengers/:id - Delete commuter
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        await PassengerModel.findByIdAndDelete(id);
      }

      const deleted = db.deletePassenger(id);

      if (!deleted) {
        return res.status(404).json({ success: false, error: `Passenger with ID '${id}' not found.` });
      }

      return res.json({
        success: true,
        message: `Passenger with ID '${id}' has been permanently deleted.`,
        deletedId: id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete passenger';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // POST /api/passengers/:id/top-up - Wallet top-up
  topUp: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      const numAmount = parseFloat(String(amount));
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, error: 'A valid positive amount is required.' });
      }

      const passenger = db.findPassengerById(id);
      if (!passenger) {
        return res.status(404).json({ success: false, error: `Passenger with ID '${id}' not found.` });
      }

      passenger.metroPayBalance = (passenger.metroPayBalance || 0) + numAmount;

      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        await PassengerModel.findByIdAndUpdate(id, { $inc: { metroPayBalance: numAmount } });
      }

      return res.json({
        success: true,
        message: `Added $${numAmount.toFixed(2)} to wallet.`,
        balance: passenger.metroPayBalance,
        data: passenger,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to top up wallet';
      return res.status(500).json({ success: false, error: message });
    }
  },
};
