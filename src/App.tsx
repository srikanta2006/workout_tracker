import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { Stats } from './pages/Stats';
import { Routines } from './pages/Routines';
import { Session } from './pages/Session';
import { Settings } from './pages/Settings';
import { Achievements } from './pages/Achievements';

function App() {
  return (
    <div className="animate-fade-in-up h-full w-full">
      <BrowserRouter>
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
      </BrowserRouter>
    </div>
  );
}

export default App;
