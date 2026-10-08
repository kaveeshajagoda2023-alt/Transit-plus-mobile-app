import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { TransportFilterType } from '../types/index.js';

export const vehicleController = {
  async getVehicles(req: Request, res: Response): Promise<void> {
    const filter = req.query.filter as TransportFilterType | undefined;
    const vehicles = db.getVehicles(filter);
    res.json({ success: true, count: vehicles.length, vehicles });
  },

  async getVehicleById(req: Request, res: Response): Promise<void> {
    const vehicle = db.getVehicleById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ success: false, error: 'Vehicle not found.' });
      return;
    }
    res.json({ success: true, vehicle });
  },

  async getVehicleLocation(req: Request, res: Response): Promise<void> {
    const vehicle = db.getVehicleById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ success: false, error: 'Vehicle not found.' });
      return;
    }
    res.json({
      success: true,
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      speed: vehicle.speed,
      heading: vehicle.heading,
      updatedAt: vehicle.updatedAt,
    });
  },

  async updateTelemetry(req: Request, res: Response): Promise<void> {
    const { latitude, longitude, speed, heading } = req.body;
    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ success: false, error: 'Latitude and longitude required.' });
      return;
    }
    const updated = db.updateVehicleTelemetry(
      req.params.id,
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      speed !== undefined ? parseFloat(speed) : undefined,
      heading !== undefined ? parseFloat(heading) : undefined
    );
    if (!updated) {
      res.status(404).json({ success: false, error: 'Vehicle not found.' });
      return;
    }
    res.json({ success: true, vehicle: updated });
  },

  // U - UPDATE: Update live bus GPS location & automatically recalculate ETA
  async updateLocation(req: Request, res: Response): Promise<void> {
    const { latitude, longitude, speed, heading, status } = req.body;
    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ success: false, error: 'Latitude and longitude required.' });
      return;
    }
    const updated = db.updateBusLocationAndETA(
      req.params.id,
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      speed !== undefined ? parseFloat(speed) : undefined,
      heading !== undefined ? parseFloat(heading) : undefined,
      status
    );
    if (!updated) {
      res.status(404).json({ success: false, error: 'Vehicle not found.' });
      return;
    }
    res.json({
      success: true,
      message: 'Bus location updated and dynamic ETA recalculated.',
      vehicle: updated,
      etaMinutes: updated.eta,
    });
  },
};
