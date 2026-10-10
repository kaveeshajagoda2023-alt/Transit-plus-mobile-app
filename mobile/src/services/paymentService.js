import api from './api';

// A declined payment rejects with ApiError status 402; error.data holds { payment, ticket }
export const checkout = async (body) => api.post('/payments/checkout', body);
export const listPayments = async (params) => (await api.get('/payments', { params })).data;
export const getPayment = async (id) => (await api.get(`/payments/${id}`)).data;

export const listMethods = async () => (await api.get('/payments/methods')).data;
export const addMethod = async (card) => api.post('/payments/methods', card);
export const updateMethod = async (id, changes) => api.put(`/payments/methods/${id}`, changes);
export const setDefaultMethod = async (id) => api.put(`/payments/methods/${id}/default`);
export const deleteMethod = async (id) => api.delete(`/payments/methods/${id}`);
