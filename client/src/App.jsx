import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import InterestedInYou from './pages/InterestedInYou';
import Teams from './pages/Teams';
import CreateTeam from './pages/CreateTeam';
import TeamDetail from './pages/TeamDetail';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Landing from './pages/Landing';
import Search from './pages/Search';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes requiring onboarding */}
            <Route element={<ProtectedRoute requireOnboarding={true} />}>
              <Route path="/discover" element={<Discover />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/interested" element={<InterestedInYou />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/create" element={<CreateTeam />} />
              <Route path="/teams/:id" element={<TeamDetail />} />
              <Route path="/teams/:id/edit" element={<CreateTeam isEdit={true} />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute requireOnboarding={true} requireAdmin={true} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Protected route NOT requiring onboarding (for the onboarding flow itself) */}
            <Route element={<ProtectedRoute requireOnboarding={false} />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>
          </Routes>
        </Router>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
