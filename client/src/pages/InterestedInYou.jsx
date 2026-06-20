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
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      
      <Navbar />

      {/* ── Main Content ── */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 relative z-10">
        {/* Page Header */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl sm:text-4xl font-cabinet font-black tracking-tight text-white mb-2">
            Interested In <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">You</span>
          </h1>
          <p className="text-sm font-sans text-slate-400">
            Hackers who swiped right on your profile. Like them back to create an instant match!
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[350px] space-y-4 glass-panel rounded-3xl border border-white/5">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <FaHeart className="absolute text-indigo-400 text-sm animate-pulse" />
            </div>
            <p className="text-xs font-outfit text-slate-400 font-semibold tracking-wider uppercase">Finding who's interested...</p>
          </div>
        ) : interestedUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[350px] space-y-6 text-center glass-panel rounded-3xl border border-white/5 p-8"
          >
            <div className="w-16 h-16 bg-slate-900/80 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 text-2xl shadow-inner shadow-black/40">
              <FaHeart className="text-indigo-500/40" />
            </div>
            <div>
              <h3 className="text-xl font-cabinet font-black text-white">No likes yet</h3>
              <p className="text-sm font-sans text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                When someone swipes right or super likes your profile, they will appear here.
                Keep your skills and projects updated to attract teams!
              </p>
            </div>
            <button
              onClick={() => navigate('/discover')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-outfit text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
            >
              <FaArrowLeft /> Back to Discover
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {interestedUsers.map((person, idx) => {
                const isSuperLike = person.swipeAction === 'super';
                const isProcessing = processingIds.has(person._id);

                return (
                  <motion.div
                    key={person._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ delay: idx * 0.04, type: 'spring', stiffness: 200, damping: 20 }}
                    className={`relative rounded-3xl overflow-hidden glass-panel border ${
                      isSuperLike
                        ? 'border-yellow-500/30 shadow-2xl shadow-yellow-500/5 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-yellow-950/10'
                        : 'border-white/5 bg-slate-900/20 hover:border-white/10'
                    } group`}
                  >
                    {/* Super Like badge */}
                    {isSuperLike && (
                      <div className="absolute top-4 right-4 z-20">
                        <motion.div
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[9px] font-cabinet font-black px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider shadow-md backdrop-blur-sm"
                        >
                          <FaStar className="text-[9px]" /> Super Like
                        </motion.div>
                      </div>
                    )}

                    {/* Banner */}
                    <div
                      className={`h-24 relative overflow-hidden ${
                        isSuperLike
                          ? 'bg-gradient-to-r from-yellow-900/20 via-amber-900/10 to-orange-900/20'
                          : 'bg-gradient-to-r from-indigo-900/20 via-purple-900/10 to-pink-900/20'
                      }`}
                    >
                      {/* GitHub Score Badge */}
                      {person.githubScore > 0 && (
                        <div className="absolute top-4 left-4 flex items-center gap-1 bg-slate-950/80 border border-white/10 px-2 py-1 rounded-lg backdrop-blur-sm shadow-md">
                          <FaGithub className="text-slate-400 text-[10px]" />
                          <span className="text-[10px] font-outfit font-bold text-emerald-400">
                            {person.githubScore}
                          </span>
                        </div>
                      )}
                      
                      {/* Grid background effect */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
                    </div>

                    {/* Content */}
                    <div className="px-5 pb-5 relative">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-950 absolute -top-8 shadow-xl p-0.5 group-hover:border-indigo-500/20 transition-all duration-300">
                        <img
                          src={
                            person.avatar?.secureUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=0f172a&color=cbd5e1&size=128`
                          }
                          alt={person.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      {/* Info */}
                      <div className="pt-10 space-y-2">
                        <h3 className="text-base font-cabinet font-black text-white truncate group-hover:text-indigo-300 transition-colors">
                          {person.name}
                        </h3>
                        
                        <p className="text-[11px] font-outfit text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-300">
                            <FaBriefcase className="text-[9px] text-indigo-400" /> {person.role}
                          </span>
                          {person.college && (
                            <span className="flex items-center gap-1">
                              <FaGraduationCap className="text-[9px]" /> {person.college}
                            </span>
                          )}
                          {person.city && (
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="text-[9px]" /> {person.city}
                            </span>
                          )}
                        </p>

                        {/* Skills preview */}
                        {person.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {person.skills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 text-[9px] font-outfit font-semibold px-2 py-0.5 rounded-md"
                              >
                                {s}
                              </span>
                            ))}
                            {person.skills.length > 3 && (
                              <span className="text-[9px] font-outfit text-slate-500 font-bold self-center ml-1">
                                +{person.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Time ago */}
                        {person.swipedAt && (
                          <p className="text-[10px] font-sans text-slate-500 mt-2">
                            Swiped {formatTimeAgo(person.swipedAt)}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/5 font-outfit">
                        <button
                          onClick={() => handleSwipeBack(person, 'left')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold text-red-400 border border-red-500/10 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                        >
                          <FaTimes className="text-[10px]" /> Pass
                        </button>
                        <button
                          onClick={() => navigate(`/profile/${person._id}`)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold text-slate-300 border border-white/5 bg-slate-900 rounded-xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                        >
                          <FaUser className="text-[10px]" /> View
                        </button>
                        <button
                          onClick={() => handleSwipeBack(person, 'right')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl hover:shadow-lg hover:shadow-emerald-500/10 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
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
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default InterestedInYou;
