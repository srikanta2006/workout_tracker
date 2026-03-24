import { useState } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { Dumbbell, Plus, Calendar, Play, Trash2, CheckCircle2, Copy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Program } from '../types';

export function Routines() {
  const { routines, deleteRoutine, programs, addProgram, deleteProgram, activeProgram, setActiveProgram } = useWorkoutState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'templates' | 'programs'>('templates');
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);

  // New Program State
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramLength, setNewProgramLength] = useState(7);
  const [newProgramSchedule, setNewProgramSchedule] = useState<Record<number, string | null>>({});

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
      alert("Please enter a program name.");
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
      setActiveProgram({
        programId: id,
        startDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col pb-8">
      <div className="mb-6 px-1">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Training</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Manage your routine templates and multi-week programs.
        </p>

        <div className="flex glass-panel rounded-xl p-1 mt-4 gap-1">
          <button 
            onClick={() => { setActiveTab('templates'); setIsCreatingProgram(false); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'templates' ? 'bg-[var(--color-bg-base)] text-[var(--color-brand-600)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
          >
            Templates
          </button>
          <button 
            onClick={() => setActiveTab('programs')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'programs' ? 'bg-[var(--color-bg-base)] text-[var(--color-brand-600)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
          >
            Programs
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
                <h3 className="text-lg font-bold mb-2">No Routines Yet</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-6">Create standalone routine templates to quick-start workouts.</p>
                <Link
                  to="/workout"
                  className="bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-6 py-3 rounded-lg font-semibold inline-block transition-colors"
                >
                  Create from New Workout
                </Link>
              </div>
            ) : (
              <>
                {routines.map(routine => (
                  <div key={routine.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm hover:border-[var(--color-brand-500)] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-main)]">{routine.name}</h3>
                        <div className="text-sm text-[var(--color-text-muted)] mt-1">{routine.muscleGroup} Day</div>
                      </div>
                      <button 
                        onClick={() => deleteRoutine(routine.id)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="text-sm text-[var(--color-text-muted)] mb-4">
                      <span className="font-semibold">{routine.exercises.length}</span> exercises included
                    </div>

                    <button 
                      onClick={() => navigate(`/workout?routineId=${routine.id}`)}
                      className="w-full bg-[var(--color-brand-500)]/10 text-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] hover:text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-current" /> Start Routine
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => navigate('/workout')}
                  className="w-full h-full min-h-[160px] border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/5 transition-colors flex flex-col justify-center items-center gap-2"
                >
                  <Plus className="w-8 h-8" /> New Routine
                </button>
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
                  Program Builder
                </h3>

                {routines.length === 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-600 dark:text-yellow-400 p-4 rounded-xl mb-6 text-sm font-semibold">
                    ⚠️ You don't have any saved Routine Templates! The Program Builder works by scheduling your existing templates. Please go to the <b>Templates</b> tab first and create some routines (like "Push Day" or "Upper Body").
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider block">Program Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4-Week Hypertrophy"
                      value={newProgramName}
                      onChange={e => setNewProgramName(e.target.value)}
                      className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg p-3 text-sm text-[var(--color-text-main)] w-full outline-none focus:border-[var(--color-brand-500)] transition-colors font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider block">Cycle Length (Days)</label>
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
                      <Copy className="w-4 h-4" /> Repeat Week 1 Schedule
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
                            <option key={r.id} value={r.id} className="bg-[var(--color-bg-card)]">{r.name} ({r.muscleGroup})</option>
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
                    <CheckCircle2 className="w-5 h-5" /> Save Plan
                  </button>
                </div>
              </div>
            ) : (
              <>
                {programs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4 w-full col-span-full border border-dashed border-[var(--color-border-subtle)] rounded-2xl">
                    <Calendar className="w-12 h-12 text-[var(--color-brand-500)] mx-auto mb-4 opacity-80" />
                    <h3 className="text-lg font-bold mb-2">No Programs</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">String together your routines into a structured multi-week training cycle.</p>
                  </div>
                ) : (
                  <>
                    {programs.map(program => {
                      const isActive = activeProgram?.programId === program.id;
                      return (
                        <div key={program.id} className={`bg-[var(--color-bg-card)] border-2 rounded-xl p-4 shadow-sm transition-all ${isActive ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/5 scale-[1.01]' : 'border-[var(--color-border-subtle)] hover:border-[var(--color-brand-500)]/50'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-[var(--color-text-main)]">{program.name}</h3>
                                {isActive && <span className="bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Active</span>}
                              </div>
                              <div className="text-sm text-[var(--color-text-muted)] mt-1">{program.lengthInDays} Day Cycle</div>
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

                          <button 
                            onClick={() => handleActivateProgram(program.id)}
                            className={`w-full py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 transition-all active:scale-[0.98] ${isActive ? 'bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white' : 'bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] shadow-md'}`}
                          >
                            {isActive ? 'Deactivate Program' : 'Set as Active Program'}
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
                  <Plus className="w-8 h-8" /> New Program Cycle
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
