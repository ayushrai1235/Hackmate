import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence, motion } from 'framer-motion';

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

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 }
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2
};

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="hw-accelerate"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

        {/* Protected routes requiring onboarding */}
        <Route element={<ProtectedRoute requireOnboarding={true} />}>
          <Route path="/discover" element={<PageWrapper><Discover /></PageWrapper>} />
          <Route path="/search" element={<PageWrapper><Search /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/profile/:id" element={<PageWrapper><PublicProfile /></PageWrapper>} />
          <Route path="/interested" element={<PageWrapper><InterestedInYou /></PageWrapper>} />
          <Route path="/teams" element={<PageWrapper><Teams /></PageWrapper>} />
          <Route path="/teams/create" element={<PageWrapper><CreateTeam /></PageWrapper>} />
          <Route path="/teams/:id" element={<PageWrapper><TeamDetail /></PageWrapper>} />
          <Route path="/teams/:id/edit" element={<PageWrapper><CreateTeam isEdit={true} /></PageWrapper>} />
          <Route path="/chat" element={<PageWrapper><Chat /></PageWrapper>} />
          <Route path="/notifications" element={<PageWrapper><Notifications /></PageWrapper>} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute requireOnboarding={true} requireAdmin={true} />}>
          <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        </Route>

        {/* Protected route NOT requiring onboarding (for the onboarding flow itself) */}
        <Route element={<ProtectedRoute requireOnboarding={false} />}>
          <Route path="/onboarding" element={<PageWrapper><Onboarding /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
