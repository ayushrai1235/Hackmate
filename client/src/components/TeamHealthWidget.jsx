import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaPaperPlane, FaSpinner, FaGithub } from 'react-icons/fa';
import GitHubBadge from './GitHubBadge';
import teamService from '../services/teamService';

const TeamHealthWidget = ({ health, isOwner, teamId, teamInvites = [], onInviteSent }) => {
  const [invitingId, setInvitingId] = useState(null);

  if (!health) return null;

  const { healthScore, strengths, weaknesses, recommendations } = health;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStrokeColor = (score) => {
    if (score >= 80) return '#10B981'; // green-500
    if (score >= 50) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (healthScore / 100) * circumference;

  // Handle invitation trigger
  const handleInvite = async (userId) => {
    if (invitingId) return;
    setInvitingId(userId);
    try {
      await teamService.inviteUser(teamId, userId);
      alert('Invite sent!');
      if (onInviteSent) onInviteSent();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to send invite');
    } finally {
      setInvitingId(null);
    }
  };

  // Helper to check if user has already been invited
  const isUserInvited = (userId) => {
    return teamInvites.some((inv) => {
      const invId = inv._id || inv;
      return invId.toString() === userId.toString();
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-6">
      {/* Header & Radial Progress */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-5">
        <div>
          <h3 className="text-base font-extrabold text-white">Team Health Analysis</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Calculated by HackMate AI Composition Engine</p>
        </div>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              className="text-slate-800"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="40"
              cy="40"
            />
            <circle
              className="transition-all duration-700 ease-out"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke={getStrokeColor(healthScore)}
              fill="transparent"
              r={radius}
              cx="40"
              cy="40"
            />
          </svg>
          <span className={`absolute text-base font-black ${getScoreColor(healthScore)}`}>
            {healthScore}%
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Strengths */}
        {strengths && strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
              Strengths
            </h4>
            <ul className="space-y-1.5">
              {strengths.map((s, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start leading-relaxed">
                  <FaCheckCircle className="text-emerald-400 mr-2 mt-0.5 flex-shrink-0 text-sm" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement (Weaknesses) */}
        {weaknesses && weaknesses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
              Areas for Improvement
            </h4>
            <ul className="space-y-1.5">
              {weaknesses.map((w, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start leading-relaxed">
                  <FaTimesCircle className="text-red-400 mr-2 mt-0.5 flex-shrink-0 text-sm" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI suggested candidates */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI-Suggested Candidates</h4>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/15 px-2 py-0.5 rounded-md">
                      Role Gap: {rec.role}
                    </span>
                  </div>
                  
                  {rec.users && rec.users.length > 0 ? (
                    <div className="space-y-3 divide-y divide-slate-800/40">
                      {rec.users.map((cand) => {
                        const invited = isUserInvited(cand._id);
                        return (
                          <div key={cand._id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                className="h-8 w-8 rounded-xl ring-1 ring-slate-800 object-cover"
                                src={cand.avatar?.secureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=random`}
                                alt={cand.name}
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <Link 
                                    to={`/profile/${cand._id}`} 
                                    className="text-xs font-bold text-white hover:text-blue-400 transition-colors"
                                  >
                                    {cand.name}
                                  </Link>
                                  {cand.githubScore > 0 && (
                                    <GitHubBadge score={cand.githubScore} />
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 capitalize">
                                  {cand.role} &bull; {cand.experienceLevel}
                                </p>
                              </div>
                            </div>

                            {/* Invite button */}
                            {isOwner && (
                              <div className="flex-shrink-0">
                                {invited ? (
                                  <span className="text-[10px] text-slate-500 font-semibold bg-slate-900/40 px-2.5 py-1.5 rounded-xl border border-slate-850">
                                    Invited
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleInvite(cand._id)}
                                    disabled={invitingId === cand._id}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all disabled:opacity-50 active:scale-95"
                                  >
                                    {invitingId === cand._id ? (
                                      <FaSpinner className="animate-spin" />
                                    ) : (
                                      <>
                                        <FaPaperPlane className="text-[8px]" /> Invite
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No eligible candidates matching this role</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamHealthWidget;
