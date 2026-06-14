import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaSpinner, FaArrowLeft, FaEdit, FaTrash, FaUserMinus, 
  FaUserPlus, FaCheck, FaTimes, FaSearch, FaPaperPlane, 
  FaSignOutAlt, FaGithub, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import teamService from '../services/teamService';
import api from '../services/api';
import TeamHealthWidget from '../components/TeamHealthWidget';
import GitHubBadge from '../components/GitHubBadge';
import Navbar from '../components/Navbar';

const TeamDetail = () => {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [team, setTeam] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Invite section state
  const [allUsers, setAllUsers] = useState([]);
  const [inviteSearch, setInviteSearch] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null); // userId or general string

  const fetchTeamData = async () => {
    try {
      const data = await teamService.getTeam(teamId);
      setTeam(data.team);
      setHealth(data.teamHealth);
    } catch (err) {
      console.error(err);
      setError('Team not found or unauthorized.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  // Load all users for the search & invite functionality
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setAllUsers(response.data || []);
      } catch (err) {
        console.error('Failed to load users for invitation feed:', err);
      }
    };
    if (team && (team.owner?._id === user?._id || team.owner === user?._id)) {
      fetchUsers();
    }
  }, [team, user?._id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <FaSpinner className="animate-spin text-4xl text-indigo-500" />
          <p className="text-xs font-outfit font-semibold tracking-wider text-slate-400">Loading Team Intel...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="glass-panel border-rose-500/10 max-w-md w-full mx-4 p-8 rounded-3xl text-center space-y-5 relative z-10">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/5">
            <FaExclamationCircle className="text-2xl" />
          </div>
          <h2 className="text-xl font-cabinet font-black tracking-tight text-white">{error || 'Team not found'}</h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            The team you are looking for might have been deleted, or you might not have authorization to view it.
          </p>
          <button
            onClick={() => navigate('/teams')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-outfit font-black py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/10 active:scale-[0.98]"
          >
            Back to Team Discovery
          </button>
        </div>
      </div>
    );
  }

  const isOwner = team.owner?._id === user?._id || team.owner === user?._id;
  const isMember = team.members?.some(m => (m._id || m) === user?._id);
  const isPendingRequest = team.joinRequests?.some(req => (req._id || req) === user?._id);
  const isInvited = team.invites?.some(inv => (inv._id || inv) === user?._id);

  // Invitation accepts / rejects (for current user)
  const handleInviteResponse = async (accept) => {
    setActionInProgress('invite-respond');
    try {
      await teamService.respondToInvite(teamId, user._id, accept);
      alert(accept ? 'Joined team!' : 'Invitation declined.');
      fetchTeamData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to respond to invite');
    } finally {
      setActionInProgress(null);
    }
  };

  // Join request (for guest user)
  const handleJoinRequest = async () => {
    setActionInProgress('join-request');
    try {
      await teamService.requestToJoin(teamId);
      alert('Join request sent successfully!');
      fetchTeamData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setActionInProgress(null);
    }
  };

  // Leave team (for members)
  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    setActionInProgress('leave-team');
    try {
      await teamService.removeMember(teamId, user._id);
      alert('Left the team.');
      navigate('/teams');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to leave team');
    } finally {
      setActionInProgress(null);
    }
  };

  // Owner action: Accept join request
  const handleAcceptRequest = async (requesterId) => {
    setActionInProgress(`accept-${requesterId}`);
    try {
      await teamService.acceptJoinRequest(teamId, requesterId);
      alert('Member accepted!');
      fetchTeamData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to accept member');
    } finally {
      setActionInProgress(null);
    }
  };

  // Owner action: Reject join request
  const handleRejectRequest = async (requesterId) => {
    setActionInProgress(`reject-${requesterId}`);
    try {
      await teamService.rejectJoinRequest(teamId, requesterId);
      alert('Join request rejected.');
      fetchTeamData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionInProgress(null);
    }
  };

  // Owner action: Remove member
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    setActionInProgress(`remove-${memberId}`);
    try {
      await teamService.removeMember(teamId, memberId);
      alert('Member removed.');
      fetchTeamData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionInProgress(null);
    }
  };

  // Owner action: Delete team
  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this team? This cannot be undone.')) return;
    setActionInProgress('delete-team');
    try {
      await teamService.deleteTeam(teamId);
      alert('Team deleted successfully.');
      navigate('/teams');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete team');
    } finally {
      setActionInProgress(null);
    }
  };

  // Owner action: Send user invitation
  const handleSendInvite = async (candidateId) => {
    setInviteLoading(candidateId);
    try {
      await teamService.inviteUser(teamId, candidateId);
      alert('Invite sent successfully!');
      fetchTeamData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  // Filter out users who are already members or invited
  const getInviteCandidates = () => {
    return allUsers.filter(u => {
      const isAlreadyMember = team.members?.some(m => (m._id || m) === u._id) || (team.owner?._id || team.owner) === u._id;
      const isAlreadyInvited = team.invites?.some(inv => (inv._id || inv) === u._id);
      
      // Perform case-insensitive search by name or skill
      const searchMatch = u.name.toLowerCase().includes(inviteSearch.toLowerCase()) || 
                          u.skills?.some(s => s.toLowerCase().includes(inviteSearch.toLowerCase()));

      return !isAlreadyMember && !isAlreadyInvited && searchMatch;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Action */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/teams')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <FaArrowLeft className="text-[10px]" /> Back to Discovery
          </button>
          
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/teams/${teamId}/edit`)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <FaEdit /> Edit Details
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={actionInProgress === 'delete-team'}
                className="bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {actionInProgress === 'delete-team' ? <FaSpinner className="animate-spin" /> : <FaTrash />} Delete Team
              </button>
            </div>
          )}
        </div>

        {/* ── Active Invitation Banner for Current User ── */}
        {isInvited && (
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FaCheckCircle className="text-blue-400" /> You are invited to join {team.name}!
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">The owner has requested your collaboration on this project.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => handleInviteResponse(true)}
                disabled={actionInProgress === 'invite-respond'}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10"
              >
                {actionInProgress === 'invite-respond' ? <FaSpinner className="animate-spin" /> : <FaCheck />} Accept
              </button>
              <button
                onClick={() => handleInviteResponse(false)}
                disabled={actionInProgress === 'invite-respond'}
                className="flex-1 md:flex-none bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* ── Main Detail Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Col 1 & 2: Team Details & Members */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Header Info Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-800 border border-slate-750 flex items-center justify-center flex-shrink-0 shadow-md">
                  {team.logo?.secureUrl ? (
                    <img src={team.logo.secureUrl} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-extrabold text-2xl text-slate-400 uppercase">
                      {team.name.substring(0, 2)}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-2xl font-black text-white">{team.name}</h1>
                    <span className="text-[10px] uppercase font-black tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/15 px-2.5 py-0.5 rounded-lg select-none">
                      {team.members?.length || 0}/6 members
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Hackathon: <span className="text-white">{team.hackathonName || 'Unspecified'}</span></p>
                  <p className="text-[10px] text-slate-500">Founded by <Link to={`/profile/${team.owner?._id}`} className="text-blue-400 hover:underline">{team.owner?.name}</Link></p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Description</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-850 p-4 rounded-2xl whitespace-pre-wrap">
                  {team.description || 'No description has been added yet.'}
                </p>
              </div>

              {/* Required Roles & Stack */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {team.requiredRoles && team.requiredRoles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Roles</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {team.requiredRoles.map((role) => (
                        <span key={role} className="bg-red-500/10 text-red-400 border border-red-500/15 text-[10px] px-2.5 py-1 rounded-lg font-semibold capitalize">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {team.techStack && team.techStack.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tech Stack</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {team.techStack.map((tech) => (
                        <span key={tech} className="bg-blue-900/20 text-blue-400 border border-blue-800/20 text-[10px] px-2.5 py-1 rounded-lg font-semibold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer for Guest / Member */}
              {!isOwner && (
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end">
                  {isMember ? (
                    <button
                      onClick={handleLeaveTeam}
                      disabled={actionInProgress === 'leave-team'}
                      className="bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {actionInProgress === 'leave-team' ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />} Leave Team
                    </button>
                  ) : isPendingRequest ? (
                    <span className="text-xs text-yellow-400 font-semibold bg-yellow-500/5 border border-yellow-500/10 px-4 py-2.5 rounded-xl select-none">
                      Join Request Pending Approval
                    </span>
                  ) : isInvited ? (
                    <span className="text-xs text-blue-400 font-semibold bg-blue-500/5 border border-blue-500/10 px-4 py-2.5 rounded-xl select-none">
                      Invitation Received
                    </span>
                  ) : team.members?.length >= 6 ? (
                    <span className="text-xs text-slate-500 font-semibold bg-slate-900/30 border border-slate-850 px-4 py-2.5 rounded-xl select-none">
                      Team is Full
                    </span>
                  ) : (
                    <button
                      onClick={handleJoinRequest}
                      disabled={actionInProgress === 'join-request'}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50 active:scale-95"
                    >
                      {actionInProgress === 'join-request' ? <FaSpinner className="animate-spin" /> : <FaUserPlus />} Request to Join
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Team Members List */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">Teammates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Team Owner */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-blue-600 text-[8px] uppercase tracking-widest font-black text-white px-2 py-0.5 rounded-bl-lg select-none">
                    Owner
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-800"
                      src={team.owner?.avatar?.secureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.owner?.name || 'H')}&background=random`}
                      alt={team.owner?.name}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link to={`/profile/${team.owner?._id}`} className="text-xs font-bold text-white hover:text-blue-400 transition-colors">
                          {team.owner?.name}
                        </Link>
                        {team.owner?.githubScore > 0 && (
                          <GitHubBadge score={team.owner.githubScore} />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 capitalize">{team.owner?.role || 'Developer'} &bull; {team.owner?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                {team.members?.map((member) => (
                  <div 
                    key={member._id}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 backdrop-blur-md relative group hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-800"
                        src={member.avatar?.secureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'M')}&background=random`}
                        alt={member.name}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link to={`/profile/${member._id}`} className="text-xs font-bold text-white hover:text-blue-400 transition-colors">
                            {member.name}
                          </Link>
                          {member.githubScore > 0 && (
                            <GitHubBadge score={member.githubScore} />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 capitalize">{member.role || 'Contributor'} &bull; {member.email}</p>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={actionInProgress === `remove-${member._id}`}
                        className="p-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-xl transition-all disabled:opacity-50"
                        title="Remove member"
                      >
                        {actionInProgress === `remove-${member._id}` ? (
                          <FaSpinner className="animate-spin text-xs" />
                        ) : (
                          <FaUserMinus className="text-xs" />
                        )}
                      </button>
                    )}
                  </div>
                ))}

              </div>
            </div>

          </div>

          {/* Col 3: Side panels (Health & Owner actions) */}
          <div className="space-y-6">
            
            {/* Team Health Analytics */}
            <TeamHealthWidget 
              health={health} 
              isOwner={isOwner} 
              teamId={teamId}
              teamInvites={team.invites}
              onInviteSent={fetchTeamData}
            />

            {/* Owner Management Panels */}
            {isOwner && (
              <>
                {/* 1. Join Requests Panel */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-3">
                    Join Requests ({team.joinRequests?.length || 0})
                  </h3>
                  
                  {team.joinRequests && team.joinRequests.length > 0 ? (
                    <div className="space-y-3">
                      {team.joinRequests.map((req) => (
                        <div key={req._id} className="bg-slate-950/30 border border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              className="h-8 w-8 rounded-lg object-cover"
                              src={req.avatar?.secureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=random`}
                              alt={req.name}
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <Link to={`/profile/${req._id}`} className="text-xs font-bold text-white hover:text-blue-400 transition-colors">
                                  {req.name}
                                </Link>
                                {req.githubScore > 0 && <GitHubBadge score={req.githubScore} />}
                              </div>
                              <p className="text-[9px] text-slate-400 capitalize">{req.role}</p>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAcceptRequest(req._id)}
                              disabled={actionInProgress === `accept-${req._id}`}
                              className="p-2 bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 rounded-xl transition-all"
                              title="Accept"
                            >
                              <FaCheck className="text-[9px]" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req._id)}
                              disabled={actionInProgress === `reject-${req._id}`}
                              className="p-2 bg-red-950/30 hover:bg-red-950/60 border border-red-900/30 text-red-400 rounded-xl transition-all"
                              title="Reject"
                            >
                              <FaTimes className="text-[9px]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No pending requests</p>
                  )}
                </div>

                {/* 2. Sent Invitations Panel */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-3">
                    Active Invitations ({team.invites?.length || 0})
                  </h3>
                  
                  {team.invites && team.invites.length > 0 ? (
                    <div className="space-y-3">
                      {team.invites.map((inv) => (
                        <div key={inv._id} className="bg-slate-950/30 border border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              className="h-8 w-8 rounded-lg object-cover"
                              src={inv.avatar?.secureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(inv.name)}&background=random`}
                              alt={inv.name}
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <Link to={`/profile/${inv._id}`} className="text-xs font-bold text-white hover:text-blue-400 transition-colors">
                                  {inv.name}
                                </Link>
                                {inv.githubScore > 0 && <GitHubBadge score={inv.githubScore} />}
                              </div>
                              <p className="text-[9px] text-slate-400 capitalize">{inv.role}</p>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-500 font-semibold bg-slate-900/40 px-2 py-1 rounded border border-slate-800">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No active invitations</p>
                  )}
                </div>

                {/* 3. General Recruits Search & Invite Selector */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-3">
                    Search & Invite Recruits
                  </h3>
                  
                  {/* Search Box */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <FaSearch className="text-[10px]" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search users by name or skill..."
                      value={inviteSearch}
                      onChange={(e) => setInviteSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-[10px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Users matching search */}
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1.5 custom-scrollbar">
                    {getInviteCandidates().length > 0 ? (
                      getInviteCandidates().map((cand) => (
                        <div 
                          key={cand._id} 
                          className="bg-slate-950/20 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              className="h-7 w-7 rounded-lg object-cover"
                              src={cand.avatar?.secureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=random`}
                              alt={cand.name}
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <Link to={`/profile/${cand._id}`} className="text-[10px] font-bold text-white hover:text-blue-400 transition-colors">
                                  {cand.name}
                                </Link>
                                {cand.githubScore > 0 && <GitHubBadge score={cand.githubScore} />}
                              </div>
                              <p className="text-[8px] text-slate-400 capitalize">{cand.role} &bull; {cand.experienceLevel}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleSendInvite(cand._id)}
                            disabled={inviteLoading === cand._id}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            {inviteLoading === cand._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaPaperPlane className="text-[7px]" /> Invite
                              </>
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-600 italic text-center py-2">No candidate matches found</p>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default TeamDetail;
