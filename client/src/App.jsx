import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';

import Home from './pages/Home';
import Stats from './pages/Stats';
import Add from './pages/Add';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import AddSchedule from './pages/AddSchedule';
import HabitDetails from './pages/HabitDetails';
import LogHabit from './pages/LogHabit';
import EditProfile from './pages/EditProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><Add /></ProtectedRoute>} />
        <Route path="/add/schedule" element={<ProtectedRoute><AddSchedule /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/habit/:id" element={<ProtectedRoute><HabitDetails /></ProtectedRoute>} />
        <Route path="/habit/:id/log" element={<ProtectedRoute><LogHabit /></ProtectedRoute>} />
      </Routes>

      {user && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <HabitProvider>
          <AppContent />
        </HabitProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;