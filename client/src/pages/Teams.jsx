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
import NotificationBell from '../components/NotificationBell';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ── Top Navbar ── */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            H
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/discover')}>
            HackMate AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => navigate('/discover')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            Find Hackers
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
          <button
            onClick={logout}
            className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner with Title and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
          <div className="space-y-1">
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Team Discovery
            </h1>
            <p className="text-xs text-slate-400">
              Browse formed teams, analyze their composition compatibility, and request to join the perfect stack.
            </p>
          </div>
          <button
            onClick={() => navigate('/teams/create')}
            className="sm:self-center px-5 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <FaPlus className="text-[10px]" /> Create Team
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab Filters */}
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800/60 w-fit">
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
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
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
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>
        </div>

        {/* ── Teams Discovery Grid ── */}
        {loading && teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <p className="text-xs text-slate-500">Scanning matching teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="border border-dashed border-slate-800/80 bg-slate-900/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-lg">
              <FaUsers className="text-slate-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Teams Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
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
                  className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700/80 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-750 flex-shrink-0 flex items-center justify-center">
                          {team.logo?.secureUrl ? (
                            <img src={team.logo.secureUrl} alt={team.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-extrabold text-sm text-slate-400 uppercase">
                              {team.name.substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 
                            onClick={() => navigate(`/teams/${team._id}`)}
                            className="font-bold text-sm text-white group-hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {team.name}
                          </h3>
                          <p className="text-[10px] text-slate-400">{team.hackathonName || 'Hackathon Project'}</p>
                        </div>
                      </div>

                      {/* Save & Health Badges */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleSaveTeam(team._id)}
                          className={`p-2 rounded-xl border transition-all text-xs ${
                            isSaved 
                              ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                          title={isSaved ? "Saved" : "Save Team"}
                        >
                          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                        <span className={`text-[10px] font-black tracking-wider px-2 py-1 rounded-lg ${getHealthColor(team.teamHealthScore)}`}>
                          {team.teamHealthScore}% Health
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {team.description || 'No description provided.'}
                    </p>

                    {/* Required Roles */}
                    {team.requiredRoles && team.requiredRoles.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Required Roles</span>
                        <div className="flex flex-wrap gap-1">
                          {team.requiredRoles.map((role) => (
                            <span
                              key={role}
                              className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] px-2 py-0.5 rounded font-medium capitalize"
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
                        <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Stack</span>
                        <div className="flex flex-wrap gap-1">
                          {team.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="bg-blue-900/15 text-blue-400 border border-blue-800/15 text-[9px] px-2 py-0.5 rounded font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Members List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Teammates ({team.members?.length || 0}/6)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2.5 overflow-hidden">
                          {team.members?.map((member) => (
                            <img
                              key={member._id || member}
                              className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 object-cover"
                              src={member.avatar?.secureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'H')}&background=random`}
                              alt={member.name || 'Member'}
                              title={`${member.name || 'Teammate'} (${member.role || 'Contributor'})`}
                            />
                          ))}
                        </div>
                        {team.members?.length >= 6 && (
                          <span className="text-[9px] text-red-400 font-medium bg-red-950/20 px-2 py-0.5 rounded border border-red-900/20">Full</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
                    <button
                      onClick={() => navigate(`/teams/${team._id}`)}
                      className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <FaEye className="text-[10px]" /> View Team
                    </button>

                    {isOwner ? (
                      <button
                        onClick={() => navigate(`/teams/${team._id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/15"
                      >
                        Manage Team
                      </button>
                    ) : isMember ? (
                      <span className="flex-1 text-center py-2.5 text-xs text-slate-500 font-semibold bg-slate-900/30 border border-slate-850 rounded-xl select-none">
                        Already Member
                      </span>
                    ) : isPending ? (
                      <span className="flex-1 text-center py-2.5 text-xs text-yellow-400/80 font-semibold bg-yellow-500/5 border border-yellow-500/10 rounded-xl select-none">
                        Request Pending
                      </span>
                    ) : isInvited ? (
                      <button
                        onClick={() => navigate(`/teams/${team._id}`)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/15"
                      >
                        Respond Invite
                      </button>
                    ) : team.members?.length >= 6 ? (
                      <span className="flex-1 text-center py-2.5 text-xs text-slate-500 font-semibold bg-slate-900/30 border border-slate-850 rounded-xl select-none">
                        Team Full
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(team._id)}
                        disabled={actionLoading === team._id}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
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
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchTeams(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors"
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
