import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { PrivateRoute } from './components/PrivateRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout'));
const Stats = lazy(() => import('./pages/Stats'));
const Routines = lazy(() => import('./pages/Routines'));
const Session = lazy(() => import('./pages/Session'));
const Settings = lazy(() => import('./pages/Settings'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <div className="animate-fade-in-up h-full w-full">
          <BrowserRouter>
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center h-screen bg-[var(--color-bg-base)]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--color-brand-500)] border-t-transparent" />
              </div>
            }>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />

                {/* Protected */}
                <Route element={<PrivateRoute />}>
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
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </div>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;
