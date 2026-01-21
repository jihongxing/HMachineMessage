import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar?: string;
  userLevel: number;
  realName?: string;
  companyName?: string;
  balance: number;
  publishCount: number;
  passCount: number;
  violationCount: number;
  status: number;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      
      login: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
          localStorage.setItem('token', token);
        }
        set({ token, user, isLoggedIn: true });
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('auth-change'));
        }
        set({ token: null, user: null, isLoggedIn: false });
      },
      
      updateUser: (userData) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...userData } : null
        })),
      
      setUser: (user) => 
        set({ user }),
    }),
    { 
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isLoggedIn: state.isLoggedIn 
      }),
      onRehydrateStorage: () => (state) => {
        // 从localStorage恢复token
        if (typeof window !== 'undefined' && state) {
          const token = localStorage.getItem('token') || localStorage.getItem('access_token');
          if (token && !state.token) {
            state.token = token;
            state.isLoggedIn = true;
          }
        }
      },
    }
  )
);
