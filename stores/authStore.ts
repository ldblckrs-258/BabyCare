import { saveCachedFcmTokenIfExists } from '@/lib/notification/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AppState } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      let authUnsubscribe: (() => void) | null = null;

      // Set initial state: user is null, loading is true
      set({ user: null, loading: true, error: null });

      const setupAuthListener = () => {
        if (authUnsubscribe) {
          authUnsubscribe();
        }

        authUnsubscribe = auth().onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
          set({ user, loading: false });
        });

        return authUnsubscribe;
      };

      authUnsubscribe = setupAuthListener();

      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active') {
          setupAuthListener();
        }
      };

      AppState.addEventListener('change', handleAppStateChange);

      return {
        user: null,
        loading: true,
        error: null,

        signUp: async (email: string, password: string, fullName?: string) => {
          try {
            set({ loading: true, error: null });
            const { user } = await auth().createUserWithEmailAndPassword(email, password);

            if (user) {
              try {
                await user.updateProfile({ displayName: fullName || 'User Name' });
              } catch (profileError) {
                console.error('Error updating profile:', profileError);
              }
            }

            set({ user, loading: false });

            saveCachedFcmTokenIfExists();

            return true;
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
            return false;
          }
        },

        signIn: async (email: string, password: string) => {
          try {
            set({ loading: true, error: null });
            const { user } = await auth().signInWithEmailAndPassword(email, password);
            set({ user, loading: false });

            // Save any cached FCM token after signin
            saveCachedFcmTokenIfExists();

            return true;
          } catch (error) {
            set({ error: 'auth.errors.invalidEmailOrPassword', loading: false });
            return false;
          }
        },

        signInWithGoogle: async () => {
          try {
            set({ loading: true, error: null });
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            await GoogleSignin.signIn();
            const { idToken } = await GoogleSignin.getTokens();

            if (!idToken) {
              set({ error: 'auth.errors.signInFailed', loading: false });
              return false;
            }

            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            const userCredential = await auth().signInWithCredential(googleCredential);

            set({ user: userCredential.user, loading: false });

            // Save any cached FCM token after Google signin
            saveCachedFcmTokenIfExists();

            return true;
          } catch (error: unknown) {
            let errorMessage = 'auth.errors.signInFailed';
            if (error && typeof error === 'object' && 'code' in error) {
              if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                errorMessage = 'auth.errors.signInCancelled';
              } else {
                errorMessage = 'auth.errors.signInFailed';
              }
            }

            set({ error: errorMessage, loading: false });
            return false;
          }
        },

        logout: async () => {
          try {
            set({ loading: true, error: null });

            auth().currentUser;

            try {
              await GoogleSignin.signOut();
            } catch (error) {
              console.error('Google Sign-Out Error:', error);
            }

            await auth().signOut();

            set({ user: null, loading: false, error: null });
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
          }
        },

        updateProfile: async (data) => {
          try {
            set({ loading: true, error: null });
            let currentUser = auth().currentUser;
            if (!currentUser) throw new Error('No user logged in');

            await currentUser.updateProfile(data);
            currentUser = auth().currentUser;
            set({ user: currentUser, loading: false });
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
          }
        },

        changePassword: async (currentPassword: string, newPassword: string) => {
          try {
            set({ loading: true, error: null });
            const currentUser = auth().currentUser;
            if (!currentUser) throw new Error('NO_USER_FOUND');
            if (!currentUser.email) throw new Error('NO_EMAIL_FOUND');

            const credential = auth.EmailAuthProvider.credential(
              currentUser.email,
              currentPassword
            );
            const reauth = await currentUser.reauthenticateWithCredential(credential);
            if (!reauth) throw new Error('PASSWORD_INCORRECT');
            await currentUser.updatePassword(newPassword);
            set({ loading: false });
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
          }
        },

        sendPasswordResetEmail: async (email: string) => {
          try {
            set({ loading: true, error: null });
            await auth().sendPasswordResetEmail(email);
            set({ loading: false });
            return true;
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
            return false;
          }
        },
      };
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isAuthenticated: !!state.user }),
      onRehydrateStorage: () => {
        return (state, set: any) => {
          if (auth().currentUser) {
            set({ user: auth().currentUser });
          }
        };
      },
    }
  )
);
