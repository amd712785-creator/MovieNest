import { AppPreferences } from '../types';
export type { AppPreferences };
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const LOCAL_STORAGE_KEY = 'movienest_app_preferences';

export const DEFAULT_PREFERENCES: AppPreferences = {
  defaultServer: 'cinextma',
  autoPlay: true,
  autoNextEpisode: true,
  defaultQuality: '1080p',
  subtitleLanguage: 'English',
  playbackSpeed: 1.0,

  themeMode: 'dark',
  themeColor: 'red',
  appAnimations: true,

  newMovieAlerts: true,
  newEpisodeAlerts: true,
  liveTvAlerts: false,
  promotionalNotifications: false,

  historyPrivacy: 'private',

  dataSaver: false,
  autoImageLoading: true,
  wifiOnlyDownloads: false,
};

let currentPreferences: AppPreferences = { ...DEFAULT_PREFERENCES };

// Event listeners for real-time app-wide updates
type Listener = (prefs: AppPreferences) => void;
const listeners: Set<Listener> = new Set();

export function subscribePreferences(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentPreferences);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn(currentPreferences));
}

/**
 * Loads preferences from localStorage on app boot
 */
export function getStoredPreferences(): AppPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      currentPreferences = { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse stored preferences', e);
  }
  return currentPreferences;
}

/**
 * Saves preferences locally and updates listeners
 */
export function saveLocalPreferences(prefs: Partial<AppPreferences>): AppPreferences {
  currentPreferences = { ...currentPreferences, ...prefs };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentPreferences));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage', e);
    }
  }
  notifyListeners();
  return currentPreferences;
}

/**
 * Syncs preferences with Firestore if signed in
 */
export async function syncPreferencesToFirestore(userId: string, prefs: AppPreferences): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences: prefs,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not sync preferences to Firestore', err);
  }
}

/**
 * Loads preferences from Firestore user profile if available
 */
export async function loadPreferencesFromFirestore(userId: string): Promise<AppPreferences> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.preferences) {
        const merged = { ...DEFAULT_PREFERENCES, ...data.preferences };
        saveLocalPreferences(merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Could not load preferences from Firestore', e);
  }
  return getStoredPreferences();
}

// Initial load
getStoredPreferences();
