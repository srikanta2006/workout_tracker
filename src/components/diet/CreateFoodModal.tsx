import { useState } from 'react';
import { X, Save, Scale, Flame, Apple, TrendingUp, Plus, Trash2, MapPin } from 'lucide-react';
import type { FoodItem, ServingUnit, ServingSize } from '../../types';

interface CreateFoodModalProps {
  onConfirm: (food: Omit<FoodItem, 'id' | 'user_id' | 'created_at'>) => void;
  onCancel: () => void;
}

const UNITS: ServingUnit[] = ['g', 'ml', 'oz', 'cup', 'tbsp', 'piece'];
const REGIONS = ['Global', 'Indian', 'American', 'Chinese', 'Italian', 'Mexican', 'Other'];

export function CreateFoodModal({ onConfirm, onCancel }: CreateFoodModalProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [region, setRegion] = useState('Global');
  
  // Baseline macros
  const [defaultServing, setDefaultServing] = useState('100');
  const [defaultUnit, setDefaultUnit] = useState<ServingUnit>('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Custom Serving Sizes builder
  const [customServings, setCustomServings] = useState<{id: string, name: string, weight: string}[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCustomServing = () => {
      setCustomServings(prev => [...prev, { id: crypto.randomUUID(), name: '', weight: '' }]);
  };

  const updateCustomServing = (id: string, field: 'name' | 'weight', value: string) => {
      setCustomServings(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeCustomServing = (id: string) => {
      setCustomServings(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories || !defaultServing) return;
    
    // Filter out empty custom serving rows
    const validServings: ServingSize[] = customServings
        .filter(s => s.name.trim() !== '' && Number(s.weight) > 0)
        .map(s => ({ name: s.name.trim(), weight_in_grams: Number(s.weight) }));

    setIsSubmitting(true);
    
    onConfirm({
      name: name.trim(),
      brand: brand.trim() || undefined,
      category: 'Custom',
      region: region === 'Global' ? undefined : region,
      
      base_calories: Number(calories),
      base_protein: Number(protein) || 0,
      base_carbs: Number(carbs) || 0,
      base_fat: Number(fat) || 0,
      
      base_fiber: 0,
      base_sugar: 0,
      base_sodium: 0,
      base_cholesterol: 0,
      base_vitA: 0,
      base_vitB: 0,
      base_vitC: 0,
      base_vitD: 0,
      base_calcium: 0,
      base_iron: 0,
      
      default_serving: Number(defaultServing),
      default_unit: defaultUnit,
      
      serving_sizes: validServings.length > 0 ? validServings : undefined,
      
      is_verified: false,
      admin_status: 'pending'
    });
    
    setTimeout(() => setIsSubmitting(false), 500);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCancel} />
      
      <div className="relative bg-[var(--color-bg-card)] w-full max-w-lg rounded-[40px] shadow-premium overflow-hidden animate-scale-spring border border-white/10 flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
               <div className="flex flex-col">
                   <h2 className="text-2xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Create Food</h2>
                   <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1">Add a custom nutritional profile</p>
               </div>
               <button onClick={onCancel} className="p-2 hover:bg-[var(--color-bg-base)] rounded-full transition-colors self-start">
                 <X className="w-6 h-6 text-[var(--color-text-muted)]" />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] px-1 border-b border-[var(--color-border-subtle)]/30 pb-2">Basic Info</h3>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] px-1">Food Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grandma's Lasagna" required autoFocus
                            className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-5 py-4 font-bold text-sm text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] px-1">Brand (Optional)</label>
                            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Trader Joe's"
                                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-5 py-4 font-bold text-sm text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] px-1">Region</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                <select value={region} onChange={e => setRegion(e.target.value)}
                                    className="w-full appearance-none bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl py-4 pl-11 pr-5 font-bold text-sm text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all">
                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-1 border-b border-[var(--color-border-subtle)]/30 pb-2 flex items-center gap-2">
                        <Scale className="w-3 h-3" /> Baseline Architecture
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] px-1 italic">Define the standard baseline. For maximum accuracy, use 100g or 100ml.</p>
                    
                    <div className="flex gap-4">
                        <input type="number" step="0.1" value={defaultServing} onChange={e => setDefaultServing(e.target.value)} required min="0.1"
                            className="flex-1 bg-[var(--color-bg-base)] border border-emerald-500/30 rounded-2xl px-5 py-4 font-black text-lg text-emerald-500 focus:border-emerald-500/80 outline-none transition-all text-center placeholder:text-emerald-500/30" placeholder="100" />
                        <select value={defaultUnit} onChange={e => setDefaultUnit(e.target.value as ServingUnit)}
                            className="flex-1 appearance-none bg-[var(--color-bg-base)] border border-emerald-500/30 rounded-2xl px-5 py-4 font-black text-lg text-emerald-500 focus:border-emerald-500/80 outline-none transition-all text-center">
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="relative">
                            <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                            <input type="number" step="1" value={calories} onChange={e => setCalories(e.target.value)} required placeholder="Calories *" min="0"
                                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl py-3 pl-11 pr-4 font-bold text-sm text-[var(--color-text-main)] focus:border-orange-500/50 outline-none transition-all" />
                        </div>
                        <div className="relative">
                            <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            <input type="number" step="0.1" value={protein} onChange={e => setProtein(e.target.value)} placeholder="Protein (g)" min="0"
                                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl py-3 pl-11 pr-4 font-bold text-sm text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all" />
                        </div>
                        <div className="relative">
                            <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                            <input type="number" step="0.1" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="Carbs (g)" min="0"
                                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl py-3 pl-11 pr-4 font-bold text-sm text-[var(--color-text-main)] focus:border-amber-500/50 outline-none transition-all" />
                        </div>
                        <div className="relative">
                            <Apple className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                            <input type="number" step="0.1" value={fat} onChange={e => setFat(e.target.value)} placeholder="Fat (g)" min="0"
                                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl py-3 pl-11 pr-4 font-bold text-sm text-[var(--color-text-main)] focus:border-pink-500/50 outline-none transition-all" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--color-border-subtle)]/30">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Custom Serving Sizes</h3>
                        <button type="button" onClick={addCustomServing} className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {customServings.length === 0 ? (
                        <p className="text-[10px] font-medium text-[var(--color-text-muted)]/60 px-1 italic">Optional. Define quick shortcuts like "1 Bowl" = 150g.</p>
                    ) : (
                        <div className="space-y-2">
                           {customServings.map((serving) => (
                               <div key={serving.id} className="flex gap-2 items-center">
                                   <input type="text" placeholder='e.g. "1 Slice"' value={serving.name} onChange={e => updateCustomServing(serving.id, 'name', e.target.value)}
                                      className="flex-[2] bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl px-4 py-3 font-bold text-sm text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all" />
                                   <div className="flex-1 relative">
                                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-text-muted)]">g</span>
                                       <input type="number" placeholder="Weight" value={serving.weight} onChange={e => updateCustomServing(serving.id, 'weight', e.target.value)}
                                          className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl pl-4 pr-8 py-3 font-bold text-sm text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all" />
                                   </div>
                                   <button type="button" onClick={() => removeCustomServing(serving.id)} className="p-3 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-xl shrink-0">
                                       <Trash2 className="w-4 h-4" />
                                   </button>
                               </div>
                           ))}
                        </div>
                    )}
                </div>

                <div className="pt-6">
                   <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50">
                       <Save className="w-4 h-4" /> Save Food Item
                   </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
