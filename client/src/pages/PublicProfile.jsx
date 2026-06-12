import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaGraduationCap, FaMapMarkerAlt, FaBriefcase, 
  FaCode, FaGithub, FaEyeSlash, FaSpinner, FaUsers, 
  FaTrophy, FaArrowLeft, FaExternalLinkAlt, FaStar, FaCodeBranch
} from 'react-icons/fa';
import api from '../services/api';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      setError('');
      setIsPrivate(false);
      try {
        const res = await api.get(`/users/${id}`);
        setProfileData(res.data);
      } catch (err) {
        console.error('Error fetching public profile:', err);
        if (err.response?.status === 403) {
          setIsPrivate(true);
        } else {
          setError(err.response?.data?.message || 'Failed to load user profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublicProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
          <p className="text-xs text-slate-400">Loading profile portfolio...</p>
        </div>
      </div>
    );
  }

  // Render Private Lock Screen
  if (isPrivate) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-slate-800 border border-slate-700/60 rounded-full flex items-center justify-center mx-auto text-yellow-500">
            <FaEyeSlash className="text-2xl" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Profile is Private</h1>
            <p className="text-sm text-slate-400">
              This user has disabled public profile search visibility. You cannot view their portfolio unless visibility is enabled.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors border border-slate-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 text-white">
        <div className="bg-slate-900 border border-red-900/30 p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <h1 className="text-lg font-bold text-red-400">Error Occurred</h1>
          <p className="text-sm text-slate-400">{error || 'User not found.'}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full bg-slate-850 hover:bg-slate-800 text-white py-2 rounded-xl text-sm transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { user, teamsJoined, hackathons, projects } = profileData;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900/40 hover:bg-slate-900 px-4 py-2 border border-slate-855 rounded-xl transition-all"
        >
          <FaArrowLeft /> Back to Discover
        </button>

        {/* Profile Header Canvas Card */}
        <div className="bg-slate-900/60 border border-slate-800/60 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
          
          {/* Header Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative" />

          {/* User Meta Summary */}
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -translate-y-16 md:-translate-y-10">
              
              {/* Profile image avatar preview */}
              <div className="w-36 h-36 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-950 shadow-2xl flex items-center justify-center flex-shrink-0">
                <img 
                  src={user.avatar?.secureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Title & Info tags */}
              <div className="text-center md:text-left flex-grow">
                <h1 className="text-3xl font-extrabold text-white flex items-center justify-center md:justify-start gap-3">
                  {user.name}
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {user.availability}
                  </span>
                </h1>
                
                <p className="text-sm text-slate-400 mt-1 flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1">
                    <FaBriefcase className="text-xs text-slate-500" /> {user.role} &bull; {user.experienceLevel}
                  </span>
                  {user.college && (
                    <span className="flex items-center gap-1">
                      <FaGraduationCap className="text-xs text-slate-500" /> {user.college} ({user.yearOfStudy})
                    </span>
                  )}
                  {user.city && (
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-xs text-slate-500" /> {user.city}
                    </span>
                  )}
                </p>
              </div>

              {/* Action column */}
              {user.githubUsername && (
                <div className="flex-shrink-0 flex items-center justify-center">
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                  >
                    <FaGithub /> GitHub Portfolio
                  </a>
                </div>
              )}

            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Grid: Bio & Team Connections */}
              <div className="md:col-span-1 space-y-6">
                
                {/* User Bio */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2">Bio</h3>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{user.bio || 'This developer is too busy coding to write a bio.'}"
                  </p>
                </div>

                {/* Hackathons joined */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2 flex items-center gap-2">
                    <FaTrophy className="text-yellow-500 text-xs" /> Hackathons
                  </h3>
                  {hackathons.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {hackathons.map((h, i) => (
                        <span key={i} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1 rounded-md font-semibold">
                          {h}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No registered hackathons found.</p>
                  )}
                </div>

                {/* Teams Showcase */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2 flex items-center gap-2">
                    <FaUsers className="text-slate-400 text-xs" /> Teams Joined
                  </h3>
                  
                  {teamsJoined.length > 0 ? (
                    <div className="space-y-4">
                      {teamsJoined.map((team, idx) => (
                        <div key={idx} className="border border-slate-850/60 bg-slate-900/30 rounded-xl p-3.5 space-y-2.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-slate-200">{team.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{team.description}</p>
                            </div>
                          </div>
                          
                          {/* Members avatars display */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-bold text-slate-500 mr-1.5">Members:</span>
                            <div className="flex -space-x-2 overflow-hidden">
                              <img 
                                src={team.owner?.avatar?.secureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                alt={team.owner?.name} 
                                title={`${team.owner?.name} (Owner)`}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
                              />
                              {(team.members || []).map((m, mIdx) => (
                                <img 
                                  key={mIdx}
                                  src={m.avatar?.secureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                  alt={m.name} 
                                  title={m.name}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Not in any team yet.</p>
                  )}
                </div>

              </div>

              {/* Right Grid: Skills, Tech Stack & GitHub Showcase */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Skills/Tech card */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 space-y-5">
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FaCode className="text-blue-400" /> Core Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((s, idx) => (
                          <span key={idx} className="bg-blue-900/25 text-blue-400 border border-blue-800/20 text-xs px-2.5 py-1 rounded-md font-semibold">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No skills listed.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-900">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FaCode className="text-emerald-400" /> Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.techStack && user.techStack.length > 0 ? (
                        user.techStack.map((t, idx) => (
                          <span key={idx} className="bg-emerald-900/25 text-emerald-400 border border-emerald-800/20 text-xs px-2.5 py-1 rounded-md font-semibold">
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No tech stack listed.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* GitHub details and statistics */}
                {user.githubUsername && (
                  <div className="space-y-6">
                    
                    {/* GitHub Numbers Grid */}
                    {user.githubData && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-955/60 border border-slate-800 p-4 rounded-2xl text-center">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Repositories</span>
                          <span className="text-xl font-black text-slate-100">{user.githubData.repos || 0}</span>
                        </div>
                        <div className="bg-slate-955/60 border border-slate-800 p-4 rounded-2xl text-center">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Stars</span>
                          <span className="text-xl font-black text-slate-100">{user.githubData.stars || 0}</span>
                        </div>
                        <div className="bg-slate-955/60 border border-slate-800 p-4 rounded-2xl text-center">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">GitHub Score</span>
                          <span className="text-xl font-black text-blue-400">{user.githubScore || 0}</span>
                        </div>
                      </div>
                    )}

                    {/* Repository Showcase (Projects list) */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <FaGithub /> Repository Showcase
                      </h3>
                      
                      {projects && projects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {projects.map((proj, idx) => (
                            <div key={idx} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all hover:bg-slate-900/25">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-sm font-bold text-slate-100 truncate">{proj.name}</h4>
                                  <a
                                    href={proj.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
                                  >
                                    <FaExternalLinkAlt className="text-xs" />
                                  </a>
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 min-h-[2rem]">
                                  {proj.description || 'No description provided.'}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-4 border-t border-slate-850 pt-2.5">
                                {proj.language && (
                                  <span className="font-semibold text-slate-300">{proj.language}</span>
                                )}
                                <div className="flex items-center gap-2 ml-auto">
                                  <span className="flex items-center gap-0.5"><FaStar /> {proj.stars || 0}</span>
                                  <span className="flex items-center gap-0.5"><FaCodeBranch /> {proj.forks || 0}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic py-2">No public repositories loaded.</p>
                      )}
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
