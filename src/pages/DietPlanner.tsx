import { useState, useMemo } from 'react';
import { useDiet } from '../context/DietContext';
import { Utensils, Plus, Calendar, Trash2, CheckCircle2, Copy, ChevronRight, X, Edit2, Search } from 'lucide-react';
import type { DietRoutine, DietProgram, DietRoutineMeal, MealType, FoodItem } from '../types';
import { GLOBAL_FOODS } from '../data/globalFoods';
import { CreateFoodModal } from '../components/diet/CreateFoodModal';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function DietPlanner() {
  const { 
    dietRoutines, addDietRoutine, deleteDietRoutine, updateDietRoutine,
    dietPrograms, addDietProgram, deleteDietProgram, activeDietProgram, setActiveDietProgram,
    customFoods, addCustomFood
  } = useDiet();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'templates' | 'programs'>('templates');
  
  // -- Template Builder State --
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateId, setNewTemplateId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateMeals, setNewTemplateMeals] = useState<DietRoutineMeal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetMealType, setTargetMealType] = useState<MealType>('breakfast');

  const [isCreatingFood, setIsCreatingFood] = useState(false);

  const filteredFoods = useMemo<FoodItem[]>(() => {
    const allFoods = [...customFoods, ...GLOBAL_FOODS];
    return allFoods.filter(food => 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.category && food.category.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 50); // limit to keep UI responsive
  }, [searchQuery, customFoods]);

  const templateTotals = useMemo(() => {
    return newTemplateMeals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [newTemplateMeals]);

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) { alert("Please enter a day template name."); return; }
    if (newTemplateMeals.length === 0) { alert("Please add at least one food."); return; }

    if (newTemplateId) {
      updateDietRoutine(newTemplateId, {
        id: newTemplateId,
        name: newTemplateName,
        meals: newTemplateMeals
      });
    } else {
      addDietRoutine({
        id: crypto.randomUUID(),
        name: newTemplateName,
        meals: newTemplateMeals
      });
    }
    setIsCreatingTemplate(false);
  };

  const editTemplate = (r: DietRoutine) => {
    setNewTemplateId(r.id);
    setNewTemplateName(r.name);
    setNewTemplateMeals(r.meals);
    setIsCreatingTemplate(true);
  };

  const openNewTemplate = () => {
    setNewTemplateId(null);
    setNewTemplateName('');
    setNewTemplateMeals([]);
    setIsCreatingTemplate(true);
  };

  // -- Program Builder State --
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramLength, setNewProgramLength] = useState(7);
  const [newProgramSchedule, setNewProgramSchedule] = useState<Record<number, string | null>>({});
  
  const [selectedStartDates, setSelectedStartDates] = useState<Record<string, string>>({});

  const handleRepeatWeek1 = () => {
    const updatedSchedule = { ...newProgramSchedule };
    for (let i = 8; i <= newProgramLength; i++) {
        const week1Day = ((i - 1) % 7) + 1;
        updatedSchedule[i] = newProgramSchedule[week1Day] || null;
    }
    setNewProgramSchedule(updatedSchedule);
  };

  const handleSaveProgram = () => {
    if (!newProgramName.trim()) { alert("Please enter a meal plan name."); return; }
    const schedule = Array.from({ length: newProgramLength }).map((_, i) => ({
      dayNumber: i + 1,
      dietRoutineId: newProgramSchedule[i + 1] || null
    }));
    addDietProgram({
      id: crypto.randomUUID(),
      name: newProgramName,
      lengthInDays: newProgramLength,
      schedule
    });
    setIsCreatingProgram(false);
    setNewProgramName('');
    setNewProgramSchedule({});
  };

  const handleActivateProgram = (id: string) => {
    if (activeDietProgram?.programId === id) {
      setActiveDietProgram(null);
    } else {
      const startDate = selectedStartDates[id] || new Date().toISOString().split('T')[0];
      setActiveDietProgram({
        programId: id,
        startDate: startDate
      });
      navigate('/nutrition'); // Kick back to nutrition dashboard
    }
  };

  return (
    <div className="w-full h-full flex flex-col pb-20 overflow-x-hidden">
      {!isCreatingTemplate && !isCreatingProgram && (
        <section aria-labelledby="planner-title" className="mb-6 px-1">
            <h2 id="planner-title" className="text-4xl font-black text-[var(--color-text-main)] tracking-tighter italic uppercase leading-none mb-2">
                Diet <span className="text-emerald-500">Planner</span>
            </h2>
            <p className="text-[var(--color-text-muted)] font-medium">Build reusable persistent Day Templates and link them into Meal Plans.</p>

            <div className="flex glass-panel rounded-xl p-1 mt-6 gap-1 max-w-sm">
                <button 
                  onClick={() => setActiveTab('templates')}
                  className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-all", activeTab === 'templates' ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]')}
                >
                  Day Templates
                </button>
                <button 
                  onClick={() => setActiveTab('programs')}
                  className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-all", activeTab === 'programs' ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]')}
                >
                  Meal Plans (Weeks)
                </button>
            </div>
        </section>
      )}

      {/* --- TEMPLATE BUILDER MODE --- */}
      {isCreatingTemplate ? (
        <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-6">
                <div className="flex items-center justify-between bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-[32px] p-6 shadow-sm">
                   <div>
                       <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Template Name</label>
                       <input 
                         type="text" 
                         value={newTemplateName}
                         onChange={e => setNewTemplateName(e.target.value)}
                         placeholder="e.g. Standard High-Protein Day"
                         className="bg-transparent text-2xl font-black text-[var(--color-text-main)] outline-none border-b border-dashed border-[var(--color-border-subtle)]/50 focus:border-emerald-500 w-full md:w-96 pb-1 transition-colors capitalize"
                       />
                   </div>
                   <div className="text-right">
                       <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)] block mb-1">Total Template</span>
                       <span className="text-xl font-black text-orange-500">{templateTotals.calories} kcal</span>
                       <div className="text-xs font-bold text-[var(--color-text-muted)] mt-1">P: {templateTotals.protein} C: {templateTotals.carbs} F: {templateTotals.fat}</div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-lg font-black text-[var(--color-text-main)] tracking-tight px-2 flex items-center gap-2">
                       <Utensils className="w-5 h-5 text-emerald-500" />
                       Template Meals
                   </h3>
                   {newTemplateMeals.length > 0 ? newTemplateMeals.map((meal, idx) => (
                      <div key={idx} className="group bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/50 rounded-3xl p-5 flex items-center justify-between hover:border-emerald-500/30 transition-all shadow-sm">
                           <div className="flex items-center gap-5">
                               <div className="flex flex-col items-center justify-center bg-[var(--color-bg-base)] px-4 py-2 rounded-xl text-center">
                                  <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)]">Type</span>
                                  <span className="text-xs font-black text-[var(--color-text-main)] capitalize">{meal.meal_type}</span>
                               </div>
                               <div>
                                   <h4 className="font-bold text-[var(--color-text-main)] leading-tight">{meal.name}</h4>
                                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                                      {meal.calories} kcal · P: {meal.protein}g C: {meal.carbs}g F: {meal.fat}g
                                   </p>
                               </div>
                           </div>
                           <button 
                             onClick={() => setNewTemplateMeals(prev => prev.filter((_, i) => i !== idx))}
                             className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                      </div>
                   )) : (
                     <div className="bg-[var(--color-bg-base)] border-2 border-dashed border-[var(--color-border-subtle)]/50 rounded-[32px] py-16 text-center">
                         <span className="inline-block p-4 bg-[var(--color-bg-card)] rounded-full mb-4 shadow-sm border border-[var(--color-border-subtle)]/30"><Search className="w-6 h-6 text-emerald-500" /></span>
                         <h4 className="text-lg font-black text-[var(--color-text-main)]">Empty Template</h4>
                         <p className="text-sm text-[var(--color-text-muted)]/60 max-w-xs mx-auto">Use the food browser to construct the blueprint for this day template.</p>
                     </div>
                   )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-[var(--color-border-subtle)]/30">
                   <button onClick={() => setIsCreatingTemplate(false)} className="flex-1 py-4 border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-[var(--color-bg-base)] transition-colors">Cancel</button>
                   <button onClick={handleSaveTemplate} className="flex-[2] py-4 bg-emerald-500 text-white font-black hover:bg-emerald-600 transition-colors uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/> Save Template</button>
                </div>
            </div>

            <div className="xl:col-span-4 space-y-4">
                <div className="p-1.5 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 rounded-[28px] shadow-sm flex items-center gap-2 pr-2">
                   <div className="relative flex-1">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                      <input 
                        type="text" placeholder="Search foods..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-bg-base)] border-none rounded-[24px] py-4 pl-14 pr-8 text-sm font-bold text-[var(--color-text-main)] outline-none"
                      />
                   </div>
                   <button onClick={() => setIsCreatingFood(true)} title="Create Custom Food" className="w-12 h-12 shrink-0 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-[20px] flex items-center justify-center transition-all shadow-sm">
                      <Plus className="w-6 h-6" />
                   </button>
                </div>

                <div className="flex items-center bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-1 gap-2 shadow-sm">
                   <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-3">Assign To:</span>
                   <select value={targetMealType} onChange={e => setTargetMealType(e.target.value as MealType)} className="flex-1 bg-transparent border-none p-3 text-xs font-black uppercase tracking-wider text-[var(--color-text-main)] outline-none">
                     <option value="breakfast">Breakfast</option>
                     <option value="lunch">Lunch</option>
                     <option value="dinner">Dinner</option>
                     <option value="snack">Snack</option>
                   </select>
                </div>

                <div className="space-y-2 h-[calc(100vh-400px)] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredFoods.map(food => (
                     <button
                       key={food.id}
                       onClick={() => setNewTemplateMeals(prev => [...prev, {
                          name: food.name, meal_type: targetMealType,
                          calories: food.base_calories, protein: food.base_protein, carbs: food.base_carbs, fat: food.base_fat,
                          fiber: food.base_fiber || 0, sugar: food.base_sugar || 0, sodium: food.base_sodium || 0, cholesterol: food.base_cholesterol || 0,
                          vitA: food.base_vitA || 0, vitB: food.base_vitB || 0, vitC: food.base_vitC || 0, vitD: food.base_vitD || 0, calcium: food.base_calcium || 0, iron: food.base_iron || 0,
                       }])}
                       className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] p-4 rounded-3xl flex items-center justify-between group hover:border-emerald-500/50 hover:shadow-md transition-all text-left"
                     >
                       <div>
                         <h4 className="font-bold text-[var(--color-text-main)] text-sm group-hover:text-emerald-500 leading-tight">{food.name}</h4>
                         <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] mt-1 inline-block">{food.base_calories} kcal</span>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"><Plus className="w-4 h-4"/></div>
                     </button>
                  ))}
                </div>
            </div>
        </div>
      ) : isCreatingProgram ? (
        /* --- PROGRAM BUILDER MODE --- */
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-3xl p-8 shadow-sm col-span-full max-w-3xl mx-auto w-full">
            <h3 className="text-2xl font-black text-[var(--color-text-main)] italic tracking-tight flex items-center gap-3 mb-8 pb-4 border-b border-[var(--color-border-subtle)]">
                <Calendar className="w-6 h-6 text-emerald-500" />
                Assemble Meal Plan
            </h3>

            {dietRoutines.length === 0 && (
                <div className="bg-orange-500/10 border border-orange-500/50 text-orange-600 p-4 rounded-xl mb-6 text-sm font-semibold">
                ⚠️ You don't have any Day Templates! The planner connects day templates into a long-term plan. Please create Day Templates first.
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                <label className="text-[10px] font-black text-[var(--color-text-muted)] mb-2 uppercase tracking-widest block">Meal Plan Name</label>
                <input 
                    type="text" placeholder="e.g. 4-Week Cut" value={newProgramName} onChange={e => setNewProgramName(e.target.value)}
                    className="bg-[var(--color-bg-base)] border-none rounded-xl py-4 px-4 text-sm text-[var(--color-text-main)] w-full outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors font-bold shadow-inner"
                />
                </div>
                <div>
                <label className="text-[10px] font-black text-[var(--color-text-muted)] mb-2 uppercase tracking-widest block">Plan Duration</label>
                <select 
                    value={newProgramLength} onChange={e => setNewProgramLength(Number(e.target.value))}
                    className="bg-[var(--color-bg-base)] border-none rounded-xl py-4 px-4 text-sm text-[var(--color-text-main)] w-full outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors font-bold shadow-inner"
                >
                    <option value={7}>1 Week</option>
                    <option value={14}>2 Weeks</option>
                    <option value={21}>3 Weeks</option>
                    <option value={28}>4 Weeks</option>
                </select>
                </div>
            </div>

            <div className="bg-[var(--color-bg-base)] p-6 rounded-3xl border border-[var(--color-border-subtle)] mb-8 shadow-inner">
                {newProgramLength > 7 && (
                <button 
                    onClick={handleRepeatWeek1}
                    className="w-full mb-6 py-4 border-2 border-dashed border-emerald-500/30 text-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 transition-colors flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                    <Copy className="w-4 h-4" /> Duplicate Week 1 Array
                </button>
                )}
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {Array.from({ length: newProgramLength }).map((_, i) => {
                    const dayNum = i + 1;
                    return (
                        <div key={dayNum} className="flex items-center gap-4 bg-[var(--color-bg-card)] p-2 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm">
                            <div className="w-16 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center font-black text-sm border border-emerald-500/20 shadow-inner shrink-0">
                                D{dayNum}
                            </div>
                            <select 
                                value={newProgramSchedule[dayNum] || ''}
                                onChange={e => setNewProgramSchedule(prev => ({...prev, [dayNum]: e.target.value}))}
                                className="bg-transparent border-none p-3 text-sm font-bold text-[var(--color-text-main)] w-full outline-none cursor-pointer"
                            >
                                <option value="" className="bg-[var(--color-bg-card)] text-[var(--color-text-muted)] italic">No Template (Unplanned Day)</option>
                                {dietRoutines.map(r => (
                                    <option key={r.id} value={r.id} className="bg-[var(--color-bg-card)] text-[var(--color-text-main)] font-medium">➡️ {r.name}</option>
                                ))}
                            </select>
                        </div>
                    );
                    })}
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={() => setIsCreatingProgram(false)} className="flex-1 py-4 border border-[var(--color-border-subtle)] font-black text-[10px] uppercase tracking-widest rounded-2xl text-[var(--color-text-muted)] hover:bg-[var(--color-bg-base)] transition-colors">Cancel</button>
                <button onClick={handleSaveProgram} className="flex-[2] py-4 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"><CheckCircle2 className="w-4 h-4" /> Confirm & Compile</button>
            </div>
        </div>
      ) : (
        /* --- MAIN LISTINGS --- */
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          {/* TEMPLATES TAB OVERVIEW */}
          {activeTab === 'templates' && (
            <>
              {dietRoutines.map((routine, index) => (
                <div key={routine.id} className={clsx("group relative glass-card rounded-3xl p-6 shadow-premium transition-all hover:shadow-premium-hover hover:border-emerald-500/30", `stagger-${Math.min(index + 1, 5)}`)}>
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--color-text-main)] group-hover:text-emerald-500 transition-colors leading-tight">{routine.name}</h3>
                        <div className="text-[10px] uppercase tracking-widest font-black text-[var(--color-text-muted)] mt-1">{routine.meals.length} Meals Logged</div>
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all gap-1">
                          <button onClick={() => editTemplate(routine)} className="p-2 text-[var(--color-text-muted)] hover:text-emerald-500"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => deleteDietRoutine(routine.id)} className="p-2 text-[var(--color-text-muted)] hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                      </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]/50">
                      <div className="flex justify-between items-center text-sm font-bold text-[var(--color-text-main)]">
                         <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">Macro Split</span>
                         <span className="text-orange-500">{routine.meals.reduce((a, b) => a + b.calories, 0)} kcal</span>
                      </div>
                   </div>
                </div>
              ))}
              <div onClick={openNewTemplate} className="group relative glass-card rounded-3xl p-6 shadow-premium transition-all hover:shadow-premium-hover hover:border-emerald-500/40 cursor-pointer min-h-[160px] flex flex-col justify-center items-center text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform"><Plus className="w-6 h-6"/></div>
                     <h3 className="text-lg font-bold text-[var(--color-text-main)] group-hover:text-emerald-500">New Template</h3>
                     <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[200px]">Create an ideal day's meal plan to use later.</p>
                  </div>
              </div>
            </>
          )}

          {/* PROGRAMS TAB OVERVIEW */}
          {activeTab === 'programs' && (
            <>
              {dietPrograms.map((program, index) => {
                 const isActive = activeDietProgram?.programId === program.id;
                 return (
                   <div key={program.id} className={clsx("bg-[var(--color-bg-card)] border-2 rounded-2xl p-5 shadow-sm transition-all", isActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-[var(--color-border-subtle)] hover:border-emerald-500/50', `stagger-${Math.min(index + 1, 5)}`)}>
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-[var(--color-text-main)]">{program.name}</h3>
                                {isActive && <span className="bg-green-500 text-white text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full">Active</span>}
                            </div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)] mt-1">{program.lengthInDays} Day Protocol</div>
                         </div>
                         <button onClick={() => deleteDietProgram(program.id)} className="p-2 text-[var(--color-text-muted)] hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                      </div>

                      <div className="mt-4 mb-5 max-h-24 overflow-y-auto custom-scrollbar flex flex-wrap gap-1">
                          {program.schedule.filter(s => s.dietRoutineId).map(s => {
                             const rName = dietRoutines.find(r => r.id === s.dietRoutineId)?.name || 'Unknown';
                             return <span key={s.dayNumber} className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] px-2 py-1 text-[9px] font-black uppercase text-[var(--color-text-muted)] rounded-md">D{s.dayNumber}: {rName}</span>
                          })}
                      </div>

                      {!isActive && (
                          <div className="mb-4">
                            <label className="text-[9px] font-black tracking-widest text-[var(--color-text-muted)] uppercase block mb-1">Commencement Date</label>
                            <input 
                              type="date" value={selectedStartDates[program.id] || new Date().toISOString().split('T')[0]}
                              onChange={e => setSelectedStartDates({...selectedStartDates, [program.id]: e.target.value})}
                              className="bg-[var(--color-bg-base)] border-none p-3 rounded-xl text-xs font-bold w-full outline-none text-[var(--color-text-main)] shadow-inner"
                            />
                          </div>
                      )}

                      <button 
                         onClick={() => handleActivateProgram(program.id)}
                         className={clsx("w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", isActive ? "bg-[var(--color-bg-base)] border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white" : "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95")}
                      >
                         {isActive ? 'Halt Program' : 'Execute Plan'}
                      </button>
                   </div>
                 );
              })}
              <div onClick={() => setIsCreatingProgram(true)} className="group bg-[var(--color-bg-base)] border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-center">
                  <Calendar className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-emerald-500 mb-3 transition-colors" />
                  <span className="font-black text-xs uppercase tracking-widest text-[var(--color-text-muted)] group-hover:text-emerald-500 transition-colors">Construct New Master Plan</span>
              </div>
            </>
          )}


        </div>
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
