import { useState, useMemo } from 'react';
import { X, Scale, Flame, TrendingUp, Apple } from 'lucide-react';
import type { FoodItem, MealItem } from '../../types';

interface PortionAdjusterProps {
  food: FoodItem;
  onConfirm: (item: MealItem) => void;
  onCancel: () => void;
}

const BASE_UNITS = ['g', 'ml', 'oz', 'cup', 'tbsp', 'piece'];

export function PortionAdjuster({ food, onConfirm, onCancel }: PortionAdjusterProps) {
  const [quantity, setQuantity] = useState<string>('1');
  
  // Default to the first custom serving size if available, otherwise default_unit
  const defaultInitialUnit = food.serving_sizes && food.serving_sizes.length > 0 
      ? food.serving_sizes[0].name 
      : food.default_unit;
      
  const [unit, setUnit] = useState<string>(defaultInitialUnit);

  const availableUnits = useMemo(() => {
     const custom = food.serving_sizes?.map(s => s.name) || [];
     return [...custom, ...BASE_UNITS];
  }, [food]);

  // Adjust initial quantity if they default to the "default_unit" which might be 100g, but if it's 100g, default quantity to 100. If it's 1 slice, default quantity is 1.
  useMemo(() => {
      if (unit === food.default_unit) {
          setQuantity(food.default_serving.toString());
      } else {
          setQuantity('1'); // Generic fallback for new unit switch
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnitChange = (newUnit: string) => {
      setUnit(newUnit);
      if (newUnit === food.default_unit) {
          setQuantity(food.default_serving.toString());
      } else {
          setQuantity('1');
      }
  }

  const getStandardGrams = (qty: number, un: string): number => {
    // 1. Is it a custom defined serving size?
    const customMatch = food.serving_sizes?.find(s => s.name === un);
    if (customMatch) {
       return qty * customMatch.weight_in_grams;
    }
    
    // 2. Standard fallback conversions
    switch (un) {
      case 'g':
      case 'ml': return qty;
      case 'oz': return qty * 28.35;
      case 'cup': return qty * 240; 
      case 'tbsp': return qty * 15;
      case 'piece': return qty * 100; // arbitrary baseline if cross-converting piece to mass
      default: return qty;
    }
  };

  const getRatio = () => {
    const qty = Number(quantity) || 0;
    
    // If the unit perfectly matches the exact baseline definition
    if (unit === food.default_unit) {
      return qty / food.default_serving;
    }
    
    // Cross unit conversion: Calculate absolute metric mass, then divide by the baseline definition's mass.
    const selectedGrams = getStandardGrams(qty, unit);
    const defaultGrams = getStandardGrams(food.default_serving, food.default_unit);
    
    // Prevent divide by zero if defaultGrams is somehow 0
    if (defaultGrams === 0) return 0;
    
    return selectedGrams / defaultGrams;
  };

  const ratio = getRatio();

  const currentMacros = {
    calories: Math.round(food.base_calories * ratio),
    protein: Number((food.base_protein * ratio).toFixed(1)),
    carbs: Number((food.base_carbs * ratio).toFixed(1)),
    fat: Number((food.base_fat * ratio).toFixed(1))
  };

  const handleConfirm = () => {
    onConfirm({
      id: crypto.randomUUID(),
      food_item: food,
      quantity: Number(quantity) || 1,
      unit,
      ...currentMacros
    });
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCancel} />
      
      <div className="relative bg-[var(--color-bg-card)] w-full max-w-md rounded-t-[40px] md:rounded-[40px] shadow-premium overflow-hidden animate-slide-up md:animate-scale-spring border border-white/10 flex flex-col max-h-[90vh]">
        <div className="p-8 overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
               <div className="flex flex-col">
                   <h2 className="text-xl font-black text-[var(--color-text-main)] tracking-tight">{food.name}</h2>
                   <div className="flex items-center gap-2 mt-1">
                       {food.brand && <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{food.brand}</span>}
                       {food.region && <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">{food.region}</span>}
                   </div>
               </div>
               <button onClick={onCancel} className="p-2 hover:bg-[var(--color-bg-base)] rounded-full transition-colors flex-shrink-0">
                 <X className="w-5 h-5 text-[var(--color-text-muted)]" />
               </button>
            </div>

            {/* Inputs */}
            <div className="flex gap-4 mb-8">
                <div className="flex-[2]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] px-1 mb-2 block">Quantity</label>
                    <input 
                        type="number"
                        min="0"
                        step="0.1"
                        autoFocus
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-5 py-4 font-black text-xl text-[var(--color-text-main)] outline-none text-center focus:border-emerald-500/50 transition-colors"
                    />
                </div>
                <div className="flex-[3]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] px-1 mb-2 block">Unit</label>
                    <div className="relative">
                        <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <select
                            value={unit}
                            onChange={(e) => handleUnitChange(e.target.value)}
                            className="w-full appearance-none bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl pl-11 pr-8 py-4 font-black text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 transition-colors shrink-0"
                        >
                            {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Live Macro Output */}
            <div className="grid grid-cols-4 gap-3 mb-8">
                 <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl p-3 flex flex-col items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-500 mb-1" />
                    <span className="font-black text-[var(--color-text-main)] text-xl leading-none">{currentMacros.calories}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mt-1">kcal</span>
                 </div>
                 <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl p-3 flex flex-col items-center justify-center">
                    <Flame className="w-4 h-4 text-emerald-500 mb-1" />
                    <span className="font-black text-[var(--color-text-main)] text-xl leading-none">{Math.round(currentMacros.protein)}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mt-1">Prot</span>
                 </div>
                 <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl p-3 flex flex-col items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-amber-500 mb-1" />
                    <span className="font-black text-[var(--color-text-main)] text-xl leading-none">{Math.round(currentMacros.carbs)}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mt-1">Carb</span>
                 </div>
                 <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl p-3 flex flex-col items-center justify-center">
                    <Apple className="w-4 h-4 text-pink-500 mb-1" />
                    <span className="font-black text-[var(--color-text-main)] text-xl leading-none">{Math.round(currentMacros.fat)}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mt-1">Fat</span>
                 </div>
            </div>

            <button 
                onClick={handleConfirm}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20"
            >
                Confirm Add
            </button>
        </div>
      </div>
    </div>
  );
}
