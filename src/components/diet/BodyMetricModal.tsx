import { useState } from 'react';
import { X, Scale, Target, Activity, Ruler } from 'lucide-react';
import { useDiet } from '../../context/DietContext';

interface BodyMetricModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BodyMetricModal({ isOpen, onClose }: BodyMetricModalProps) {
    const { addWeightRecord, weightRecords, selectedDate } = useDiet();
    const todayRecord = weightRecords.find(r => r.date === new Date(selectedDate).toISOString().split('T')[0]);

    const [metrics, setMetrics] = useState({
        weight: todayRecord?.weight || 0,
        body_fat_pct: todayRecord?.body_fat_pct || 0,
        muscle_mass_kg: todayRecord?.muscle_mass_kg || 0,
        waist_cm: todayRecord?.waist_cm || 0
    });

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!metrics.weight) {
            alert("Weight is required");
            return;
        }
        setLoading(true);
        try {
            await addWeightRecord(metrics);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--color-bg-card)] w-full max-w-md rounded-[40px] border border-[var(--color-border-subtle)]/30 shadow-2xl p-8 relative animate-scale-up overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] transform rotate-12 pointer-events-none">
                    <Scale className="w-48 h-48 text-white" />
                </div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <Scale className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-main)] italic uppercase tracking-tight">Log Biometrics</h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-[var(--color-bg-base)] rounded-2xl transition-colors">
                        <X className="w-6 h-6 text-[var(--color-text-muted)]" />
                    </button>
                </div>

                <div className="space-y-6 relative z-10">
                    {/* Weight */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2 block flex items-center gap-2">
                            <Scale className="w-3 h-3" /> Body Weight (kg)
                        </label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={metrics.weight || ''} 
                            onChange={e => setMetrics({...metrics, weight: Number(e.target.value)})}
                            className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-2xl py-4 px-6 text-lg font-bold focus:border-emerald-500 outline-none transition-all"
                            placeholder="0.0"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Body Fat */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2 block flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Body Fat %
                            </label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={metrics.body_fat_pct || ''} 
                                onChange={e => setMetrics({...metrics, body_fat_pct: Number(e.target.value)})}
                                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-2xl py-3 px-5 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                placeholder="Optional"
                            />
                        </div>
                        {/* Muscle Mass */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2 block flex items-center gap-2">
                                <Target className="w-3 h-3" /> Muscle (kg)
                            </label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={metrics.muscle_mass_kg || ''} 
                                onChange={e => setMetrics({...metrics, muscle_mass_kg: Number(e.target.value)})}
                                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-2xl py-3 px-5 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {/* Waist */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2 block flex items-center gap-2">
                            <Ruler className="w-3 h-3" /> Waist Circ. (cm)
                        </label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={metrics.waist_cm || ''} 
                            onChange={e => setMetrics({...metrics, waist_cm: Number(e.target.value)})}
                            className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-2xl py-3 px-5 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                            placeholder="Optional"
                        />
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "SAVING..." : "SAVE METRICS"}
                    </button>
                </div>
            </div>
        </div>
    );
}
