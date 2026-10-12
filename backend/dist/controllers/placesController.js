import { db } from '../db/database.js';
export const placesController = {
    async getNearbyServices(req, res) {
        const filter = req.query.filter;
        const services = db.getNearbyServices(filter);
        res.json({ success: true, count: services.length, services });
    },
    async getSavedPlaces(req, res) {
        const places = db.getSavedPlaces();
        res.json({ success: true, places });
    },
    async getRecentSearches(req, res) {
        const searches = db.getRecentSearches();
        res.json({ success: true, searches });
    },
    async addRecentSearch(req, res) {
        const { query, type, targetId } = req.body;
        if (!query) {
            res.status(400).json({ success: false, error: 'Query parameter required.' });
            return;
        }
        const item = db.addRecentSearch(query, type, targetId);
        res.status(201).json({ success: true, item });
    },
};
