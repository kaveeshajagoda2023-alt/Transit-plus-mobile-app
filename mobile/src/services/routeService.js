import api from './api';

export const listRoutes = async (search) => (await api.get('/routes', { params: search ? { search } : {} })).data;

export const getFare = async (routeId, { from, to, type, passengers }) =>
  (await api.get(`/routes/${routeId}/fare`, { params: { from, to, type, passengers } })).data;
