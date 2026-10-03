'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Layers, Lock, Mail, Eye, EyeOff, ArrowRight, 
  ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Info, BookOpen 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Wezblue@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your Wezblue email address.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    const res = await login(email.trim(), password);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
      setIsLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-7 text-white text-center relative">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-black tracking-tight text-white">WEZBLUE</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-300/30 text-[10px] font-bold uppercase tracking-wider text-blue-100">
              Enterprise Jira
            </span>
          </div>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xs mx-auto">
            Jira Project Management • Confluence Spaces • WezAI
          </p>
        </div>

        {/* Form Body */}
        <div className="p-7 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 text-center">Sign in to your workspace</h2>
            <p className="text-xs text-slate-500 text-center mt-0.5">
              Enter your corporate Wezblue email and password
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Wezblue Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@wezblue.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-jira-brand focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-jira-brand hover:underline font-semibold cursor-pointer">
                  Default: Wezblue@123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-jira-brand focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-jira-brand focus:ring-0 cursor-pointer"
                />
                <span>Remember this device (30 days)</span>
              </label>
            </div>

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-jira-brand to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-yellow-300" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Wezblue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Enterprise SSO & SAML 2.0 Enabled</span>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-blue-200/70 font-medium">
        © 2026 Wezblue Technologies Inc. • Enterprise Jira Platform
      </div>
    </div>
  );
}
