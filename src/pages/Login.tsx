import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

// Custom SVG Icons
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>('signin');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleOAuth = async (provider: 'google') => {
    setError('');
    setSocialLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: { redirectTo: window.location.origin } 
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setSocialLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (tab === 'signup' && password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setTab('signin');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings?reset=true`, 
      });
      if (error) throw error;
      setSuccess('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAction = tab === 'reset' ? handleResetPassword : handleEmailAuth;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex flex-col items-center justify-center px-4 relative overflow-y-auto py-10">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-brand-500)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-[var(--color-brand-500)]/20 to-[var(--color-brand-500)]/10 backdrop-blur-sm border border-[var(--color-brand-500)]/20 p-4 rounded-2xl mb-4 shadow-lg">
            <Dumbbell className="w-10 h-10 text-[var(--color-brand-500)]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-main)]">MaxOut</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 font-medium text-center">Your ultimate intelligent fitness tracker.</p>
        </div>

        <div className="glass-card rounded-[32px] p-8 shadow-premium">
          {/* Main Auth Tabs */}
          {tab !== 'reset' && (
            <div className="flex bg-[var(--color-bg-base)]/50 rounded-xl p-1 mb-6 border border-[var(--color-border-subtle)]/30">
              {(['signin', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                    tab === t ? 'bg-[var(--color-brand-500)] text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          {/* Title for reset tab */}
          {tab === 'reset' && (
            <h2 className="text-xl font-black text-[var(--color-text-main)] mb-6 text-center">Reset Password</h2>
          )}

          {/* Social Auth Buttons */}
          {tab !== 'reset' && (
            <>
              <div className="mb-6">
                <button type="button" onClick={() => handleOAuth('google')} disabled={socialLoading || loading} className="w-full flex items-center justify-center p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/50 hover:bg-[var(--color-bg-base)] transition-colors text-[var(--color-text-main)] font-bold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {socialLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <GoogleIcon />} 
                  {socialLoading ? 'Connecting...' : 'Continue with Google'}
                </button>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[var(--color-border-subtle)]/50" />
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-[var(--color-border-subtle)]/50" />
              </div>
            </>
          )}

          <form onSubmit={submitAction} className="space-y-4">
            
            {/* Email Inputs */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required
                className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-3.5 pl-11 pr-4 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors" />
            </div>
            {tab !== 'reset' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
                  className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-3.5 pl-11 pr-11 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
            {tab === 'signup' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" required
                  className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-3.5 pl-11 pr-4 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors" />
              </div>
            )}

            {/* Messages */}
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium px-4 py-3 rounded-xl">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium px-4 py-3 rounded-xl">{success}</div>}

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[var(--color-brand-500)] to-blue-500 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-[var(--color-brand-500)]/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {tab === 'reset' ? 'Send Reset Link' : tab === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Helpers */}
          <div className="mt-6 flex flex-col gap-3 text-center">
            {tab === 'signin' && (
              <button type="button" onClick={() => { setTab('reset'); setError(''); setSuccess(''); }} className="text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
                Forgot Password?
              </button>
            )}
            {tab === 'reset' && (
              <button type="button" onClick={() => { setTab('signin'); setError(''); setSuccess(''); }} className="text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
                Back to Sign In
              </button>
            )}
            <p className="text-xs text-[var(--color-text-muted)]/70">
              Your data is encrypted and synced securely via Supabase.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
