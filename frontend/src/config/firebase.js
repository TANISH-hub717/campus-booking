import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Firebase client configuration loaded from environment variables with production defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCvjzcBVsE_4bxWeTgifVtBJyKXcUFF7OM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'campus-booking-f8217.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campus-booking-f8217',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'campus-booking-f8217.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '958598133981',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:958598133981:web:94b6d544ee4e3a427d0334'
};

// Check whether valid, non-placeholder credentials have been configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.toLowerCase().includes('placeholder')
);

// Initialize Firebase App only once when valid configuration is present
let app = null;
let authInstance = null;
let googleProviderInstance = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Export auth safely; if uninitialized, provide a safe fallback object so callers don't throw null reference errors
export const auth = authInstance || { currentUser: null };
export const googleProvider = googleProviderInstance;

function getActiveAuth() {
  if (!authInstance || !isFirebaseConfigured) {
    throw new Error('Firebase configuration is missing or incomplete. Please provide your Firebase API key and configuration in the frontend .env file.');
  }
  return authInstance;
}

export const firebaseAuthService = {
  /**
   * Register with Email and Password in Firebase
   */
  async registerWithEmail(email, password) {
    const auth = getActiveAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const idToken = await userCredential.user.getIdToken();
    return {
      user: userCredential.user,
      idToken
    };
  },

  /**
   * Sign in with Email and Password in Firebase
   */
  async loginWithEmail(email, password) {
    const auth = getActiveAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const idToken = await userCredential.user.getIdToken();
    return {
      user: userCredential.user,
      idToken
    };
  },

  /**
   * Sign in with Google Popup via Firebase
   */
  async signInWithGoogle() {
    const auth = getActiveAuth();
    if (!googleProviderInstance) {
      throw new Error('Firebase Google provider is not configured.');
    }
    const userCredential = await signInWithPopup(auth, googleProviderInstance);
    return userCredential.user;
  },

  /**
   * Send Password Reset Email via Firebase
   */
  async sendPasswordReset(email) {
    const auth = getActiveAuth();
    return sendPasswordResetEmail(auth, email.trim());
  },

  /**
   * Update password for currently signed-in user
   */
  async updateUserPassword(newPassword) {
    const auth = getActiveAuth();
    if (!auth.currentUser) {
      throw new Error('No authenticated Firebase session found.');
    }
    return updatePassword(auth.currentUser, newPassword);
  },

  /**
   * Delete current Firebase user account
   */
  async deleteCurrentUser() {
    if (authInstance?.currentUser) {
      return deleteUser(authInstance.currentUser);
    }
  },

  /**
   * Sign out from Firebase
   */
  async logOut() {
    if (authInstance) {
      return signOut(authInstance);
    }
  },

  /**
   * Get current user ID token
   */
  async getCurrentIdToken() {
    if (authInstance?.currentUser) {
      return authInstance.currentUser.getIdToken();
    }
    return null;
  },

  /**
   * Listen to auth state changes
   */
  onAuthState(callback) {
    if (!authInstance) {
      return () => {};
    }
    return onAuthStateChanged(authInstance, callback);
  }
};
