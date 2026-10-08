import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { GovCrest } from './GovCrest';
import { ShieldCheck, KeyRound, AlertCircle, Lock } from 'lucide-react';
import { User } from '../types';

interface Props {
  onAdminCreated: (admin: User) => void;
}

export const FirstRunSetup: React.FC<Props> = ({ onAdminCreated }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const admin = await StorageService.createInitialAdmin(fullName, username, email, password);
      onAdminCreated(admin);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize administrator account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f2] flex flex-col justify-between font-sans text-slate-800">
      {/* Top Bangladesh Government Banner (iBAS++ Style) */}
      <header className="bg-[#006a4e] text-white shadow-md border-b-4 border-[#c68a14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <GovCrest className="w-12 h-12 shrink-0 drop-shadow-sm" />
            <div>
              <div className="text-[11px] sm:text-xs font-semibold tracking-wide text-emerald-100 uppercase">
                Government of the People's Republic of Bangladesh
              </div>
              <div className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Integrated Case Volume Book & Judgement Ledger</span>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded shadow-sm">
                  iBAS++ Setup
                </span>
              </div>
              <div className="text-[11px] text-emerald-200">
                Finance Division & Judicial Administration
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#006a4e] to-[#00523c] px-6 py-4 text-white flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <span>First-Run System Initialization</span>
              </h2>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Primary Master Administrator Setup
              </p>
            </div>
            <GovCrest className="w-8 h-8" />
          </div>

          <div className="p-6">
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#006a4e] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#006a4e]">System Initialization:</span> Configure the master administrator account to generate the local encrypted database ledger and enforce role access control.
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name of Record Officer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Record Officer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Office Email</label>
                  <input
                    type="email"
                    placeholder="admin@gov.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Master Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#006a4e] hover:bg-[#00523c] text-white font-semibold py-2.5 rounded shadow transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Initializing Database...' : 'Initialize & Create Administrator'}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 border-t border-slate-700 py-3 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <GovCrest className="w-4 h-4" />
            <span>Finance Division, Ministry of Finance, Government of Bangladesh</span>
          </div>
          <span className="text-[10px] text-slate-400">100% Standalone Offline Ledger</span>
        </div>
      </footer>
    </div>
  );
};
