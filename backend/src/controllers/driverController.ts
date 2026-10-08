import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { DriverModel } from '../models/Driver.js';
import mongoose from 'mongoose';

export const driverController = {
  // GET /api/drivers - List all drivers / operators with search and filtering
  getAll: async (req: Request, res: Response) => {
    try {
      const { search, role, status, dispatchZone, page, limit } = req.query;

      // MongoDB check
      if (mongoose.connection.readyState === 1) {
        const query: Record<string, unknown> = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (dispatchZone) query.dispatchZone = dispatchZone;
        if (search) {
          const s = String(search).trim();
          query.$or = [
            { name: { $regex: s, $options: 'i' } },
            { staffId: { $regex: s, $options: 'i' } },
            { email: { $regex: s, $options: 'i' } },
            { assignedVehicle: { $regex: s, $options: 'i' } },
          ];
        }

        const p = Math.max(1, parseInt(String(page || '1'), 10));
        const l = Math.max(1, Math.min(100, parseInt(String(limit || '20'), 10)));
        const skip = (p - 1) * l;

        const [items, total] = await Promise.all([
          DriverModel.find(query).skip(skip).limit(l).sort({ createdAt: -1 }),
          DriverModel.countDocuments(query),
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
      const result = db.getAllDrivers({
        search: search ? String(search) : undefined,
        role: role ? String(role) : undefined,
        status: status ? String(status) : undefined,
        dispatchZone: dispatchZone ? String(dispatchZone) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 20,
      });

      return res.json({
        success: true,
        source: 'in-memory',
        data: result.drivers,
        pagination: {
          total: result.total,
          page: result.page,
          limit: limit ? parseInt(String(limit), 10) : 20,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve drivers';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // GET /api/drivers/:id - Get single driver by ID or Staff ID
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        const doc = await DriverModel.findById(id);
        if (doc) {
          return res.json({ success: true, source: 'mongodb', data: doc.toJSON() });
        }
      }

      const driver = db.getDriverById(id) || db.findStaffByIdentifier(id);
      if (!driver) {
        return res.status(404).json({ success: false, error: `Driver with ID '${id}' not found.` });
      }

      return res.json({ success: true, source: 'in-memory', data: driver });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve driver';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // POST /api/drivers - Create new driver / operator
  create: async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        staffId,
        phone,
        licenseNumber,
        role,
        status,
        assignedVehicle,
        dispatchZone,
        badgeLabel,
        shiftHours,
        password,
        pin,
      } = req.body;

      if (!name || !String(name).trim()) {
        return res.status(400).json({ success: false, error: 'Driver full name is required.' });
      }

      if (!email || !String(email).includes('@')) {
        return res.status(400).json({ success: false, error: 'Valid driver work email is required.' });
      }

      const existing = db.findStaffByIdentifier(email) || (staffId && db.findStaffByIdentifier(staffId));
      if (existing) {
        return res.status(409).json({ success: false, error: 'A staff member with this email or Staff ID already exists.' });
      }

      const newDriver = db.createDriver({
        name,
        email,
        staffId,
        phone,
        role: role || 'DRIVER',
        status: status || 'ACTIVE',
        assignedVehicle: assignedVehicle || 'Bus #4028',
        dispatchZone: dispatchZone || 'DISPATCH ZONE 4',
        badgeLabel: badgeLabel || 'Transit Operator',
        shiftHours: shiftHours || '06:00 - 14:00',
        password: password || 'TransitSecure2024!',
        pin: pin || '4028',
      });

      // MongoDB sync
      if (mongoose.connection.readyState === 1) {
        try {
          const doc = await DriverModel.create({
            staffId: newDriver.staffId,
            name: newDriver.name,
            email: newDriver.email,
            phone,
            licenseNumber,
            role: newDriver.role,
            status: newDriver.status,
            assignedVehicle: newDriver.assignedVehicle,
            dispatchZone: newDriver.dispatchZone,
            badgeLabel: newDriver.badgeLabel,
            shiftHours: newDriver.shiftHours,
            terminalAccess: newDriver.terminalAccess,
          });
          return res.status(201).json({
            success: true,
            message: 'Driver profile created successfully.',
            source: 'mongodb',
            data: doc.toJSON(),
          });
        } catch {
          // Keep in-memory
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Driver profile created successfully.',
        source: 'in-memory',
        data: newDriver,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create driver';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // PUT / PATCH /api/drivers/:id - Update driver profile
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      delete updates.id;
      delete updates._id;

      let updatedDoc = null;
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        updatedDoc = await DriverModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
      }

      const updated = db.updateDriver(id, updates);

      if (!updated && !updatedDoc) {
        return res.status(404).json({ success: false, error: `Driver with ID '${id}' not found.` });
      }

      return res.json({
        success: true,
        message: 'Driver details updated successfully.',
        data: updatedDoc ? updatedDoc.toJSON() : updated,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update driver';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // DELETE /api/drivers/:id - Delete driver profile
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        await DriverModel.findByIdAndDelete(id);
      }

      const deleted = db.deleteDriver(id);

      if (!deleted) {
        return res.status(404).json({ success: false, error: `Driver with ID '${id}' not found.` });
      }

      return res.json({
        success: true,
        message: `Driver with ID '${id}' has been permanently deleted.`,
        deletedId: id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete driver';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // POST /api/drivers/:id/assign-vehicle - Assign new fleet vehicle
  assignVehicle: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { vehicleNumber } = req.body;

      if (!vehicleNumber || !String(vehicleNumber).trim()) {
        return res.status(400).json({ success: false, error: 'Vehicle number is required.' });
      }

      const driver = db.getDriverById(id);
      if (!driver) {
        return res.status(404).json({ success: false, error: `Driver with ID '${id}' not found.` });
      }

      driver.assignedVehicle = vehicleNumber.trim();
      if (!driver.vehicleAccess.includes(driver.assignedVehicle)) {
        driver.vehicleAccess.push(driver.assignedVehicle);
      }

      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        await DriverModel.findByIdAndUpdate(id, {
          assignedVehicle: driver.assignedVehicle,
          $addToSet: { vehicleAccess: driver.assignedVehicle },
        });
      }

      return res.json({
        success: true,
        message: `Vehicle assigned to ${driver.assignedVehicle}.`,
        data: driver,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign vehicle';
      return res.status(500).json({ success: false, error: message });
    }
  },

  // POST /api/drivers/:id/duty-status - Switch duty status (ACTIVE, OFF_DUTY, SUSPENDED)
  switchDutyStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'OFF_DUTY', 'SUSPENDED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Status must be 'ACTIVE', 'OFF_DUTY', or 'SUSPENDED'.",
        });
      }

      const driver = db.getDriverById(id);
      if (!driver) {
        return res.status(404).json({ success: false, error: `Driver with ID '${id}' not found.` });
      }

      driver.status = status;

      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        await DriverModel.findByIdAndUpdate(id, { status });
      }

      return res.json({
        success: true,
        message: `Duty status switched to ${status}.`,
        data: driver,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to switch duty status';
      return res.status(500).json({ success: false, error: message });
    }
  },
};
