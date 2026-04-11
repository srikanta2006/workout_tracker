import { useMemo, useState } from 'react';
import { useDiet } from '../context/DietContext';
import BodyMetricModal from '../components/diet/BodyMetricModal';
import { 
  Scale, Target, Activity, Ruler, TrendingDown, TrendingUp, Plus
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import clsx from 'clsx';

export default function BodyStats() {
    const { weightRecords, dietGoals } = useDiet();
    const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [showLogModal, setShowLogModal] = useState(false);

    const chartData = useMemo(() => {
        if (!weightRecords.length) return [];
        
        let days = 30;
        if (range === '7d') days = 7;
        if (range === '90d') days = 90;
        if (range === 'all') days = 365; // Max 1 year for now

        const interval = eachDayOfInterval({
            start: subDays(new Date(), days - 1),
            end: new Date()
        });

        return interval.map(date => {
            const dayStr = format(date, 'yyyy-MM-dd');
            const record = weightRecords.find(r => r.date === dayStr);
            return {
                date: dayStr,
                displayDate: format(date, 'MMM dd'),
                weight: record?.weight || null,
                bodyFat: record?.body_fat_pct || null,
                muscle: record?.muscle_mass_kg || null,
                waist: record?.waist_cm || null,
            };
        });
    }, [weightRecords, range]);

    // Statistics
    const stats = useMemo(() => {
        const logged = weightRecords.filter(r => r.weight > 0);
        if (!logged.length) return null;

        const current = logged[logged.length - 1];
        const initial = logged[0];
        const change = current.weight - initial.weight;
        const targetWeight = dietGoals?.target_weight;
        const remaining = targetWeight ? Math.abs(current.weight - targetWeight) : null;
        const progress = targetWeight ? Math.min(100, Math.max(0, (Math.abs(initial.weight - current.weight) / Math.abs(initial.weight - targetWeight)) * 100)) : 0;

        return {
            current: current.weight,
            initial: initial.weight,
            change,
            target: targetWeight,
            remaining,
            progress,
            latestFat: current.body_fat_pct,
            latestMuscle: current.muscle_mass_kg,
            latestWaist: current.waist_cm
        };
    }, [weightRecords, dietGoals]);

    if (!stats) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-[var(--color-bg-base)] rounded-3xl flex items-center justify-center mb-6">
                    <Scale className="w-10 h-10 text-[var(--color-text-muted)]" />
                </div>
                <h2 className="text-2xl font-black text-[var(--color-text-main)] italic uppercase tracking-tight">No Biometrics Found</h2>
                <p className="text-[var(--color-text-muted)] mt-2 max-w-sm">Start logging your weight and body composition in the Nutrition Dashboard to see your trends.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase flex items-center gap-3">
                        <Activity className="w-8 h-8 text-emerald-500" />
                        Transformation Trends
                    </h2>
                    <p className="text-[var(--color-text-muted)] font-medium mt-1">Decoding your metabolic and physical progression.</p>
                </div>
                
                <div className="flex items-center gap-4 self-start">
                    <button 
                        onClick={() => setShowLogModal(true)}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Log Biometrics
                    </button>
                    
                    <div className="flex bg-[var(--color-bg-base)]/50 border border-[var(--color-border-subtle)]/30 rounded-2xl p-1">
                        {(['7d', '30d', '90d', 'all'] as const).map(r => (
                            <button 
                                key={r}
                                onClick={() => setRange(r)}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    range === r ? "bg-emerald-500 text-white shadow-md" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scorecard Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Current Weight', value: `${stats.current}kg`, icon: Scale, color: 'text-emerald-500' },
                    { label: 'Total Change', value: `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1)}kg`, icon: stats.change <= 0 ? TrendingDown : TrendingUp, color: stats.change <= 0 ? 'text-emerald-500' : 'text-amber-500' },
                    { label: 'Body Fat', value: stats.latestFat ? `${stats.latestFat}%` : '-', icon: Activity, color: 'text-blue-500' },
                    { label: 'Waist', value: stats.latestWaist ? `${stats.latestWaist}cm` : '-', icon: Ruler, color: 'text-pink-500' },
                ].map((s, i) => (
                    <div key={i} className="glass-card rounded-[32px] p-6 shadow-premium border border-[var(--color-border-subtle)]/30 group hover:shadow-premium-hover transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={clsx("w-8 h-8 rounded-xl bg-current opacity-10 flex items-center justify-center", s.color)}>
                                <s.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{s.label}</span>
                        </div>
                        <div className="text-2xl font-black text-[var(--color-text-main)] tracking-tight">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Weight Chart */}
            <div className="glass-card rounded-[40px] p-8 shadow-premium border border-[var(--color-border-subtle)]/30 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-[var(--color-text-main)] italic uppercase tracking-tight flex items-center gap-2">
                        <Scale className="w-5 h-5 text-emerald-500" />
                        Weight Progression
                    </h3>
                    {stats.target && (
                        <div className="px-4 py-2 bg-emerald-500/10 rounded-full text-xs font-bold text-emerald-500">
                            Target: {stats.target}kg
                        </div>
                    )}
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="displayDate" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis 
                                hide={false} 
                                domain={['dataMin - 2', 'dataMax + 2']} 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--color-bg-card)', 
                                    border: '1px solid var(--color-border-subtle)',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                                }}
                                itemStyle={{ fontWeight: 800, color: '#10b981' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="#10b981" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorWeight)" 
                                connectNulls
                            />
                            {stats.target && (
                                <ReferenceLine y={stats.target} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'right', value: 'Goal', fill: '#10b981', fontSize: 10, fontWeight: 900 }} />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Secondary Charts Block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Composition Trends */}
                <div className="glass-card rounded-[40px] p-8 shadow-premium border border-[var(--color-border-subtle)]/30">
                    <h3 className="text-lg font-black text-[var(--color-text-main)] italic uppercase tracking-tight mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Body Composition
                    </h3>
                    <div className="h-[250px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="bodyFat" name="Body Fat %" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                                <Line type="monotone" dataKey="muscle" name="Muscle (kg)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                            </LineChart>
                         </ResponsiveContainer>
                    </div>
                </div>

                {/* Measurements */}
                <div className="glass-card rounded-[40px] p-8 shadow-premium border border-[var(--color-border-subtle)]/30">
                    <h3 className="text-lg font-black text-[var(--color-text-main)] italic uppercase tracking-tight mb-6 flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-pink-500" />
                        Waist Timeline
                    </h3>
                    <div className="h-[250px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="waist" name="Waist (cm)" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                            </LineChart>
                         </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Progress Hub */}
            {stats.target && (
                <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-lg">
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                         <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="rgba(16,185,129,0.1)" strokeWidth="12" fill="transparent" />
                            <circle 
                                cx="64" cy="64" r="58" stroke="#10b981" strokeWidth="12" fill="transparent" 
                                strokeDasharray={364.4} strokeDashoffset={364.4 - (stats.progress / 100) * 364.4}
                                strokeLinecap="round" className="transition-all duration-1000" 
                            />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-[var(--color-text-main)]">{Math.round(stats.progress)}%</span>
                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">To Goal</span>
                         </div>
                    </div>
                    <div className="space-y-4 text-center md:text-left flex-1">
                        <div>
                            <h4 className="text-xl font-black text-[var(--color-text-main)] tracking-tight leading-none mb-2">Distance to Perfection</h4>
                            <p className="text-sm font-medium text-[var(--color-text-muted)] leading-relaxed">
                                You are currently <span className="text-emerald-500 font-bold">{stats.remaining?.toFixed(1)}kg</span> away from your dream weight of <span className="text-emerald-500 font-bold">{stats.target}kg</span>.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-main)] bg-[var(--color-bg-base)] px-4 py-2 rounded-full border border-[var(--color-border-subtle)]/30">
                                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                                Initial: {stats.initial}kg
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-main)] bg-[var(--color-bg-base)] px-4 py-2 rounded-full border border-[var(--color-border-subtle)]/30">
                                <Target className="w-3.5 h-3.5 text-emerald-500" />
                                Goal: {stats.target}kg
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BodyMetricModal 
                isOpen={showLogModal} 
                onClose={() => setShowLogModal(false)} 
            />
        </div>
    );
}
