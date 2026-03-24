import { useRef, useState } from 'react';
import type { WorkoutSession } from '../types';
import { X, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import clsx from 'clsx';

interface ShareCardProps {
  workout: WorkoutSession;
  onClose: () => void;
}

function sessionVolume(s: WorkoutSession): number {
  return s.exercises.reduce((et, e) =>
    et + e.sets.reduce((st, set) => st + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0), 0);
}

function topLift(s: WorkoutSession): { exercise: string; weight: number } | null {
  let best: { exercise: string; weight: number } | null = null;
  s.exercises.forEach(e => {
    e.sets.forEach(set => {
      const w = Number(set.weight) || 0;
      if (!best || w > best.weight) best = { exercise: e.name, weight: w };
    });
  });
  return best;
}

export function ShareCard({ workout, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const volume = sessionVolume(workout);
  const lift = topLift(workout);
  const totalSets = workout.exercises.reduce((t, e) => t + e.sets.length, 0);
  const date = new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `maxout-session-${workout.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>

        {/* The card to be exported */}
        <div
          ref={cardRef}
          className="relative rounded-3xl p-7 overflow-hidden text-white"
          style={{
            background: 'linear-gradient(135deg, #0f0f11 0%, #1c1c1f 40%, #0d1a2e 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Background decoration */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[var(--color-brand-500)]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-500)] flex items-center justify-center">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg tracking-tight">MaxOut</span>
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Session Complete</span>
          </div>

          {/* Date & Muscles */}
          <p className="text-xs text-white/50 mb-1">{date}</p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {workout.muscleGroups.map(mg => (
              <span key={mg} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-500)]/20 text-[var(--color-brand-500)] border border-[var(--color-brand-500)]/30">
                {mg}
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/8">
              <p className="text-xl font-black text-white">{workout.exercises.length}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Exercises</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/8">
              <p className="text-xl font-black text-white">{totalSets}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Sets</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/8">
              <p className="text-xl font-black text-[var(--color-brand-500)]">{Math.round(volume).toLocaleString()}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">kg Volume</p>
            </div>
          </div>

          {/* Top lift */}
          {lift && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amber-400/80 uppercase tracking-wider mb-0.5">Top Lift</p>
                <p className="font-bold text-sm text-white leading-tight">{lift.exercise}</p>
              </div>
              <p className="text-3xl font-black text-amber-400">{lift.weight}<span className="text-sm font-normal text-amber-400/60 ml-1">kg</span></p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-3 bg-white/10 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
            <X className="w-4 h-4" /> Close
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={clsx('flex-1 py-3 bg-[var(--color-brand-500)] rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all', downloading ? 'opacity-60' : 'hover:bg-[var(--color-brand-600)]')}
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Saving…' : 'Save PNG'}
          </button>
        </div>
      </div>
    </div>
  );
}
