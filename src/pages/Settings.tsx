import { useState } from 'react';
import { Download, Upload, Trash2, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const [importStatus, setImportStatus] = useState('');

  const handleExport = () => {
    const data = {
      version: '2.0',
      workouts: localStorage.getItem('workout_tracker_data'),
      routines: localStorage.getItem('workout_tracker_routines'),
      bodyweights: localStorage.getItem('workout_tracker_bodyweights'),
      favorites: localStorage.getItem('workout_tracker_favorites'),
      programs: localStorage.getItem('workout_tracker_programs'),
      activeProgram: localStorage.getItem('workout_tracker_active_program'),
      goals: localStorage.getItem('workout_tracker_goals')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maxout_workout_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsed = JSON.parse(result);
        
        if (parsed.workouts !== undefined) {
          if (parsed.workouts) localStorage.setItem('workout_tracker_data', parsed.workouts);
          if (parsed.routines) localStorage.setItem('workout_tracker_routines', parsed.routines);
          if (parsed.bodyweights) localStorage.setItem('workout_tracker_bodyweights', parsed.bodyweights);
          if (parsed.favorites) localStorage.setItem('workout_tracker_favorites', parsed.favorites);
          if (parsed.programs) localStorage.setItem('workout_tracker_programs', parsed.programs);
          if (parsed.activeProgram) localStorage.setItem('workout_tracker_active_program', parsed.activeProgram);
          if (parsed.goals) localStorage.setItem('workout_tracker_goals', parsed.goals);
          
          setImportStatus('Data imported successfully! Reloading...');
          setTimeout(() => window.location.href = '/', 1500);
        } else {
          setImportStatus('Error: Invalid backup file format.');
        }
      } catch {
        setImportStatus('Error reading JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm("WARNING: This will delete ALL your workouts, routines, and bodyweight data permanently. Are you absolutely certain?")) {
      localStorage.removeItem('workout_tracker_data');
      localStorage.removeItem('workout_tracker_routines');
      localStorage.removeItem('workout_tracker_bodyweights');
      localStorage.removeItem('workout_tracker_favorites');
      localStorage.removeItem('workout_tracker_programs');
      localStorage.removeItem('workout_tracker_active_program');
      localStorage.removeItem('workout_tracker_goals');
      window.location.href = '/';
    }
  };

  const handleLoadDemoData = () => {
    if (window.confirm("Load Demo Data? This will overwrite your current routines and history to provide a populated testing environment.")) {
      const now = Date.now();
      const dayMs = 86400000;

      const demoRoutines = [
        { 
          id: "demo-leg-day", name: "Heavy Leg Day", muscleGroups: ["Legs"], 
          exercises: [
            { id: "ex-1", name: "Barbell Squat", sets: [{ id: "s1", setNumber: 1, reps: 5, weight: 225 }, { id: "s2", setNumber: 2, reps: 5, weight: 225 }] }, 
            { id: "ex-2", name: "Leg Press", sets: [{ id: "s3", setNumber: 1, reps: 10, weight: 400 }] }
          ] 
        },
        { 
          id: "demo-pull-day", name: "Pull Day", muscleGroups: ["Back", "Arms"], 
          exercises: [
            { id: "ex-3", name: "Pull-ups", sets: [{ id: "s4", setNumber: 1, reps: 10, weight: 0 }] }, 
            { id: "ex-4", name: "Barbell Rows", sets: [{ id: "s5", setNumber: 1, reps: 8, weight: 135 }] }
          ] 
        },
        { 
          id: "demo-push-day", name: "Push Day", muscleGroups: ["Chest", "Shoulders", "Arms"], 
          exercises: [
            { id: "ex-5", name: "Barbell Bench Press", sets: [{ id: "s6", setNumber: 1, reps: 5, weight: 185 }, { id: "s7", setNumber: 2, reps: 5, weight: 185 }] }, 
            { id: "ex-6", name: "Overhead Press (Strict)", sets: [{ id: "s8", setNumber: 1, reps: 8, weight: 115 }] }
          ] 
        }
      ];
      
      const demoPrograms = [
        { id: "demo-prog-1", name: "4-Week MaxOut Plan", lengthInDays: 14, schedule: [{ dayNumber: 1, routineId: "demo-leg-day" }, { dayNumber: 3, routineId: "demo-push-day" }, { dayNumber: 5, routineId: "demo-pull-day" }] }
      ];

      // Simulated 30-day progression for 1RM and Radar
      const demoWorkouts = [
        // Week 1
        { id: "dw-1", date: new Date(now - dayMs*28).toISOString(), muscleGroups: ["Legs"], exercises: [{ id: "we-1", name: "Barbell Squat", sets: [{ id: "ws-1", setNumber: 1, reps: 8, weight: 205, completed: true }, { id: "ws-2", setNumber: 2, reps: 8, weight: 205, completed: true }]}] },
        { id: "dw-2", date: new Date(now - dayMs*26).toISOString(), muscleGroups: ["Chest", "Shoulders", "Arms"], exercises: [{ id: "we-2", name: "Barbell Bench Press", sets: [{ id: "ws-3", setNumber: 1, reps: 8, weight: 165, completed: true }, { id: "ws-4", setNumber: 2, reps: 8, weight: 165, completed: true }]}] },
        { id: "dw-3", date: new Date(now - dayMs*24).toISOString(), muscleGroups: ["Back", "Arms"], exercises: [{ id: "we-3", name: "Pull-ups", sets: [{ id: "ws-5", setNumber: 1, reps: 10, weight: 0, completed: true }]}] },
        // Week 2 (Progression)
        { id: "dw-4", date: new Date(now - dayMs*21).toISOString(), muscleGroups: ["Legs"], exercises: [{ id: "we-4", name: "Barbell Squat", sets: [{ id: "ws-6", setNumber: 1, reps: 6, weight: 215, completed: true }, { id: "ws-7", setNumber: 2, reps: 6, weight: 215, completed: true }]}] },
        { id: "dw-5", date: new Date(now - dayMs*19).toISOString(), muscleGroups: ["Chest", "Shoulders", "Arms"], exercises: [{ id: "we-5", name: "Barbell Bench Press", sets: [{ id: "ws-8", setNumber: 1, reps: 6, weight: 175, completed: true }]}] },
        // Week 3 (Progression)
        { id: "dw-6", date: new Date(now - dayMs*14).toISOString(), muscleGroups: ["Legs"], exercises: [{ id: "we-6", name: "Barbell Squat", sets: [{ id: "ws-9", setNumber: 1, reps: 5, weight: 225, completed: true }, { id: "ws-10", setNumber: 2, reps: 5, weight: 225, completed: true }]}] },
        { id: "dw-7", date: new Date(now - dayMs*12).toISOString(), muscleGroups: ["Chest", "Shoulders", "Arms"], exercises: [{ id: "we-7", name: "Barbell Bench Press", sets: [{ id: "ws-11", setNumber: 1, reps: 5, weight: 185, completed: true }]}] },
        { id: "dw-8", date: new Date(now - dayMs*10).toISOString(), muscleGroups: ["Back", "Arms"], exercises: [{ id: "we-8", name: "Pull-ups", sets: [{ id: "ws-12", setNumber: 1, reps: 12, weight: 0, completed: true }, { id: "ws-13", setNumber: 2, reps: 8, weight: 25, completed: true }]}] },
        // Week 4 (Latest)
        { id: "dw-9", date: new Date(now - dayMs*4).toISOString(), muscleGroups: ["Legs"], exercises: [{ id: "we-9", name: "Barbell Squat", sets: [{ id: "ws-14", setNumber: 1, reps: 3, weight: 235, completed: true }]}] },
        { id: "dw-10", date: new Date(now - dayMs*2).toISOString(), muscleGroups: ["Chest", "Shoulders", "Arms"], exercises: [{ id: "we-10", name: "Barbell Bench Press", sets: [{ id: "ws-15", setNumber: 1, reps: 3, weight: 195, completed: true }]}] },
      ];

      // Simulated cutting/recomp bodyweight over 30 days
      const demoBodyweights = [
        { id: "dbw-1", date: new Date(now - dayMs*30).toISOString(), weight: 185.0 },
        { id: "dbw-2", date: new Date(now - dayMs*25).toISOString(), weight: 184.2 },
        { id: "dbw-3", date: new Date(now - dayMs*18).toISOString(), weight: 183.5 },
        { id: "dbw-4", date: new Date(now - dayMs*10).toISOString(), weight: 182.1 },
        { id: "dbw-5", date: new Date(now - dayMs*2).toISOString(), weight: 181.0 },
      ];

      // Insert all dummy data and hard reload
      localStorage.setItem('workout_tracker_routines', JSON.stringify(demoRoutines));
      localStorage.setItem('workout_tracker_programs', JSON.stringify(demoPrograms));
      localStorage.setItem('workout_tracker_data', JSON.stringify(demoWorkouts));
      localStorage.setItem('workout_tracker_bodyweights', JSON.stringify(demoBodyweights));
      
      window.location.reload();
    }
  };

  return (
    <div className="w-full h-full flex flex-col pb-8 items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 px-1">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[var(--color-brand-600)]" />
            Settings & Data
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your app data and backup your progress locally.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-[var(--color-text-main)]">
              <Download className="w-5 h-5 text-green-500" />
              Export Data
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Save a copy of your entire workout history, routines, and physical stats to a JSON file.
            </p>
            <button 
              onClick={handleExport}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              Export Backup (.json)
            </button>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-[var(--color-text-main)]">
              <Upload className="w-5 h-5 text-blue-500" />
              Import Data
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Restore your previously exported IronForge workout backup. This will overwrite any current data!
            </p>
            
            <div className="relative w-full h-12">
              <input 
                type="file" 
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="absolute inset-0 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg flex items-center justify-center font-bold text-sm pointer-events-none transition-colors">
                Choose Backup File
              </div>
            </div>
            
            {importStatus && (
              <div className={`mt-3 text-sm font-semibold text-center ${importStatus.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                {importStatus}
              </div>
            )}
          </div>

          <div className="bg-[var(--color-bg-card)] border border-red-500/30 rounded-xl p-5 shadow-sm mt-12">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-red-500">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Completely wipe all data associated with this app from this device.
            </p>
            <button 
              onClick={handleClearAll}
              className="w-full bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-3 rounded-lg transition-colors active:scale-[0.98]"
            >
              Reset All Data
            </button>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-5 shadow-sm mt-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-[var(--color-text-main)]">
              🧪 Testing & Demo
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Need test data? This will load a pre-configured template, routine, and a previous workout to test the history and flow features.
            </p>
            <button 
              onClick={handleLoadDemoData}
              className="w-full bg-[var(--color-bg-base)] border-2 border-dashed border-[var(--color-brand-500)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)]/5 font-bold py-3 rounded-lg transition-colors active:scale-[0.98]"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
