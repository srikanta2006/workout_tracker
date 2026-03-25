import { useState } from 'react';
import { Settings as SettingsIcon, LogOut, User, Shield, Info, ExternalLink, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function Settings() {
  const { user } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateStatus, setUpdateStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus(null);
    
    if (newPassword !== confirmPassword) {
      setUpdateStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setUpdateStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setUpdateStatus({ type: 'error', message: error.message });
    } else {
      setUpdateStatus({ type: 'success', message: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsEditingPassword(false);
        setUpdateStatus(null);
      }, 2000);
    }
  };

  const memberSince = user?.created_at 
    ? format(new Date(user.created_at), 'MMMM yyyy') 
    : 'Recently';

  return (
    <div className="w-full h-full flex flex-col pb-8 items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 px-1">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[var(--color-brand-600)]" />
            Account & Settings
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your cloud profile and application preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Profile Card */}
          <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500 animate-scale-spring overflow-hidden relative">
            <div className="absolute -top-10 -right-10 p-4 opacity-5 transform rotate-12 pointer-events-none">
              <User className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-500)] mb-6">
                Your Profile
              </h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-[var(--color-brand-500)] to-blue-500 p-4 rounded-2xl shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--color-text-main)] truncate max-w-[280px]">
                    {user?.email}
                  </h4>
                  <p className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {memberSince}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button 
                  onClick={handleSignOut}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
                <button 
                  onClick={() => setIsEditingPassword(!isEditingPassword)}
                  className={`border font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] ${
                    isEditingPassword 
                      ? 'bg-[var(--color-brand-500)] text-white border-transparent' 
                      : 'bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:border-[var(--color-brand-500)]/50'
                  }`}
                >
                  <Shield className={`w-5 h-5 ${isEditingPassword ? 'text-white' : 'text-[var(--color-text-muted)]'}`} />
                  {isEditingPassword ? 'Cancel Edit' : 'Edit Password'}
                </button>
              </div>

              {/* Password Edit Form */}
              {isEditingPassword && (
                <form onSubmit={handleUpdatePassword} className="mt-8 pt-8 border-t border-[var(--color-border-subtle)]/30 animate-fade-in-up">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none transition-colors"
                      />
                    </div>

                    {updateStatus && (
                      <div className={`p-3 rounded-xl text-sm font-semibold text-center ${
                        updateStatus.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {updateStatus.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[var(--color-brand-500)] text-white font-bold py-3.5 rounded-xl hover:bg-[var(--color-brand-600)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Preferences Placeholder */}
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-[var(--color-text-main)]">
              <Info className="w-5 h-5 text-blue-500" />
              App Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]/30">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">Version</span>
                <span className="text-sm font-bold text-[var(--color-text-main)] tracking-tight">2.1.0 Cloud</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]/30">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">Sync Engine</span>
                <span className="text-sm font-bold text-green-500 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Supabase Realtime
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">Database Status</span>
                <span className="text-sm font-bold text-[var(--color-text-main)]">Connected</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
               <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] flex items-center justify-center gap-1 transition-colors"
              >
                Managed with Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Legacy Warning */}
          <p className="text-[10px] text-center text-[var(--color-text-muted)] opacity-40 px-8 uppercase tracking-widest font-bold">
            All data is now securely stored in the cloud. Local storage sync is disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
