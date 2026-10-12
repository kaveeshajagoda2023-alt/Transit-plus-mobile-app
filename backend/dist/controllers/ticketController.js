import { db } from '../db/database.js';
export const ticketController = {
    async validateTicket(req, res) {
        const { ticketId, method, tripId } = req.body;
        if (!ticketId) {
            res.status(400).json({ success: false, error: 'Ticket ID is required.' });
            return;
        }
        const result = db.validateTicket(ticketId, method || 'QR', tripId);
        res.json(result);
    },
    async lookupPreview(req, res) {
        const code = (req.query.code || req.query.ticketId || '');
        if (!code) {
            res.status(400).json({ success: false, error: 'Ticket code parameter required.' });
            return;
        }
        const ticket = db.lookupTicketPreview(code);
        if (!ticket) {
            res.status(404).json({ success: false, error: 'Ticket not found in central registry.' });
            return;
        }
        res.json({ success: true, ticket });
    },
    async issueTicket(req, res) {
        const ticket = db.issueTicket(req.body);
        res.status(201).json({ success: true, ticket });
    },
    async batchSync(req, res) {
        const { records } = req.body;
        if (!Array.isArray(records)) {
            res.status(400).json({ success: false, error: 'Array of records required.' });
            return;
        }
        const result = db.batchSyncOfflineScans(records);
        res.json({ success: true, ...result });
    },
};
