import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { GovCrest } from './GovCrest';
import { LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle, ShieldCheck, Lock, User as UserIcon, HelpCircle } from 'lucide-react';

interface Props {
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<Props> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await StorageService.authenticate(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const users = StorageService.getUsers();
      if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
        throw new Error(`Username "${username}" already exists.`);
      }
      
      const created = await StorageService.createUser('Administrator', {
        username,
        fullName,
        email,
        password,
        role: 'User',
      });

      setSuccess(`Account "${created.username}" created successfully! Please sign in.`);
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f2] flex flex-col justify-between font-sans text-slate-800">
      {/* Top Bangladesh Government Banner (iBAS++ Style) */}
      <header className="bg-[#006a4e] text-white shadow-md border-b-4 border-[#c68a14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <GovCrest className="w-12 h-12 shrink-0 drop-shadow-sm" />
            <div>
              <div className="text-[11px] sm:text-xs font-semibold tracking-wide text-emerald-100 uppercase">
                Government of the People's Republic of Bangladesh
              </div>
              <div className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Integrated Case Volume Book & Judgement Ledger</span>
                <span className="hidden md:inline-block text-[10px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded shadow-sm">
                  iBAS++ Style
                </span>
              </div>
              <div className="text-[11px] text-emerald-200">
                Finance Division & Judicial Administration Suite
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-emerald-100">
            <div className="text-right">
              <div className="font-semibold text-white">System Security</div>
              <div className="text-[10px] text-emerald-200">ISO/IEC 27001 Standard Offline</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-800/80 border border-emerald-400/30 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
          {/* Card Top Header */}
          <div className="bg-gradient-to-r from-[#006a4e] to-[#00523c] px-6 py-4 text-white flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-300" />
                <span>User Authentication Portal</span>
              </h2>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Authorized Personnel Only
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-800/70 border border-amber-400/40 flex items-center justify-center">
              <GovCrest className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6">
            {/* Tab switchers */}
            <div className="flex border-b border-slate-200 mb-5 text-xs">
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className={`flex-1 pb-2.5 text-center font-semibold border-b-2 transition-colors ${
                  mode === 'login'
                    ? 'border-[#006a4e] text-[#006a4e]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                className={`flex-1 pb-2.5 text-center font-semibold border-b-2 transition-colors ${
                  mode === 'signup'
                    ? 'border-[#006a4e] text-[#006a4e]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Register User
              </button>
              <button
                onClick={() => { setMode('reset'); setError(null); setSuccess(null); }}
                className={`flex-1 pb-2.5 text-center font-semibold border-b-2 transition-colors ${
                  mode === 'reset'
                    ? 'border-[#006a4e] text-[#006a4e]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Help & Reset
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    User ID / Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter authorized username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Enter confidential password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm transition"
                    />
                  </div>
                </div>

                {/* Government Security Disclaimer Box */}
                <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded text-[11px] text-amber-900 leading-tight">
                  <span className="font-semibold text-amber-800">Security Warning:</span> Unauthorized access or tampering with official judicial and financial records is strictly prohibited under the ICT Act.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#006a4e] hover:bg-[#00523c] text-white font-semibold py-2.5 rounded shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Verifying Credentials...' : 'Sign In'}</span>
                </button>
              </form>
            )}

            {/* Signup Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Officer / Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md. Rafiqul Islam"
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
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Office Email</label>
                    <input
                      type="email"
                      placeholder="name@gov.bd"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006a4e] focus:border-[#006a4e] text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Password <span className="text-red-500">*</span>
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
                    placeholder="Re-type password"
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
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Registering...' : 'Register User Account'}</span>
                </button>
              </form>
            )}

            {/* Reset Modal */}
            {mode === 'reset' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2 text-slate-700">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#c68a14]" />
                    <span>Government Protocol for Password Reset</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Because this system operates in a secure standalone offline environment, password resets must be authorized by your system administrator:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-700 font-medium">
                    <li>Contact your designated System Administrator.</li>
                    <li>Administrator logs in and accesses <strong>User Management</strong>.</li>
                    <li>The administrator verifies officer identity and resets the credential locally.</li>
                  </ol>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded text-slate-800 text-xs font-semibold transition"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="bg-slate-800 text-slate-300 border-t border-slate-700 py-3 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <GovCrest className="w-4 h-4" />
            <span>Finance Division, Ministry of Finance, Government of Bangladesh</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Integrated Budget and Accounting System (iBAS++) Framework | VolumnBook Offline Ledger
          </div>
        </div>
      </footer>
    </div>
  );
};
