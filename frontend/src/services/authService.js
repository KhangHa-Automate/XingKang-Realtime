import api from '../api/axiosConfig';
export const login = async (email, password) => {
  return api.post('/auth/login', { email, password });
};
export const register = async (userData) => {
  return api.post('/auth/signup', userData);
};
export const logout = async () => {
  return api.get('/auth/logout');
};