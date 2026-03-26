import { useState } from 'react';
import type { WorkoutSession } from '../types';
import { X, Download } from 'lucide-react';

interface StoryCardProps {
   workout: WorkoutSession;
   onClose: () => void;
}

function sessionVolume(s: WorkoutSession): number {
   return s.exercises.reduce((et, e) =>
      et + e.sets.reduce((st, set) => st + (set.completed ? (Number(set.weight) || 0) * (Number(set.reps) || 0) : 0), 0), 0);
}

function topLift(s: WorkoutSession): { exercise: string; weight: number; reps: number; sets: number } | null {
   let best: { exercise: string; weight: number; reps: number; sets: number } | null = null;
   s.exercises.forEach(e => {
      const completed = e.sets.filter(set => set.completed);
      completed.forEach(set => {
         const w = Number(set.weight) || 0;
         if (!best || w > best.weight)
            best = { exercise: e.name, weight: w, reps: Number(set.reps) || 0, sets: completed.length };
      });
   });
   return best;
}

function avgWeight(s: WorkoutSession): number {
   let total = 0, count = 0;
   s.exercises.forEach(e => {
      e.sets.filter(set => set.completed).forEach(set => {
         const w = Number(set.weight) || 0;
         if (w > 0) { total += w; count++; }
      });
   });
   return count > 0 ? Math.round(total / count) : 0;
}

function intensityScore(s: WorkoutSession): number {
   const totalSets = s.exercises.reduce((t, e) => t + e.sets.filter(set => set.completed).length, 0);
   const vol = sessionVolume(s);
   return Math.round(Math.min(10, totalSets * 0.3 + vol / 500) * 10) / 10;
}

function formatDuration(seconds: number): string {
   const mins = Math.floor(seconds / 60);
   const hrs = Math.floor(mins / 60);
   if (hrs > 0) return `${hrs}h ${mins % 60}m`;
   return `${mins}m`;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
   ctx.beginPath();
   ctx.moveTo(x + r, y);
   ctx.lineTo(x + w - r, y);
   ctx.quadraticCurveTo(x + w, y, x + w, y + r);
   ctx.lineTo(x + w, y + h - r);
   ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
   ctx.lineTo(x + r, y + h);
   ctx.quadraticCurveTo(x, y + h, x, y + h - r);
   ctx.lineTo(x, y + r);
   ctx.quadraticCurveTo(x, y, x + r, y);
   ctx.closePath();
}

function drawStoryCanvas(workout: WorkoutSession): HTMLCanvasElement {
   const W = 1080;
   const H = 1920;
   const canvas = document.createElement('canvas');
   canvas.width = W;
   canvas.height = H;
   const ctx = canvas.getContext('2d')!;
   const P = 72;

   // Background
   ctx.fillStyle = '#06060f';
   ctx.fillRect(0, 0, W, H);

   const addBlob = (cx: number, cy: number, r: number, col: string, a: number) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, col + a + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
   };
   addBlob(150, 400, 900, 'rgba(26,58,110,', 0.9);
   addBlob(950, 1550, 950, 'rgba(59,16,96,', 0.85);
   addBlob(900, 500, 700, 'rgba(10,74,90,', 0.6);

   const btm = ctx.createLinearGradient(0, 1400, 0, H);
   btm.addColorStop(0, 'rgba(0,0,0,0)');
   btm.addColorStop(1, 'rgba(0,0,0,0.55)');
   ctx.fillStyle = btm; ctx.fillRect(0, 0, W, H);

   // Corner brackets
   const bkt = (x: number, y: number, dx: number, dy: number) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y + dy); ctx.lineTo(x, y); ctx.lineTo(x + dx, y); ctx.stroke();
   };
   bkt(P - 10, P - 10, 60, 60);
   bkt(W - P + 10, P - 10, -60, 60);
   bkt(P - 10, H - P + 10, 60, -60);
   bkt(W - P + 10, H - P + 10, -60, -60);

   // Header
   ctx.fillStyle = '#3b82f6';
   ctx.beginPath(); ctx.arc(P + 14, 130, 18, 0, Math.PI * 2); ctx.fill();
   ctx.fillStyle = '#1d4ed8';
   ctx.beginPath(); ctx.arc(P + 14, 130, 10, 0, Math.PI * 2); ctx.fill();
   ctx.fillStyle = '#bfdbfe';
   ctx.beginPath(); ctx.arc(P + 14, 130, 5, 0, Math.PI * 2); ctx.fill();

   ctx.fillStyle = '#ffffff';
   ctx.font = 'italic 900 54px system-ui,sans-serif';
   ctx.letterSpacing = '6px';
   ctx.fillText('MAXOUT', P + 44, 146);
   ctx.letterSpacing = '0px';
   ctx.fillStyle = 'rgba(255,255,255,0.28)';
   ctx.font = '700 22px system-ui,sans-serif';
   ctx.letterSpacing = '5px';
   ctx.fillText('PERFORMANCE', P + 44, 174);
   ctx.letterSpacing = '0px';

   const dateStr = new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
   ctx.textAlign = 'right';
   ctx.fillStyle = 'rgba(255,255,255,0.3)';
   ctx.font = '700 22px system-ui,sans-serif';
   ctx.letterSpacing = '3px';
   ctx.fillText('SESSION DATE', W - P, 132);
   ctx.letterSpacing = '0px';
   ctx.fillStyle = 'rgba(255,255,255,0.72)';
   ctx.font = 'italic 700 30px system-ui,sans-serif';
   ctx.fillText(dateStr, W - P, 166);
   ctx.textAlign = 'left';

   ctx.strokeStyle = 'rgba(255,255,255,0.06)';
   ctx.lineWidth = 1;
   ctx.beginPath(); ctx.moveTo(P, 202); ctx.lineTo(W - P, 202); ctx.stroke();

   // Volume Hero
   const volume = sessionVolume(workout);

   ctx.fillStyle = 'rgba(96,165,250,0.18)';
   rr(ctx, P, 220, 310, 50, 25); ctx.fill();
   ctx.strokeStyle = 'rgba(96,165,250,0.3)';
   ctx.lineWidth = 1.5;
   rr(ctx, P, 220, 310, 50, 25); ctx.stroke();
   ctx.fillStyle = '#60a5fa';
   ctx.font = '700 22px system-ui,sans-serif';
   ctx.letterSpacing = '3px';
   ctx.fillText('↑  TOTAL VOLUME', P + 22, 252);
   ctx.letterSpacing = '0px';

   const volGrad = ctx.createLinearGradient(P, 280, P, 450);
   volGrad.addColorStop(0, '#ffffff');
   volGrad.addColorStop(1, 'rgba(255,255,255,0.45)');
   ctx.fillStyle = volGrad;
   ctx.font = 'italic 900 220px system-ui,sans-serif';
   ctx.fillText(Math.round(volume).toLocaleString(), P - 10, 460);

   ctx.fillStyle = 'rgba(255,255,255,0.28)';
   ctx.font = 'italic 700 46px system-ui,sans-serif';
   ctx.letterSpacing = '2px';
   ctx.fillText('KG LIFTED', P, 510);
   ctx.letterSpacing = '0px';
   const kgW = ctx.measureText('KG LIFTED').width;
   ctx.strokeStyle = 'rgba(255,255,255,0.12)';
   ctx.lineWidth = 1.5;
   ctx.beginPath(); ctx.moveTo(P + kgW + 24, 492); ctx.lineTo(W - P, 492); ctx.stroke();

   ctx.strokeStyle = 'rgba(255,255,255,0.05)';
   ctx.lineWidth = 1;
   ctx.beginPath(); ctx.moveTo(P, 535); ctx.lineTo(W - P, 535); ctx.stroke();

   // Muscle Groups
   ctx.fillStyle = 'rgba(255,255,255,0.22)';
   ctx.font = '700 22px system-ui,sans-serif';
   ctx.letterSpacing = '4px';
   ctx.fillText('MUSCLE GROUPS', P, 570);
   ctx.letterSpacing = '0px';

   let chipX = P;
   const chipY = 583;
   const chipH = 58;
   workout.muscleGroups.forEach(mg => {
      ctx.font = 'italic 700 24px system-ui,sans-serif';
      const tw = ctx.measureText(mg.toUpperCase()).width;
      const cw = tw + 56;
      if (chipX + cw > W - P) chipX = P;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      rr(ctx, chipX, chipY, cw, chipH, 29); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1;
      rr(ctx, chipX, chipY, cw, chipH, 29); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(mg.toUpperCase(), chipX + 28, chipY + 37);
      chipX += cw + 16;
   });

   // Apex Lift
   const lift = topLift(workout);
   const liftY = 664;
   const liftH = 280;

   ctx.fillStyle = 'rgba(255,255,255,0.055)';
   rr(ctx, P, liftY, W - P * 2, liftH, 36); ctx.fill();
   ctx.strokeStyle = 'rgba(255,255,255,0.08)';
   ctx.lineWidth = 1;
   rr(ctx, P, liftY, W - P * 2, liftH, 36); ctx.stroke();
   ctx.fillStyle = '#fbbf24';
   rr(ctx, P, liftY, 8, liftH, 4); ctx.fill();

   ctx.fillStyle = 'rgba(251,191,36,0.1)';
   rr(ctx, P + 26, liftY + 28, 72, 72, 16); ctx.fill();
   ctx.strokeStyle = 'rgba(251,191,36,0.25)'; ctx.lineWidth = 1;
   rr(ctx, P + 26, liftY + 28, 72, 72, 16); ctx.stroke();
   ctx.fillStyle = '#fbbf24';
   ctx.font = '38px system-ui';
   ctx.textAlign = 'center';
   ctx.fillText('★', P + 62, liftY + 73);
   ctx.textAlign = 'left';

   ctx.fillStyle = 'rgba(251,191,36,0.7)';
   ctx.font = '700 22px system-ui,sans-serif';
   ctx.letterSpacing = '3px';
   ctx.fillText('APEX LIFT', P + 115, liftY + 52);
   ctx.letterSpacing = '0px';

   if (lift) {
      let liftName = lift.exercise.toUpperCase();
      ctx.font = 'italic 700 52px system-ui,sans-serif';
      while (ctx.measureText(liftName).width > W - P * 2 - 130 && liftName.length > 3)
         liftName = liftName.slice(0, -1);
      if (liftName !== lift.exercise.toUpperCase()) liftName += '…';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(liftName, P + 115, liftY + 92);

      const goldGrad = ctx.createLinearGradient(P + 26, liftY + 120, P + 26, liftY + liftH);
      goldGrad.addColorStop(0, '#fde68a');
      goldGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = goldGrad;
      ctx.font = 'italic 900 148px system-ui,sans-serif';
      ctx.fillText(String(lift.weight), P + 26, liftY + liftH - 22);
      const ww = ctx.measureText(String(lift.weight)).width;
      ctx.fillStyle = 'rgba(251,191,36,0.32)';
      ctx.font = 'italic 700 56px system-ui,sans-serif';
      ctx.fillText('KG', P + 26 + ww + 14, liftY + liftH - 38);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W - P - 240, liftY + 110); ctx.lineTo(W - P - 240, liftY + liftH - 24); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.font = '700 20px system-ui,sans-serif';
      ctx.letterSpacing = '2px';
      ctx.textAlign = 'right';
      ctx.fillText('TOP SET', W - P, liftY + 150);
      ctx.letterSpacing = '0px';
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = 'italic 700 36px system-ui,sans-serif';
      ctx.fillText(`${lift.sets} × ${lift.weight} KG`, W - P, liftY + 196);
      ctx.textAlign = 'left';
   }

   // Exercise Log
   const logY = liftY + liftH + 28;
   const logH = 200;

   ctx.fillStyle = 'rgba(255,255,255,0.03)';
   rr(ctx, P, logY, W - P * 2, logH, 28); ctx.fill();
   ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
   rr(ctx, P, logY, W - P * 2, logH, 28); ctx.stroke();

   ctx.fillStyle = 'rgba(255,255,255,0.22)';
   ctx.font = '700 20px system-ui,sans-serif';
   ctx.letterSpacing = '4px';
   ctx.fillText('EXERCISE LOG', P + 28, logY + 32);
   ctx.letterSpacing = '0px';

   ctx.strokeStyle = 'rgba(255,255,255,0.05)';
   ctx.beginPath(); ctx.moveTo(P + 28, logY + 42); ctx.lineTo(W - P - 28, logY + 42); ctx.stroke();

   const exes = workout.exercises.slice(0, 8);
   const half = Math.ceil(exes.length / 2);
   const colW = (W - P * 2 - 56) / 2;
   exes.forEach((ex, i) => {
      const col = i < half ? 0 : 1;
      const row = i < half ? i : i - half;
      const exName = ex.name.length > 22 ? ex.name.slice(0, 21) + '…' : ex.name;
      ctx.fillStyle = 'rgba(255,255,255,0.48)';
      ctx.font = '400 26px system-ui,sans-serif';
      ctx.fillText(`· ${exName}`, P + 28 + col * (colW + 28), logY + 74 + row * 38);
   });

   // Stats
   const totalSets = workout.exercises.reduce((t, e) => t + e.sets.filter(s => s.completed).length, 0);
   const durationStr = workout.duration ? formatDuration(workout.duration) : '—';
   const statY = logY + logH + 28;
   const statW = (W - P * 2 - 40) / 3;
   const stats = [
      { label: 'SETS', value: String(totalSets), color: '#22d3ee', sym: '⚡' },
      { label: 'DURATION', value: durationStr, color: '#c084fc', sym: '⏱' },
      { label: 'EXERCISES', value: String(workout.exercises.length), color: '#34d399', sym: '◈' },
   ];

   stats.forEach((st, i) => {
      const sx = P + i * (statW + 20);
      const cx = sx + statW / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      rr(ctx, sx, statY, statW, 160, 24); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
      rr(ctx, sx, statY, statW, 160, 24); ctx.stroke();
      ctx.fillStyle = st.color;
      ctx.font = '30px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(st.sym, cx, statY + 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 900 60px system-ui,sans-serif';
      ctx.fillText(st.value, cx, statY + 118);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.font = '700 18px system-ui,sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText(st.label, cx, statY + 148);
      ctx.letterSpacing = '0px';
      ctx.textAlign = 'left';
   });

   ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
   ctx.beginPath(); ctx.moveTo(P, statY + 180); ctx.lineTo(W - P, statY + 180); ctx.stroke();

   // Bonus metrics
   const metY = statY + 196;
   const halfW = (W - P * 2 - 20) / 2;
   const avg = avgWeight(workout);

   ctx.fillStyle = 'rgba(59,130,246,0.07)';
   rr(ctx, P, metY, halfW, 108, 22); ctx.fill();
   ctx.strokeStyle = 'rgba(59,130,246,0.22)'; ctx.lineWidth = 1;
   rr(ctx, P, metY, halfW, 108, 22); ctx.stroke();
   ctx.fillStyle = 'rgba(255,255,255,0.28)';
   ctx.font = '700 19px system-ui,sans-serif';
   ctx.letterSpacing = '3px';
   ctx.textAlign = 'center';
   ctx.fillText('AVG WEIGHT', P + halfW / 2, metY + 32);
   ctx.letterSpacing = '0px';
   ctx.fillStyle = '#ffffff';
   ctx.font = 'italic 900 52px system-ui,sans-serif';
   ctx.fillText(`${avg} KG`, P + halfW / 2, metY + 90);
   ctx.textAlign = 'left';

   const score = intensityScore(workout);
   ctx.fillStyle = 'rgba(168,85,247,0.07)';
   rr(ctx, P + halfW + 20, metY, halfW, 108, 22); ctx.fill();
   ctx.strokeStyle = 'rgba(168,85,247,0.22)'; ctx.lineWidth = 1;
   rr(ctx, P + halfW + 20, metY, halfW, 108, 22); ctx.stroke();
   ctx.fillStyle = 'rgba(255,255,255,0.28)';
   ctx.font = '700 19px system-ui,sans-serif';
   ctx.letterSpacing = '3px';
   ctx.textAlign = 'center';
   ctx.fillText('INTENSITY', P + halfW + 20 + halfW / 2, metY + 32);
   ctx.letterSpacing = '0px';
   ctx.fillStyle = '#c084fc';
   ctx.font = 'italic 900 52px system-ui,sans-serif';
   ctx.fillText(`${score} / 10`, P + halfW + 20 + halfW / 2, metY + 90);
   ctx.textAlign = 'left';

   // Footer
   const footY = metY + 136;

   ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
   ctx.beginPath(); ctx.moveTo(P, footY); ctx.lineTo(W - P, footY); ctx.stroke();

   ctx.fillStyle = '#3b82f6';
   ctx.beginPath(); ctx.arc(P + 12, footY + 34, 11, 0, Math.PI * 2); ctx.fill();
   ctx.fillStyle = '#93c5fd';
   ctx.beginPath(); ctx.arc(P + 12, footY + 34, 5, 0, Math.PI * 2); ctx.fill();

   ctx.fillStyle = 'rgba(255,255,255,0.18)';
   ctx.font = '700 20px system-ui,sans-serif';
   ctx.letterSpacing = '2px';
   ctx.fillText('MAXOUT ENGINE', P + 34, footY + 40);
   ctx.letterSpacing = '0px';

   ctx.textAlign = 'right';
   ctx.fillStyle = 'rgba(255,255,255,0.14)';
   ctx.font = '700 20px system-ui,sans-serif';
   ctx.letterSpacing = '2px';
   ctx.fillText('PERFORMANCE RECAP', W - P, footY + 40);
   ctx.letterSpacing = '0px';
   ctx.textAlign = 'left';

   ctx.fillStyle = 'rgba(59,130,246,0.45)';
   rr(ctx, P, footY + 60, 140, 5, 2.5); ctx.fill();
   ctx.fillStyle = 'rgba(168,85,247,0.3)';
   rr(ctx, P + 152, footY + 60, 50, 5, 2.5); ctx.fill();
   ctx.fillStyle = 'rgba(52,211,153,0.18)';
   rr(ctx, P + 214, footY + 60, 24, 5, 2.5); ctx.fill();

   return canvas;
}

export function StoryCard({ workout, onClose }: StoryCardProps) {
   const [downloading, setDownloading] = useState(false);

   const volume = sessionVolume(workout);
   const lift = topLift(workout);
   const totalSets = workout.exercises.reduce((t, e) => t + e.sets.filter(s => s.completed).length, 0);
   const dateStr = new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
   const durationStr = workout.duration ? formatDuration(workout.duration) : '—';
   const avg = avgWeight(workout);
   const score = intensityScore(workout);

   const handleDownload = async () => {
      setDownloading(true);
      try {
         const canvas = drawStoryCanvas(workout);
         const blob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png', 1.0)
         );
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.download = `maxout-story-${workout.date}.png`;
         a.href = url;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
      } catch (err) {
         console.error('Story export failed:', err);
         alert('Failed to generate story. Please try again.');
      } finally {
         setDownloading(false);
      }
   };

   return (
      <div
         className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-2xl overflow-y-auto"
         onClick={onClose}
      >
         <div
            className="relative w-full max-w-[420px] my-4 px-4 flex flex-col items-center"
            onClick={e => e.stopPropagation()}
         >
            {/* HUD BAR */}
            <div className="w-full h-14 flex items-center justify-between mb-3 px-4 bg-white/5 rounded-[28px] border border-white/10">
               <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Preview Mode</span>
               </div>
            </div>

            {/* PREVIEW — 9:16 CSS card */}
            <div
               className="relative w-full rounded-[28px] overflow-hidden border border-white/10 shadow-2xl text-white"
               style={{ background: '#06060f', aspectRatio: '9/16' }}
            >
               {/* Blobs */}
               <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-[-5%] left-[-15%] w-[110%] h-[55%] rounded-full blur-[100px]"
                     style={{ background: 'rgba(26,58,110,0.85)' }} />
                  <div className="absolute bottom-[-5%] right-[-15%] w-[100%] h-[55%] rounded-full blur-[100px]"
                     style={{ background: 'rgba(59,16,96,0.8)' }} />
                  <div className="absolute top-[20%] right-[-15%] w-[70%] h-[40%] rounded-full blur-[80px]"
                     style={{ background: 'rgba(10,74,90,0.55)' }} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
               </div>

               {/* Corner brackets */}
               <div className="absolute top-5 left-5 w-5 h-5 border-t border-l border-white/25" style={{ borderWidth: '1.5px' }} />
               <div className="absolute top-5 right-5 w-5 h-5 border-t border-r border-white/25" style={{ borderWidth: '1.5px' }} />
               <div className="absolute bottom-5 left-5 w-5 h-5 border-b border-l border-white/25" style={{ borderWidth: '1.5px' }} />
               <div className="absolute bottom-5 right-5 w-5 h-5 border-b border-r border-white/25" style={{ borderWidth: '1.5px' }} />

               <div className="relative z-10 w-full h-full flex flex-col p-7 overflow-hidden">

                  {/* Header */}
                  <div className="flex justify-between items-start mb-2.5">
                     <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5 flex-shrink-0">
                           <div className="absolute inset-0 rounded-full bg-blue-500" />
                           <div className="absolute inset-[3px] rounded-full bg-blue-700" />
                           <div className="absolute inset-[6px] rounded-full bg-blue-200" />
                        </div>
                        <div>
                           <div className="font-black text-base italic tracking-widest uppercase leading-tight">MAXOUT</div>
                           <div className="text-[6px] font-black tracking-[4px] text-white/28 uppercase">PERFORMANCE</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[6px] font-black tracking-[3px] text-white/30 uppercase mb-0.5">Session Date</div>
                        <div className="text-[9px] font-black italic uppercase text-white/70">{dateStr}</div>
                     </div>
                  </div>

                  <div className="h-px bg-white/[0.06] mb-2.5" />

                  {/* Volume */}
                  <div className="mb-1.5">
                     <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full mb-1"
                        style={{ background: 'rgba(96,165,250,0.15)', border: '0.5px solid rgba(96,165,250,0.3)' }}>
                        <span className="text-[7px] font-black tracking-[2px] text-blue-400 uppercase">↑ Total Volume</span>
                     </div>
                     <div className="text-[64px] font-black italic tracking-tighter leading-[0.85] text-white">
                        {Math.round(volume).toLocaleString()}
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black italic text-white/28 uppercase tracking-wide">KG Lifted</span>
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.15),transparent)' }} />
                     </div>
                  </div>

                  <div className="h-px bg-white/[0.05] mb-2" />

                  {/* Muscle groups */}
                  <div className="mb-2">
                     <div className="text-[6px] font-black tracking-[3px] text-white/22 uppercase mb-1">Muscle Groups</div>
                     <div className="flex flex-wrap gap-1">
                        {workout.muscleGroups.map(mg => (
                           <div key={mg} className="px-2.5 py-0.5 rounded-full text-[8px] font-black italic uppercase"
                              style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.14)' }}>
                              {mg}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Apex Lift */}
                  {lift && (
                     <div className="mb-2 rounded-xl p-2.5 relative overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.055)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-400" style={{ borderRadius: '4px 0 0 4px' }} />
                        <div className="flex items-center gap-1.5 mb-1 ml-2">
                           <span className="text-amber-400 text-xs">★</span>
                           <span className="text-[6px] font-black tracking-[3px] text-amber-400/70 uppercase">Apex Lift</span>
                        </div>
                        <div className="ml-2 text-[12px] font-black italic uppercase truncate mb-0.5">{lift.exercise}</div>
                        <div className="ml-2 flex items-end gap-2">
                           <span className="text-[38px] font-black italic leading-none text-amber-400">{lift.weight}</span>
                           <span className="text-xs font-black italic text-amber-400/30 pb-1">KG</span>
                           <div className="ml-auto text-right pb-1">
                              <div className="text-[6px] font-black tracking-[2px] text-white/18 uppercase">Top Set</div>
                              <div className="text-[10px] font-black italic text-white/45">{lift.sets} × {lift.weight} KG</div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Exercise Log */}
                  <div className="mb-2 rounded-xl p-2.5"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                     <div className="text-[6px] font-black tracking-[3px] text-white/22 uppercase mb-1">Exercise Log</div>
                     <div className="h-px bg-white/[0.05] mb-1" />
                     <div className="grid grid-cols-2 gap-x-3">
                        {workout.exercises.slice(0, 8).map(ex => (
                           <div key={ex.name} className="text-[8px] text-white/45 truncate leading-relaxed">· {ex.name}</div>
                        ))}
                     </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                     {[
                        { label: 'Sets', value: totalSets, color: '#22d3ee', sym: '⚡' },
                        { label: 'Duration', value: durationStr, color: '#c084fc', sym: '⏱' },
                        { label: 'Exercises', value: workout.exercises.length, color: '#34d399', sym: '◈' },
                     ].map(s => (
                        <div key={s.label} className="rounded-xl py-1.5 flex flex-col items-center"
                           style={{ background: 'rgba(255,255,255,0.045)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                           <span style={{ color: s.color, fontSize: 10 }} className="mb-0.5">{s.sym}</span>
                           <span className="text-[18px] font-black italic leading-tight">{s.value}</span>
                           <span className="text-[6px] font-black tracking-[2px] text-white/28 uppercase mt-0.5">{s.label}</span>
                        </div>
                     ))}
                  </div>

                  <div className="h-px bg-white/[0.05] mb-2" />

                  {/* Bonus metrics */}
                  <div className="grid grid-cols-2 gap-1.5 mb-auto">
                     <div className="rounded-xl py-1.5 px-2.5"
                        style={{ background: 'rgba(59,130,246,0.07)', border: '0.5px solid rgba(59,130,246,0.2)' }}>
                        <div className="text-[6px] font-black tracking-[2px] text-white/28 uppercase mb-0.5">Avg Weight</div>
                        <div className="text-[20px] font-black italic text-white">{avg} KG</div>
                     </div>
                     <div className="rounded-xl py-1.5 px-2.5"
                        style={{ background: 'rgba(168,85,247,0.07)', border: '0.5px solid rgba(168,85,247,0.2)' }}>
                        <div className="text-[6px] font-black tracking-[2px] text-white/28 uppercase mb-0.5">Intensity</div>
                        <div className="text-[20px] font-black italic" style={{ color: '#c084fc' }}>{score} / 10</div>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-2">
                     <div className="h-px bg-white/[0.05] mb-1.5" />
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                           <div className="relative w-3 h-3 flex-shrink-0">
                              <div className="absolute inset-0 rounded-full bg-blue-500" />
                              <div className="absolute inset-[2px] rounded-full bg-blue-300" />
                           </div>
                           <span className="text-[7px] font-black tracking-[2px] text-white/18 uppercase">Maxout Engine</span>
                        </div>
                        <span className="text-[7px] font-black tracking-[2px] text-white/14 uppercase">Performance Recap</span>
                     </div>
                     <div className="flex gap-1.5 mt-1">
                        <div className="h-[3px] w-14 rounded-full" style={{ background: 'rgba(59,130,246,0.45)' }} />
                        <div className="h-[3px] w-5 rounded-full" style={{ background: 'rgba(168,85,247,0.3)' }} />
                        <div className="h-[3px] w-2.5 rounded-full" style={{ background: 'rgba(52,211,153,0.18)' }} />
                     </div>
                  </div>

               </div>
            </div>

            {/* Bottom share button */}
            <button
               onClick={handleDownload}
               disabled={downloading}
               className="mt-4 flex items-center gap-2 px-8 py-3 rounded-full text-white/55 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95"
            >
               <Download className="w-3.5 h-3.5" />
               {downloading ? 'Capturing…' : 'Finalize & Share'}
            </button>
         </div>
      </div>
   );
}