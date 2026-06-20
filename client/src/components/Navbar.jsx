import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { FaHeart, FaShieldAlt, FaSignOutAlt, FaSearch, FaCompass, FaUsers, FaComments, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  const navItems = [
    { name: 'Discover', path: '/discover', icon: FaCompass },
    { name: 'Search', path: '/search', icon: FaSearch },
    { name: 'Teams', path: '/teams', icon: FaUsers },
    { name: 'Chats', path: '/chat', icon: FaComments },
    { name: 'Interested In You', path: '/interested', icon: FaHeart, color: 'emerald' },
    { name: 'Portfolio', path: '/profile', icon: FaUser },
  ];

  if (user && user.isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: FaShieldAlt, color: 'purple' });
  }

  const navigateTo = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 bg-[#030014]/65 backdrop-blur-2xl border-b border-white/5 flex flex-row items-center justify-between transition-all duration-300 hw-accelerate">
      {/* Brand Logo */}
      <div 
        onClick={() => navigate('/discover')} 
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/35 group-hover:rotate-[12deg] group-hover:scale-105 transition-all duration-300">
          H
        </div>
        <span className="font-cabinet text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-emerald-200 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
          HackMate <span className="font-sans text-[10px] px-2 py-0.5 ml-1 bg-white/5 border border-white/10 rounded-full text-indigo-300 font-bold tracking-wider uppercase align-middle">AI</span>
        </span>
      </div>

      {/* Desktop Navigation */}
      {user && (
        <div className="hidden md:flex flex-wrap items-center justify-center gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = isActive(item.path);
            
            let activeClasses = 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-inner';
            let inactiveClasses = 'text-slate-400 hover:text-white border-transparent hover:bg-white/[0.04]';
            
            if (item.color === 'emerald') {
              activeClasses = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
              inactiveClasses = 'text-emerald-400/90 hover:text-emerald-300 border-transparent hover:bg-white/[0.04]';
            } else if (item.color === 'purple') {
              activeClasses = 'bg-purple-600/20 border-purple-500/40 text-purple-400';
              inactiveClasses = 'text-purple-400 hover:text-purple-300 border-transparent hover:bg-white/[0.04]';
            }

            return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border ${isItemActive ? activeClasses : inactiveClasses}`}
              >
                <Icon className="text-[10px]" /> {item.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-2">
        {user && <NotificationBell />}
        {user && (
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 hover:bg-red-500/20"
            title="Logout"
          >
            <FaSignOutAlt className="text-[10px]" /> Logout
          </button>
        )}
      </div>

      {/* Mobile Right Side (Icons + Hamburger) */}
      <div className="flex md:hidden items-center gap-3">
        {user && <NotificationBell />}
        {user && (
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <FaBars />
          </button>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-[#0f172a] border-l border-white/10 shadow-2xl z-50 flex flex-col p-5 md:hidden hw-accelerate"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-cabinet text-xl font-black tracking-tight text-white">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigateTo(item.path)}
                      className={`flex items-center gap-3 p-4 rounded-xl text-sm font-semibold transition-colors ${
                        isItemActive 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className={isItemActive ? 'text-indigo-400' : 'text-slate-400'} />
                      {item.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
