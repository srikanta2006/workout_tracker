import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LogOut, User, Shield, Calendar, Download, Trash2, Edit3, Save, X, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { useDiet } from '../context/DietContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { UserProfile, Gender, ActivityLevel } from '../types';
import { calculateBMR, calculateTDEE, calculateBMI, getBMICategory, getGoalRecommendation } from '../utils/healthCalculations';

export default function Settings() {
  const { user, profile, updateProfile } = useAuth();
  const { workouts, routines, bodyweights } = useWorkout();
  const { meals, dietGoals, updateGoals } = useDiet();
  
  const [activeTab, setActiveTab] = useState<'account' | 'profile'>('profile');

  // Password State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateStatus, setUpdateStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileUpdates, setProfileUpdates] = useState<Partial<UserProfile>>(profile || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) setProfileUpdates(profile);
  }, [profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus(null);
    if (newPassword !== confirmPassword) return setUpdateStatus({ type: 'error', message: 'Passwords do not match.' });
    if (newPassword.length < 6) return setUpdateStatus({ type: 'error', message: 'Password must be at least 6 characters.' });

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setUpdateStatus({ type: 'error', message: error.message });
    } else {
      setUpdateStatus({ type: 'success', message: 'Password updated successfully!' });
      setNewPassword(''); setConfirmPassword('');
      setTimeout(() => { setIsEditingPassword(false); setUpdateStatus(null); }, 2000);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profileUpdates);
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile,
      workouts,
      routines,
      bodyweights,
      meals,
      dietGoals,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maxout_export_${profile?.name?.replace(/\s+/g, '_') || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("WARNING: This will permanently delete your local tracker data and sign you out. Since user rows must be deleted by an admin in Supabase, this action just wipes your connection. Proceed?");
    if (confirmDelete) {
      localStorage.clear();
      await supabase.auth.signOut();
    }
  };

  const memberSince = user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'Recently';

  return (
    <div className="w-full h-full flex flex-col pb-8 items-center overflow-y-auto">
      <div className="w-full max-w-2xl px-4 mt-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[var(--color-brand-600)]" />
            Account & Settings
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your personal intelligence profile and security.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[var(--color-bg-base)]/50 rounded-xl p-1 mb-6 border border-[var(--color-border-subtle)]/30">
          <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'profile' ? 'bg-[var(--color-brand-500)] text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}>
            Intelligence Profile
          </button>
          <button onClick={() => setActiveTab('account')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'account' ? 'bg-[var(--color-brand-500)] text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}>
            Account Security
          </button>
        </div>

        <div className="space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-premium animate-fade-in-up">
              <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border-subtle)]/30 pb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--color-text-main)]">
                  <Activity className="w-5 h-5 text-[var(--color-brand-500)]" />
                  Biometrics & Goals
                </h3>
                {!isEditingProfile ? (
                  <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 text-sm font-bold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors bg-[var(--color-brand-500)]/10 px-4 py-2 rounded-lg">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                     <button onClick={() => { setIsEditingProfile(false); setProfileUpdates(profile || {}); }} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-white transition-colors hover:bg-red-500 px-4 py-2 rounded-lg">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleSaveProfile} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-white bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] transition-colors px-4 py-2 rounded-lg disabled:opacity-50">
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </div>
                )}
              </div>

              {/* Health Scorecard (Computed) */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                      { label: 'BMR', value: calculateBMR(profileUpdates) || '-', unit: 'kcal', color: 'text-orange-500' },
                      { label: 'TDEE', value: (calculateBMR(profileUpdates) ? calculateTDEE(calculateBMR(profileUpdates)!, profileUpdates.activity_level) : '-'), unit: 'kcal', color: 'text-blue-500' },
                      { label: 'BMI', value: (profileUpdates.weight && profileUpdates.height ? calculateBMI(profileUpdates.weight, profileUpdates.height) : '-'), unit: getBMICategory(calculateBMI(profileUpdates.weight || 0, profileUpdates.height || 1)), color: 'text-emerald-500' },
                  ].map((stat, i) => (
                      <div key={i} className="bg-[var(--color-bg-base)]/50 border border-[var(--color-border-subtle)]/30 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] block mb-1">{stat.label}</span>
                          <div className={clsx("text-lg font-black tracking-tight", stat.color)}>{stat.value}</div>
                          <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{stat.unit}</span>
                      </div>
                  ))}
              </div>

              {!isEditingProfile ? (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div><span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold block mb-1">Name</span><p className="text-lg font-medium text-[var(--color-text-main)]">{profile?.name || '-'}</p></div>
                  <div><span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold block mb-1">Age</span><p className="text-lg font-medium text-[var(--color-text-main)]">{profile?.age ? `${profile.age} yrs` : '-'}</p></div>
                  <div><span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold block mb-1">Height</span><p className="text-lg font-medium text-[var(--color-text-main)]">{profile?.height ? `${profile.height} cm` : '-'}</p></div>
                  <div><span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold block mb-1">Weight</span><p className="text-lg font-medium text-[var(--color-text-main)]">{profile?.weight ? `${profile.weight} kg` : '-'}</p></div>
                  <div><span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold block mb-1">Target Weight</span><p className="text-lg font-medium text-emerald-500 font-bold">{dietGoals?.target_weight ? `${dietGoals.target_weight} kg` : '-'}</p></div>
                  <div className="col-span-2"><span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold block mb-1">Goal</span><p className="text-lg font-medium text-[var(--color-text-main)] capitalize">{profile?.fitness_goal?.replace('_', ' ') || '-'}</p></div>
                  <div className="col-span-2"><span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold block mb-1">Dietary Config</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile?.dietary_preferences?.map(d => <span key={d} className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full">{d}</span>)}
                      {profile?.allergies?.map(a => <span key={a} className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full">{a} (Allergy)</span>)}
                      {(!profile?.dietary_preferences?.length && !profile?.allergies?.length) && <span className="text-sm text-[var(--color-text-muted)] italic">No restrictions set</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Name</label>
                      <input type="text" value={profileUpdates.name || ''} onChange={e => setProfileUpdates({...profileUpdates, name: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                    </div>
                    <div><label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Age</label>
                      <input type="number" value={profileUpdates.age || ''} onChange={e => setProfileUpdates({...profileUpdates, age: Number(e.target.value)})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                    </div>
                    <div><label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Height (cm)</label>
                      <input type="number" value={profileUpdates.height || ''} onChange={e => setProfileUpdates({...profileUpdates, height: Number(e.target.value)})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                    </div>
                    <div><label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Weight (kg)</label>
                      <input type="number" value={profileUpdates.weight || ''} onChange={e => setProfileUpdates({...profileUpdates, weight: Number(e.target.value)})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                    </div>
                    <div><label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Target Weight (kg)</label>
                      <input type="number" value={dietGoals?.target_weight || ''} onChange={e => updateGoals({...dietGoals!, target_weight: Number(e.target.value)})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                    </div>
                    <div className="col-span-2">
                       <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2 block">Personal Archetype</label>
                       <div className="grid grid-cols-2 gap-4">
                           <select value={profileUpdates.gender || ''} onChange={e => setProfileUpdates({...profileUpdates, gender: e.target.value as Gender})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none">
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                           </select>
                           <select value={profileUpdates.activity_level || ''} onChange={e => setProfileUpdates({...profileUpdates, activity_level: e.target.value as ActivityLevel})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none">
                              <option value="Sedentary">Sedentary</option>
                              <option value="Lightly Active">Lightly Active</option>
                              <option value="Moderately Active">Moderately Active</option>
                              <option value="Very Active">Very Active</option>
                           </select>
                       </div>
                    </div>
                    <div className="col-span-2">
                       <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Goal</label>
                       <select value={profileUpdates.fitness_goal || ''} onChange={e => setProfileUpdates({...profileUpdates, fitness_goal: e.target.value as any})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none">
                          <option value="lose_weight">Lose Weight</option>
                          <option value="gain_weight">Build Muscle</option>
                          <option value="cut">Extreme Cut</option>
                          <option value="bulk">Heavy Bulk</option>
                          <option value="maintain">Maintain</option>
                       </select>
                    </div>
                  </div>

                  <div className="pt-4">
                      <button 
                        onClick={() => {
                            const bmr = calculateBMR(profileUpdates);
                            if (bmr && profileUpdates.weight && profileUpdates.fitness_goal) {
                                const tdee = calculateTDEE(bmr, profileUpdates.activity_level);
                                const recommendation = getGoalRecommendation(tdee, profileUpdates.fitness_goal, profileUpdates.weight);
                                updateGoals({
                                    target_calories: recommendation.calories,
                                    target_protein: recommendation.protein,
                                    target_carbs: recommendation.carbs,
                                    target_fat: recommendation.fat,
                                    fitness_goal: profileUpdates.fitness_goal
                                });
                                alert(`Smart goals applied! Calories: ${recommendation.calories}kcal. Macros: P:${recommendation.protein}g C:${recommendation.carbs}g F:${recommendation.fat}g`);
                            } else {
                                alert("Please fill age, height, weight, gender, and goal first.");
                            }
                        }}
                        className="w-full py-3 bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30 text-[var(--color-brand-600)] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--color-brand-500)] hover:text-white transition-all shadow-sm"
                      >
                         Generate Smart Goal Recommendations
                      </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-premium animate-fade-in-up relative overflow-hidden">
               <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] transform rotate-12 pointer-events-none">
                 <Shield className="w-48 h-48 text-white" />
               </div>
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-[var(--color-brand-500)] to-blue-500 p-4 rounded-2xl shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[var(--color-text-main)] truncate max-w-[280px]">
                        {user?.email || user?.phone || 'Linked Account'}
                      </h4>
                      <p className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Member since {memberSince}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button onClick={handleSignOut} className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                    <button onClick={() => setIsEditingPassword(!isEditingPassword)} className={`border font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${isEditingPassword ? 'bg-[var(--color-brand-500)] text-white border-transparent' : 'bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:border-[var(--color-brand-500)]/50'}`}>
                      <Shield className={`w-5 h-5 ${isEditingPassword ? 'text-white' : 'text-[var(--color-text-muted)]'}`} />
                      {isEditingPassword ? 'Cancel Edit' : 'Edit Password'}
                    </button>
                  </div>

                  {isEditingPassword && (
                    <form onSubmit={handleUpdatePassword} className="pt-4 animate-fade-in-up space-y-4">
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                      {updateStatus && <div className={`p-3 rounded-xl text-sm font-semibold text-center ${updateStatus.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{updateStatus.message}</div>}
                      <button type="submit" disabled={loading} className="w-full bg-[var(--color-brand-500)] text-white font-bold py-3.5 rounded-xl hover:bg-[var(--color-brand-600)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  )}

                  <div className="pt-8 border-t border-[var(--color-border-subtle)]/30 space-y-4">
                    <h4 className="text-sm font-bold text-[var(--color-text-main)] uppercase tracking-wider mb-4">Data Management</h4>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={handleExportData} className="flex-1 border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Download className="w-5 h-5" /> Export My Data (JSON)
                      </button>
                      
                      <button onClick={handleDeleteAccount} className="flex-1 border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Trash2 className="w-5 h-5" /> Wipe Account Data
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] text-center mt-2 leading-relaxed">
                      Exporting your data bundles your active routines, workout history, meals, and biometric trends into an open-source JSON file. Wiping your account destroys local cache and severs backend connectivity permanently.
                    </p>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
