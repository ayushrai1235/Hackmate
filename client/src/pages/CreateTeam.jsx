import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaSpinner, FaArrowLeft, FaSave, FaPlus, FaTimes, FaCamera 
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import teamService from '../services/teamService';
import { uploadAvatar } from '../services/uploadService';

const AVAILABLE_ROLES = ['Developer', 'Designer', 'Product Manager', 'Other'];
const POPULAR_TECH = [
  'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 
  'Python', 'JavaScript', 'TypeScript', 'Docker', 'AWS', 
  'TailwindCSS', 'Figma', 'Next.js', 'Go', 'Rust'
];

const CreateTeam = ({ isEdit = false }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id: teamId } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    hackathonName: '',
    logo: { publicId: '', secureUrl: '' },
    requiredRoles: [],
    techStack: [],
  });

  const [customTech, setCustomTech] = useState('');

  // Fetch team details if in edit mode
  useEffect(() => {
    if (isEdit && teamId) {
      const fetchTeamDetails = async () => {
        setFetching(true);
        try {
          const data = await teamService.getTeam(teamId);
          const { team } = data;
          
          // Verify current user is owner
          if (team.owner._id !== user._id && team.owner !== user._id) {
            alert('Only the team owner can edit details.');
            navigate(`/teams/${teamId}`);
            return;
          }

          setForm({
            name: team.name || '',
            description: team.description || '',
            hackathonName: team.hackathonName || '',
            logo: team.logo?.secureUrl ? team.logo : { publicId: '', secureUrl: '' },
            requiredRoles: team.requiredRoles || [],
            techStack: team.techStack || [],
          });
        } catch (error) {
          console.error('Error fetching team details:', error);
          alert('Failed to fetch team details.');
          navigate('/teams');
        } finally {
          setFetching(false);
        }
      };
      fetchTeamDetails();
    }
  }, [isEdit, teamId, user._id, navigate]);

  // Handle Logo file upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      // Reusing avatar upload proxy as it accepts image uploads to Cloudinary
      const result = await uploadAvatar(file);
      setForm((prev) => ({
        ...prev,
        logo: { publicId: result.publicId, secureUrl: result.secureUrl },
      }));
    } catch (err) {
      console.error(err);
      alert('Logo upload failed. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  // Toggle roles in requiredRoles array
  const toggleRequiredRole = (role) => {
    setForm((prev) => {
      const roles = prev.requiredRoles;
      if (roles.includes(role)) {
        return { ...prev, requiredRoles: roles.filter((r) => r !== role) };
      } else {
        return { ...prev, requiredRoles: [...roles, role] };
      }
    });
  };

  // Add / Remove Tech Stack
  const toggleTech = (tech) => {
    setForm((prev) => {
      const list = prev.techStack;
      if (list.includes(tech)) {
        return { ...prev, techStack: list.filter((t) => t !== tech) };
      } else {
        return { ...prev, techStack: [...list, tech] };
      }
    });
  };

  const addCustomTech = () => {
    const trimmed = customTech.trim();
    if (!trimmed) return;
    if (form.techStack.includes(trimmed)) {
      setCustomTech('');
      return;
    }
    setForm((prev) => ({
      ...prev,
      techStack: [...prev.techStack, trimmed],
    }));
    setCustomTech('');
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Team name is required');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await teamService.updateTeam(teamId, form);
        alert('Team updated successfully!');
        navigate(`/teams/${teamId}`);
      } else {
        const data = await teamService.createTeam(form);
        alert('Team created successfully!');
        navigate(`/teams/${data.team._id}`);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error saving team configuration.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Action */}
        <button
          onClick={() => navigate(isEdit ? `/teams/${teamId}` : '/teams')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <FaArrowLeft className="text-[10px]" /> Back to {isEdit ? 'Team Details' : 'Discovery'}
        </button>

        {/* Form Container */}
        <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8">
            <h1 className="text-2xl font-black text-white">
              {isEdit ? 'Configure Your Team' : 'Form a New Team'}
            </h1>
            <p className="text-xs text-blue-100 mt-1.5">
              {isEdit 
                ? 'Modify the required roles, tech stacks, and team information.' 
                : 'Define your hackathon project, outline the required competencies, and find collaborators.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Logo and Name row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              
              {/* Logo Upload Box */}
              <div className="md:col-span-1 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 mb-2.5">Team Logo</span>
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group cursor-pointer shadow-inner">
                  {form.logo?.secureUrl ? (
                    <img src={form.logo.secureUrl} alt="Logo" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                  ) : (
                    <div className="text-center text-slate-500 group-hover:text-slate-300">
                      <FaCamera className="text-2xl mx-auto mb-1" />
                      <span className="text-[9px] uppercase font-bold tracking-wider">Upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaCamera className="text-sm mr-1" /> Change
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imageUploading && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                      <FaSpinner className="animate-spin text-white text-sm" />
                    </div>
                  )}
                </div>
              </div>

              {/* Names */}
              <div className="md:col-span-3 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter team name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hackathon Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HackMIT, ETHGlobal..."
                    value={form.hackathonName}
                    onChange={(e) => setForm({ ...form, hackathonName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Description</label>
              <textarea
                rows={4}
                placeholder="What is your team building? Describe your project vision..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors resize-none"
              />
            </div>

            {/* Required Roles (Multi-select toggles) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Required Roles</label>
              <p className="text-[10px] text-slate-500 mb-2">Select the roles you are actively searching for to complete your team.</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map((role) => {
                  const selected = form.requiredRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRequiredRole(role)}
                      className={`text-xs px-4 py-2 rounded-xl border font-semibold transition-all ${
                        selected 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-md shadow-red-500/5' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tech Stack Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-bold">Tech Stack & Tools</label>
              
              {/* Popular list */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TECH.map((tech) => {
                  const selected = form.techStack.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                        selected 
                          ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-semibold' 
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom stack tool"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTech();
                    }
                  }}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 flex-grow text-white placeholder-slate-700 focus:outline-none focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={addCustomTech}
                  className="bg-slate-800 text-white text-xs border border-slate-700 px-4 rounded-xl hover:bg-slate-750 font-bold transition-all"
                >
                  Add
                </button>
              </div>

              {/* Rendered Stack list */}
              {form.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {form.techStack.map((t) => (
                    <span 
                      key={t} 
                      className="bg-blue-900/25 text-blue-300 text-[10px] px-2.5 py-1 rounded-lg border border-blue-800/40 flex items-center gap-1.5"
                    >
                      {t}
                      <button 
                        type="button" 
                        onClick={() => toggleTech(t)} 
                        className="text-xs text-blue-400 hover:text-blue-200 font-black"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="pt-6 border-t border-slate-800/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(isEdit ? `/teams/${teamId}` : '/teams')}
                className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/15 disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaSave className="text-xs" />}
                {isEdit ? 'Save Changes' : 'Create Team'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};

export default CreateTeam;
