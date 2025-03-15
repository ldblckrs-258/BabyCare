import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  keepSignedIn: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signIn: (email: string, password: string, keepSignedIn?: boolean) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  setKeepSignedIn: (value: boolean) => void;
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
    keepSignedIn: false,

    setKeepSignedIn: (value: boolean) => {
      set({ keepSignedIn: value });
    },

    signUp: async (email: string, password: string, fullName?: string) => {
      try {
        set({ loading: true, error: null });
        const { user } = await createUserWithEmailAndPassword(auth, email, password);

        // Update user profile with display name and default avatar
        if (user) {
          try {
            await updateProfile(user, {
              displayName: fullName || 'User Name',
              photoURL: '../assets/default-avatar.png',
            });
          } catch (profileError) {
            console.error('Error updating profile:', profileError);
            // Continue even if profile update fails
          }
        }

        set({ user, loading: false });
        return true;
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        return false;
      }
    },

    signIn: async (email: string, password: string, keepSignedIn?: boolean) => {
      try {
        set({ loading: true, error: null });
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        if (keepSignedIn !== undefined) {
          set({ keepSignedIn });
        }
        set({ user, loading: false });
        return true;
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        return false;
      }
    },

    signInWithGoogle: async () => {
      set({
        error:
          'Google Sign-in is temporarily disabled in Expo Go. Please use email/password login.',
        loading: false,
      });
      return false;
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
