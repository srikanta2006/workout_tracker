import { useState, useEffect } from 'react';
import { X, Target, Flame, TrendingUp, Apple, Save } from 'lucide-react';
import { useDiet } from '../context/DietContext';

interface DietGoalModalProps {
  onClose: () => void;
}

export function DietGoalModal({ onClose }: DietGoalModalProps) {
  const { dietGoals, updateGoals } = useDiet();
  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('150');
  const [carbs, setCarbs] = useState('200');
  const [fat, setFat] = useState('70');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dietGoals) {
      setCalories(dietGoals.target_calories.toString());
      setProtein(dietGoals.target_protein.toString());
      setCarbs(dietGoals.target_carbs.toString());
      setFat(dietGoals.target_fat.toString());
    }
  }, [dietGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateGoals({
      target_calories: Number(calories),
      target_protein: Number(protein),
      target_carbs: Number(carbs),
      target_fat: Number(fat),
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-[var(--color-bg-card)] w-full max-w-lg rounded-[40px] shadow-premium overflow-hidden animate-scale-spring border border-white/10">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Set Diet Goals</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg-base)] rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-[var(--color-text-muted)]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Calories */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.2 px-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Daily Calorie Target</label>
              </div>
              <input
                type="number"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-5 py-4 font-bold text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all"
                required
              />
            </div>

            {/* Macros Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.2 px-1">
                  <Flame className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Protein (g)</span>
                </div>
                <input
                  type="number"
                  value={protein}
                  onChange={e => setProtein(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl px-4 py-3 font-bold text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.2 px-1">
                  <TrendingUp className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Carbs (g)</span>
                </div>
                <input
                  type="number"
                  value={carbs}
                  onChange={e => setCarbs(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl px-4 py-3 font-bold text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.2 px-1">
                  <Apple className="w-3 h-3 text-pink-500" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Fat (g)</span>
                </div>
                <input
                  type="number"
                  value={fat}
                  onChange={e => setFat(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl px-4 py-3 font-bold text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Saving...' : 'Save Goals'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
