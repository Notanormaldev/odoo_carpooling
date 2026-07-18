import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
  user: null,
  org: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  loadUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ user: null, org: null, isAuthenticated: false, loading: false });
        return;
      }
      
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isAuthenticated: true, loading: false });
    } catch (err) {
      localStorage.removeItem('accessToken');
      set({ user: null, org: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, org } = res.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      set({ user, org, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (name, email, password, mobile, department, officeLocation) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, mobile, department, officeLocation });
      const { user, accessToken } = res.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      set({ user, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, org: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
