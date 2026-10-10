import api from './api';

export const getMe = async () => (await api.get('/users/me')).data;

export const updateMe = async (changes) => api.put('/users/me', changes);

export const deleteMe = async (password) => api.delete('/users/me', { data: { password } });
