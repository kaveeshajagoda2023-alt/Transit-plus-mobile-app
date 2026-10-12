import { db } from '../db/database.js';
export const routeController = {
    // R - READ: List all transit routes
    async getRoutes(req, res) {
        const filter = req.query.filter;
        const routes = db.getRoutes(filter);
        res.json({ success: true, count: routes.length, routes });
    },
    // R - READ: Route details by ID
    async getRouteById(req, res) {
        const route = db.getRouteById(req.params.id);
        if (!route) {
            res.status(404).json({ success: false, error: 'Route not found.' });
            return;
        }
        res.json({ success: true, route });
    },
    // R - READ: Search routes & stops
    async searchRoutes(req, res) {
        const query = req.query.q || '';
        const routes = db.searchRoutes(query);
        res.json({ success: true, count: routes.length, routes });
    },
    // R - READ: Calculate & retrieve live ETA for route
    async getRouteETA(req, res) {
        const routeId = req.params.id;
        const lat = req.query.lat ? parseFloat(req.query.lat) : undefined;
        const lng = req.query.lng ? parseFloat(req.query.lng) : undefined;
        const userCoords = lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : undefined;
        const etaData = db.getRouteETA(routeId, userCoords);
        res.json({ success: true, ...etaData });
    },
    // C - CREATE: Add / save a favourite route or ETA search
    async saveRoute(req, res) {
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
    async getSavedRoutes(req, res) {
        const passengerId = req.query.passengerId;
        const savedRoutes = db.getSavedRoutes(passengerId);
        res.json({ success: true, count: savedRoutes.length, savedRoutes });
    },
    // D - DELETE: Remove saved / favourite route
    async deleteSavedRoute(req, res) {
        const idOrRouteId = req.params.id;
        const passengerId = req.query.passengerId;
        const deleted = db.deleteSavedRoute(idOrRouteId, passengerId);
        if (!deleted) {
            res.status(404).json({ success: false, error: 'Saved route not found.' });
            return;
        }
        res.json({ success: true, message: 'Saved route removed successfully.' });
    },
};
