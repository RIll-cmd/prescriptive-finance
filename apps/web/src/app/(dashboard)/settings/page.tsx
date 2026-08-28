'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export default function SettingsPage() {
  const { user, updateProfile, isLoading } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [timezone, setTimezone] = useState('Asia/Manila');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setCurrency(user.currency || 'PHP');
      setTimezone(user.timezone || 'Asia/Manila');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsSaving(true);

    try {
      await updateProfile({
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        currency,
        timezone,
      });
      setSuccessMsg('Account settings updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlinkEmail = async () => {
    if (!confirm('Are you sure you want to unlink your email? You will still be able to sign in using your username.')) {
      return;
    }
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsSaving(true);

    try {
      await updateProfile({
        email: '',
      });
      setEmail('');
      setSuccessMsg('Email unlinked successfully. You are in username-only mode.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to unlink email.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-[fadeIn_0.3s_ease-out]">
      {/* Page Header */}
      <div>
        <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
          Account & Preferences
        </h1>
        <p className="text-[0.82rem] text-white/40 mt-0.5">
          Manage your account credentials, linked Gmail/email, and regional currency settings
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[0.82rem] flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
          <span className="material-symbols-rounded text-[20px] text-emerald-400">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[0.82rem] flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
          <span className="material-symbols-rounded text-[20px] text-red-400">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Details Card */}
        <div className="rounded-[20px] bg-[rgba(5,5,16,0.7)] backdrop-blur-[24px] border border-white/[0.08] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3869D2] to-[#C57CF9] flex items-center justify-center shadow-[0_2px_12px_rgba(56,105,210,0.3)]">
              <span className="material-symbols-rounded text-[20px] text-white">person</span>
            </div>
            <div>
              <h2 className="text-[1.05rem] font-bold text-white tracking-tight">Profile Credentials</h2>
              <p className="text-[0.72rem] text-white/40">Your unique identity and username</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Username *
              </label>
              <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 focus-within:border-[#3869D2] transition-all">
                <span className="material-symbols-rounded text-[18px] text-white/30 mr-2">alternate_email</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className="bg-transparent border-none text-[0.85rem] font-medium text-white outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Display / First Name
              </label>
              <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 focus-within:border-[#3869D2] transition-all">
                <span className="material-symbols-rounded text-[18px] text-white/30 mr-2">badge</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="bg-transparent border-none text-[0.85rem] font-medium text-white outline-none w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Linked Email Card */}
        <div className="rounded-[20px] bg-[rgba(5,5,16,0.7)] backdrop-blur-[24px] border border-white/[0.08] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3869D2]/30 to-[#C57CF9]/30 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-rounded text-[20px] text-[#C57CF9]">mail</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[1.05rem] font-bold text-white tracking-tight">Linked Email / Gmail</h2>
                  {user?.email ? (
                    <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Linked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      Not Linked (Username Only)
                    </span>
                  )}
                </div>
                <p className="text-[0.72rem] text-white/40">Used for signing in and account recovery</p>
              </div>
            </div>

            {user?.email && (
              <button
                type="button"
                onClick={handleUnlinkEmail}
                className="text-[0.75rem] text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Unlink Email
              </button>
            )}
          </div>

          <div>
            <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
              Email Address (Optional)
            </label>
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 focus-within:border-[#3869D2] transition-all">
              <span className="material-symbols-rounded text-[18px] text-white/30 mr-2">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="bg-transparent border-none text-[0.85rem] font-medium text-white outline-none w-full"
              />
            </div>
            <p className="text-[0.70rem] text-white/35 mt-2">
              You can sign in with either your username (<strong className="text-white/70">{user?.username}</strong>) or this email address.
            </p>
          </div>
        </div>

        {/* Currency & Preferences Card */}
        <div className="rounded-[20px] bg-[rgba(5,5,16,0.7)] backdrop-blur-[24px] border border-white/[0.08] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center shadow-[0_2px_12px_rgba(52,211,153,0.3)]">
              <span className="material-symbols-rounded text-[20px] text-black">payments</span>
            </div>
            <div>
              <h2 className="text-[1.05rem] font-bold text-white tracking-tight">Preferences & Currency</h2>
              <p className="text-[0.72rem] text-white/40">Display formats for balance calculation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
              >
                <option value="PHP">PHP (₱ - Philippine Peso)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                <option value="JPY">JPY (¥ - Japanese Yen)</option>
              </select>
            </div>

            <div>
              <label className="text-[0.68rem] font-semibold text-white/40 uppercase tracking-[0.06em] mb-1.5 block">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0d0d21] border border-white/[0.08] rounded-[10px] px-3.5 py-2.5 text-[0.85rem] font-medium text-white outline-none focus:border-[#3869D2] transition-all"
              >
                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none rounded-[12px] px-7 py-3 text-white font-bold text-[0.88rem] cursor-pointer shadow-[0_4px_24px_rgba(56,105,210,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
            <span className="material-symbols-rounded text-[18px]">save</span>
          </button>
        </div>
      </form>
    </div>
  );
}
