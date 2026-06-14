import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaSpinner,
  FaSync,
  FaHeart,
  FaTimes,
  FaStar,
  FaInfoCircle,
  FaGithub,
  FaArrowRight,
  FaBriefcase,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaUsers,
  FaKeyboard,
} from 'react-icons/fa';
import swipeService from '../services/swipeService';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { SocketContext } from '../context/SocketContext';
import SwipeCard from '../components/SwipeCard';
import MatchModal from '../components/MatchModal';
import GitHubBadge from '../components/GitHubBadge';
import GitHubStats from '../components/GitHubStats';

const Discover = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [inspectorUser, setInspectorUser] = useState(null);

  // Match modal state
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchData, setMatchData] = useState(null);

  // Keyboard hints
  const [showKeyHints, setShowKeyHints] = useState(true);

  // ── Fetch Feed ──
  const fetchFeed = useCallback(
    async (pageNum = 1, append = false) => {
      if (!append) setLoading(true);
      try {
        const data = await swipeService.getFeed(pageNum, 15);
        if (append) {
          setUsers((prev) => [...prev, ...data.users]);
        } else {
          setUsers(data.users);
        }
        setHasMore(pageNum < data.totalPages);
        setPage(pageNum);
      } catch (err) {
        console.error('Error fetching feed:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  // ── Load more when nearing end ──
  useEffect(() => {
    const remaining = filteredUsers.length - currentIndex;
    if (remaining <= 3 && hasMore && !loading) {
      fetchFeed(page + 1, true);
    }
  }, [currentIndex]);

  // ── Socket listener for match events ──
  useEffect(() => {
    if (!socket) return;
    const handleMatch = (data) => {
      setMatchData(data);
      setMatchModalOpen(true);
    };
    socket.on('match:created', handleMatch);
    return () => socket.off('match:created', handleMatch);
  }, [socket]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e) => {
      if (inspectorUser || matchModalOpen) return;
      if (swiping) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleSwipe('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSwipe('right');
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleSwipe('super');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, inspectorUser, matchModalOpen, swiping]);

  // Hide keyboard hints after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowKeyHints(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // ── Swipe Handler ──
  const handleSwipe = async (direction) => {
    const activeUser = filteredUsers[currentIndex];
    if (!activeUser || swiping) return;

    setSwiping(true);
    setCurrentIndex((prev) => prev + 1);

    try {
      const result = await swipeService.createSwipe(activeUser._id, direction);

      if (result.matched && result.match) {
        // Fetch full user data for match modal
        setMatchData({
          match: result.match,
          chat: result.chat,
          users: [user, activeUser],
        });
        setMatchModalOpen(true);
      }
    } catch (err) {
      console.error('Swipe error:', err);
      // If it's a super like limit error, show a note but don't revert
      if (err.response?.status === 429) {
        // Could show a toast here
        console.warn('Super like limit reached');
      }
    } finally {
      setSwiping(false);
    }
  };

  // ── Match Modal Close ──
  const handleMatchClose = (action) => {
    setMatchModalOpen(false);
    setMatchData(null);

    if (action === 'chat' && matchData?.chat) {
      // Navigate to chat (future route)
      // navigate(`/chat/${matchData.chat._id}`);
    } else if (action === 'team') {
      // Navigate to team creation (future route)
      // navigate('/teams/create');
    }
    // 'continue' = stay on discover
  };

  // ── Reset / Refresh ──
  const resetDeck = () => {
    setCurrentIndex(0);
    setPage(1);
    fetchFeed(1);
  };

  // ── Filter by role ──
  const filteredUsers = users.filter((item) => {
    if (activeTab === 'all') return true;
    return item.role?.toLowerCase() === activeTab.toLowerCase();
  });

  // Get the visible stack (top 3 cards)
  const visibleCards = filteredUsers.slice(currentIndex, currentIndex + 3);
  const deckEmpty = currentIndex >= filteredUsers.length && !loading;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

      <Navbar />

      {/* ── Main Content ── */}
      <main className="flex-grow flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 py-8 z-10 relative">
        {/* Role Filters */}
        <div className="flex justify-center gap-1.5 mb-8 bg-slate-950/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 w-full shadow-2xl">
          {['all', 'developer', 'designer', 'product manager', 'other'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentIndex(0);
                }}
                className={`flex-1 text-center py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 border-t border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab === 'product manager' ? 'PM' : tab === 'other' ? 'Other' : tab}
              </button>
            );
          })}
        </div>

        {/* Keyboard hints */}
        <AnimatePresence>
          {showKeyHints && !loading && visibleCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 mb-6 bg-slate-900/60 backdrop-blur-md border border-white/5 px-4.5 py-2.5 rounded-2xl shadow-xl z-20"
            >
              <FaKeyboard className="text-slate-400 text-xs animate-bounce" />
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                <kbd className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded-lg text-slate-300 font-mono text-[9px] shadow-sm">←</kbd> Pass
                <kbd className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded-lg text-slate-300 font-mono text-[9px] shadow-sm">→</kbd> Like
                <kbd className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded-lg text-slate-300 font-mono text-[9px] shadow-sm">↑</kbd> Super
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Card Stack ── */}
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[520px] space-y-5">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-indigo-400 rounded-full animate-spin" />
            </div>
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Searching matching hackers...</p>
          </div>
        ) : (
          <div className="relative w-full h-[525px]">
            <AnimatePresence mode="popLayout">
              {visibleCards.length > 0
                ? visibleCards
                    .map((cardUser, idx) => {
                      const isTop = idx === 0;
                      // Stack effect: cards behind are scaled down and shifted
                      const cardStyle = {
                        scale: 1 - idx * 0.04,
                        y: idx * -10,
                        zIndex: 3 - idx,
                      };

                      return (
                        <SwipeCard
                          key={cardUser._id}
                          user={cardUser}
                          isTop={isTop}
                          style={cardStyle}
                          onSwipe={isTop ? handleSwipe : undefined}
                          onViewProfile={setInspectorUser}
                        />
                      );
                    })
                    .reverse() // Render bottom cards first so top card overlays
                : null}
            </AnimatePresence>

            {/* ── Empty State ── */}
            {deckEmpty && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-900/10 border border-dashed border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-[2px]"
              >
                <div className="w-16 h-16 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 text-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
                  <FaUsers className="text-slate-500 z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-cabinet font-black text-white leading-tight">Deck Completed</h3>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed font-light">
                    You've reviewed all developers matching your search. Expand your filters or refresh to load new profiles!
                  </p>
                </div>
                <button
                  onClick={resetDeck}
                  className="bg-indigo-500 hover:bg-indigo-650 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 border-t border-white/10"
                >
                  <FaSync className="text-xs" /> Refresh Deck
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Feed status */}
        {!loading && visibleCards.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {currentIndex + 1} of {filteredUsers.length} profiles
              {hasMore && <span className="text-indigo-400 animate-pulse"> (more loading...)</span>}
            </p>
          </div>
        )}
      </main>

      {/* ── Inspector Modal ── */}
      <AnimatePresence>
        {inspectorUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-slate-950 border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative space-y-6 scrollbar-thin scrollbar-thumb-white/10"
            >
              {/* Top Mesh Header Panel */}
              <div className="h-32 bg-gradient-to-tr from-indigo-950 via-slate-950 to-emerald-950/20 relative border-b border-white/5 overflow-hidden p-6 flex items-end">
                <div className="absolute inset-0 bg-radial-at-t from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                
                {/* Close */}
                <button
                  onClick={() => setInspectorUser(null)}
                  className="absolute top-4 right-4 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 p-2.5 rounded-full text-xs transition-all shadow-lg"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Inspector Content container */}
              <div className="px-6 pb-6 space-y-6">
                {/* Developer Header Details */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-white/5 relative -mt-16 z-10">
                  <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 shadow-2xl">
                    <img
                      src={
                        inspectorUser.avatar?.secureUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(inspectorUser.name)}&background=131520&color=6366f1&size=128`
                      }
                      alt={inspectorUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center sm:text-left space-y-2 flex-grow pt-10 sm:pt-14">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-2xl font-cabinet font-black text-white flex items-center justify-center sm:justify-start gap-2.5 leading-tight tracking-tight">
                        {inspectorUser.name}
                        {inspectorUser.githubScore > 0 && (
                          <GitHubBadge score={inspectorUser.githubScore} />
                        )}
                      </h2>
                      <span className="text-[9px] uppercase font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full inline-block mx-auto sm:mx-0">
                        {inspectorUser.availability || 'Available'}
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1">
                      <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                        <FaBriefcase className="text-[9px] text-indigo-400" /> {inspectorUser.role} · {inspectorUser.experienceLevel}
                      </span>
                      {inspectorUser.college && (
                        <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                          <FaGraduationCap className="text-[9px] text-emerald-400" /> {inspectorUser.college}
                          {inspectorUser.yearOfStudy ? ` (${inspectorUser.yearOfStudy})` : ''}
                        </span>
                      )}
                      {inspectorUser.city && (
                        <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                          <FaMapMarkerAlt className="text-[9px] text-pink-400" /> {inspectorUser.city}
                        </span>
                      )}
                    </div>

                    {/* Match Score */}
                    {inspectorUser.matchScore !== undefined && (
                      <div className="mt-1.5 flex justify-center sm:justify-start">
                        <span
                          className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded border ${
                            inspectorUser.matchScore >= 75
                              ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                              : inspectorUser.matchScore >= 45
                                ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                : 'text-slate-400 border-white/5 bg-white/5'
                          }`}
                        >
                          {inspectorUser.matchScore}% Compatibility
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio & Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl space-y-2">
                      <h4 className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                        Bio
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed italic font-light">
                        "{inspectorUser.bio || 'Code mechanic crafting solutions.'}"
                      </p>
                    </div>

                    {inspectorUser.skills?.length > 0 && (
                      <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl space-y-2">
                        <h4 className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                          Competencies
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {inspectorUser.skills.map((s) => (
                            <span
                              key={s}
                              className="bg-indigo-950/25 text-indigo-400 border border-indigo-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {inspectorUser.techStack?.length > 0 && (
                      <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl space-y-2">
                        <h4 className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                          Toolbox
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {inspectorUser.techStack.map((t) => (
                            <span
                              key={t}
                              className="bg-emerald-950/25 text-emerald-400 border border-emerald-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {inspectorUser.lookingFor?.length > 0 && (
                      <div className="bg-slate-900/40 border border-white/5 p-4.5 rounded-2xl space-y-2">
                        <h4 className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                          Looking For
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {inspectorUser.lookingFor.map((l) => (
                            <span
                              key={l}
                              className="bg-purple-950/25 text-purple-400 border border-purple-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GitHub Stats */}
                  <div className="md:col-span-2 space-y-4">
                    {inspectorUser.githubUsername ? (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <FaGithub className="text-indigo-400" /> GitHub Insights
                        </h3>
                        <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-4">
                          <GitHubStats
                            githubData={inspectorUser.githubData || inspectorUser}
                            githubScore={inspectorUser.githubScore}
                            username={inspectorUser.githubUsername}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl text-slate-500 text-xs italic font-light">
                        No connected GitHub account.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-5 border-t border-white/5 flex justify-end gap-3 z-10">
                  <button
                    onClick={() => setInspectorUser(null)}
                    className="bg-slate-900 border border-white/10 hover:bg-slate-800 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${inspectorUser._id}`)}
                    className="bg-indigo-500 hover:bg-indigo-650 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20 border-t border-white/10"
                  >
                    Inspect Portfolio <FaArrowRight className="text-[10px]" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Match Modal ── */}
      <MatchModal
        isOpen={matchModalOpen}
        onClose={handleMatchClose}
        matchData={matchData}
        currentUser={user}
      />
    </div>
  );
};

export default Discover;
