import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSpinner, FaSearch, FaPlus, FaBookmark, FaRegBookmark, 
  FaUsers, FaHeart, FaExclamationTriangle, FaEye, FaShieldAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import teamService from '../services/teamService';
import Navbar from '../components/Navbar';

const Teams = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, mine, saved
  const [savedTeamIds, setSavedTeamIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // teamId of action in progress

  // Load saved teams from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedTeams');
    if (saved) {
      try {
        setSavedTeamIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch teams based on active tab and search query
  const fetchTeams = async (pageNum = 1) => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const data = await teamService.discoverTeams(pageNum, searchQuery);
        setTeams(data.teams || []);
        setPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.pages || 1);
      } else if (activeTab === 'mine') {
        const data = await teamService.getMyTeams();
        // client-side search filtering for "mine"
        const filtered = (data.teams || []).filter(team => 
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setTeams(filtered);
        setPage(1);
        setTotalPages(1);
      } else if (activeTab === 'saved') {
        // We fetch all discovery teams (or my teams) and filter by saved status
        const data = await teamService.discoverTeams(1, searchQuery);
        // client-side filter for saved teams
        const filtered = (data.teams || []).filter(team => savedTeamIds.includes(team._id));
        setTeams(filtered);
        setPage(1);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams(1);
  }, [activeTab, searchQuery, savedTeamIds.length]);

  // Handle Save / Bookmark toggle
  const toggleSaveTeam = (teamId) => {
    let updated;
    if (savedTeamIds.includes(teamId)) {
      updated = savedTeamIds.filter(id => id !== teamId);
    } else {
      updated = [...savedTeamIds, teamId];
    }
    setSavedTeamIds(updated);
    localStorage.setItem('savedTeams', JSON.stringify(updated));
  };

  // Handle Request to Join
  const handleJoinRequest = async (teamId) => {
    if (actionLoading) return;
    setActionLoading(teamId);
    try {
      await teamService.requestToJoin(teamId);
      alert('Join request sent successfully!');
      // Refresh teams to update UI state
      fetchTeams(page);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to send join request');
    } finally {
      setActionLoading(null);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (score >= 50) return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Main Layout ── */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        
        {/* Banner with Title and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/20 border border-white/5 rounded-3xl p-6.5 backdrop-blur-md shadow-2xl shadow-indigo-500/5">
          <div className="space-y-1">
            <h1 className="text-3xl font-cabinet font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
              Team Discovery
            </h1>
            <p className="text-xs text-slate-400 font-sans font-medium">
              Browse formed teams, analyze their composition compatibility, and request to join the perfect stack.
            </p>
          </div>
          <button
            onClick={() => navigate('/teams/create')}
            className="sm:self-center px-5.5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:via-indigo-500 hover:to-emerald-500 text-white font-outfit font-black rounded-2xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
          >
            <FaPlus className="text-[10px]" /> Create Team
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab Filters */}
          <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 w-fit">
            {[
              { id: 'all', label: 'All Teams' },
              { id: 'mine', label: 'My Teams' },
              { id: 'saved', label: 'Saved Teams' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setTeams([]);
                }}
                className={`px-5 py-2.5 text-xs font-outfit font-bold rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <FaSearch className="text-xs" />
            </span>
            <input
              type="text"
              placeholder="Search by team name or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 focus:bg-slate-900/80 transition-all font-outfit font-medium"
            />
          </div>
        </div>

        {/* ── Teams Discovery Grid ── */}
        {loading && teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <FaSpinner className="animate-spin text-4xl text-indigo-500" />
            <p className="text-xs text-slate-500 font-sans">Scanning matching teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-slate-900/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 text-lg">
              <FaUsers className="text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-cabinet font-bold text-white">No Teams Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-sans leading-relaxed">
                {activeTab === 'saved' 
                  ? "You haven't bookmarked any teams yet." 
                  : activeTab === 'mine' 
                    ? "You aren't currently part of any team. Create one!" 
                    : "No teams matched your criteria. Try adjusting filters."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const isOwner = team.owner?._id?.toString() === user?._id?.toString() || team.owner === user?._id;
              const isMember = team.members?.some(m => (m._id || m) === user?._id);
              const isPending = team.joinRequests?.some(id => id === user?._id);
              const isInvited = team.invites?.some(id => id === user?._id);
              const isSaved = savedTeamIds.includes(team._id);

              return (
                <motion.div
                  key={team._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/30 backdrop-blur-sm border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-950 border border-white/5 flex-shrink-0 flex items-center justify-center shadow-inner">
                          {team.logo?.secureUrl ? (
                            <img src={team.logo.secureUrl} alt={team.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-cabinet font-extrabold text-sm text-slate-400 uppercase">
                              {team.name.substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 
                            onClick={() => navigate(`/teams/${team._id}`)}
                            className="font-cabinet font-extrabold text-sm text-white group-hover:text-indigo-400 cursor-pointer transition-colors tracking-wide"
                          >
                            {team.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-medium font-sans">{team.hackathonName || 'Hackathon Project'}</p>
                        </div>
                      </div>

                      {/* Save & Health Badges */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleSaveTeam(team._id)}
                          className={`p-2.5 rounded-xl border transition-all text-xs ${
                            isSaved 
                              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30 shadow-inner' 
                              : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300 hover:border-slate-800'
                          }`}
                          title={isSaved ? "Saved" : "Save Team"}
                        >
                          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                        <span className={`text-[10px] font-cabinet font-black tracking-wider px-2.5 py-1.5 rounded-xl ${getHealthColor(team.teamHealthScore)}`}>
                          {team.teamHealthScore}% Health
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans">
                      {team.description || 'No description provided.'}
                    </p>

                    {/* Required Roles */}
                    {team.requiredRoles && team.requiredRoles.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider font-outfit">Required Roles</span>
                        <div className="flex flex-wrap gap-1.5">
                          {team.requiredRoles.map((role) => (
                            <span
                              key={role}
                              className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] px-2.5 py-1 rounded-lg font-outfit font-bold tracking-wide capitalize shadow-sm"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tech Stack */}
                    {team.techStack && team.techStack.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider font-outfit">Stack</span>
                        <div className="flex flex-wrap gap-1.5">
                          {team.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] px-2.5 py-1 rounded-lg font-outfit font-bold tracking-wide shadow-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Members List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider font-outfit">
                        Teammates ({team.members?.length || 0}/6)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2.5 overflow-hidden">
                          {team.members?.map((member) => (
                            <img
                              key={member._id || member}
                              className="inline-block h-7 w-7 rounded-xl ring-2 ring-slate-950 object-cover border border-white/5 hover:scale-110 transition-transform duration-200 cursor-pointer"
                              src={member.avatar?.secureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'H')}&background=random`}
                              alt={member.name || 'Member'}
                              title={`${member.name || 'Teammate'} (${member.role || 'Contributor'})`}
                            />
                          ))}
                        </div>
                        {team.members?.length >= 6 && (
                          <span className="text-[9px] text-rose-400 font-bold bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/20 font-sans">Full</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-3">
                    <button
                      onClick={() => navigate(`/teams/${team._id}`)}
                      className="flex-1 bg-slate-950 hover:bg-slate-900 border border-white/5 text-white text-xs font-outfit font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <FaEye className="text-[10px]" /> View Team
                    </button>

                    {isOwner ? (
                      <button
                        onClick={() => navigate(`/teams/${team._id}`)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-outfit font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                      >
                        Manage Team
                      </button>
                    ) : isMember ? (
                      <span className="flex-1 text-center py-3 text-xs text-slate-500 font-outfit font-bold bg-slate-900/30 border border-white/5 rounded-xl select-none">
                        Already Member
                      </span>
                    ) : isPending ? (
                      <span className="flex-1 text-center py-3 text-xs text-yellow-400/80 font-outfit font-bold bg-yellow-500/5 border border-yellow-500/15 rounded-xl select-none">
                        Request Pending
                      </span>
                    ) : isInvited ? (
                      <button
                        onClick={() => navigate(`/teams/${team._id}`)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-outfit font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Respond Invite
                      </button>
                    ) : team.members?.length >= 6 ? (
                      <span className="flex-1 text-center py-3 text-xs text-slate-500 font-outfit font-bold bg-slate-900/30 border border-white/5 rounded-xl select-none">
                        Team Full
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(team._id)}
                        disabled={actionLoading === team._id}
                        className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-outfit font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                      >
                        {actionLoading === team._id ? <FaSpinner className="animate-spin mx-auto" /> : 'Join Team'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {activeTab === 'all' && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-6">
            <button
              onClick={() => fetchTeams(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors font-outfit"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 font-sans font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchTeams(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors font-outfit"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Teams;
