import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Discover from './pages/Discover';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected routes requiring onboarding */}
            <Route element={<ProtectedRoute requireOnboarding={true} />}>
              <Route path="/discover" element={<Discover />} />
              {/* Add more protected routes here */}
            </Route>

            {/* Protected route NOT requiring onboarding (for the onboarding flow itself) */}
            <Route element={<ProtectedRoute requireOnboarding={false} />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
