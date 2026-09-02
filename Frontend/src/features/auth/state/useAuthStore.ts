import { create } from 'zustand';
import type { User } from '../../../shared/types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  setUser: (user: User | null) => void;
  setIsCheckingAuth: (isChecking: boolean) => void;
  logout: () => void;
}

// Retrieve initial user from localStorage if present
const getSavedUser = (): User | null => {
  try {
    const saved = localStorage.getItem('queueforge_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialUser = getSavedUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isCheckingAuth: !initialUser, // If user is cached in localStorage, start authenticated immediately
  setUser: (user) => {
    if (user) {
      try {
        localStorage.setItem('queueforge_user', JSON.stringify(user));
      } catch {}
    } else {
      localStorage.removeItem('queueforge_user');
    }
    set({
      user,
      isAuthenticated: !!user,
      isCheckingAuth: false,
    });
  },
  setIsCheckingAuth: (isChecking) => set({ isCheckingAuth: isChecking }),
  logout: () => {
    // Clear non-httpOnly token cookie & local cache
    document.cookie = 'token=; Max-Age=0; path=/';
    localStorage.removeItem('queueforge_user');
    set({ user: null, isAuthenticated: false, isCheckingAuth: false });
  },
}));
