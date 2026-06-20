import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { FaHeart, FaShieldAlt, FaSignOutAlt, FaSearch, FaCompass, FaUsers, FaComments, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 bg-[#030014]/65 backdrop-blur-2xl border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
      {/* Brand Logo */}
      <div className="flex items-center justify-between w-full md:w-auto">
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

        {/* Mobile quick icons (Notifications) */}
        <div className="md:hidden flex items-center gap-2">
          {user && <NotificationBell />}
        </div>
      </div>

      {/* Navigation Buttons */}
      {user && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto bg-white/[0.02] border border-white/5 p-1 rounded-2xl">
          {/* Discover */}
          <button
            onClick={() => navigate('/discover')}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border ${
              isActive('/discover')
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-inner'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <FaCompass className="text-[10px]" /> Discover
          </button>

          {/* Search */}
          <button
            onClick={() => navigate('/search')}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border ${
              isActive('/search')
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-inner'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <FaSearch className="text-[10px]" /> Search
          </button>

          {/* Teams */}
          <button
            onClick={() => navigate('/teams')}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border ${
              isActive('/teams')
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-inner'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <FaUsers className="text-[10px]" /> Teams
          </button>

          {/* Chats */}
          <button
            onClick={() => navigate('/chat')}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border ${
              isActive('/chat')
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-inner'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <FaComments className="text-[10px]" /> Chats
          </button>

          {/* Interested In You */}
          <button
            onClick={() => navigate('/interested')}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border ${
              isActive('/interested')
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'text-emerald-400/90 hover:text-emerald-300 border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <FaHeart className="text-[10px]" /> Interested In You
          </button>

          {/* My Portfolio */}
          <button
            onClick={() => navigate('/profile')}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border ${
              isActive('/profile')
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-inner'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <FaUser className="text-[10px]" /> Portfolio
          </button>

          {/* Admin Dashboard */}
          {user.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border ${
                isActive('/admin')
                  ? 'bg-purple-600/20 border-purple-500/40 text-purple-400'
                  : 'text-purple-400 hover:text-purple-300 border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <FaShieldAlt className="text-[10px]" /> Admin
            </button>
          )}

          {/* Desktop Notification & Logout */}
          <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 hover:bg-red-500/20"
              title="Logout"
            >
              <FaSignOutAlt className="text-[10px]" /> Logout
            </button>
          </div>

          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="md:hidden text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <FaSignOutAlt className="text-[10px]" /> Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
