import { db } from '../db/database.js';
export const terminalController = {
    async getStatus(req, res) {
        const status = db.getTerminalStatus();
        res.json(status);
    },
    async ping(req, res) {
        res.json({
            success: true,
            pong: true,
            timestamp: new Date().toISOString(),
            serverPingMs: 14 + Math.floor(Math.random() * 8),
        });
    },
    async setSimulatedOffline(req, res) {
        const offline = Boolean(req.body.offline);
        db.setSimulatedOffline(offline);
        res.json({ success: true, offline });
    },
};
