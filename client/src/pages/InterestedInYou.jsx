import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaHeart,
  FaTimes,
  FaStar,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaSpinner,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaGithub,
} from 'react-icons/fa';
import swipeService from '../services/swipeService';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

const InterestedInYou = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [interestedUsers, setInterestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchInterested();
  }, []);

  const fetchInterested = async () => {
    setLoading(true);
    try {
      const data = await swipeService.getInterestedInMe();
      setInterestedUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching interested users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeBack = async (targetUser, action) => {
    if (processingIds.has(targetUser._id)) return;

    setProcessingIds((prev) => new Set([...prev, targetUser._id]));

    try {
      const result = await swipeService.createSwipe(targetUser._id, action);

      // Remove from list after action
      setInterestedUsers((prev) => prev.filter((u) => u._id !== targetUser._id));

      if (result.matched) {
        // The match modal will be triggered via socket in the main layout
        // For now, a brief notification
      }
    } catch (err) {
      console.error('Swipe back error:', err);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUser._id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/discover')}
            className="text-slate-400 hover:text-white transition-colors p-1.5"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <FaHeart className="text-xs" />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-rose-400 via-pink-300 to-purple-400 bg-clip-text text-transparent">
              Interested In You
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg font-mono">
            {interestedUsers.length} {interestedUsers.length === 1 ? 'person' : 'people'}
          </span>
          <NotificationBell />
          <button
            onClick={() => navigate('/teams')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            Teams
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            Chats
          </button>
          <button
            onClick={() => navigate('/discover')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            Back to Discover
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
            <FaSpinner className="animate-spin text-4xl text-rose-500" />
            <p className="text-xs text-slate-500">Finding who's interested...</p>
          </div>
        ) : interestedUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[400px] space-y-6 text-center"
          >
            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-600 text-3xl">
              <FaHeart />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">No Likes Yet</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                When someone swipes right or super likes your profile, they'll appear here.
                Keep your profile polished to attract more interest!
              </p>
            </div>
            <button
              onClick={() => navigate('/discover')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
            >
              <FaArrowLeft /> Back to Discover
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {interestedUsers.map((person, idx) => {
                const isSuperLike = person.swipeAction === 'super';
                const isProcessing = processingIds.has(person._id);

                return (
                  <motion.div
                    key={person._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative rounded-2xl overflow-hidden border shadow-xl ${
                      isSuperLike
                        ? 'border-yellow-500/30 shadow-yellow-500/10 bg-gradient-to-br from-slate-900 via-slate-900 to-yellow-950/20'
                        : 'border-slate-800/80 bg-slate-900/60'
                    }`}
                  >
                    {/* Super Like badge */}
                    {isSuperLike && (
                      <div className="absolute top-3 right-3 z-10">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          <FaStar className="text-[10px]" /> Super Like
                        </motion.div>
                      </div>
                    )}

                    {/* Banner */}
                    <div
                      className={`h-20 relative ${
                        isSuperLike
                          ? 'bg-gradient-to-r from-yellow-900/30 via-amber-900/20 to-orange-900/30'
                          : 'bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40'
                      }`}
                    >
                      {person.githubScore > 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-950/70 border border-slate-800 px-1.5 py-0.5 rounded">
                          <FaGithub className="text-slate-300 text-[9px]" />
                          <span className="text-[9px] font-bold text-emerald-400">
                            {person.githubScore}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-4 relative">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-900 absolute -top-7 shadow-lg">
                        <img
                          src={
                            person.avatar?.secureUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1e293b&color=94a3b8&size=128`
                          }
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="pt-9 space-y-1.5">
                        <h3 className="text-sm font-bold text-white truncate">{person.name}</h3>
                        <p className="text-[10px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="flex items-center gap-0.5">
                            <FaBriefcase className="text-[8px]" /> {person.role}
                          </span>
                          {person.college && (
                            <span className="flex items-center gap-0.5">
                              <FaGraduationCap className="text-[8px]" /> {person.college}
                            </span>
                          )}
                          {person.city && (
                            <span className="flex items-center gap-0.5">
                              <FaMapMarkerAlt className="text-[8px]" /> {person.city}
                            </span>
                          )}
                        </p>

                        {/* Skills preview */}
                        {person.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {person.skills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="bg-blue-900/15 text-blue-400 border border-blue-800/10 text-[9px] px-1.5 py-0.5 rounded font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {person.skills.length > 3 && (
                              <span className="text-[9px] text-slate-500">
                                +{person.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Time ago */}
                        {person.swipedAt && (
                          <p className="text-[9px] text-slate-600 mt-1">
                            {formatTimeAgo(person.swipedAt)}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => handleSwipeBack(person, 'left')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-red-400 border border-red-500/20 bg-red-500/5 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50 active:scale-95"
                        >
                          <FaTimes className="text-[10px]" /> Pass
                        </button>
                        <button
                          onClick={() => navigate(`/profile/${person._id}`)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-slate-300 border border-slate-700 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-all active:scale-95"
                        >
                          <FaUser className="text-[10px]" /> View
                        </button>
                        <button
                          onClick={() => handleSwipeBack(person, 'right')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50 active:scale-95"
                        >
                          <FaHeart className="text-[10px]" /> Like
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

// ── Helper: format relative time ──
function formatTimeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default InterestedInYou;
