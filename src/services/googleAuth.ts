import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App & Auth
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// OAuth Client ID from firebase-applet-config.json
export const OAUTH_CLIENT_ID = firebaseConfig.oAuthClientId || '';

/**
 * Required Google Workspace API Scopes for R&S Operations:
 * - Google Calendar (List and create candidate interview events)
 * - Google Sheets (Database backup and candidate export)
 * - Google Drive (Resume storage and file picking)
 * - Google Meet (Meeting rooms and video interview links)
 * - Google Forms (Application forms and interview evaluation rubrics)
 * - Google Gmail (Candidate invitations and automated email dispatch)
 */
export const GOOGLE_SCOPES = [
  // Google Calendar
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  // Google Sheets
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  // Google Drive
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  // Google Meet
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.settings',
  // Google Forms
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  // Gmail
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
];

// Configure Firebase Google Auth Provider with all required scopes
const googleAuthProvider = new GoogleAuthProvider();
GOOGLE_SCOPES.forEach((scope) => {
  googleAuthProvider.addScope(scope);
});
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline',
});

// Runtime Token Storage
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;
let isSigningIn = false;

// LocalStorage key for session persistence
const ACCESS_TOKEN_STORAGE_KEY = 'voxtalent_google_access_token';
const TOKEN_EXPIRY_STORAGE_KEY = 'voxtalent_google_token_expiry';

// Load stored token on initialize if valid
try {
  const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);
  if (storedToken && storedExpiry && Date.now() < Number(storedExpiry)) {
    cachedAccessToken = storedToken;
    tokenExpiresAt = Number(storedExpiry);
  } else if (storedToken) {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
  }
} catch {
  // Ignore localStorage read errors
}

/**
 * Saves access token in memory and localStorage with 1 hour expiration
 */
export const storeAccessToken = (token: string, expiresInSeconds = 3600): void => {
  cachedAccessToken = token;
  tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  try {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, String(tokenExpiresAt));
  } catch (err) {
    console.warn('Não foi possível persistir o token no localStorage:', err);
  }
};

/**
 * Clears stored access tokens and session data
 */
export const clearStoredAccessToken = (): void => {
  cachedAccessToken = null;
  tokenExpiresAt = null;
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
  } catch {
    // Ignore error
  }
};

/**
 * Returns current valid access token or null if expired
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }
  return cachedAccessToken;
};

/**
 * Returns current access token synchronously
 */
export const getStoredAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Signs in user using Google OAuth via Firebase Popup with all requested scopes
 */
export const signInWithGoogle = async (): Promise<{
  user: User;
  accessToken: string;
  oAuthClientId: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Falha ao obter token de autorização do Google.');
    }

    storeAccessToken(credential.accessToken);

    return {
      user: result.user,
      accessToken: credential.accessToken,
      oAuthClientId: OAUTH_CLIENT_ID,
    };
  } catch (error: any) {
    console.error('Erro na autenticação OAuth2 Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Alternate alias for signInWithGoogle
 */
export const googleSignIn = signInWithGoogle;

/**
 * Signs out current user from Google / Firebase and clears cached tokens
 */
export const signOutGoogle = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    clearStoredAccessToken();
  }
};

export const logout = signOutGoogle;

/**
 * Initializes authentication listener for active session
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = await getAccessToken();
      if (token) {
        if (onAuthSuccess) onAuthSuccess(user, token);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      clearStoredAccessToken();
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Fetches basic Google user profile via Google OAuth People / UserInfo API
 */
export const fetchGoogleUserProfile = async (token?: string): Promise<any> => {
  const activeToken = token || (await getAccessToken());
  if (!activeToken) throw new Error('Nenhum token de acesso disponível.');

  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${activeToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Erro ao consultar perfil do usuário no Google.');
  }

  return res.json();
};

export default {
  OAUTH_CLIENT_ID,
  GOOGLE_SCOPES,
  signInWithGoogle,
  signOutGoogle,
  getAccessToken,
  getStoredAccessToken,
  storeAccessToken,
  clearStoredAccessToken,
  initAuth,
  fetchGoogleUserProfile,
};
