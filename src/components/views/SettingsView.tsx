import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  Palette,
  Bell,
  Shield,
  HardDrive,
  Info,
  Check,
  AlertTriangle,
  Lock,
  Mail,
  Edit2,
  Trash2,
  KeyRound,
  Sparkles,
  Smartphone,
  LogOut,
  ChevronRight,
  ExternalLink,
  Loader2,
  CheckCircle2,
  RefreshCw,
  X,
  FileText,
  HelpCircle,
  Play,
  Volume2,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  AppPreferences,
  DEFAULT_PREFERENCES,
  getStoredPreferences,
  saveLocalPreferences,
  syncPreferencesToFirestore,
  loadPreferencesFromFirestore,
} from '../../services/preferences';
import { updateProfile, updateEmail, updatePassword, deleteUser } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface SettingsViewProps {
  onRequireAuth: () => void;
  onNavigate?: (tab: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
];

export const SettingsView: React.FC<SettingsViewProps> = ({ onRequireAuth, onNavigate }) => {
  const { user, userProfile, logout, refreshProfile, resendVerification } = useAuth();
  const { prefs, updateTheme: updateThemeContext } = useTheme();

  // Preferences State
  // const [prefs, setPrefs] = useState<AppPreferences>(getStoredPreferences());
  const [activeCategory, setActiveCategory] = useState<string>('account');

  // Feedback Messages
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account Edit States
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName || '');
  const [photoUrlInput, setPhotoUrlInput] = useState(user?.photoURL || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Email Change State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState(user?.email || '');
  const [savingEmail, setSavingEmail] = useState(false);

  // Password Change State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete Account Confirmation State
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Storage Stats
  const [cacheSizeMB, setCacheSizeMB] = useState<string>('0.00');

  // Legal Modals
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // Load preferences from Firestore if signed in
  useEffect(() => {
    if (user) {
      loadPreferencesFromFirestore(user.uid);
      setDisplayNameInput(user.displayName || '');
      setPhotoUrlInput(user.photoURL || '');
      setNewEmailInput(user.email || '');
    }
    calculateCacheSize();
  }, [user]);

  // Show auto-disappearing toast
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Handle Preference Change
  const updateTheme = <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
    updateThemeContext({ [key]: value });
    
    if (user) {
      syncPreferencesToFirestore(user.uid, { ...prefs, [key]: value });
    }
    showToast('success', 'Preferences saved.');
  };

  // Calculate Local Storage Cache Size
  const calculateCacheSize = () => {
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalBytes += (localStorage.getItem(key) || '').length * 2;
        }
      }
      setCacheSizeMB((totalBytes / (1024 * 1024)).toFixed(2));
    } catch (e) {
      setCacheSizeMB('0.45');
    }
  };

  // Clear Storage Cache
  const handleClearCache = () => {
    try {
      // Clear non-essential items
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('tmdb_') || key.startsWith('iptv_') || key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
      calculateCacheSize();
      showToast('success', 'Application cache cleared successfully!');
    } catch (e) {
      showToast('error', 'Failed to clear cache');
    }
  };

  // Update Profile Name & Photo
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !user) return;

    setSavingProfile(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayNameInput.trim(),
        photoURL: photoUrlInput.trim(),
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayNameInput.trim(),
        photoURL: photoUrlInput.trim(),
        updatedAt: new Date().toISOString(),
      });

      await refreshProfile();
      setEditProfileOpen(false);
      showToast('success', 'Profile updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Update Email
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !user) return;
    if (!newEmailInput.trim() || newEmailInput === user.email) return;

    setSavingEmail(true);
    try {
      await updateEmail(auth.currentUser, newEmailInput.trim());

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        email: newEmailInput.trim(),
        updatedAt: new Date().toISOString(),
      });

      await refreshProfile();
      setEmailModalOpen(false);
      showToast('success', 'Email updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update email. Re-authentication may be required.');
    } finally {
      setSavingEmail(false);
    }
  };

  // Change Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (newPasswordInput.length < 6) {
      showToast('error', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await updatePassword(auth.currentUser, newPasswordInput);
      setPasswordModalOpen(false);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      showToast('success', 'Password updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update password. Re-authentication required.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user) return;
    if (deleteConfirmText.trim().toLowerCase() !== 'delete') {
      showToast('error', 'Please type DELETE to confirm account deletion.');
      return;
    }

    setDeletingAccount(true);
    try {
      const uid = user.uid;
      // 1. Delete Firestore user document
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.warn('Could not clean user doc', e);
      }

      // 2. Delete Auth user
      await deleteUser(auth.currentUser);
      setDeleteAccountModalOpen(false);
      showToast('success', 'Your account has been deleted.');
    } catch (err: any) {
      showToast('error', err.message || 'Deletion failed. Re-authentication required.');
    } finally {
      setDeletingAccount(false);
    }
  };

  // Request Notification Permission
  const handleToggleNotification = (key: keyof AppPreferences) => {
    const nextVal = !prefs[key];
    if (nextVal && typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          updateTheme(key, true);
        } else {
          showToast('error', 'Notification permission was denied in browser settings.');
          updateTheme(key, false);
        }
      });
    } else {
      updateTheme(key, nextVal as any);
    }
  };

  const navCategories = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'playback', label: 'Playback', icon: Sliders },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'storage', label: 'Storage & Data', icon: HardDrive },
    { id: 'about', label: 'About & Support', icon: Info },
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-3 duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-900/30'
              : 'bg-red-950/90 text-red-200 border-red-500/40 shadow-red-900/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ios-glass p-5 rounded-3xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl ios-glass border border-white/20 flex items-center justify-center text-red-500 shadow-md">
            <Sliders className="w-6 h-6 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">App Settings</h1>
            <p className="text-xs text-neutral-300/80">
              Customize playback, account security, themes, and data preferences
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2 text-xs text-neutral-300 ios-glass px-3.5 py-1.5 rounded-2xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Synced as <strong className="text-white">{user.email}</strong></span>
          </div>
        )}
      </div>

      {/* Main Settings Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Categories */}
        <div className="lg:col-span-1 space-y-2">
          <div className="ios-glass p-2 rounded-3xl border border-white/15 space-y-1 shadow-lg">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 active:scale-98 ${
                    isActive
                      ? 'ios-pill-active text-white font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* CATEGORY 1: ACCOUNT SETTINGS */}
          {activeCategory === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="ios-glass p-6 rounded-3xl border border-white/15 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Account & Identity</h3>
                    <p className="text-xs text-neutral-400">Manage your profile, credentials, and authentication</p>
                  </div>
                  <User className="w-5 h-5 text-red-500" />
                </div>

                {user ? (
                  <div className="space-y-5">
                    {/* User Card */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-md shrink-0 bg-neutral-900">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white">
                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <h4 className="text-base font-bold text-white truncate">
                          {user.displayName || 'MovieNest Member'}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                          UID: {user.uid}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditProfileOpen(true)}
                        className="px-4 py-2 rounded-xl ios-glass-btn-primary text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>
                    </div>

                    {/* Account Settings Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setEditProfileOpen(true)}
                        className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-white/25 text-left flex items-center justify-between transition active:scale-98"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-red-400" />
                          <div>
                            <p className="text-xs font-bold text-white">Change Name & Avatar</p>
                            <p className="text-[11px] text-neutral-400">Update display info</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      </button>

                      <button
                        onClick={() => setEmailModalOpen(true)}
                        className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-white/25 text-left flex items-center justify-between transition active:scale-98"
                      >
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-amber-400" />
                          <div>
                            <p className="text-xs font-bold text-white">Change Email Address</p>
                            <p className="text-[11px] text-neutral-400">Current: {user.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      </button>

                      <button
                        onClick={() => setPasswordModalOpen(true)}
                        className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-white/25 text-left flex items-center justify-between transition active:scale-98"
                      >
                        <div className="flex items-center gap-3">
                          <KeyRound className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="text-xs font-bold text-white">Change Password</p>
                            <p className="text-[11px] text-neutral-400">Update Auth password</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      </button>

                      <button
                        onClick={() => setDeleteAccountModalOpen(true)}
                        className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 hover:border-red-500/40 text-left flex items-center justify-between transition active:scale-98"
                      >
                        <div className="flex items-center gap-3">
                          <Trash2 className="w-4 h-4 text-red-500" />
                          <div>
                            <p className="text-xs font-bold text-red-200">Delete Account</p>
                            <p className="text-[11px] text-red-300/70">Permanently erase data</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-500/60" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-xs text-neutral-400">
                      Sign in to customize your profile, sync watchlist settings across devices, and manage security options.
                    </p>
                    <button
                      onClick={onRequireAuth}
                      className="px-6 py-2.5 rounded-2xl ios-glass-btn-primary text-white text-xs font-bold shadow-lg"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CATEGORY 2: PLAYBACK SETTINGS */}
          {activeCategory === 'playback' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="ios-glass p-6 rounded-3xl border border-white/15 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Playback & Streaming</h3>
                    <p className="text-xs text-neutral-400">Configure default video player, servers, and quality</p>
                  </div>
                  <Sliders className="w-5 h-5 text-red-500" />
                </div>

                <div className="space-y-5">
                  {/* Default Server */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-white">Default Streaming Server</p>
                      <p className="text-[11px] text-neutral-400">Choose which streaming system loads by default</p>
                    </div>
                    <div className="flex ios-glass rounded-xl p-1 border border-white/10">
                      <button
                        onClick={() => updateTheme('defaultServer', 'cinextma')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          prefs.defaultServer === 'cinextma'
                            ? 'ios-pill-active text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Server 1: CINEXTMA
                      </button>
                      <button
                        onClick={() => updateTheme('defaultServer', 'legacy')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          prefs.defaultServer === 'legacy'
                            ? 'ios-pill-active text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Server 2: Existing
                      </button>
                    </div>
                  </div>

                  {/* Auto Play & Auto Next Episode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div>
                        <p className="text-xs font-bold text-white">Auto Play Video</p>
                        <p className="text-[11px] text-neutral-400">Start playback immediately</p>
                      </div>
                      <button
                        onClick={() => updateTheme('autoPlay', !prefs.autoPlay)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                          prefs.autoPlay ? 'bg-red-600' : 'bg-neutral-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            prefs.autoPlay ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div>
                        <p className="text-xs font-bold text-white">Auto Next Episode</p>
                        <p className="text-[11px] text-neutral-400">Autoplay next TV episode</p>
                      </div>
                      <button
                        onClick={() => updateTheme('autoNextEpisode', !prefs.autoNextEpisode)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                          prefs.autoNextEpisode ? 'bg-red-600' : 'bg-neutral-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            prefs.autoNextEpisode ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Video Quality */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-white">Default Video Quality</p>
                      <p className="text-[11px] text-neutral-400">Target playback resolution</p>
                    </div>
                    <div className="flex flex-wrap gap-1 ios-glass p-1 rounded-xl border border-white/10">
                      {(['Auto', '480p', '720p', '1080p'] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => updateTheme('defaultQuality', q)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            prefs.defaultQuality === q
                              ? 'ios-pill-active text-white font-bold'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitle Language & Speed */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <p className="text-xs font-bold text-white">Subtitle Language</p>
                      <select
                        value={prefs.subtitleLanguage}
                        onChange={(e) => updateTheme('subtitleLanguage', e.target.value as any)}
                        className="w-full bg-[#12131e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="Off">Off</option>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Bengali">Bengali</option>
                        <option value="French">French</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <p className="text-xs font-bold text-white">Default Playback Speed</p>
                      <select
                        value={prefs.playbackSpeed}
                        onChange={(e) => updateTheme('playbackSpeed', parseFloat(e.target.value))}
                        className="w-full bg-[#12131e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        <option value={0.5}>0.5x Slow</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1.0}>1.0x Normal</option>
                        <option value={1.25}>1.25x Faster</option>
                        <option value={1.5}>1.5x Fast</option>
                        <option value={2.0}>2.0x Double Speed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 3: APPEARANCE SETTINGS */}
          {activeCategory === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="ios-glass p-6 rounded-3xl border border-white/15 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Appearance & Design</h3>
                    <p className="text-xs text-neutral-400">Themes, color accents, and spring animations</p>
                  </div>
                  <Palette className="w-5 h-5 text-red-500" />
                </div>

                <div className="space-y-5">
                  {/* Theme Mode Selector */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-white">Theme Mode</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark', label: 'Dark Mode', icon: Moon },
                        { id: 'light', label: 'Light Glass', icon: Sun },
                        { id: 'system', label: 'System Default', icon: Monitor },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSel = prefs.themeMode === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => updateTheme('themeMode', t.id as any)}
                            className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition active:scale-95 ${
                              isSel
                                ? 'bg-[var(--accent)]/20 border-[var(--accent)]/60 text-[var(--text-main)] font-bold shadow-md'
                                : 'ios-glass text-[var(--text-muted)] border-white/10 hover:text-[var(--text-main)]'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSel ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                            <span className="text-xs">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Theme Color Accents */}
                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-bold text-white">Accent Glow Color</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: 'red', name: 'MovieNest Red', class: 'bg-red-600' },
                        { id: 'cyan', name: 'Cyan Glow', class: 'bg-cyan-500' },
                        { id: 'gold', name: 'Gold VIP', class: 'bg-amber-400' },
                        { id: 'emerald', name: 'Emerald', class: 'bg-emerald-500' },
                        { id: 'purple', name: 'Nebula Purple', class: 'bg-purple-600' },
                      ].map((c) => {
                        const isSel = prefs.themeColor === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => updateTheme('themeColor', c.id as any)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition active:scale-95 ${
                              isSel
                                ? 'ios-glass text-[var(--text-main)] border-[var(--accent)]/60 bg-[var(--accent)]/10 font-bold shadow-md'
                                : 'ios-glass text-[var(--text-muted)] border-white/10 hover:text-[var(--text-main)]'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full ${c.class}`} />
                            <span>{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* iOS 26 Animations Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 pt-3">
                    <div>
                      <p className="text-xs font-bold text-white">iOS 26 Liquid Glass Animations</p>
                      <p className="text-[11px] text-neutral-400">Enable physics-based spring transitions</p>
                    </div>
                    <button
                      onClick={() => updateTheme('appAnimations', !prefs.appAnimations)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                        prefs.appAnimations ? 'bg-red-600' : 'bg-neutral-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          prefs.appAnimations ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 4: NOTIFICATIONS */}
          {activeCategory === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="ios-glass p-6 rounded-3xl border border-white/15 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Push & App Notifications</h3>
                    <p className="text-xs text-neutral-400">Manage release alerts, new episodes, and Live TV events</p>
                  </div>
                  <Bell className="w-5 h-5 text-red-500" />
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: 'newMovieAlerts',
                      label: 'New Movie Release Alerts',
                      desc: 'Get notified when trending Hollywood or Hindi blockbusters drop',
                    },
                    {
                      key: 'newEpisodeAlerts',
                      label: 'New TV Episode Alerts',
                      desc: 'Receive alerts when new episodes of bookmarked shows premiere',
                    },
                    {
                      key: 'liveTvAlerts',
                      label: 'Live TV & Sports Alerts',
                      desc: 'Stay informed of live broadcasts and sports events',
                    },
                    {
                      key: 'promotionalNotifications',
                      label: 'VIP & Offer Announcements',
                      desc: 'Special VIP discounts and feature releases',
                    },
                  ].map((n) => {
                    const isVal = prefs[n.key as keyof AppPreferences] as boolean;
                    return (
                      <div
                        key={n.key}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{n.label}</p>
                          <p className="text-[11px] text-neutral-400">{n.desc}</p>
                        </div>
                        <button
                          onClick={() => handleToggleNotification(n.key as keyof AppPreferences)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                            isVal ? 'bg-red-600' : 'bg-neutral-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                              isVal ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 5: PRIVACY & SECURITY */}
          {activeCategory === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="ios-glass p-6 rounded-3xl border border-white/15 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Privacy & Account Security</h3>
                    <p className="text-xs text-neutral-400">Manage active sessions, security verification, and history</p>
                  </div>
                  <Shield className="w-5 h-5 text-red-500" />
                </div>

                <div className="space-y-5">
                  {/* Email Verification Status */}
                  {user && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">Email Verification Status</p>
                          {user.emailVerified ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              UNVERIFIED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          {user.emailVerified
                            ? 'Your account email is verified and secure.'
                            : 'Please verify your email address to enable all account privileges.'}
                        </p>
                      </div>
                      {!user.emailVerified && (
                        <button
                          onClick={async () => {
                            try {
                              await resendVerification();
                              showToast('success', 'Verification email sent!');
                            } catch (e: any) {
                              showToast('error', e.message || 'Failed to send verification email');
                            }
                          }}
                          className="px-4 py-2 rounded-xl ios-glass border border-amber-400/40 text-amber-300 hover:text-white text-xs font-bold whitespace-nowrap"
                        >
                          Send Verification Email
                        </button>
                      )}
                    </div>
                  )}

                  {/* Active Devices Info */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-red-400" />
                        <p className="text-xs font-bold text-white">Active Device Session</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        CURRENT DEVICE
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-mono">
                      {typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 70) : 'Browser Client'}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={async () => {
                          if (user) {
                            await logout();
                            showToast('success', 'Signed out from device.');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  </div>

                  {/* History Privacy Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-white">Watch History Privacy</p>
                      <p className="text-[11px] text-neutral-400">Keep viewing history private to your account</p>
                    </div>
                    <select
                      value={prefs.historyPrivacy}
                      onChange={(e) => updateTheme('historyPrivacy', e.target.value as any)}
                      className="bg-[#12131e] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value="private">Strictly Private</option>
                      <option value="recommendations">Use for AI Recommendations</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 6: STORAGE & DATA */}
          {activeCategory === 'storage' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="ios-glass p-6 rounded-3xl border border-white/15 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Storage & Network Data</h3>
                    <p className="text-xs text-neutral-400">Manage offline cache, data saver mode, and image loading</p>
                  </div>
                  <HardDrive className="w-5 h-5 text-red-500" />
                </div>

                <div className="space-y-5">
                  {/* Cache Stats & Clear Button */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-white">Local Storage Cache</p>
                      <p className="text-[11px] text-neutral-400">
                        Current cached metadata size: <strong className="text-red-400 font-mono">{cacheSizeMB} MB</strong>
                      </p>
                    </div>
                    <button
                      onClick={handleClearCache}
                      className="px-4 py-2 rounded-xl ios-glass border border-white/15 text-white hover:border-red-500/50 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                      <span>Clear Cache</span>
                    </button>
                  </div>

                  {/* Data Saver Mode */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-white">Data Saver Mode</p>
                      <p className="text-[11px] text-neutral-400">Reduce poster image resolution to save mobile bandwidth</p>
                    </div>
                    <button
                      onClick={() => updateTheme('dataSaver', !prefs.dataSaver)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                        prefs.dataSaver ? 'bg-red-600' : 'bg-neutral-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          prefs.dataSaver ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Auto Image Preloading */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-white">Auto Image Preloading</p>
                      <p className="text-[11px] text-neutral-400">Preload backdrop imagery for fast page rendering</p>
                    </div>
                    <button
                      onClick={() => updateTheme('autoImageLoading', !prefs.autoImageLoading)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                        prefs.autoImageLoading ? 'bg-red-600' : 'bg-neutral-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          prefs.autoImageLoading ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Wi-Fi Only Downloads */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-white">Wi-Fi Only Mode</p>
                      <p className="text-[11px] text-neutral-400">Restrict heavy media fetches to Wi-Fi networks</p>
                    </div>
                    <button
                      onClick={() => updateTheme('wifiOnlyDownloads', !prefs.wifiOnlyDownloads)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                        prefs.wifiOnlyDownloads ? 'bg-red-600' : 'bg-neutral-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          prefs.wifiOnlyDownloads ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 7: ABOUT & SUPPORT */}
          {activeCategory === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="ios-glass p-6 rounded-3xl border border-white/15 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">About & Support</h3>
                    <p className="text-xs text-neutral-400">App metadata, licenses, terms, and developer contact</p>
                  </div>
                  <Info className="w-5 h-5 text-red-500" />
                </div>

                <div className="space-y-4">
                  {/* App Version Info Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-white/[0.03] to-red-950/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src="/movienest-logo.png" alt="MovieNest" className="h-10 w-auto object-contain drop-shadow-md" />
                      <div>
                        <h4 className="text-base font-black text-white">MovieNest Pro</h4>
                        <p className="text-xs text-neutral-300">Version 2.5.0-pro (Build 2026.11)</p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                      SYSTEM ONLINE
                    </span>
                  </div>

                  {/* Support & Legal Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="https://t.me/rifat_hossain125"
                      target="_blank"
                      rel="noreferrer"
                      className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-white/25 text-left flex items-center justify-between transition active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Contact Developer Support</p>
                          <p className="text-[11px] text-neutral-400">Telegram @rifat_hossain125</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                    </a>

                    <button
                      onClick={() => setAboutModalOpen(true)}
                      className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-white/25 text-left flex items-center justify-between transition active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <Info className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="text-xs font-bold text-white">About MovieNest Platform</p>
                          <p className="text-[11px] text-neutral-400">System overview & APIs</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    </button>

                    <button
                      onClick={() => setPrivacyModalOpen(true)}
                      className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-white/25 text-left flex items-center justify-between transition active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Privacy Policy</p>
                          <p className="text-[11px] text-neutral-400">Data protection statement</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    </button>

                    <button
                      onClick={() => setTermsModalOpen(true)}
                      className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-white/25 text-left flex items-center justify-between transition active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Terms & Conditions</p>
                          <p className="text-[11px] text-neutral-400">User service agreement</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: EDIT PROFILE */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="ios-glass p-6 rounded-3xl border border-white/20 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Edit Profile & Avatar</h3>
              <button onClick={() => setEditProfileOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Display Name:</label>
                <input
                  type="text"
                  required
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Avatar Image URL:</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Avatar Presets */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-neutral-300">Or Pick Preset Avatar:</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset"
                      onClick={() => setPhotoUrlInput(url)}
                      className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition ${
                        photoUrlInput === url ? 'border-red-500 scale-110' : 'border-white/20 hover:border-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl ios-glass text-xs font-semibold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl ios-glass-btn-primary text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE EMAIL */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="ios-glass p-6 rounded-3xl border border-white/20 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Change Email Address</h3>
              <button onClick={() => setEmailModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">New Email Address:</label>
                <input
                  type="email"
                  required
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl ios-glass text-xs font-semibold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEmail}
                  className="px-5 py-2 rounded-xl ios-glass-btn-primary text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {savingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Update Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="ios-glass p-6 rounded-3xl border border-white/20 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Change Auth Password</h3>
              <button onClick={() => setPasswordModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">New Password (min 6 chars):</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Confirm Password:</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl ios-glass text-xs font-semibold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl ios-glass-btn-primary text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE ACCOUNT CONFIRMATION */}
      {deleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="ios-glass p-6 rounded-3xl border border-red-500/30 max-w-md w-full space-y-4 shadow-2xl bg-red-950/30">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Delete MovieNest Account</h3>
              </div>
              <button onClick={() => setDeleteAccountModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              This action is permanent and irreversible. Your user profile, custom watchlist, and watch history records will be completely removed.
            </p>

            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-red-200">
                Type <strong>DELETE</strong> below to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-black/50 border border-red-500/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteAccountModalOpen(false)}
                className="px-4 py-2 rounded-xl ios-glass text-xs font-semibold text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmText.trim().toLowerCase() !== 'delete'}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
              >
                {deletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ABOUT MOVIENEST */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="ios-glass p-6 rounded-3xl border border-white/20 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">About MovieNest</h3>
              <button onClick={() => setAboutModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-neutral-300 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>MovieNest</strong> is a high-performance cinema & television streaming platform powered by TMDB metadata and real-time streaming CDN mirrors.
              </p>
              <p>
                Integrated with <strong>CINEXTMA</strong> (Server 1) and CineSrc (Server 2) engines, providing high-definition 1080p and 4K playback.
              </p>
              <p className="text-[11px] text-neutral-400">
                This app uses the TMDB API but is not endorsed or certified by TMDB. Public television channels are indexed from open IPTV providers.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAboutModalOpen(false)}
                className="px-5 py-2 rounded-xl ios-glass-btn-primary text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PRIVACY POLICY */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="ios-glass p-6 rounded-3xl border border-white/20 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Privacy Policy</h3>
              <button onClick={() => setPrivacyModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-neutral-300 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p><strong>1. Data Collection:</strong> We store minimal user authentication credentials via Firebase Authentication. Watch history and saved watchlists are stored securely in Cloud Firestore under your UID.</p>
              <p><strong>2. Encryption:</strong> All communications between the MovieNest client and backend API proxies are transmitted using TLS 1.3 HTTPS encryption.</p>
              <p><strong>3. Third Party Services:</strong> MovieNest embeds public third-party video mirrors. No personal banking credentials or passwords are stored on external mirrors.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="px-5 py-2 rounded-xl ios-glass-btn-primary text-white text-xs font-bold"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: TERMS & CONDITIONS */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="ios-glass p-6 rounded-3xl border border-white/20 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Terms & Conditions</h3>
              <button onClick={() => setTermsModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-neutral-300 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p><strong>1. Acceptance:</strong> By accessing or using MovieNest, you agree to comply with our Terms of Service.</p>
              <p><strong>2. Authorized Use:</strong> Streams are provided for personal, non-commercial entertainment. Content distribution or reverse engineering is prohibited.</p>
              <p><strong>3. Service Continuity:</strong> We reserve the right to modify or update playback endpoints and features to ensure continuous streaming availability.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTermsModalOpen(false)}
                className="px-5 py-2 rounded-xl ios-glass-btn-primary text-white text-xs font-bold"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
