import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, ArrowLeft, Loader2, Target, Apple, Flame, Scale, ChevronRight, User, HeartPulse, Dumbbell
} from 'lucide-react';
import type { UserProfile } from '../types';

export default function Onboarding() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<Partial<UserProfile>>(profile || {});

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/');
    }
  }, [profile, navigate]);

  const update = (key: keyof UserProfile, value: any) => {
    setUpdates(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(4, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateProfile({ ...updates, onboarding_completed: true });
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleArray = (key: 'dietary_preferences' | 'allergies', value: string) => {
    const arr = (updates[key] || []) as string[];
    if (arr.includes(value)) {
      update(key, arr.filter(item => item !== value));
    } else {
      update(key, [...arr, value]);
    }
  };

  // Step validation
  const canProceed = () => {
    if (step === 1) return updates.name && updates.age && updates.gender;
    if (step === 2) return updates.height && updates.weight;
    if (step === 3) return updates.fitness_goal && updates.activity_level;
    return true; // step 4 is optional
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-6 relative overflow-y-auto">
      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--color-brand-500)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <HeartPulse className="w-12 h-12 text-[var(--color-brand-500)] mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-black text-[var(--color-text-main)] mb-2">Build Your Intelligence Profile</h1>
          <p className="text-[var(--color-text-muted)] font-medium">We need some data to tailor the ultimate training experience.</p>
        </div>

        {/* Wizard Card */}
        <div className="glass-card rounded-[32px] p-8 shadow-premium min-h-[400px] flex flex-col">
          
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8 items-center justify-between">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex-1 h-3 rounded-full bg-[var(--color-bg-base)] relative overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-brand-500)] to-blue-500 transition-all duration-500 ${step >= num ? 'w-full' : 'w-0'}`}
                />
              </div>
            ))}
          </div>

          <div className="flex-1 animate-fade-in-up">
            
            {/* STEP 1: Basics */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-[var(--color-brand-500)]" />
                  <h2 className="text-2xl font-bold text-[var(--color-text-main)]">The Basics</h2>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Full Name</label>
                  <input type="text" value={updates.name || ''} onChange={e => update('name', e.target.value)} placeholder="John Doe"
                    className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-4 px-5 text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/60 text-lg transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Age</label>
                    <input type="number" value={updates.age || ''} onChange={e => update('age', parseInt(e.target.value))} placeholder="25"
                      className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-4 px-5 text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/60 text-lg transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Gender</label>
                    <div className="relative">
                      <select 
                        value={updates.gender || ''} onChange={e => update('gender', e.target.value)}
                        className="w-full appearance-none bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-4 pl-5 pr-10 text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/60 text-lg transition-colors"
                      >
                        <option value="" disabled>Select</option>
                        {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] rotate-90 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Metrics */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Scale className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Biometrics</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Height (cm)</label>
                    <input type="number" value={updates.height || ''} onChange={e => update('height', parseFloat(e.target.value))} placeholder="180"
                      className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-5 px-5 text-[var(--color-text-main)] text-xl font-bold text-center outline-none focus:border-[var(--color-brand-500)]/60 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Weight (kg)</label>
                    <input type="number" value={updates.weight || ''} onChange={e => update('weight', parseFloat(e.target.value))} placeholder="75"
                      className="w-full bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/40 rounded-xl py-5 px-5 text-[var(--color-text-main)] text-xl font-bold text-center outline-none focus:border-[var(--color-brand-500)]/60 transition-colors" />
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] text-center mt-4 bg-[var(--color-bg-base)] p-4 rounded-xl border border-[var(--color-border-subtle)]/30">
                  We use these metrics to calculate your Base Metabolic Rate (BMR) and AI target predictions.
                </p>
              </div>
            )}

            {/* STEP 3: Goals */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Mission & Activity</h2>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide">Primary Goal</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'lose_weight', label: 'Lose Weight', icon: Flame, color: 'text-red-500' },
                      { id: 'gain_weight', label: 'Build Muscle', icon: Dumbbell, color: 'text-[var(--color-brand-500)]' },
                      { id: 'maintain', label: 'Recomp / Maintain', icon: Scale, color: 'text-blue-500' },
                    ].map(g => {
                      const Icon = g.icon;
                      const active = updates.fitness_goal === g.id;
                      return (
                        <button key={g.id} onClick={() => update('fitness_goal', g.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                            active ? 'bg-[var(--color-brand-500)]/10 border-[var(--color-brand-500)] shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                                  : 'bg-[var(--color-bg-base)] border-[var(--color-border-subtle)]/40 hover:border-[var(--color-brand-500)]/50'
                          }`}
                        >
                          <Icon className={`w-8 h-8 mb-2 ${active ? g.color : 'text-[var(--color-text-muted)]'}`} />
                          <span className={`text-sm font-bold ${active ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)]'}`}>{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide mt-4">Daily Activity Level</label>
                  <div className="space-y-2">
                    {[
                      { id: 'Sedentary', desc: 'Little or no exercise, desk job' },
                      { id: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                      { id: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                      { id: 'Very Active', desc: 'Heavy exercise 6-7 days/week' }
                    ].map(a => {
                      const active = updates.activity_level === a.id;
                      return (
                        <button key={a.id} onClick={() => update('activity_level', a.id)}
                          className={`w-full flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left ${
                            active ? 'bg-[var(--color-brand-500)]/10 border-[var(--color-brand-500)]' : 'bg-[var(--color-bg-base)] border-[var(--color-border-subtle)]/40 hover:border-[var(--color-brand-500)]/50'
                          }`}
                        >
                          <span className={`font-bold ${active ? 'text-[var(--color-brand-500)]' : 'text-[var(--color-text-main)]'}`}>{a.id}</span>
                          <span className="text-sm text-[var(--color-text-muted)]">{a.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Dietary Details */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Apple className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Dietary Config (Optional)</h2>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide">Dietary Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Keto', 'Paleo', 'Gluten-Free'].map(diet => {
                      const active = updates.dietary_preferences?.includes(diet as any);
                      return (
                        <button key={diet} onClick={() => toggleArray('dietary_preferences', diet)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                            active ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-white shadow-md' 
                                   : 'bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'
                          }`}
                        >
                          {diet}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide">Allergies</label>
                  <div className="flex flex-wrap gap-2">
                    {['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy'].map(allergy => {
                      const active = updates.allergies?.includes(allergy as any);
                      return (
                        <button key={allergy} onClick={() => toggleArray('allergies', allergy)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                            active ? 'bg-red-500 border-red-500 text-white shadow-md' 
                                   : 'bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'
                          }`}
                        >
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--color-border-subtle)]">
            <button 
              onClick={handleBack} disabled={step === 1 || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-base)] transition-colors disabled:opacity-0"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            
            {step < 4 ? (
              <button 
                onClick={handleNext} disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-[var(--color-text-main)] text-[var(--color-bg-base)] hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleFinish} disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--color-brand-500)] to-blue-500 text-white hover:opacity-90 shadow-lg hover:shadow-[var(--color-brand-500)]/30 transition-all disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'} 
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
