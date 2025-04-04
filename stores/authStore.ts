import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { auth } from '../lib/firebase';
import { useSettingsStore } from './settingsStore';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  // Cấu hình thêm để đảm bảo hoạt động trên Android
  offlineAccess: true,
});

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
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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
              displayName: fullName || 'User Name'
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
      try {
        set({ loading: true, error: null });

        // Check if device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        // Get the users ID token
        const signInResult = await GoogleSignin.signIn();

        // Type assertion for the response
        const idToken = signInResult.data?.idToken;

        if (!idToken) {
          set({ error: 'No ID token present in Google Sign-In response', loading: false });
          return false;
        }

        // Create a Google credential with the token
        const googleCredential = GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        const userCredential = await signInWithCredential(auth, googleCredential);

        set({ user: userCredential.user, loading: false });
        return true;
      } catch (error: unknown) {
        console.error('Google Sign-In Error:', error);
        let errorMessage = 'Failed to sign in with Google';

        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            errorMessage = 'Sign in cancelled';
          } else if (error.code === statusCodes.IN_PROGRESS) {
            errorMessage = 'Sign in already in progress';
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            errorMessage = 'Play services not available or outdated';
          }
        }

        set({
          error: errorMessage,
          loading: false,
        });
        return false;
      }
    },

    logout: async () => {
      try {
        set({ loading: true, error: null });

        // Reset settings - disconnect device, etc.
        const settingsStore = useSettingsStore.getState();
        settingsStore.setDeviceConnection(false, undefined);

        // Sign out from Google
        try {
          await GoogleSignin.signOut();
        } catch (error) {
          console.error('Google Sign-Out Error:', error);
          // Continue even if Google sign out fails
        }

        // Sign out from Firebase
        await signOut(auth);

        // Reset auth store state
        set({
          user: null,
          loading: false,
          keepSignedIn: false,
          error: null,
        });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        throw error; // Rethrow to allow handling in UI components
      }
    },

    updateProfile: async (data) => {
      try {
        set({ loading: true, error: null });
        if (!auth.currentUser) throw new Error('No user logged in');
        await updateProfile(auth.currentUser, data);
        set({ user: auth.currentUser, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        throw error;
      }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      try {
        set({ loading: true, error: null });
        if (!auth.currentUser) throw new Error('No user logged in');
        if (!auth.currentUser.email) throw new Error('No email associated with account');

        // Reauthenticate user
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Update password
        await updatePassword(auth.currentUser, newPassword);
        set({ loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        throw error;
      }
    },
  };
});
