import { Request, Response } from 'express';
import { db } from '../db/database.js';

export const tripController = {
  async getActiveTrip(req: Request, res: Response): Promise<void> {
    const driverName = req.query.driverName as string | undefined;
    const trip = db.getActiveTrip(driverName);
    res.json({ success: true, trip, ...trip });
  },

  async getTripById(req: Request, res: Response): Promise<void> {
    const trip = db.getTripById(req.params.id);
    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found.' });
      return;
    }
    res.json({ success: true, trip });
  },

  async toggleDoors(req: Request, res: Response): Promise<void> {
    const doorStatus = db.toggleDoors();
    res.json({ success: true, doorStatus });
  },

  async advanceStop(req: Request, res: Response): Promise<void> {
    const trip = db.advanceStop();
    res.json({ success: true, trip, ...trip });
  },

  async updateOccupancy(req: Request, res: Response): Promise<void> {
    const delta = parseInt(req.body.delta ?? '1', 10);
    const trip = db.updateOccupancy(delta);
    res.json({ success: true, trip, ...trip });
  },

  async recordCashFare(req: Request, res: Response): Promise<void> {
    const amount = parseFloat(req.body.amount ?? '50');
    const trip = db.recordCashFare(amount);
    res.json({ success: true, trip, ...trip });
  },

  async reportDelay(req: Request, res: Response): Promise<void> {
    const { reason, estimatedDelayMinutes, notes } = req.body;
    if (!reason || estimatedDelayMinutes === undefined) {
      res.status(400).json({ success: false, error: 'Delay reason and minutes required.' });
      return;
    }
    const trip = db.reportDelay({ reason, estimatedDelayMinutes, notes });
    res.json({ success: true, trip, ...trip });
  },

  async sendDispatchMessage(req: Request, res: Response): Promise<void> {
    const { type, message, priority } = req.body;
    if (!message) {
      res.status(400).json({ success: false, error: 'Message body is required.' });
      return;
    }
    const result = db.sendDispatchMessage({
      type: type || 'GENERAL',
      message,
      priority: priority || 'MEDIUM',
    });
    res.json(result);
  },

  async endTrip(req: Request, res: Response): Promise<void> {
    const trip = db.endTrip();
    res.json({ success: true, trip, ...trip });
  },

  async reportTripIssue(req: Request, res: Response): Promise<void> {
    const { type, description, reporterId } = req.body;
    if (!type || !description) {
      res.status(400).json({ success: false, error: 'Issue type and description required.' });
      return;
    }
    const result = db.reportTripIssue({ type, description, reporterId });
    res.json(result);
  },

  async scanTicket(req: Request, res: Response): Promise<void> {
    const { ticketId, method } = req.body;
    if (!ticketId) {
      res.status(400).json({ success: false, error: 'Ticket ID barcode or UID is required.' });
      return;
    }
    const response = db.validateTicket(ticketId, method || 'QR', req.params.id);
    res.json(response);
  },

  async getManifest(req: Request, res: Response): Promise<void> {
    const manifest = db.getPassengerManifest();
    res.json({ success: true, manifest });
  },

  async boardPassenger(req: Request, res: Response): Promise<void> {
    const passengerId = req.params.passengerId;
    const ok = db.boardPassengerManual(passengerId);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Passenger not found in manifest.' });
      return;
    }
    res.json({ success: true, message: 'Passenger checked in.' });
  },

  async exportManifest(req: Request, res: Response): Promise<void> {
    const report = db.exportManifestReport();
    res.json({ success: true, report });
  },
};
