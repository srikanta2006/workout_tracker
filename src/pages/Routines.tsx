import { useState } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { Dumbbell, Plus, Calendar, Trash2, CheckCircle2, Copy, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Program } from '../types';
import clsx from 'clsx';

export default function Routines() {
  const { routines, deleteRoutine, programs, addProgram, deleteProgram, activeProgram, setActiveProgram } = useWorkoutState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'templates' | 'programs'>('templates');
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);

  // New Program State
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramLength, setNewProgramLength] = useState(7);
  const [newProgramSchedule, setNewProgramSchedule] = useState<Record<number, string | null>>({});
  
  // Start Date for activating a Routine
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
    if (!newProgramName.trim()) {
      alert("Please enter a routine name.");
      return;
    }

    const schedule = Array.from({ length: newProgramLength }).map((_, i) => ({
      dayNumber: i + 1,
      routineId: newProgramSchedule[i + 1] || null
    }));

    const program: Program = {
      id: crypto.randomUUID(),
      name: newProgramName,
      lengthInDays: newProgramLength,
      schedule
    };

    addProgram(program);
    setIsCreatingProgram(false);
    setNewProgramName('');
    setNewProgramSchedule({});
  };

  const handleActivateProgram = (id: string) => {
    if (activeProgram?.programId === id) {
      // Deactivate
      setActiveProgram(null);
    } else {
      const startDate = selectedStartDates[id] || new Date().toISOString().split('T')[0];
      setActiveProgram({
        programId: id,
        startDate: startDate
      });
      navigate('/session'); // Navigate to the dedicated Session tab
    }
  };

  return (
    <div className="w-full h-full flex flex-col pb-8">
      <div className="mb-6 px-1">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Planner</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Build single Day Templates, then combine them into multi-week Routines.
        </p>

        <div className="flex glass-panel rounded-xl p-1 mt-4 gap-1">
          <button 
            onClick={() => { setActiveTab('templates'); setIsCreatingProgram(false); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'templates' ? 'bg-[var(--color-bg-base)] text-[var(--color-brand-600)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
          >
            Day Templates
          </button>
          <button 
            onClick={() => setActiveTab('programs')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'programs' ? 'bg-[var(--color-bg-base)] text-[var(--color-brand-600)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
          >
            Routines (Weeks)
          </button>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        
        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <>
            {routines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 w-full col-span-full border border-dashed border-[var(--color-border-subtle)] rounded-2xl">
                <Dumbbell className="w-12 h-12 text-[var(--color-brand-500)] mx-auto mb-4 opacity-80" />
                <h3 className="text-lg font-bold mb-2">No Day Templates</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-6">Create standalone day templates (e.g. Leg Day, Pull Day) to use in your routines.</p>
                <Link
                  to="/workout?mode=template"
                  className="bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-6 py-3 rounded-lg font-semibold inline-block transition-colors"
                >
                  Create Day Template
                </Link>
              </div>
            ) : (
              <>
                {routines.map((routine, index) => (
                  <div 
                    key={routine.id} 
                    className={clsx(
                      "group relative glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover hover:border-[var(--color-brand-500)]/30 transition-all duration-500 cursor-pointer overflow-hidden",
                      `stagger-${Math.min(index + 1, 5)}`
                    )}
                  >
                    {/* Subtle background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-500)]/5 via-transparent to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-1 group-hover:text-[var(--color-brand-500)] transition-colors duration-300">
                            {routine.name}
                          </h3>
                          <div className="text-sm text-[var(--color-text-muted)] font-medium">{routine.muscleGroups?.join(', ')} Focus</div>
                        </div>
                        <button 
                          onClick={() => deleteRoutine(routine.id)}
                          className="p-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]/30">
                        <div className="text-sm text-[var(--color-text-muted)]">
                          <span className="font-bold text-[var(--color-text-main)] text-lg">{routine.exercises.length}</span> exercises
                        </div>
                        <div className="bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/30 p-2 rounded-xl group-hover:bg-[var(--color-brand-500)]/10 group-hover:border-[var(--color-brand-500)]/30 transition-all duration-300">
                          <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-500)] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Link 
                  to="/workout?mode=template"
                  className="group relative glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover hover:border-[var(--color-brand-500)]/40 transition-all duration-500 cursor-pointer overflow-hidden min-h-[200px] flex flex-col justify-center items-center text-center"
                >
                  {/* Subtle background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-500)]/5 via-transparent to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-[var(--color-brand-500)]/20 to-[var(--color-brand-500)]/10 backdrop-blur-sm border border-[var(--color-brand-500)]/20 p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <Plus className="w-8 h-8 text-[var(--color-brand-500)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-2 group-hover:text-[var(--color-brand-500)] transition-colors duration-300">New Day Template</h3>
                    <p className="text-sm text-[var(--color-text-muted)] font-medium">Create standalone day templates to use in your routines.</p>
                  </div>
                </Link>
              </>
            )}
          </>
        )}

        {/* PROGRAMS TAB */}
        {activeTab === 'programs' && (
          <>
            {isCreatingProgram ? (
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-sm col-span-full max-w-2xl mx-auto w-full">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-[var(--color-brand-500)]" />
                  Routine Builder
                </h3>

                {routines.length === 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-600 dark:text-yellow-400 p-4 rounded-xl mb-6 text-sm font-semibold">
                    ⚠️ You don't have any saved Day Templates! The Routine Builder connects your existing day templates into a long-term plan. Please go to the <b>Day Templates</b> tab first and create some days.
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider block">Routine Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4-Week Hypertrophy"
                      value={newProgramName}
                      onChange={e => setNewProgramName(e.target.value)}
                      className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg p-3 text-sm text-[var(--color-text-main)] w-full outline-none focus:border-[var(--color-brand-500)] transition-colors font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider block">Routine Length (Days)</label>
                    <select 
                      value={newProgramLength}
                      onChange={e => setNewProgramLength(Number(e.target.value))}
                      className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg p-3 text-sm text-[var(--color-text-main)] w-full outline-none focus:border-[var(--color-brand-500)] transition-colors font-bold"
                    >
                      <option value={7}>1 Week (7 Days)</option>
                      <option value={14}>2 Weeks (14 Days)</option>
                      <option value={21}>3 Weeks (21 Days)</option>
                      <option value={28}>4 Weeks (28 Days)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {newProgramLength > 7 && (
                    <button 
                      onClick={handleRepeatWeek1}
                      className="w-full mb-2 py-2 border border-[var(--color-brand-500)] text-[var(--color-brand-600)] rounded-lg font-bold text-xs hover:bg-[var(--color-brand-500)]/10 transition-colors flex justify-center items-center gap-1 active:scale-[0.98]"
                    >
                      <Copy className="w-4 h-4" /> Repeat Week 1 Plan
                    </button>
                  )}
                  {Array.from({ length: newProgramLength }).map((_, i) => {
                    const dayNum = i + 1;
                    return (
                      <div key={dayNum} className="flex flex-col gap-1 bg-[var(--color-bg-base)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                        <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Day {dayNum}</span>
                        <select 
                          value={newProgramSchedule[dayNum] || ''}
                          onChange={e => setNewProgramSchedule(prev => ({...prev, [dayNum]: e.target.value}))}
                          className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded p-2 text-sm font-semibold text-[var(--color-text-main)] w-full outline-none focus:border-[var(--color-brand-500)] cursor-pointer mt-1"
                        >
                          <option value="" className="bg-[var(--color-bg-card)]">Rest Day 😴</option>
                          {routines.map(r => (
                            <option key={r.id} value={r.id} className="bg-[var(--color-bg-card)]">{r.name} ({r.muscleGroups?.join(', ')})</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex gap-2 border-t border-[var(--color-border-subtle)] pt-4">
                  <button 
                    onClick={() => setIsCreatingProgram(false)}
                    className="flex-1 py-3 border border-[var(--color-border-subtle)] rounded-xl font-bold text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-base)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProgram}
                    className="flex-1 py-3 bg-[var(--color-brand-500)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-brand-600)] transition-colors flex justify-center items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Save Routine
                  </button>
                </div>
              </div>
            ) : (
              <>
                {programs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4 w-full col-span-full border border-dashed border-[var(--color-border-subtle)] rounded-2xl">
                    <Calendar className="w-12 h-12 text-[var(--color-brand-500)] mx-auto mb-4 opacity-80" />
                    <h3 className="text-lg font-bold mb-2">No Routines Configured</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">String together your Day Templates into a structured multi-week Routine.</p>
                  </div>
                ) : (
                  <>
                    {programs.map((program, index) => {
                      const isActive = activeProgram?.programId === program.id;
                      return (
                        <div 
                          key={program.id} 
                          className={clsx(
                            "animate-fade-in-up bg-[var(--color-bg-card)] border-2 rounded-xl p-4 shadow-sm transition-all",
                            isActive ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/5 scale-[1.01]' : 'border-[var(--color-border-subtle)] hover:border-[var(--color-brand-500)]/50',
                            `stagger-${Math.min(index + 1, 5)}`
                          )}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-[var(--color-text-main)]">{program.name}</h3>
                                {isActive && <span className="bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Active</span>}
                              </div>
                              <div className="text-sm text-[var(--color-text-muted)] mt-1">{program.lengthInDays} Day Routine</div>
                            </div>
                            <button 
                              onClick={() => deleteProgram(program.id)}
                              className="p-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="text-xs text-[var(--color-text-muted)] mb-4 flex gap-1 flex-wrap">
                            {program.schedule.filter(s => s.routineId).map(s => {
                               const rName = routines.find(r => r.id === s.routineId)?.name || 'Unknown';
                               return <span key={s.dayNumber} className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] px-2 py-1 rounded-md">D{s.dayNumber}: {rName}</span>
                            })}
                          </div>

                          {!isActive && (
                            <div className="mb-4">
                              <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider block mb-1">Select Start Date</label>
                              <input 
                                type="date" 
                                value={selectedStartDates[program.id] || new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedStartDates({...selectedStartDates, [program.id]: e.target.value})}
                                className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] p-2 rounded-lg text-sm w-full outline-none focus:border-[var(--color-brand-500)] text-[var(--color-text-main)]"
                              />
                            </div>
                          )}

                          <button 
                            onClick={() => handleActivateProgram(program.id)}
                            className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all active:scale-[0.98] ${isActive ? 'bg-[var(--color-bg-card)] border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] shadow-md'}`}
                          >
                            {isActive ? 'Stop Current Routine' : 'Start Routine Now'}
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
                <button 
                  onClick={() => setIsCreatingProgram(true)}
                  className="w-full h-full min-h-[160px] border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/5 transition-colors flex flex-col justify-center items-center gap-2"
                >
                  <Plus className="w-8 h-8" /> Assemble New Routine Check
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
