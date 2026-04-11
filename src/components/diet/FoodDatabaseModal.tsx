import { useState, useMemo } from 'react';
import { X, Search, Plus, Utensils, Clock, Apple, Check, Trash2, Zap, BadgeCheck } from 'lucide-react';
import { useDiet } from '../../context/DietContext';
import { PortionAdjuster } from './PortionAdjuster';
import { CreateFoodModal } from './CreateFoodModal';
import type { FoodItem, MealItem, MealType } from '../../types';

interface FoodDatabaseModalProps {
  mealType: MealType;
  status: 'PLANNED' | 'UNPLANNED';
  onClose: () => void;
}

import { GLOBAL_FOODS } from '../../data/globalFoods';

type TabType = 'Search' | 'Recent' | 'My Foods' | 'Quick Add';

export function FoodDatabaseModal({ mealType, status, onClose }: FoodDatabaseModalProps) {
  const { addMeal, customFoods, getRecentFoods, addCustomFood, deleteCustomFood, selectedDate } = useDiet();
  const [activeTab, setActiveTab] = useState<TabType>('Search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(40);
  
  // Staging Area
  const [stagedItems, setStagedItems] = useState<MealItem[]>([]);
  
  // Modals
  const [activeFoodForPortion, setActiveFoodForPortion] = useState<FoodItem | null>(null);
  const [isCreatingFood, setIsCreatingFood] = useState(false);
  const [loading, setLoading] = useState(false);

  // Quick Add State
  const [qaCals, setQaCals] = useState('');
  const [qaP, setQaP] = useState('');
  const [qaC, setQaC] = useState('');
  const [qaF, setQaF] = useState('');

  // Data aggregations
  const allFoods = useMemo(() => [...customFoods, ...GLOBAL_FOODS], [customFoods]);
  const recentFoods = useMemo(() => getRecentFoods(), [getRecentFoods]);

  const categories = useMemo(() => {
    const cats = new Set(allFoods.map(f => f.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [allFoods]);

  const regions = useMemo(() => {
    const regs = new Set(allFoods.map(f => f.region).filter(Boolean));
    return Array.from(regs) as string[];
  }, [allFoods]);

  const filteredFoods = useMemo(() => {
    // - [x] Create implementation plan
    // - [x] Create CSV processing script
    // - [x] Generate indianFoodDatabase.json
    // - [x] Integrate full database into globalFoods.ts
    // - [x] Verify search performance and UI responsiveness
    let source = activeTab === 'Search' ? allFoods : activeTab === 'Recent' ? recentFoods : customFoods;
    if (!searchQuery.trim()) return source;
    
    const q = searchQuery.toLowerCase();
    return source.filter(f => {
       const matchesSearch = f.name.toLowerCase().includes(q) || 
          (f.brand && f.brand.toLowerCase().includes(q)) || 
          (f.category && f.category.toLowerCase().includes(q));
       
       const matchesCategory = !selectedCategory || f.category === selectedCategory;
       const matchesRegion = !selectedRegion || f.region === selectedRegion;

       return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [allFoods, recentFoods, customFoods, activeTab, searchQuery, selectedCategory, selectedRegion]);

  // Derived Totals
  const totalCalories = stagedItems.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = stagedItems.reduce((acc, item) => acc + item.protein, 0);
  const totalCarbs = stagedItems.reduce((acc, item) => acc + item.carbs, 0);
  const totalFat = stagedItems.reduce((acc, item) => acc + item.fat, 0);
  const totalFiber = stagedItems.reduce((acc, item) => acc + item.fiber, 0);
  const totalSugar = stagedItems.reduce((acc, item) => acc + item.sugar, 0);
  const totalSodium = stagedItems.reduce((acc, item) => acc + item.sodium, 0);
  const totalCholesterol = stagedItems.reduce((acc, item) => acc + item.cholesterol, 0);
  const totalVitA = stagedItems.reduce((acc, item) => acc + item.vitA, 0);
  const totalVitB = stagedItems.reduce((acc, item) => acc + item.vitB, 0);
  const totalVitC = stagedItems.reduce((acc, item) => acc + item.vitC, 0);
  const totalVitD = stagedItems.reduce((acc, item) => acc + item.vitD, 0);
  const totalCalcium = stagedItems.reduce((acc, item) => acc + item.calcium, 0);
  const totalIron = stagedItems.reduce((acc, item) => acc + item.iron, 0);

  const handleCommitStaging = async () => {
    if (stagedItems.length === 0) return;
    setLoading(true);
    
    await addMeal({
      date: selectedDate.toISOString().split('T')[0],
      meal_type: mealType,
      name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Log`,
      items: stagedItems,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
      sugar: totalSugar,
      sodium: totalSodium,
      cholesterol: totalCholesterol,
      vitA: totalVitA,
      vitB: totalVitB,
      vitC: totalVitC,
      vitD: totalVitD,
      calcium: totalCalcium,
      iron: totalIron,
      timestamp: new Date().toISOString(),
      status: status
    });
    
    setLoading(false);
    onClose();
  };

  const removeStagedItem = (id: string) => {
    setStagedItems(prev => prev.filter(i => i.id !== id));
  };

  const submitQuickAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!qaCals) return;
      
      const p = Number(qaP) || 0;
      const c = Number(qaC) || 0;
      const f = Number(qaF) || 0;
      const cals = Number(qaCals);

      const dummyFood: FoodItem = {
          id: `qa-${Date.now()}`,
          name: 'Quick Add / Manual',
          category: 'Manual Entry',
          base_calories: cals,
          base_protein: p,
          base_carbs: c,
          base_fat: f,
          default_serving: 1,
          default_unit: 'piece'
      };

      setStagedItems(prev => [...prev, {
          id: crypto.randomUUID(),
          food_item: dummyFood,
          quantity: 1,
          unit: 'piece',
          calories: cals,
          protein: p,
          carbs: c,
          fat: f,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          cholesterol: 0,
          vitA: 0,
          vitB: 0,
          vitC: 0,
          vitD: 0,
          calcium: 0,
          iron: 0
      }]);

      setQaCals(''); setQaP(''); setQaC(''); setQaF('');
      setActiveTab('Search');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col md:items-center md:justify-center bg-black/80 backdrop-blur-md p-0 md:p-6 overflow-hidden">
      
      <div className="relative bg-[var(--color-bg-base)] w-full h-full md:max-w-4xl md:h-[85vh] md:rounded-[40px] shadow-premium flex flex-col animate-slide-up border border-white/10">
        
        {/* Header Region */}
        <div className="flex flex-col gap-4 p-6 border-b border-[var(--color-border-subtle)]/30 bg-[var(--color-bg-card)]">
            <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase flex items-center gap-2">
                       <Utensils className="w-6 h-6 text-emerald-500" /> Database
                   </h2>
                   <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1 ml-8">
                     {status === 'PLANNED' ? 'Planning' : 'Logging'} {mealType}
                   </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-[var(--color-bg-base)] rounded-full transition-colors flex-shrink-0 bg-[var(--color-bg-base)] border border-white/5">
                 <X className="w-6 h-6 text-[var(--color-text-muted)]" />
               </button>
            </div>

            {/* Smart Search Bar */}
            {activeTab !== 'Quick Add' && (
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input 
                        type="text" 
                        placeholder="Search foods, brands..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl py-4 pl-12 pr-4 font-bold text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                    />
                </div>
            )}

            {/* Sub Nav */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {(['Search', 'Recent', 'My Foods', 'Quick Add'] as TabType[]).map(tab => (
                    <button 
                        key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl font-black tracking-wider uppercase text-[10px] whitespace-nowrap transition-all border shrink-0 ${
                            activeTab === tab 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                                : 'bg-[var(--color-bg-base)] border-[var(--color-border-subtle)]/30 text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'
                        }`}
                    >
                        {tab === 'Recent' && <Clock className="w-3 h-3 inline pb-0.5 mr-1" />}
                        {tab === 'My Foods' && <Apple className="w-3 h-3 inline pb-0.5 mr-1" />}
                        {tab === 'Quick Add' && <Zap className="w-3 h-3 inline pb-0.5 mr-1" />}
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* List Region */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[var(--color-bg-base)]/30 min-h-0">
             
             {/* Filter Chips */}
             {activeTab !== 'Quick Add' && (
                 <div className="flex flex-col gap-3 mb-2">
                     {/* Category Chips */}
                     <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                         <button 
                            onClick={() => setSelectedCategory(null)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border whitespace-nowrap ${!selectedCategory ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'border-white/5 text-[var(--color-text-muted)] opacity-50'}`}
                         > All categories </button>
                         {categories.map(cat => (
                             <button 
                                key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border whitespace-nowrap ${selectedCategory === cat ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-sm' : 'border-white/5 text-[var(--color-text-muted)] hover:border-white/20'}`}
                             > {cat} </button>
                         ))}
                     </div>
                     {/* Region Chips */}
                     <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                         <button 
                            onClick={() => setSelectedRegion(null)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border whitespace-nowrap ${!selectedRegion ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'border-white/5 text-[var(--color-text-muted)] opacity-50'}`}
                         > All Regions </button>
                         {regions.map(reg => (
                             <button 
                                key={reg} onClick={() => setSelectedRegion(reg === selectedRegion ? null : reg)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border whitespace-nowrap ${selectedRegion === reg ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-sm' : 'border-white/5 text-[var(--color-text-muted)] hover:border-white/20'}`}
                             > {reg} </button>
                         ))}
                     </div>
                 </div>
             )}
             {activeTab === 'Quick Add' ? (
                 <form onSubmit={submitQuickAdd} className="space-y-4 max-w-sm mx-auto pt-8">
                     <p className="text-center font-bold text-[var(--color-text-muted)] text-sm mb-6">Manually input calories directly to your plate.</p>
                     <input type="number" placeholder="Calories *" required value={qaCals} onChange={e => setQaCals(e.target.value)} min="1"
                        className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-5 py-4 font-black text-xl text-[var(--color-text-main)] outline-none text-center focus:border-orange-500/50 transition-colors placeholder:text-orange-500/20 text-orange-500" />
                     
                     <div className="grid grid-cols-3 gap-3">
                        <input type="number" placeholder="Prot (g)" value={qaP} onChange={e => setQaP(e.target.value)} min="0" className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-3 py-3 font-bold text-center text-emerald-500 focus:border-emerald-500/50 outline-none" />
                        <input type="number" placeholder="Carb (g)" value={qaC} onChange={e => setQaC(e.target.value)} min="0" className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-3 py-3 font-bold text-center text-amber-500 focus:border-amber-500/50 outline-none" />
                        <input type="number" placeholder="Fat (g)" value={qaF} onChange={e => setQaF(e.target.value)} min="0" className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-3 py-3 font-bold text-center text-pink-500 focus:border-pink-500/50 outline-none" />
                     </div>
                     <button type="submit" className="w-full mt-4 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-base)] border border-dashed border-emerald-500 text-emerald-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                         Push to Plate
                     </button>
                 </form>
             ) : (
                 <>
                    <div className="grid grid-cols-1 gap-2">
                        {activeTab === 'My Foods' && (
                            <button onClick={() => setIsCreatingFood(true)} className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5 transition-all font-bold text-sm">
                                <Plus className="w-4 h-4" /> Create Custom Food
                            </button>
                        )}

                        {filteredFoods.slice(0, displayLimit).map(food => (
                            <div 
                                key={food.id}
                                className="group flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all shadow-sm active:scale-[0.98]"
                            >
                                <div onClick={() => setActiveFoodForPortion(food)} className="flex-1 min-w-0 cursor-pointer">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-sm text-[var(--color-text-main)] truncate group-hover:text-emerald-500 transition-colors">
                                            {food.name}
                                        </h4>
                                        {food.is_verified && (
                                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] font-bold">
                                        {food.brand && <span className="uppercase text-emerald-500/70">{food.brand}</span>}
                                        {food.category && <span className="uppercase bg-[var(--color-bg-base)] px-1.5 py-0.5 rounded border border-white/5">{food.category}</span>}
                                        {food.region && <span className="uppercase text-blue-400/70">{food.region}</span>}
                                        <span>•</span>
                                        <span>{food.base_calories} kcal / {food.default_serving}{food.default_unit}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTab === 'My Foods' && (
                                        <button onClick={(e) => { e.stopPropagation(); deleteCustomFood(food.id); }} className="p-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors z-10 hidden group-hover:block relative">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div onClick={() => setActiveFoodForPortion(food)} className="w-8 h-8 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-bg-base)] cursor-pointer">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredFoods.length > displayLimit && (
                            <button 
                                onClick={() => setDisplayLimit(prev => prev + 40)}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-emerald-500 transition-colors border border-dashed border-white/5 rounded-2xl"
                            >
                                Show More ({filteredFoods.length - displayLimit} remaining)
                            </button>
                        )}
                        
                        {filteredFoods.length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <p className="text-sm font-bold">No matches found</p>
                                <p className="text-[10px] uppercase">Try adjusting your filters or search query</p>
                            </div>
                        )}
                    </div>
                 </>
             )}
        </div>

        {/* Footer Staging Area */}
        <div className="p-4 md:p-6 border-t border-[var(--color-border-subtle)]/30 bg-[var(--color-bg-card)]">
            {stagedItems.length > 0 ? (
                <div className="flex flex-col gap-4">
                    <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar snap-x">
                        {stagedItems.map(item => (
                            <div key={item.id} className="snap-start flex-shrink-0 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/50 rounded-xl px-4 py-2 flex items-center gap-3 relative group">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black truncate max-w-[120px] text-[var(--color-text-main)]">{item.food_item.name}</span>
                                    <span className="text-[10px] font-bold text-emerald-500">{item.calories} kcal <span className="text-[var(--color-text-muted)] font-normal ml-1">({item.quantity}{item.unit})</span></span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeStagedItem(item.id); }} className="w-5 h-5 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all ml-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                         onClick={handleCommitStaging} disabled={loading}
                         className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] py-4 md:py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" /> Log Meal ({totalCalories} kcal)
                    </button>
                </div>
            ) : (
                <div className="text-center py-2 opacity-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Plate is empty</p>
                </div>
            )}
        </div>
      </div>

      {activeFoodForPortion && (
          <PortionAdjuster 
            food={activeFoodForPortion} 
            onCancel={() => setActiveFoodForPortion(null)} 
            onConfirm={(mealItem) => {
                setStagedItems(prev => [...prev, mealItem]);
                setActiveFoodForPortion(null);
            }} 
          />
      )}

      {isCreatingFood && (
          <CreateFoodModal 
             onCancel={() => setIsCreatingFood(false)}
             onConfirm={async (food) => {
                await addCustomFood(food);
                setIsCreatingFood(false);
             }}
          />
      )}
    </div>
  );
}
