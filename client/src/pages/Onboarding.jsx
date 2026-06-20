import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaCamera, FaGraduationCap, FaMapMarkerAlt, 
  FaBriefcase, FaCode, FaGithub, FaEye, FaEyeSlash, 
  FaCheckCircle, FaSpinner, FaChevronRight, FaChevronLeft,
  FaSearch
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { uploadAvatar } from '../services/uploadService';
import api from '../services/api';
import GitHubStats from '../components/GitHubStats';
import GitHubBadge from '../components/GitHubBadge';

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

const Onboarding = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    avatar: { publicId: '', secureUrl: '' },
    bio: '',
    college: '',
    city: '',
    yearOfStudy: '1st Year',
    role: 'Developer',
    experienceLevel: 'Beginner',
    skills: [],
    techStack: [],
    githubUsername: '',
    lookingFor: [],
    availability: 'Available for Teams',
    profileVisibility: true
  });

  // Custom input states for tags
  const [customSkill, setCustomSkill] = useState('');
  const [customTech, setCustomTech] = useState('');

  // GitHub preview state
  const [githubStats, setGithubStats] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');

  // Populate initial name if user exists
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        avatar: user.avatar?.secureUrl ? user.avatar : prev.avatar
      }));
    }
  }, [user]);

  // Upload profile photo
  const [uploadingImage, setUploadingImage] = useState(false);
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadAvatar(file);
      setFormData(prev => ({
        ...prev,
        avatar: { publicId: result.publicId, secureUrl: result.secureUrl }
      }));
    } catch (error) {
      console.error('Image upload failed', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch GitHub stats
  const fetchGithubPreview = async () => {
    if (!formData.githubUsername.trim()) return;
    setGithubLoading(true);
    setGithubError('');
    setGithubStats(null);
    try {
      const res = await api.get(`/github/${formData.githubUsername.trim()}`);
      setGithubStats(res.data);
    } catch (error) {
      setGithubError(error.response?.data?.message || 'Failed to fetch GitHub stats. Verify username.');
    } finally {
      setGithubLoading(false);
    }
  };

  // Tag helpers
  const handleToggleTag = (field, tag) => {
    setFormData(prev => {
      const list = prev[field];
      const index = list.indexOf(tag);
      if (index > -1) {
        return { ...prev, [field]: list.filter(t => t !== tag) };
      } else {
        return { ...prev, [field]: [...list, tag] };
      }
    });
  };

  const handleAddCustomTag = (field, inputState, setInputState) => {
    const val = inputState.trim();
    if (!val) return;
    setFormData(prev => {
      if (prev[field].includes(val)) return prev;
      return { ...prev, [field]: [...prev[field], val] };
    });
    setInputState('');
  };

  // Form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/onboarding', formData);
      setUser(res.data.user);
      navigate('/discover', { replace: true });
    } catch (error) {
      console.error('Onboarding failed:', error);
      alert(error.response?.data?.message || 'Failed to save onboarding data.');
    } finally {
      setLoading(false);
    }
  };

  // Skip onboarding
  const handleSkip = async () => {
    setLoading(true);
    try {
      // Send empty/default payload, backend sets onboardingComplete: true
      const res = await api.put('/users/onboarding', { onboardingComplete: true });
      setUser(res.data.user);
      navigate('/discover', { replace: true });
    } catch (error) {
      console.error('Skip failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      alert('Please enter your full name');
      return;
    }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Stepper labels
  const stepsConfig = [
    { label: 'Identity', icon: FaUser },
    { label: 'Bio', icon: FaGraduationCap },
    { label: 'Role', icon: FaBriefcase },
    { label: 'Skills', icon: FaCode },
    { label: 'GitHub', icon: FaGithub },
    { label: 'Privacy', icon: FaEye }
  ];

  return (
    <div className="relative min-h-screen bg-[#030014] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      {/* Header and Stepper */}
      <div className="relative w-full max-w-2xl text-center mb-8 z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl font-cabinet bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
          Welcome to HackMate AI
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-outfit">
          Let's set up your profile to match you with the perfect hackathon teammates.
        </p>

        {/* Custom Progress Stepper */}
        <div className="mt-10 flex items-center justify-between relative px-2">
          <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-white/5 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 h-[2px] bg-gradient-to-r from-indigo-500 to-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 5) * 100}%` }}
          />

          {stepsConfig.map((item, idx) => {
            const Icon = item.icon;
            const isActive = step >= idx + 1;
            const isCurrent = step === idx + 1;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => idx + 1 < step && setStep(idx + 1)}
                  disabled={idx + 1 >= step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/35 shadow-lg shadow-indigo-500/20' 
                      : isActive 
                        ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer shadow-lg shadow-emerald-500/5' 
                        : 'bg-[#0b0825] text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Icon className="text-sm" />
                </button>
                <span className={`mt-2 text-[10px] sm:text-xs font-medium tracking-wide hidden sm:block font-outfit ${isCurrent ? 'text-indigo-400 font-bold' : isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Glassmorphic Form Card */}
      <div className="relative w-full max-w-2xl glass-panel card-glow-indigo p-8 sm:p-10 rounded-2xl border border-white/5 shadow-2xl overflow-hidden z-10">
        
        {/* Skip button on top corner */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="absolute top-4 right-4 text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full"
        >
          Skip for now
        </button>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              
              {/* STEP 1: Name and Avatar */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 font-cabinet">Let's start with your identity</h3>
                    <p className="text-xs text-slate-400 font-outfit">Fill in your basic information to get recognized.</p>
                  </div>

                  {/* Avatar Upload Container */}
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden bg-slate-950 border-2 border-dashed border-white/10 hover:border-indigo-500 transition-all flex items-center justify-center shadow-inner">
                      {formData.avatar.secureUrl ? (
                        <img 
                          src={formData.avatar.secureUrl} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-center text-slate-400 transition-colors group-hover:text-indigo-400">
                          <FaCamera className="mx-auto text-2xl mb-1.5" />
                          <span className="text-[10px] uppercase tracking-wider font-semibold">Upload Photo</span>
                        </div>
                      )}
                      
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-slate-955/80 flex items-center justify-center">
                          <FaSpinner className="animate-spin text-white text-2xl" />
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 font-outfit">Click card area above to upload image</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-outfit">Full Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <FaUser className="text-slate-500 text-sm" />
                      </div>
                      <input
                        type="text"
                        required
                        className="premium-input block w-full pl-10 pr-4 py-3 text-sm"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Bio, College, City, Year */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 font-cabinet">Tell us about yourself</h3>
                    <p className="text-xs text-slate-400 font-outfit">Share your background and current location.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-outfit">Bio</label>
                    <textarea
                      rows={3}
                      maxLength={300}
                      className="premium-input block w-full px-4 py-3 text-sm resize-none"
                      placeholder="Share a brief bio (interests, focus areas)..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                    <div className="text-right text-[10px] text-slate-500 mt-1 font-outfit">
                      {formData.bio.length}/300
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-outfit">College Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <FaGraduationCap className="text-slate-500 text-sm" />
                        </div>
                        <input
                          type="text"
                          className="premium-input block w-full pl-10 pr-4 py-3 text-sm"
                          placeholder="University Name"
                          value={formData.college}
                          onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-outfit">City</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <FaMapMarkerAlt className="text-slate-500 text-sm" />
                        </div>
                        <input
                          type="text"
                          className="premium-input block w-full pl-10 pr-4 py-3 text-sm"
                          placeholder="e.g. New York"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-outfit">Year of Study</label>
                    <select
                      className="premium-input block w-full px-4 py-3 text-sm bg-[#090622] text-white"
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                    >
                      <option className="bg-[#0c0a21]" value="1st Year">1st Year</option>
                      <option className="bg-[#0c0a21]" value="2nd Year">2nd Year</option>
                      <option className="bg-[#0c0a21]" value="3rd Year">3rd Year</option>
                      <option className="bg-[#0c0a21]" value="4th Year">4th Year</option>
                      <option className="bg-[#0c0a21]" value="Graduate">Graduate</option>
                      <option className="bg-[#0c0a21]" value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: Role and Experience */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 font-cabinet">Define your professional path</h3>
                    <p className="text-xs text-slate-400 font-outfit">Select your specialization and comfort level.</p>
                  </div>

                  {/* Custom Card Selector for Roles */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-outfit">Primary Role</label>
                    <div className="grid grid-cols-2 gap-4">
                      {ROLE_OPTIONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: r })}
                          className={`p-4 rounded-xl border text-center font-semibold transition-all duration-305 ${
                            formData.role === r 
                              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30' 
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-outfit">Experience Level</label>
                    <div className="grid grid-cols-3 gap-4">
                      {EXPERIENCE_OPTIONS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setFormData({ ...formData, experienceLevel: e })}
                          className={`p-3 rounded-xl border text-center text-sm font-semibold transition-all duration-305 ${
                            formData.experienceLevel === e 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' 
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Skills & Tech Stack */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 font-cabinet">Detail your toolkit</h3>
                    <p className="text-xs text-slate-400 font-outfit">Choose tags or add custom skills you possess.</p>
                  </div>

                  {/* Skills Container */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-outfit">Skills</label>
                    
                    {/* Pre-defined popular skill options */}
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SKILLS.map((tag) => {
                        const selected = formData.skills.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag('skills', tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              selected
                                ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                : 'bg-[#0d0a2d]/60 text-slate-300 border border-white/5 hover:border-white/15 hover:bg-[#130f3c]/60'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom skill input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="premium-input block w-full px-3 py-2 text-sm"
                        placeholder="Add custom skill..."
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTag('skills', customSkill, setCustomSkill);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomTag('skills', customSkill, setCustomSkill)}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected tags preview */}
                    {formData.skills.length > 0 && (
                      <div className="border border-white/5 bg-slate-950/20 rounded-xl p-3 flex flex-wrap gap-1.5">
                        {formData.skills.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-850/80">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleToggleTag('skills', tag)}
                              className="ml-1.5 text-indigo-400 hover:text-indigo-200"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tech Stack Container */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-outfit">Tech Stack</label>
                    
                    {/* Pre-defined popular tech stack options */}
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_TECH.map((tag) => {
                        const selected = formData.techStack.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag('techStack', tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              selected
                                ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                : 'bg-[#0d0a2d]/60 text-slate-300 border border-white/5 hover:border-white/15 hover:bg-[#130f3c]/60'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom tech input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="premium-input block w-full px-3 py-2 text-sm"
                        placeholder="Add custom tech (e.g. Kotlin)..."
                        value={customTech}
                        onChange={(e) => setCustomTech(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTag('techStack', customTech, setCustomTech);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomTag('techStack', customTech, setCustomTech)}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected tech preview */}
                    {formData.techStack.length > 0 && (
                      <div className="border border-white/5 bg-slate-950/20 rounded-xl p-3 flex flex-wrap gap-1.5">
                        {formData.techStack.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-850/80">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleToggleTag('techStack', tag)}
                              className="ml-1.5 text-emerald-400 hover:text-emerald-200"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: GitHub stats & Looking For */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 font-cabinet">GitHub Integration</h3>
                    <p className="text-xs text-slate-400 font-outfit">Connect GitHub to populate statistics and select your partner requirements.</p>
                  </div>

                  {/* GitHub integration input and fetch button */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-outfit">GitHub Username (optional)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <FaGithub className="text-slate-500 text-sm" />
                        </div>
                        <input
                          type="text"
                          className="premium-input block w-full pl-10 pr-4 py-3 text-sm"
                          placeholder="github_username"
                          value={formData.githubUsername}
                          onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={fetchGithubPreview}
                        disabled={githubLoading || !formData.githubUsername.trim()}
                        className="bg-indigo-500 hover:bg-indigo-650 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border border-indigo-400/20 shadow-lg shadow-indigo-500/10 cursor-pointer"
                      >
                        {githubLoading ? (
                          <FaSpinner className="animate-spin text-sm" />
                        ) : (
                          <FaSearch className="text-sm" />
                        )}
                        Sync
                      </button>
                    </div>

                    {/* GitHub verification card error */}
                    {githubError && (
                      <p className="mt-2 text-xs text-red-400 font-outfit">{githubError}</p>
                    )}

                    {/* GitHub visual stats preview card */}
                    {githubStats && (
                      <div className="mt-4">
                        <div className="mb-4">
                          <GitHubBadge score={githubStats.githubScore} />
                        </div>
                        <GitHubStats
                          githubData={githubStats}
                          githubScore={githubStats.githubScore}
                          username={githubStats.username}
                        />
                      </div>
                    )}
                  </div>

                  {/* Looking For */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-outfit">Looking For (Role types for teammates)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {ROLE_OPTIONS.map((role) => {
                        const selected = formData.lookingFor.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleToggleTag('lookingFor', role)}
                            className={`p-3 rounded-xl border text-center text-sm font-semibold transition-all duration-305 ${
                              selected 
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30' 
                                : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                            }`}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Availability & Profile Visibility */}
              {step === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 font-cabinet">Preferences & Visibility</h3>
                    <p className="text-xs text-slate-400 font-outfit">Control how other users find you on HackMate.</p>
                  </div>

                  {/* Availability Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-outfit">Availability Status</label>
                    <select
                      className="premium-input block w-full px-4 py-3 text-sm bg-[#090622] text-white"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    >
                      {AVAILABILITY_OPTIONS.map(opt => (
                        <option className="bg-[#0c0a21]" key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Profile Visibility Toggle */}
                  <div className="bg-[#090622]/40 border border-white/5 rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                        {formData.profileVisibility ? <FaEye className="text-lg" /> : <FaEyeSlash className="text-lg" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-outfit">Profile Visibility</h4>
                        <p className="text-xs text-slate-400 font-outfit">
                          {formData.profileVisibility 
                            ? 'Your profile is public. Other users can search and match with you.' 
                            : 'Your profile is private. You will not show up in the discover panel.'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, profileVisibility: !formData.profileVisibility })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          formData.profileVisibility ? 'bg-indigo-650' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.profileVisibility ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Stepper Navigation Actions */}
          <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-5">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-white/5 text-slate-300 font-semibold rounded-xl text-sm hover:bg-[#0a0820]/80 hover:text-white transition-colors cursor-pointer"
              >
                <FaChevronLeft className="text-xs" /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 ml-auto cursor-pointer"
              >
                Next <FaChevronRight className="text-xs" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all ml-auto disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" /> Saving...
                  </>
                ) : (
                  <>
                    Complete Profile <FaCheckCircle className="text-sm" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
