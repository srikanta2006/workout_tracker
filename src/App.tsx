import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ActiveWorkout } from './pages/ActiveWorkout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workout" element={<ActiveWorkout />} />
          <Route path="workout/:id" element={<ActiveWorkout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
