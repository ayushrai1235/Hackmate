import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { 
  FaShieldAlt, FaUsers, FaChartBar, FaFlag, FaBan, FaCheck, 
  FaTrashAlt, FaSearch, FaChevronLeft, FaChevronRight, FaTimes, 
  FaUserShield, FaExclamationTriangle, FaHourglassHalf 
} from 'react-icons/fa';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  
  // State for different datasets
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // UI state
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    // Load initial tab data
    handleTabChange(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'users') fetchUsers(1, usersSearch);
    if (tab === 'teams') fetchTeams();
    if (tab === 'reports') fetchReports();
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchUsers = async (page = 1, search = '') => {
    setUsersLoading(true);
    try {
      const res = await api.get(`/admin/users`, {
        params: { page, limit: 8, search }
      });
      setUsers(res.data.users);
      setUsersTotalPages(res.data.totalPages);
      setUsersPage(res.data.currentPage);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchTeams = async () => {
    setTeamsLoading(true);
    try {
      const res = await api.get('/admin/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleBanToggle = async (userId, currentBanStatus) => {
    const actionWord = currentBanStatus ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${actionWord} this user?`)) return;

    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await api.put(`/admin/users/${userId}/ban`, { isBanned: !currentBanStatus });
      
      // Update local state for users list
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: res.data.user.isBanned } : u));
      
      // Update local state for reports list if present
      setReports(prev => prev.map(r => {
        if (r.reported && r.reported._id === userId) {
          return { ...r, reported: { ...r.reported, isBanned: res.data.user.isBanned } };
        }
        return r;
      }));

      // Refresh analytics if we are banning active users
      fetchAnalytics();
    } catch (err) {
      console.error('Error updating ban status:', err);
      alert('Failed to update ban status.');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to permanently delete this team? This action is irreversible.')) return;

    setActionLoading(prev => ({ ...prev, [teamId]: true }));
    try {
      await api.delete(`/admin/teams/${teamId}`);
      setTeams(prev => prev.filter(t => t._id !== teamId));
      fetchAnalytics();
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Failed to delete team.');
    } finally {
      setActionLoading(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    setActionLoading(prev => ({ ...prev, [reportId]: true }));
    try {
      const res = await api.put(`/admin/reports/${reportId}`, { status });
      setReports(prev => prev.map(r => r._id === reportId ? res.data.report : r));
    } catch (err) {
      console.error('Error updating report status:', err);
      alert('Failed to update report status.');
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1, usersSearch);
  };

  return (
    <div className="relative min-h-screen bg-[#030014] text-slate-100 flex flex-col overflow-hidden font-sans">
      <div className="fixed top-[-15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/[0.06] blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-emerald-500/[0.04] blur-[100px] pointer-events-none" />
      <Navbar />

      <div className="relative flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 z-10">
        {/* Header Title Section */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FaShieldAlt className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-cabinet">Admin Dashboard</h1>
            <p className="text-xs text-slate-400 font-medium mt-1 font-outfit">
              Review platform analytics, manage hacker listings, evaluate reports, and audit teams.
            </p>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex border-b border-white/5 overflow-x-auto gap-1">
          {[
            { id: 'analytics', label: 'Analytics', icon: FaChartBar },
            { id: 'users', label: 'Users', icon: FaUsers },
            { id: 'teams', label: 'Teams', icon: FaUserShield },
            { id: 'reports', label: 'Reports', icon: FaFlag }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap font-outfit ${
                  isSelected
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="text-xs" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body based on Active Tab */}
        <div className="flex-1">
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="glass-panel border border-white/5 rounded-2xl p-6 h-32 animate-pulse" />
                  ))}
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Hackers', value: analytics.totalUsers, color: 'from-indigo-500 to-blue-500', icon: FaUsers },
                    { label: 'Total Teams', value: analytics.totalTeams, color: 'from-emerald-500 to-teal-500', icon: FaUserShield },
                    { label: 'Teammate Matches', value: analytics.totalMatches, color: 'from-pink-500 to-rose-500', icon: FaShieldAlt },
                    { label: 'Active Today', value: analytics.activeToday, color: 'from-amber-500 to-orange-500', icon: FaChartBar }
                  ].map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={idx} className="glass-panel card-glow-indigo rounded-2xl p-6 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.07] rounded-full blur-xl`} />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">{stat.label}</span>
                          <span className="p-2 rounded-lg bg-white/[0.03] text-slate-400 border border-white/5"><StatIcon /></span>
                        </div>
                        <div className="text-3xl font-black text-white mt-4 font-cabinet">{stat.value}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-outfit">Failed to load analytics.</p>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <form onSubmit={handleUserSearchSubmit} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="premium-input flex-grow px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20 font-outfit"
                >
                  <FaSearch /> Search
                </button>
              </form>

              {/* Table Container */}
              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-semibold">Loading users list...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl border border-white/5">
                  <p className="text-sm text-slate-500 font-medium font-outfit">No users found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto glass-panel border border-white/5 rounded-2xl">
                    <table className="min-w-full divide-y divide-white/5">
                      <thead className="bg-white/[0.02]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xxs font-bold text-slate-500 uppercase tracking-widest">Hacker</th>
                          <th className="px-6 py-4 text-left text-xxs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                          <th className="px-6 py-4 text-left text-xxs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-left text-xxs font-bold text-slate-500 uppercase tracking-widest">Onboarded</th>
                          <th className="px-6 py-4 text-right text-xxs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map(user => (
                          <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {user.avatar?.secureUrl ? (
                                  <img src={user.avatar.secureUrl} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-slate-800" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="text-xs font-bold text-white">{user.name}</div>
                                  <div className="text-[10px] text-slate-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                user.isBanned 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {user.isBanned ? 'Banned' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                              {user.onboardingComplete ? (
                                <span className="text-emerald-500 font-bold">Yes</span>
                              ) : (
                                <span className="text-slate-600 font-bold">No</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                              <button
                                onClick={() => handleBanToggle(user._id, user.isBanned)}
                                disabled={actionLoading[user._id]}
                                className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold border transition-colors inline-flex items-center gap-1.5 ${
                                  user.isBanned
                                    ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20'
                                    : 'bg-red-600/10 border-red-500/30 text-red-400 hover:bg-red-600/20'
                                }`}
                              >
                                <FaBan className="text-[10px]" /> {user.isBanned ? 'Unban User' : 'Ban User'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  {usersTotalPages > 1 && (
                    <div className="flex justify-between items-center glass-panel rounded-2xl p-4 border border-white/5">
                      <button
                        onClick={() => fetchUsers(usersPage - 1, usersSearch)}
                        disabled={usersPage === 1}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-colors font-outfit"
                      >
                        <FaChevronLeft /> Previous
                      </button>
                      <span className="text-xs font-semibold text-slate-400 font-outfit">
                        Page <strong className="text-white">{usersPage}</strong> of <strong className="text-white">{usersTotalPages}</strong>
                      </span>
                      <button
                        onClick={() => fetchUsers(usersPage + 1, usersSearch)}
                        disabled={usersPage === usersTotalPages}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-colors font-outfit"
                      >
                        Next <FaChevronRight />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TEAMS TAB */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              {teamsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-semibold">Loading teams list...</p>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl border border-white/5">
                  <p className="text-sm text-slate-500 font-medium font-outfit">No teams currently created.</p>
                </div>
              ) : (
                <div className="overflow-x-auto glass-panel border border-white/5 rounded-2xl">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/[0.02]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xxs font-bold text-slate-500 uppercase tracking-widest">Team Details</th>
                        <th className="px-6 py-4 text-left text-xxs font-bold text-slate-500 uppercase tracking-widest">Owner</th>
                        <th className="px-6 py-4 text-left text-xxs font-bold text-slate-500 uppercase tracking-widest">Members</th>
                        <th className="px-6 py-4 text-right text-xxs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {teams.map(team => (
                        <tr key={team._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-white">{team.name}</div>
                            <div className="text-[10px] text-slate-500 max-w-md truncate mt-0.5">{team.description || 'No description provided.'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                            {team.owner ? (
                              <span className="font-semibold text-slate-300">{team.owner.name}</span>
                            ) : (
                              <span className="text-slate-655 font-medium italic">Deleted Account</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-bold">
                            {(team.members?.length || 0) + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                            <button
                              onClick={() => handleDeleteTeam(team._id)}
                              disabled={actionLoading[team._id]}
                              className="px-3 py-1.5 bg-red-650/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-xxs font-extrabold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <FaTrashAlt /> Delete Team
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reportsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-semibold">Loading safety reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl border border-white/5">
                  <p className="text-sm text-slate-500 font-medium font-outfit">No user reports pending evaluation.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map(report => (
                    <div 
                      key={report._id}
                      className="glass-panel card-glow-indigo rounded-2xl p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            report.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : report.status === 'reviewed'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {report.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-550 font-bold">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Report description details */}
                        <div className="space-y-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                          <div className="text-[10px] text-slate-500 uppercase font-black">Reason for Report</div>
                          <p className="text-xs text-slate-350 leading-relaxed font-semibold italic">
                            "{report.reason || 'No description specified.'}"
                          </p>
                        </div>

                        {/* Profiles involved */}
                        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Reporter</div>
                            {report.reporter ? (
                              <div className="font-bold text-white">{report.reporter.name}</div>
                            ) : (
                              <div className="text-slate-600 font-medium italic">Deleted Account</div>
                            )}
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Reported User</div>
                            {report.reported ? (
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {report.reported.name}
                                {report.reported.isBanned && (
                                  <span className="text-red-500 font-black text-xxs flex items-center gap-0.5">
                                    <FaBan /> Banned
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-600 font-medium italic">Deleted Account</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action status select/buttons */}
                      <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4 items-center justify-between">
                        <div className="flex gap-1.5">
                          {report.status !== 'reviewed' && (
                            <button
                              onClick={() => handleUpdateReportStatus(report._id, 'reviewed')}
                              disabled={actionLoading[report._id]}
                              className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/35 text-blue-400 rounded-lg text-xxs font-extrabold flex items-center gap-1 transition-colors"
                            >
                              <FaHourglassHalf /> Mark Reviewed
                            </button>
                          )}
                          {report.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateReportStatus(report._id, 'resolved')}
                              disabled={actionLoading[report._id]}
                              className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/35 text-emerald-400 rounded-lg text-xxs font-extrabold flex items-center gap-1 transition-colors"
                            >
                              <FaCheck /> Resolve
                            </button>
                          )}
                        </div>

                        {report.reported && (
                          <button
                            onClick={() => handleBanToggle(report.reported._id, report.reported.isBanned)}
                            disabled={actionLoading[report.reported._id] || actionLoading[report._id]}
                            className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold border transition-colors inline-flex items-center gap-1 ${
                              report.reported.isBanned
                                ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-600/10 border-red-500/20 text-red-400 hover:bg-red-600/20'
                            }`}
                          >
                            <FaBan /> {report.reported.isBanned ? 'Unban User' : 'Ban User'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
