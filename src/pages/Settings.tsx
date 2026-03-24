import { useState } from 'react';
import { Download, Upload, Trash2, Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
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
    a.download = `parkwise_workout_backup_${new Date().toISOString().split('T')[0]}.json`;
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
      } catch (err) {
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

  return (
    <div className="w-full h-full flex flex-col pb-8">
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
            Restore your previously exported ParkWise workout backup. This will overwrite any current data!
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
      </div>
    </div>
  );
}
