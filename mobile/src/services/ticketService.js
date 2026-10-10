import api from './api';

// Functions returning the whole envelope (message + data) are used where the
// screen shows the server's message in a toast.
export const listTickets = async (params) => (await api.get('/tickets', { params })).data;
export const getTicket = async (id) => (await api.get(`/tickets/${id}`)).data;
export const createTicket = async (body) => api.post('/tickets', body);
export const updateTicket = async (id, body) => api.put(`/tickets/${id}`, body);
export const cancelTicket = async (id) => api.post(`/tickets/${id}/cancel`);
export const hideTicket = async (id) => api.delete(`/tickets/${id}`);
export const rebookTicket = async (id, body = {}) => api.post(`/tickets/${id}/rebook`, body);
export const getQr = async (id) => (await api.get(`/tickets/${id}/qr`)).data;
export const rotateQr = async (id) => (await api.post(`/tickets/${id}/qr/rotate`)).data;
