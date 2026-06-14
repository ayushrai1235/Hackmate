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
import NotificationBell from '../components/NotificationBell';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ── Top Navbar ── */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            H
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            HackMate AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => navigate('/teams')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            Teams
          </button>
          <button
            onClick={() => navigate('/interested')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <FaHeart className="text-[10px]" /> Interested In You
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            Chats
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            My Portfolio
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-grow flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 py-6">
        {/* Role Filters */}
        <div className="flex justify-center gap-1.5 mb-6 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/60 w-full">
          {['all', 'developer', 'designer', 'product manager', 'other'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentIndex(0);
              }}
              className={`flex-1 text-center py-2 text-[11px] font-semibold rounded-lg capitalize transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'product manager' ? 'PM' : tab === 'other' ? 'Other' : tab}
            </button>
          ))}
        </div>

        {/* Keyboard hints */}
        <AnimatePresence>
          {showKeyHints && !loading && visibleCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 mb-4 bg-slate-900/50 border border-slate-800/40 px-4 py-2 rounded-xl"
            >
              <FaKeyboard className="text-slate-500 text-xs" />
              <span className="text-[10px] text-slate-500">
                <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">←</kbd> Pass{' '}
                <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">→</kbd> Like{' '}
                <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">↑</kbd> Super
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Card Stack ── */}
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <p className="text-xs text-slate-500">Searching matching hackers...</p>
          </div>
        ) : (
          <div className="relative w-full h-[520px]">
            <AnimatePresence mode="popLayout">
              {visibleCards.length > 0
                ? visibleCards
                    .map((cardUser, idx) => {
                      const isTop = idx === 0;
                      // Stack effect: cards behind are scaled down and shifted
                      const cardStyle = {
                        scale: 1 - idx * 0.04,
                        y: idx * -8,
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
                className="absolute inset-0 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 text-xl">
                  <FaUsers className="text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No More Hackers Nearby</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                    You've reviewed all developers matching your search. Refresh to check for new
                    profiles or adjust your filters!
                  </p>
                </div>
                <button
                  onClick={resetDeck}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                >
                  <FaSync /> Refresh Deck
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Feed status */}
        {!loading && visibleCards.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-600">
              {currentIndex + 1} of {filteredUsers.length} profiles
              {hasMore && ' (more loading...)'}
            </p>
          </div>
        )}
      </main>

      {/* ── Inspector Modal ── */}
      <AnimatePresence>
        {inspectorUser && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
            >
              {/* Close */}
              <button
                onClick={() => setInspectorUser(null)}
                className="absolute top-4 right-4 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 p-2 rounded-full text-xs transition-all"
              >
                <FaTimes className="text-sm" />
              </button>

              {/* Developer Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-slate-800/60">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-800 flex-shrink-0 shadow-lg">
                  <img
                    src={
                      inspectorUser.avatar?.secureUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(inspectorUser.name)}&background=1e293b&color=94a3b8&size=128`
                    }
                    alt={inspectorUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center sm:text-left space-y-1.5 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
                      {inspectorUser.name}
                      {inspectorUser.githubScore > 0 && (
                        <GitHubBadge score={inspectorUser.githubScore} />
                      )}
                    </h2>
                    <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full inline-block mx-auto sm:mx-0">
                      {inspectorUser.availability || 'Available'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                    <span className="flex items-center gap-0.5">
                      <FaBriefcase className="text-slate-500" /> {inspectorUser.role} ·{' '}
                      {inspectorUser.experienceLevel}
                    </span>
                    {inspectorUser.college && (
                      <span className="flex items-center gap-0.5">
                        <FaGraduationCap className="text-slate-500" /> {inspectorUser.college}
                        {inspectorUser.yearOfStudy ? ` (${inspectorUser.yearOfStudy})` : ''}
                      </span>
                    )}
                    {inspectorUser.city && (
                      <span className="flex items-center gap-0.5">
                        <FaMapMarkerAlt className="text-slate-500" /> {inspectorUser.city}
                      </span>
                    )}
                  </p>

                  {/* Match Score */}
                  {inspectorUser.matchScore !== undefined && (
                    <div className="mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          inspectorUser.matchScore >= 75
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : inspectorUser.matchScore >= 45
                              ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                              : 'text-slate-400 border-slate-600/30 bg-slate-600/10'
                        }`}
                      >
                        {inspectorUser.matchScore}% Match Score
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-5">
                  <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Bio
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{inspectorUser.bio || 'Code mechanic crafting solutions.'}"
                    </p>
                  </div>

                  {inspectorUser.skills?.length > 0 && (
                    <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Competencies
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {inspectorUser.skills.map((s) => (
                          <span
                            key={s}
                            className="bg-blue-900/15 text-blue-400 border border-blue-800/15 text-[10px] px-2 py-0.5 rounded font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inspectorUser.techStack?.length > 0 && (
                    <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Toolbox
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {inspectorUser.techStack.map((t) => (
                          <span
                            key={t}
                            className="bg-emerald-900/15 text-emerald-400 border border-emerald-800/15 text-[10px] px-2 py-0.5 rounded font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inspectorUser.lookingFor?.length > 0 && (
                    <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Looking For
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {inspectorUser.lookingFor.map((l) => (
                          <span
                            key={l}
                            className="bg-purple-900/15 text-purple-400 border border-purple-800/15 text-[10px] px-2 py-0.5 rounded font-medium"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* GitHub Stats */}
                <div className="md:col-span-2 space-y-6">
                  {inspectorUser.githubUsername ? (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                        <FaGithub /> Full Skill Analysis
                      </h3>
                      <GitHubStats
                        githubData={inspectorUser.githubData || inspectorUser}
                        githubScore={inspectorUser.githubScore}
                        username={inspectorUser.githubUsername}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-950/20 border border-slate-800/60 rounded-2xl text-slate-500 text-xs italic">
                      No connected GitHub account.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                <button
                  onClick={() => setInspectorUser(null)}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate(`/profile/${inspectorUser._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10"
                >
                  Inspect Portfolio <FaArrowRight className="text-[10px]" />
                </button>
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
