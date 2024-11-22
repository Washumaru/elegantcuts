import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '../services/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'barber' | 'client';
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => {
        set({ isAuthenticated: true, user, token });
      },
      logout: async () => {
        await authService.logout();
        set({ isAuthenticated: false, user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);