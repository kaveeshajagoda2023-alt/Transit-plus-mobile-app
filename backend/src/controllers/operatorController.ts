import { Request, Response } from 'express';
import { db } from '../db/database.js';

export const operatorController = {
  async getProfile(req: Request, res: Response): Promise<void> {
    const profile = db.getOperatorProfile();
    res.json({ success: true, profile, ...profile });
  },

  async updateDutyStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.body;
    if (!status || !['ON DUTY', 'OFF DUTY', 'ON BREAK'].includes(status)) {
      res.status(400).json({ success: false, error: 'Valid duty status required.' });
      return;
    }
    const profile = db.updateDutyStatus(status);
    res.json({ success: true, profile, ...profile });
  },

  async switchVehicle(req: Request, res: Response): Promise<void> {
    const { busNumber, fleetType } = req.body;
    if (!busNumber) {
      res.status(400).json({ success: false, error: 'Vehicle bus number required.' });
      return;
    }
    const profile = db.switchVehicle(busNumber, fleetType);
    res.json({ success: true, profile, ...profile });
  },

  async toggleBeep(req: Request, res: Response): Promise<void> {
    const enabled = req.body.enabled as boolean | undefined;
    const result = db.toggleScannerBeep(enabled);
    res.json({ success: true, beepEnabled: result });
  },

  async toggleBrightness(req: Request, res: Response): Promise<void> {
    const enabled = req.body.enabled as boolean | undefined;
    const result = db.toggleBrightnessBoost(enabled);
    res.json({ success: true, brightnessBoost: result });
  },

  async reconnectScanner(req: Request, res: Response): Promise<void> {
    const result = db.reconnectScanner();
    res.json({ success: true, ...result });
  },

  async syncAirGap(req: Request, res: Response): Promise<void> {
    const result = db.syncAirGapCache();
    res.json({ success: true, ...result });
  },

  async reportFault(req: Request, res: Response): Promise<void> {
    const { category, severity, description, busNumber } = req.body;
    if (!category || !severity || !description) {
      res.status(400).json({ success: false, error: 'Category, severity, and description required.' });
      return;
    }
    const report = db.reportVehicleFault({ category, severity, description, busNumber });
    res.status(201).json({ success: true, report });
  },

  async getFaults(req: Request, res: Response): Promise<void> {
    const faults = db.getFaultReports();
    res.json({ success: true, faults });
  },

  async completeShiftSummary(req: Request, res: Response): Promise<void> {
    const summary = db.completeShiftSummary();
    res.json({ success: true, summary, ...summary });
  },
};
