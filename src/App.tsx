import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout'));
const Stats = lazy(() => import('./pages/Stats'));
const Routines = lazy(() => import('./pages/Routines'));
const Session = lazy(() => import('./pages/Session'));
const Settings = lazy(() => import('./pages/Settings'));
const Achievements = lazy(() => import('./pages/Achievements'));

function App() {
  return (
    <div className="animate-fade-in-up h-full w-full">
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="stats" element={<Stats />} />
              <Route path="routines" element={<Routines />} />
              <Route path="session" element={<Session />} />
              <Route path="settings" element={<Settings />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="workout" element={<ActiveWorkout />} />
              <Route path="workout/:id" element={<ActiveWorkout />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
