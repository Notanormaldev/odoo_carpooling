import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set, get) => ({
  user: null,
  org: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, org: null, isAuthenticated: false, loading: false });
      return;
    }
    try {
      const user = res.data.data;
      set({ user, org: user?.orgId, isAuthenticated: true, loading: false });
    } catch (err) {
      // Only clear session on explicit 401 (invalid/expired token).
      // Network errors (ECONNREFUSED, timeout) should NOT log the user out.
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        set({ user: null, org: null, isAuthenticated: false, loading: false });
      } else {
        // Keep the token but mark loading done — user stays logged in
        set({ loading: false });
      }
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, org } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      set({ user, org, isAuthenticated: true, error: null });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed' });
      return false;
    }
  },

  register: async (name, email, password, mobile, department, officeLocation) => {
    set({ error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, mobile, department, officeLocation });
      const { user, accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      set({ user, isAuthenticated: true, error: null });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed' });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, org: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
