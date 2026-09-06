import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Package,
  DollarSign,
  TrendingUp,
  Store
} from 'lucide-react';
import { UserProfile, loginUser, registerUser } from '../lib/auth';

interface AuthViewProps {
  onAuthSuccess: (user: UserProfile) => void;
  onContinueAsGuest?: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
  noticeMessage?: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
  isModal = false,
  onCloseModal,
  noticeMessage
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          setSuccessMsg(`Welcome back, ${res.user.name}!`);
          setTimeout(() => {
            onAuthSuccess(res.user!);
          }, 400);
        }
      } else {
        const res = await registerUser(email, password, name, brandName);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          setSuccessMsg(`Account created for ${res.user.brandName}!`);
          setTimeout(() => {
            onAuthSuccess(res.user!);
          }, 400);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await loginUser(demoEmail, 'password123');
      if (res.user) {
        setSuccessMsg(`Logged in as ${res.user.name}`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 300);
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isModal ? 'p-0' : 'min-h-[85vh] flex items-center justify-center py-10 px-4'}>
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="md:col-span-5 bg-gradient-to-br from-pink-900 via-pink-800 to-fuchsia-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Ornament */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shadow-pink-600/50">
                G
              </div>
              <div>
                <h2 className="font-bold text-lg tracking-tight">GLOW & CARE</h2>
                <p className="text-xs text-pink-200">the beauty suite</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-xl font-bold leading-snug">
                The operations hub for high-margin beauty & cosmetics brands.
              </h3>
              <p className="text-xs text-pink-100/90 leading-relaxed">
                Log inventory deliveries, calculate true landed costs with freight split, build profitable bundle combos, and monitor net margins in real time.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-pink-700/50 hidden sm:block">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-pink-800/80 border border-pink-600/50 text-pink-300 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Automated Landed Costing</h4>
                  <p className="text-[11px] text-pink-300">Evenly split shipping & packaging across all batch units.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-pink-800/80 border border-pink-600/50 text-pink-300 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Bundle & Combo Engine</h4>
                  <p className="text-[11px] text-pink-300">Design duo and trio packages with automatic component stock reduction.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-pink-800/80 border border-pink-600/50 text-pink-300 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Secure Isolated Sessions</h4>
                  <p className="text-[11px] text-pink-300">Encrypted user storage with per-brand workspace isolation.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 sm:pt-6 border-t border-pink-700/50 flex items-center justify-between text-xs text-pink-300 hidden sm:flex">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Web Crypto SHA-256
            </span>
            <span>v2.4 Protected</span>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Top Switcher */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-pink-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-pink-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {isModal && onCloseModal && (
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="text-xs text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {mode === 'login' ? 'Welcome back' : 'Start managing your beauty brand'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Enter your credentials to access your inventory and profit data.'
                  : 'Set up your brand account to track products, batches, and sales.'}
              </p>
            </div>

            {/* Notice, Error & Success Banners */}
            {noticeMessage && !errorMsg && !successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
                <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
                <span>{noticeMessage}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Amina Bello"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-pink-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Brand / Business Name
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Glow Aesthetics"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-pink-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@yourbrand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  {mode === 'login' && (
                    <span
                      className="text-[11px] text-pink-600 hover:text-pink-700 font-medium cursor-pointer"
                      onClick={() => setSuccessMsg('Tip: You can use the 1-click demo logins below to sign in instantly.')}
                    >
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-pink-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-[11px] text-slate-400 mt-1">Must be at least 6 characters.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Brand Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick 1-Click Demo Accounts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('sumyabint@gmail.com')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-pink-600">Sumya Bint</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 font-semibold">Owner</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">sumyabint@gmail.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('demo@glowcare.com')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-pink-600">Amina Demo</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Demo</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">demo@glowcare.com</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Guest Option */}
          {onContinueAsGuest && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-2 cursor-pointer"
              >
                Or continue in guest preview mode
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
