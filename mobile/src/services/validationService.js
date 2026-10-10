import api, { validateQrTicket } from './api';

// Returns the envelope: { success, message, data: { result, reason, ticket } }
export const scanTicket = (token) => validateQrTicket(token);

export const listScanLogs = async (params) => (await api.get('/validation/logs', { params })).data;
