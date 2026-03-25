import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (tab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

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
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setResendStatus('loading');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      setResendStatus('error');
      setError(error.message);
    } else {
      setResendStatus('success');
      setSuccess('Verification link resent! Please check your inbox.');
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-brand-500)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-[var(--color-brand-500)]/20 to-[var(--color-brand-500)]/10 backdrop-blur-sm border border-[var(--color-brand-500)]/20 p-4 rounded-2xl mb-4 shadow-lg">
            <Dumbbell className="w-10 h-10 text-[var(--color-brand-500)]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-main)]">MaxOut</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 font-medium">Your personal strength intelligence platform</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-premium">
          {/* Tabs */}
          <div className="flex bg-[var(--color-bg-base)]/50 rounded-xl p-1 mb-8 border border-[var(--color-border-subtle)]/30">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                  tab === t
                    ? 'bg-[var(--color-brand-500)] text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-3.5 pl-11 pr-4 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-3.5 pl-11 pr-11 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm password (signup only) */}
            {tab === 'signup' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-3.5 pl-11 pr-4 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors"
                />
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium px-4 py-3 rounded-xl flex flex-col gap-2">
                <span>{error}</span>
                {error.toLowerCase().includes('confirmed') && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus === 'loading'}
                    className="text-white bg-red-500/20 hover:bg-red-500/30 py-1.5 px-3 rounded-lg text-xs font-bold transition-all w-fit disabled:opacity-50"
                  >
                    {resendStatus === 'loading' ? 'Sending...' : 'Resend confirmation link'}
                  </button>
                )}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--color-brand-500)] to-blue-500 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-[var(--color-brand-500)]/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {tab === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--color-text-muted)] mt-6 leading-relaxed">
            Your data is private and synced securely to your account only.
          </p>
        </div>
      </div>
    </div>
  );
}
