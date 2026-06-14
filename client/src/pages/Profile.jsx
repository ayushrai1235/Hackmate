import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, FaCamera, FaGraduationCap, FaMapMarkerAlt, 
  FaBriefcase, FaCode, FaGithub, FaEye, FaEyeSlash, 
  FaEdit, FaSave, FaTimes, FaSpinner, FaCheckCircle,
  FaSignOutAlt
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { uploadAvatar } from '../services/uploadService';
import api from '../services/api';
import GitHubBadge from '../components/GitHubBadge';
import GitHubStats from '../components/GitHubStats';

const POPULAR_SKILLS = [
  'Frontend Development', 'Backend Development', 'Fullstack Development',
  'UI/UX Design', 'Product Management', 'Data Science', 'Machine Learning',
  'DevOps', 'Mobile Development', 'Cybersecurity'
];

const POPULAR_TECH = [
  'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 
  'Python', 'JavaScript', 'TypeScript', 'Docker', 'AWS', 
  'TailwindCSS', 'Figma', 'Next.js', 'Go', 'Rust'
];

const ROLE_OPTIONS = ['Developer', 'Designer', 'Product Manager', 'Other'];
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const AVAILABILITY_OPTIONS = ['Available for Teams', 'Open to Offers', 'Not Available'];

const Profile = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields state
  const [editForm, setEditForm] = useState({
    name: '',
    avatar: { publicId: '', secureUrl: '' },
    bio: '',
    college: '',
    city: '',
    yearOfStudy: '',
    role: '',
    experienceLevel: '',
    skills: [],
    techStack: [],
    githubUsername: '',
    lookingFor: [],
    availability: '',
    profileVisibility: true
  });

  // Custom tags helper states
  const [customSkill, setCustomSkill] = useState('');
  const [customTech, setCustomTech] = useState('');

  // Hydrate fields from user context
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        avatar: user.avatar?.secureUrl ? user.avatar : { publicId: '', secureUrl: '' },
        bio: user.bio || '',
        college: user.college || '',
        city: user.city || '',
        yearOfStudy: user.yearOfStudy || '1st Year',
        role: user.role || 'Developer',
        experienceLevel: user.experienceLevel || 'Beginner',
        skills: user.skills || [],
        techStack: user.techStack || [],
        githubUsername: user.githubUsername || '',
        lookingFor: user.lookingFor || [],
        availability: user.availability || 'Available for Teams',
        profileVisibility: user.profileVisibility !== undefined ? user.profileVisibility : true
      });
    }
  }, [user, isEditing]);

  // Handle image upload to Cloudinary
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const result = await uploadAvatar(file);
      setEditForm(prev => ({
        ...prev,
        avatar: { publicId: result.publicId, secureUrl: result.secureUrl }
      }));
      setSuccessMsg('Avatar updated! Save changes to finalize.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Avatar upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  // Toggle skills or tech list
  const handleToggleTag = (field, tag) => {
    setEditForm(prev => {
      const list = prev[field];
      if (list.includes(tag)) {
        return { ...prev, [field]: list.filter(t => t !== tag) };
      } else {
        return { ...prev, [field]: [...list, tag] };
      }
    });
  };

  // Add custom tags
  const handleAddCustomTag = (field, text, setInput) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setEditForm(prev => {
      if (prev[field].includes(trimmed)) return prev;
      return { ...prev, [field]: [...prev[field], trimmed] };
    });
    setInput('');
  };

  // Submit profile updates
  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      alert('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/users/me', editForm);
      setUser(res.data.user);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error('Save failed:', error);
      alert(error.response?.data?.message || 'Error saving profile modifications.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Banner */}
        <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              HackMate AI Dashboard
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/discover'}
              className="text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all"
            >
              Find Hackers
            </button>
            <button
              onClick={() => window.location.href = '/teams'}
              className="text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all"
            >
              Teams
            </button>
            <button
              onClick={() => window.location.href = '/chat'}
              className="text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all"
            >
              Chats
            </button>
            <button
              onClick={logout}
              className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-center gap-2 text-emerald-400 text-sm">
            <FaCheckCircle className="text-lg flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PROFILE CONTENT CARD */}
        <div className="bg-slate-900/60 border border-slate-800/60 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
          
          {/* Cover Placeholder Gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative" />

          {/* Profile Header Block */}
          <div className="relative px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -translate-y-12 sm:-translate-y-8 mb-4 sm:mb-0">
              
              {/* Photo Box */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-950 shadow-xl flex items-center justify-center">
                  {isEditing ? (
                    <div className="relative w-full h-full group">
                      <img 
                        src={editForm.avatar.secureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                        alt="Edit Avatar" 
                        className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" 
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCamera className="text-lg mb-1" />
                        <span>Upload</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      {imageUploading && (
                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                          <FaSpinner className="animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <img 
                      src={user.avatar?.secureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                      alt={user.name} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>

                <div className="text-center sm:text-left translate-y-3">
                  <h1 className="text-2xl font-bold text-white flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {user.name}
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user.profileVisibility ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                      {user.profileVisibility ? 'Public' : 'Private'}
                    </span>
                    <GitHubBadge score={user.githubScore} />
                  </h1>
                  <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                    <FaBriefcase className="text-slate-500 text-xs" /> {user.role} &bull; {user.experienceLevel}
                  </p>
                </div>
              </div>

              {/* Edit Mode Toggle Button */}
              <div className="mt-8 sm:mt-0 flex justify-center sm:justify-end translate-y-8 sm:translate-y-3">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-slate-805 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      {loading ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>

            </div>

            {/* FORM / READ ONLY BODY CONTAINER */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Metadata Cards */}
              <div className="space-y-6">
                
                {/* Details Box */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2">Background</h3>
                  
                  {isEditing ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Display Name</label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">College/School</label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs"
                          value={editForm.college}
                          onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">City</label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Year of Study</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs"
                          value={editForm.yearOfStudy}
                          onChange={(e) => setEditForm({ ...editForm, yearOfStudy: e.target.value })}
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Graduate">Graduate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      {user.college && (
                        <div className="flex items-start gap-2.5">
                          <FaGraduationCap className="text-slate-500 mt-1 flex-shrink-0" />
                          <div>
                            <span className="block text-xs text-slate-400">College</span>
                            <span className="text-xs font-semibold text-slate-200">{user.college} &bull; {user.yearOfStudy}</span>
                          </div>
                        </div>
                      )}
                      {user.city && (
                        <div className="flex items-start gap-2.5">
                          <FaMapMarkerAlt className="text-slate-500 mt-1 flex-shrink-0" />
                          <div>
                            <span className="block text-xs text-slate-400">Location</span>
                            <span className="text-xs font-semibold text-slate-200">{user.city}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Collaboration Box */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2">Status & Availability</h3>
                  
                  {isEditing ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Role Title</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        >
                          {ROLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Experience Level</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs"
                          value={editForm.experienceLevel}
                          onChange={(e) => setEditForm({ ...editForm, experienceLevel: e.target.value })}
                        >
                          {EXPERIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Availability Status</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs"
                          value={editForm.availability}
                          onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                        >
                          {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">Public Visibility</span>
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, profileVisibility: !editForm.profileVisibility })}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            editForm.profileVisibility ? 'bg-blue-600' : 'bg-slate-800'
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            editForm.profileVisibility ? 'translate-x-4.5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs text-slate-400">Collaboration State</span>
                        <span className="inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                          {user.availability}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-400">Member Since</span>
                        <span className="text-xs text-slate-300 font-medium">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Columns: Bio, Skills, and GitHub stats */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Bio Panel */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-2">Bio</h3>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      {user.bio || "No biography provided yet. Write something awesome to attract teammates!"}
                    </p>
                  )}
                </div>

                {/* Skills & Tech Stack Editor */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                  
                  {/* Skills Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills</h4>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_SKILLS.map(skill => {
                            const selected = editForm.skills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => handleToggleTag('skills', skill)}
                                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                                  selected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add custom skill tag"
                            className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-1.5 flex-grow text-white"
                            value={customSkill}
                            onChange={(e) => setCustomSkill(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomTag('skills', customSkill, setCustomSkill);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomTag('skills', customSkill, setCustomSkill)}
                            className="bg-slate-800 text-white text-xs border border-slate-700 px-3 rounded-lg hover:bg-slate-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {editForm.skills.map(s => (
                            <span key={s} className="bg-blue-950/50 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-800/40 flex items-center gap-1">
                              {s}
                              <button type="button" onClick={() => handleToggleTag('skills', s)} className="text-xs text-blue-400 hover:text-blue-200">&times;</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {user.skills && user.skills.length > 0 ? (
                          user.skills.map(skill => (
                            <span key={skill} className="bg-blue-900/20 text-blue-400 border border-blue-800/30 text-xs px-3 py-1 rounded-md font-medium">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-xs italic">No skills listed yet</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tech Stack Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tech Stack</h4>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_TECH.map(tech => {
                            const selected = editForm.techStack.includes(tech);
                            return (
                              <button
                                key={tech}
                                type="button"
                                onClick={() => handleToggleTag('techStack', tech)}
                                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                                  selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                              >
                                {tech}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add custom tech tag"
                            className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-1.5 flex-grow text-white"
                            value={customTech}
                            onChange={(e) => setCustomTech(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomTag('techStack', customTech, setCustomTech);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomTag('techStack', customTech, setCustomTech)}
                            className="bg-slate-800 text-white text-xs border border-slate-700 px-3 rounded-lg hover:bg-slate-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {editForm.techStack.map(t => (
                            <span key={t} className="bg-emerald-950/50 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                              {t}
                              <button type="button" onClick={() => handleToggleTag('techStack', t)} className="text-xs text-emerald-400 hover:text-emerald-200">&times;</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {user.techStack && user.techStack.length > 0 ? (
                          user.techStack.map(tech => (
                            <span key={tech} className="bg-emerald-900/20 text-emerald-400 border border-emerald-800/30 text-xs px-3 py-1 rounded-md font-medium">
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-xs italic">No tech stack listed yet</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* GitHub Integration Panel */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FaGithub /> GitHub Stats
                    </h3>
                  </div>

                  {isEditing ? (
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">GitHub Username</label>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="username"
                        value={editForm.githubUsername}
                        onChange={(e) => setEditForm({ ...editForm, githubUsername: e.target.value })}
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Changing username will auto-fetch and sync stats upon saving.</p>
                    </div>
                  ) : user.githubUsername ? (
                    <GitHubStats
                      githubData={user.githubData}
                      githubScore={user.githubScore}
                      username={user.githubUsername}
                    />
                  ) : (
                    <div className="text-center py-4 bg-slate-900/30 border border-slate-850 rounded-xl">
                      <p className="text-xs text-slate-500 italic">No GitHub account linked. Toggle edit mode to link your account.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
