import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { TransportFilterType } from '../types/index.js';

export const placesController = {
  async getNearbyServices(req: Request, res: Response): Promise<void> {
    const filter = req.query.filter as TransportFilterType | undefined;
    const services = db.getNearbyServices(filter);
    res.json({ success: true, count: services.length, services });
  },

  async getSavedPlaces(req: Request, res: Response): Promise<void> {
    const places = db.getSavedPlaces();
    res.json({ success: true, places });
  },

  async getRecentSearches(req: Request, res: Response): Promise<void> {
    const searches = db.getRecentSearches();
    res.json({ success: true, searches });
  },

  async addRecentSearch(req: Request, res: Response): Promise<void> {
    const { query, type, targetId } = req.body;
    if (!query) {
      res.status(400).json({ success: false, error: 'Query parameter required.' });
      return;
    }
    const item = db.addRecentSearch(query, type, targetId);
    res.status(201).json({ success: true, item });
  },
};
