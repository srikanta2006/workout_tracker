import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AppModeProvider } from './context/AppModeContext';
import { DietProvider } from './context/DietContext';

const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout.tsx'));
const Stats = lazy(() => import('./pages/Stats.tsx'));
const Routines = lazy(() => import('./pages/Routines.tsx'));
const Session = lazy(() => import('./pages/Session.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const Achievements = lazy(() => import('./pages/Achievements.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.tsx'));

// Diet Pages (Eat Mode)
const NutritionDashboard = lazy(() => import('./pages/NutritionDashboard.tsx'));
const MealLog = lazy(() => import('./pages/MealLog.tsx'));
const WaterLog = lazy(() => import('./pages/WaterLog.tsx'));
const DietStats = lazy(() => import('./pages/DietStats.tsx'));
const WeightLog = lazy(() => import('./pages/WeightLog.tsx'));
const BodyStats = lazy(() => import('./pages/BodyStats.tsx'));
const DietPlanner = lazy(() => import('./pages/DietPlanner.tsx'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppModeProvider>
          <DietProvider>
            <WorkoutProvider>
              <div className="animate-fade-in-up h-full w-full">
                <Suspense fallback={
                  <div className="flex-1 flex items-center justify-center h-screen bg-[var(--color-bg-base)]">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
                  </div>
                }>
                  <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="stats" element={<Stats />} />
                        <Route path="routines" element={<Routines />} />
                        <Route path="session" element={<Session />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="achievements" element={<Achievements />} />
                        <Route path="workout" element={<ActiveWorkout />} />
                        <Route path="workout/:id" element={<ActiveWorkout />} />

                        {/* Diet Routes */}
                        <Route path="diet" element={<NutritionDashboard />} />
                        <Route path="meals" element={<MealLog />} />
                        <Route path="water" element={<WaterLog />} />
                        <Route path="diet-stats" element={<DietStats />} />
                        <Route path="weight" element={<WeightLog />} />
                        <Route path="body-stats" element={<BodyStats />} />
                        <Route path="planner" element={<DietPlanner />} />
                      </Route>
                    </Route>
                  </Routes>
                </Suspense>
              </div>
            </WorkoutProvider>
          </DietProvider>
        </AppModeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
