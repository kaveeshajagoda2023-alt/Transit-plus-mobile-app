import api from './api';

export const login = async (email, password) =>
  (await api.post('/auth/login', { email: email.trim(), password })).data;

export const register = async (form) => (await api.post('/auth/register', form)).data;
