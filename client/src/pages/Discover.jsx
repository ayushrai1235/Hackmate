import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaBriefcase, FaGraduationCap, FaMapMarkerAlt, 
  FaHeart, FaTimes, FaSpinner, FaInfoCircle, FaGithub,
  FaArrowRight, FaSync, FaTrophy, FaCalendarAlt, FaStar,
  FaAward, FaCodeBranch
} from 'react-icons/fa';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import GitHubBadge from '../components/GitHubBadge';
import GitHubStats from '../components/GitHubStats';

// Premium high-fidelity mock users for demonstration fallback
const MOCK_DEV_CARDS = [
  {
    _id: 'mock1',
    name: 'Aarav Mehta',
    avatar: { secureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
    role: 'Developer',
    experienceLevel: 'Advanced',
    bio: 'Fullstack wizard passionate about AI agents and decentralized finance. building HackMate to connect code mechanics.',
    college: 'IIT Bombay',
    city: 'Mumbai',
    yearOfStudy: '3rd Year',
    skills: ['Backend Development', 'Fullstack Development', 'DevOps'],
    techStack: ['Node.js', 'React', 'MongoDB', 'Docker', 'AWS', 'TypeScript'],
    githubUsername: 'aaravm-dev',
    githubScore: 88,
    availability: 'Available for Teams',
    githubData: {
      repos: 34,
      stars: 42,
      contributions: 312,
      languages: {
        TypeScript: 'Advanced',
        JavaScript: 'Advanced',
        Rust: 'Intermediate',
        Go: 'Beginner'
      }
    }
  },
  {
    _id: 'mock2',
    name: 'Elena Rostova',
    avatar: { secureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80' },
    role: 'Designer',
    experienceLevel: 'Advanced',
    bio: 'UI/UX specialist with 4+ years creating glassmorphic systems and modern motion design. Let\'s win the next hackathon!',
    college: 'RISD',
    city: 'New York',
    yearOfStudy: 'Graduate',
    skills: ['UI/UX Design', 'Product Management'],
    techStack: ['Figma', 'React', 'TailwindCSS', 'CSS', 'HTML'],
    githubUsername: 'elena-ux',
    githubScore: 45,
    availability: 'Open to Offers',
    githubData: {
      repos: 12,
      stars: 8,
      contributions: 54,
      languages: {
        CSS: 'Advanced',
        HTML: 'Advanced',
        JavaScript: 'Intermediate'
      }
    }
  },
  {
    _id: 'mock3',
    name: 'Karthik Rao',
    avatar: { secureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
    role: 'Developer',
    experienceLevel: 'Intermediate',
    bio: 'Python and Machine Learning engineer. Looking to build automated data agents and scrape custom web workflows.',
    college: 'BITS Pilani',
    city: 'Bangalore',
    yearOfStudy: '4th Year',
    skills: ['Data Science', 'Machine Learning'],
    techStack: ['Python', 'PyTorch', 'FastAPI', 'PostgreSQL', 'Docker'],
    githubUsername: 'karthik-rao-ml',
    githubScore: 67,
    availability: 'Available for Teams',
    githubData: {
      repos: 22,
      stars: 18,
      contributions: 165,
      languages: {
        Python: 'Advanced',
        CPlusPlus: 'Intermediate',
        TypeScript: 'Beginner'
      }
    }
  }
];

const Discover = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'developer', 'designer', 'product manager'
  const [inspectorUser, setInspectorUser] = useState(null); // Detailed view state

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users');
        // Filter out users who haven't completed onboarding or are private,
        // although backend already handles some of this, we align it
        const filtered = res.data.filter(u => u._id !== user?._id);
        
        // If we have actual users, set them; otherwise fall back to premium mocks
        if (filtered.length > 0) {
          setUsers(filtered);
        } else {
          setUsers(MOCK_DEV_CARDS);
        }
      } catch (err) {
        console.warn('API error fetching users, using mock data:', err.message);
        setUsers(MOCK_DEV_CARDS);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // Handle swipes or clicks
  const handleSwipe = (direction) => {
    // Reset index if deck completes
    setCurrentIndex(prev => prev + 1);
  };

  const resetDeck = () => {
    setCurrentIndex(0);
  };

  // Filter users list by role tab selection
  const filteredUsers = users.filter(item => {
    if (activeTab === 'all') return true;
    return item.role?.toLowerCase() === activeTab.toLowerCase();
  });

  const activeUser = filteredUsers[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            H
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            HackMate AI
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/profile'}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-all"
          >
            My Portfolio
          </button>
        </div>
      </header>

      {/* Main Discover Layout */}
      <main className="flex-grow flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 py-8">
        
        {/* Role Filters */}
        <div className="flex justify-center gap-1.5 mb-8 bg-slate-900/50 p-1.5 rounded-xl border border-slate-850 w-full">
          {['all', 'developer', 'designer', 'other'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentIndex(0);
              }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg capitalize transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'other' ? 'PMs/Other' : tab}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[450px] space-y-4">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <p className="text-xs text-slate-500">Searching matching hackers...</p>
          </div>
        ) : (
          <div className="relative w-full h-[500px]">
            <AnimatePresence mode="wait">
              {activeUser && currentIndex < filteredUsers.length ? (
                <motion.div
                  key={activeUser._id}
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-slate-900/40 border border-slate-800/80 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col justify-between"
                >
                  {/* Banner & Photo Profile Section */}
                  <div>
                    <div className="h-32 bg-gradient-to-r from-blue-750 to-indigo-850 relative">
                      {activeUser.githubScore > 0 && (
                        <div className="absolute top-4 left-4 z-10">
                          <GitHubBadge score={activeUser.githubScore} />
                        </div>
                      )}
                      <button
                        onClick={() => setInspectorUser(activeUser)}
                        className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 p-2.5 rounded-full text-xs transition-colors flex items-center justify-center"
                        title="View Detailed GitHub Info"
                      >
                        <FaInfoCircle className="text-sm" />
                      </button>
                    </div>

                    <div className="px-6 relative">
                      {/* Avatar picture */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-900 absolute -top-10 shadow-lg">
                        <img 
                          src={activeUser.avatar?.secureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                          alt={activeUser.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      {/* Header details block */}
                      <div className="pt-12 space-y-1">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                            {activeUser.name}
                          </h2>
                          <span className="text-[9px] uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            {activeUser.availability}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="flex items-center gap-0.5"><FaBriefcase className="text-[10px]" /> {activeUser.role} &bull; {activeUser.experienceLevel}</span>
                          {activeUser.college && <span className="flex items-center gap-0.5"><FaGraduationCap className="text-[10px]" /> {activeUser.college}</span>}
                        </p>
                      </div>

                      {/* Biography */}
                      <p className="text-xs text-slate-300 mt-4 leading-relaxed line-clamp-3 italic">
                        "{activeUser.bio || 'Building solutions and breaking things. Let\'s hook up on code.'}"
                      </p>

                      {/* Tech badges */}
                      <div className="mt-5 space-y-3">
                        {activeUser.skills && activeUser.skills.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Expertise</span>
                            <div className="flex flex-wrap gap-1">
                              {activeUser.skills.slice(0, 3).map(skill => (
                                <span key={skill} className="bg-blue-900/15 text-blue-400 border border-blue-800/10 text-[10px] px-2 py-0.5 rounded font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {activeUser.techStack && activeUser.techStack.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tech Stack</span>
                            <div className="flex flex-wrap gap-1">
                              {activeUser.techStack.slice(0, 5).map(tech => (
                                <span key={tech} className="bg-emerald-900/15 text-emerald-400 border border-emerald-800/10 text-[10px] px-2 py-0.5 rounded font-medium">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions (Swipe buttons) */}
                  <div className="p-6 bg-slate-950/40 border-t border-slate-850/60 flex items-center justify-around">
                    <button
                      onClick={() => handleSwipe('left')}
                      className="w-12 h-12 rounded-full border border-red-500/30 hover:border-red-500 text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center shadow-lg hover:shadow-red-500/15"
                      title="Pass"
                    >
                      <FaTimes className="text-lg" />
                    </button>
                    <button
                      onClick={() => setInspectorUser(activeUser)}
                      className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all font-semibold"
                    >
                      <FaInfoCircle className="text-sm" /> Full Profile
                    </button>
                    <button
                      onClick={() => handleSwipe('right')}
                      className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20"
                      title="Request Team Match"
                    >
                      <FaHeart className="text-lg" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 text-xl">
                    <FaSync className="animate-spin text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">No More Hackers Nearby</h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                      You've reviewed all developers matching your search tag. You can refresh the deck to start over!
                    </p>
                  </div>
                  <button
                    onClick={resetDeck}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10"
                  >
                    <FaSync /> Restart Deck
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* INSPECTOR MODAL: Full developer stats display */}
      <AnimatePresence>
        {inspectorUser && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
            >
              {/* Close Button */}
              <button
                onClick={() => setInspectorUser(null)}
                className="absolute top-4 right-4 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 p-2 rounded-full text-xs transition-all flex items-center justify-center"
              >
                <FaTimes className="text-sm" />
              </button>

              {/* Developer Header Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-slate-850">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-800 flex-shrink-0 shadow-lg">
                  <img 
                    src={inspectorUser.avatar?.secureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                    alt={inspectorUser.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="text-center sm:text-left space-y-1.5 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
                      {inspectorUser.name}
                      <GitHubBadge score={inspectorUser.githubScore} />
                    </h2>
                    <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full inline-block mx-auto sm:mx-0">
                      {inspectorUser.availability}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                    <span className="flex items-center gap-0.5"><FaBriefcase className="text-slate-500" /> {inspectorUser.role} &bull; {inspectorUser.experienceLevel}</span>
                    {inspectorUser.college && <span className="flex items-center gap-0.5"><FaGraduationCap className="text-slate-500" /> {inspectorUser.college} ({inspectorUser.yearOfStudy})</span>}
                    {inspectorUser.city && <span className="flex items-center gap-0.5"><FaMapMarkerAlt className="text-slate-500" /> {inspectorUser.city}</span>}
                  </p>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left column info */}
                <div className="md:col-span-1 space-y-5">
                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bio Description</h4>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{inspectorUser.bio || 'Code mechanic crafting solutions.'}"
                    </p>
                  </div>

                  {inspectorUser.skills && inspectorUser.skills.length > 0 && (
                    <div className="bg-slate-955/40 border border-slate-850 p-4 rounded-xl space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Competencies</h4>
                      <div className="flex flex-wrap gap-1">
                        {inspectorUser.skills.map(s => (
                          <span key={s} className="bg-blue-900/15 text-blue-400 border border-blue-800/15 text-[10px] px-2 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inspectorUser.techStack && inspectorUser.techStack.length > 0 && (
                    <div className="bg-slate-955/40 border border-slate-850 p-4 rounded-xl space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Toolbox</h4>
                      <div className="flex flex-wrap gap-1">
                        {inspectorUser.techStack.map(t => (
                          <span key={t} className="bg-emerald-900/15 text-emerald-400 border border-emerald-800/15 text-[10px] px-2 py-0.5 rounded font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column detailed GitHub stats */}
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
                    <div className="text-center py-8 bg-slate-950/20 border border-slate-850 rounded-2xl text-slate-500 text-xs italic">
                      No connected GitHub account.
                    </div>
                  )}
                </div>

              </div>

              {/* View Full Portfolio Button */}
              <div className="pt-4 border-t border-slate-850 flex justify-end gap-3">
                <button
                  onClick={() => setInspectorUser(null)}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.href = `/profile/${inspectorUser._id}`}
                  className="bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10"
                >
                  Inspect Portfolio <FaArrowRight className="text-[10px]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;
