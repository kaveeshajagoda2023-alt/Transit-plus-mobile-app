import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { TransportFilterType } from '../types/index.js';

export const routeController = {
  // R - READ: List all transit routes
  async getRoutes(req: Request, res: Response): Promise<void> {
    const filter = req.query.filter as TransportFilterType | undefined;
    const routes = db.getRoutes(filter);
    res.json({ success: true, count: routes.length, routes });
  },

  // R - READ: Route details by ID
  async getRouteById(req: Request, res: Response): Promise<void> {
    const route = db.getRouteById(req.params.id);
    if (!route) {
      res.status(404).json({ success: false, error: 'Route not found.' });
      return;
    }
    res.json({ success: true, route });
  },

  // R - READ: Search routes & stops
  async searchRoutes(req: Request, res: Response): Promise<void> {
    const query = (req.query.q as string) || '';
    const routes = db.searchRoutes(query);
    res.json({ success: true, count: routes.length, routes });
  },

  // R - READ: Calculate & retrieve live ETA for route
  async getRouteETA(req: Request, res: Response): Promise<void> {
    const routeId = req.params.id;
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const userCoords = lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : undefined;

    const etaData = db.getRouteETA(routeId, userCoords);
    res.json({ success: true, ...etaData });
  },

  // C - CREATE: Add / save a favourite route or ETA search
  async saveRoute(req: Request, res: Response): Promise<void> {
    const { routeId, origin, destination, customName, isStarred, passengerId } = req.body;
    if (!routeId) {
      res.status(400).json({ success: false, error: 'Route ID is required.' });
      return;
    }

    const saved = db.saveRoute({
      routeId,
      origin,
      destination,
      customName,
      isStarred,
      passengerId,
    });
    res.status(201).json({ success: true, message: 'Route saved to favourites.', savedRoute: saved });
  },

  // R - READ: Get saved / favourite routes
  async getSavedRoutes(req: Request, res: Response): Promise<void> {
    const passengerId = req.query.passengerId as string | undefined;
    const savedRoutes = db.getSavedRoutes(passengerId);
    res.json({ success: true, count: savedRoutes.length, savedRoutes });
  },

  // D - DELETE: Remove saved / favourite route
  async deleteSavedRoute(req: Request, res: Response): Promise<void> {
    const idOrRouteId = req.params.id;
    const passengerId = req.query.passengerId as string | undefined;

    const deleted = db.deleteSavedRoute(idOrRouteId, passengerId);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Saved route not found.' });
      return;
    }
    res.json({ success: true, message: 'Saved route removed successfully.' });
  },
};
