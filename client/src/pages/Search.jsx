import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';
import GitHubBadge from '../components/GitHubBadge';
import swipeService from '../services/swipeService';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  FaSearch, FaHeart, FaStar, FaUser, FaBuilding, FaMapMarkerAlt, 
  FaBriefcase, FaGraduationCap, FaChevronLeft, FaChevronRight, 
  FaTimes, FaComment, FaCode, FaRegFrown, FaFilter 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Search = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  
  // Detail Modal & Match states
  const [selectedUser, setSelectedUser] = useState(null);
  const [swipeLoading, setSwipeLoading] = useState({});
  const [matchData, setMatchData] = useState(null); // { matchedUser }

  const fetchUsers = async (currentFilters = filters, currentPage = page) => {
    setLoading(true);
    try {
      // Format arrays to comma separated values for standard query parsing
      const queryParams = {
        ...currentFilters,
        role: currentFilters.role?.join(','),
        skills: currentFilters.skills?.join(','),
        techStack: currentFilters.techStack?.join(','),
        lookingFor: currentFilters.lookingFor?.join(','),
        page: currentPage,
        limit: 8
      };

      const res = await api.get('/users/search', { params: queryParams });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.totalUsers);
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // reset to page 1 on filter changes
    fetchUsers(newFilters, 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentName = filters.name || '';
      if (currentName !== searchTerm) {
        handleFilterChange({ ...filters, name: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchUsers(filters, newPage);
  };

  const handleSwipe = async (targetId, action) => {
    setSwipeLoading(prev => ({ ...prev, [targetId]: true }));
    try {
      const res = await swipeService.createSwipe(targetId, action);
      if (res.matched) {
        const matchedUser = users.find(u => u._id === targetId) || selectedUser;
        setMatchData({ matchedUser });
      }
      
      // Remove swiped user from list or update status
      setUsers(prev => prev.filter(u => u._id !== targetId));
      if (selectedUser && selectedUser._id === targetId) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error(`Error swiping ${action} on user:`, err);
      alert(err.response?.data?.message || 'Failed to record swipe.');
    } finally {
      setSwipeLoading(prev => ({ ...prev, [targetId]: false }));
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030014] text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="fixed top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/[0.07] blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[35%] h-[35%] rounded-full bg-emerald-500/[0.05] blur-[100px] pointer-events-none" />
      <Navbar />

      <div className="relative flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 z-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 font-cabinet">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FaSearch className="text-lg" />
              </div>
              Discover Teammates
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1.5 font-outfit">
              Search the global HackMate community, filter by criteria, and request matches.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="glass-panel text-xs font-semibold px-3.5 py-1.5 rounded-full text-slate-300 border border-white/5">
              {totalUsers} Hacker{totalUsers !== 1 ? 's' : ''} Found
            </span>
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden flex items-center gap-1.5 text-xs font-semibold glass-panel hover:bg-white/[0.06] px-3.5 py-1.5 rounded-full transition-all border border-white/5"
            >
              <FaFilter /> Filters
            </button>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full max-w-2xl mx-auto mb-2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input w-full pl-11 pr-4 py-3.5 text-sm font-medium"
          />
        </div>

        {/* Content Body Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 relative items-start">
          {/* Desktop Filter Panel Column */}
          <div className="hidden lg:block w-72 shrink-0">
            <FilterPanel onFilterChange={handleFilterChange} initialFilters={filters} />
          </div>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showFiltersMobile && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setShowFiltersMobile(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 h-full w-[280px] bg-[#0f172a] border-r border-white/10 shadow-2xl z-50 flex flex-col p-5 lg:hidden overflow-y-auto hw-accelerate"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-cabinet text-xl font-black tracking-tight text-white">Filters</span>
                    <button 
                      onClick={() => setShowFiltersMobile(false)}
                      className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <FilterPanel onFilterChange={handleFilterChange} initialFilters={filters} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Results Column */}
          <div className="flex-1 w-full space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-10 h-10 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400 font-medium font-outfit">Filtering hackers...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 glass-panel rounded-2xl border border-white/5">
                <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
                  <FaRegFrown className="text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 font-cabinet">No Hackers Match Your Criteria</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-outfit">
                  Try clearing some filter tags, adjusting the minimum GitHub score, or widening your role searches.
                </p>
              </div>
            ) : (
              <>
                {/* Users Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <div 
                      key={user._id}
                      className="glass-panel card-glow-indigo rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group"
                    >
                      <div className="space-y-4">
                        {/* Header: Avatar, Info, GitHub Score */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {user.avatar?.secureUrl ? (
                              <img 
                                src={user.avatar.secureUrl} 
                                alt={user.name} 
                                className="w-12 h-12 rounded-xl object-cover border border-slate-800 group-hover:scale-105 transition-transform" 
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-slate-400 text-lg">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-white text-sm hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                                {user.name}
                              </h3>
                              <p className="text-xxs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                <span className="text-slate-400">{user.role}</span>
                                <span>•</span>
                                <span>{user.experienceLevel}</span>
                              </p>
                            </div>
                          </div>

                          {user.githubUsername && (
                            <GitHubBadge score={user.githubScore} />
                          )}
                        </div>

                        {/* Availability & Location */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xxs font-semibold text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${user.availability === 'Not Available' ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                            {user.availability || 'Available'}
                          </span>
                          {(user.college || user.city) && <span>•</span>}
                          {user.college && (
                            <span className="flex items-center gap-1" title={user.college}>
                              <FaGraduationCap className="text-slate-500" /> {user.college.length > 22 ? user.college.substring(0, 20) + '...' : user.college}
                            </span>
                          )}
                          {user.city && (
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="text-slate-500" /> {user.city}
                            </span>
                          )}
                        </div>

                        {/* Bio */}
                        {user.bio && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {user.bio}
                          </p>
                        )}

                        {/* Skills & Tech tags */}
                        <div className="space-y-1.5">
                          {user.skills && user.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {user.skills.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-xxs font-semibold bg-blue-950/20 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded-md">
                                  {skill}
                                </span>
                              ))}
                              {user.skills.length > 3 && (
                                <span className="text-xxs font-semibold text-slate-500 px-1 py-0.5">
                                  +{user.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {user.techStack && user.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {user.techStack.slice(0, 3).map((tech, i) => (
                                <span key={i} className="text-xxs font-semibold bg-emerald-955/20 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-md">
                                  {tech}
                                </span>
                              ))}
                              {user.techStack.length > 3 && (
                                <span className="text-xxs font-semibold text-slate-500 px-1 py-0.5">
                                  +{user.techStack.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center gap-2 border-t border-white/5 mt-5 pt-4">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex-1 text-center bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 text-xs font-bold py-2.5 rounded-xl transition-all font-outfit"
                        >
                          View Details
                        </button>
                        
                        {/* Like Buttons */}
                        <button
                          onClick={() => handleSwipe(user._id, 'super')}
                          disabled={swipeLoading[user._id]}
                          className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300 transition-all"
                          title="Super Like"
                        >
                          <FaStar className="text-sm" />
                        </button>
                        
                        <button
                          onClick={() => handleSwipe(user._id, 'right')}
                          disabled={swipeLoading[user._id]}
                          className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-all flex items-center justify-center"
                          title="Like Teammate"
                        >
                          <FaHeart className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center glass-panel rounded-2xl p-4 mt-6 border border-white/5">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-colors font-outfit"
                    >
                      <FaChevronLeft /> Previous
                    </button>
                    <span className="text-xs font-semibold text-slate-400 font-outfit">
                      Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-colors font-outfit"
                    >
                      Next <FaChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-[#030014]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative border border-white/5">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-955/50 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white transition-all z-10"
            >
              <FaTimes />
            </button>

            <div className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left border-b border-slate-850 pb-6">
                {selectedUser.avatar?.secureUrl ? (
                  <img 
                    src={selectedUser.avatar.secureUrl} 
                    alt={selectedUser.name} 
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-800 shadow-md" 
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-slate-400 text-3xl">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
                    {selectedUser.githubUsername && <GitHubBadge score={selectedUser.githubScore} />}
                  </div>
                  <p className="text-xs font-semibold text-slate-400">{selectedUser.role} • {selectedUser.experienceLevel}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xxs font-semibold text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedUser.availability === 'Not Available' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      {selectedUser.availability || 'Available'}
                    </span>
                    {selectedUser.college && (
                      <span className="flex items-center gap-1">
                        <FaGraduationCap /> {selectedUser.college}
                      </span>
                    )}
                    {selectedUser.city && (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt /> {selectedUser.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</h4>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedUser.bio}</p>
                </div>
              )}

              {/* Skills and Tech Stack */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><FaCode /> Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUser.skills.map((skill, i) => (
                        <span key={i} className="text-xs font-semibold bg-blue-950/30 text-blue-300 border border-blue-900/40 px-2.5 py-1 rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.techStack && selectedUser.techStack.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><FaCode /> Tech Stack</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUser.techStack.map((tech, i) => (
                        <span key={i} className="text-xs font-semibold bg-emerald-950/30 text-emerald-300 border border-emerald-900/40 px-2.5 py-1 rounded-lg">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Looking for */}
              {selectedUser.lookingFor && selectedUser.lookingFor.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><FaUser /> Looking For</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.lookingFor.map((item, i) => (
                      <span key={i} className="text-xs font-semibold bg-purple-950/30 text-purple-300 border border-purple-900/40 px-2.5 py-1 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub detailed statistics if loaded */}
              {selectedUser.githubUsername && (
                <div className="space-y-3 bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">GitHub Integration</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{selectedUser.githubData?.repos || 0}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Repos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{selectedUser.githubData?.stars || 0}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Stars</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{selectedUser.githubData?.contributions || 0}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Contributions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-400">{selectedUser.githubScore || 0}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Score</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal footer actions */}
              <div className="flex items-center gap-3 border-t border-slate-850 pt-5">
                <button
                  onClick={() => handleSwipe(selectedUser._id, 'super')}
                  disabled={swipeLoading[selectedUser._id]}
                  className="flex-1 inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  <FaStar /> Super Like
                </button>
                <button
                  onClick={() => handleSwipe(selectedUser._id, 'right')}
                  disabled={swipeLoading[selectedUser._id]}
                  className="flex-1 inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  <FaHeart /> Like Teammate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Celebration Screen Overlay */}
      {matchData && (
        <div className="fixed inset-0 bg-[#030014]/95 z-[55] flex flex-col items-center justify-center p-6 text-center">
          {/* Confetti simulation elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-2 h-2 bg-blue-500 rounded-full top-1/4 left-1/4 animate-bounce delay-100" />
            <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full top-1/3 right-1/4 animate-bounce" />
            <div className="absolute w-2 h-2 bg-purple-500 rounded-full bottom-1/4 left-1/2 animate-ping" />
          </div>

          <div className="space-y-6 max-w-md relative z-10">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent animate-pulse tracking-tight">
              It's a Match!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold">
              You and <strong className="text-emerald-400">{matchData.matchedUser.name}</strong> liked each other! Let's get building.
            </p>

            {/* Combined Match Avatars */}
            <div className="flex justify-center items-center gap-6 py-6">
              {currentUser?.avatar?.secureUrl ? (
                <img 
                  src={currentUser.avatar.secureUrl} 
                  alt="You" 
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/50 scale-105" 
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-600 border-2 border-blue-400 flex items-center justify-center font-bold text-white text-3xl">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'Y'}
                </div>
              )}
              
              <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-emerald-500" />

              {matchData.matchedUser.avatar?.secureUrl ? (
                <img 
                  src={matchData.matchedUser.avatar.secureUrl} 
                  alt="Teammate" 
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/50 scale-105" 
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-600 border-2 border-emerald-400 flex items-center justify-center font-bold text-white text-3xl">
                  {matchData.matchedUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button
                onClick={() => {
                  setMatchData(null);
                  navigate('/chat');
                }}
                className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/10 transition-all text-sm"
              >
                <FaComment /> Start Chatting
              </button>
              <button
                onClick={() => setMatchData(null)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-3 rounded-xl text-xs font-semibold transition-all text-slate-300"
              >
                Keep Discovering
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Search;
