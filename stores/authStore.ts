import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Set up auth state listener
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    set({ user, loading: false });
  });

  // Cleanup subscription when app is closed
  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'inactive' || nextAppState === 'background') {
      unsubscribe();
    }
  });

  return {
    user: null,
    loading: false,
    error: null,

    signUp: async (email: string, password: string) => {
      try {
        set({ loading: true, error: null });
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        set({ user, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },

    signIn: async (email: string, password: string) => {
      try {
        set({ loading: true, error: null });
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        set({ user, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },

    signInWithGoogle: async () => {
      set({
        error:
          'Google Sign-in is temporarily disabled in Expo Go. Please use email/password login.',
        loading: false,
      });
    },

    logout: async () => {
      try {
        set({ loading: true, error: null });
        await signOut(auth);
        set({ user: null, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },
  };
});
