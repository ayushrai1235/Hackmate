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
      const res = await api.get(`/users/github-stats/${formData.githubUsername.trim()}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-905 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header and Stepper */}
      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Welcome to HackMate AI
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Let's set up your profile to match you with the perfect hackathon teammates.
        </p>

        {/* Custom Progress Stepper */}
        <div className="mt-8 flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-700 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-300"
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
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' 
                      : isActive 
                        ? 'bg-emerald-500 text-white cursor-pointer' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Icon className="text-sm" />
                </button>
                <span className={`mt-2 text-xs font-medium hidden sm:block ${isCurrent ? 'text-blue-400 font-semibold' : isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Glassmorphic Form Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-2xl p-8 max-w-2xl w-full relative overflow-hidden">
        
        {/* Skip button on top corner */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider bg-slate-800/40 hover:bg-slate-800 px-3 py-1.5 rounded-full"
        >
          Skip for now
        </button>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* STEP 1: Name and Avatar */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Let's start with your identity</h3>
                    <p className="text-xs text-slate-400">Fill in your basic information to get recognized.</p>
                  </div>

                  {/* Avatar Upload Container */}
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-2 border-dashed border-slate-600 hover:border-blue-500 transition-all flex items-center justify-center">
                      {formData.avatar.secureUrl ? (
                        <img 
                          src={formData.avatar.secureUrl} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-center text-slate-500">
                          <FaCamera className="mx-auto text-2xl mb-1 text-slate-400" />
                          <span className="text-xs">Photo</span>
                        </div>
                      )}
                      
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-slate-905/70 flex items-center justify-center">
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
                    <p className="text-xs text-slate-400 mt-2">Click to upload your profile picture</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-slate-500 text-sm" />
                      </div>
                      <input
                        type="text"
                        required
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
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
                    <h3 className="text-xl font-bold text-white mb-1">Tell us about yourself</h3>
                    <p className="text-xs text-slate-400">Share your background and current location.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                    <textarea
                      rows={3}
                      maxLength={300}
                      className="block w-full px-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm resize-none"
                      placeholder="Share a brief bio (interests, focus areas)..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                    <div className="text-right text-xs text-slate-500 mt-1">
                      {formData.bio.length}/300
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">College Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaGraduationCap className="text-slate-500 text-sm" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                          placeholder="University Name"
                          value={formData.college}
                          onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaMapMarkerAlt className="text-slate-500 text-sm" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                          placeholder="e.g. New York"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Year of Study</label>
                    <select
                      className="block w-full px-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
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
              )}

              {/* STEP 3: Role and Experience */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Define your professional path</h3>
                    <p className="text-xs text-slate-400">Select your specialization and comfort level.</p>
                  </div>

                  {/* Custom Card Selector for Roles */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3 font-semibold">Primary Role</label>
                    <div className="grid grid-cols-2 gap-4">
                      {ROLE_OPTIONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: r })}
                          className={`p-4 rounded-xl border text-center font-medium transition-all ${
                            formData.role === r 
                              ? 'bg-blue-500/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/30' 
                              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3 font-semibold">Experience Level</label>
                    <div className="grid grid-cols-3 gap-4">
                      {EXPERIENCE_OPTIONS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setFormData({ ...formData, experienceLevel: e })}
                          className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${
                            formData.experienceLevel === e 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/30' 
                              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
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
                    <h3 className="text-xl font-bold text-white mb-1">Detail your toolkit</h3>
                    <p className="text-xs text-slate-400">Choose tags or add custom skills you possess.</p>
                  </div>

                  {/* Skills Container */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300 font-semibold">Skills</label>
                    
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
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
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
                        className="block w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent sm:text-sm"
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
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg text-sm transition-colors border border-slate-700"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected tags preview */}
                    {formData.skills.length > 0 && (
                      <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-3 flex flex-wrap gap-1.5">
                        {formData.skills.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-900/40 text-blue-300 border border-blue-800">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleToggleTag('skills', tag)}
                              className="ml-1.5 text-blue-400 hover:text-blue-200"
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
                    <label className="block text-sm font-medium text-slate-300 font-semibold">Tech Stack</label>
                    
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
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
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
                        className="block w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
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
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg text-sm transition-colors border border-slate-700"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected tech preview */}
                    {formData.techStack.length > 0 && (
                      <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-3 flex flex-wrap gap-1.5">
                        {formData.techStack.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-800">
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
                    <h3 className="text-xl font-bold text-white mb-1">GitHub Integration & Collaboration</h3>
                    <p className="text-xs text-slate-400">Connect GitHub to populate statistics and select your partner requirements.</p>
                  </div>

                  {/* GitHub integration input and fetch button */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">GitHub Username (optional)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaGithub className="text-slate-500 text-sm" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                          placeholder="github_username"
                          value={formData.githubUsername}
                          onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={fetchGithubPreview}
                        disabled={githubLoading || !formData.githubUsername.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
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
                      <p className="mt-2 text-xs text-red-400">{githubError}</p>
                    )}

                    {/* GitHub visual stats preview card */}
                    {githubStats && (
                      <div className="mt-4 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            <FaGithub className="text-slate-300" /> Sync Success
                          </span>
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                            Score: {githubStats.githubScore}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-900/60 p-2 rounded-lg">
                            <span className="block text-slate-500">Repos</span>
                            <span className="text-sm font-bold text-slate-200">{githubStats.githubData.repos}</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded-lg">
                            <span className="block text-slate-500">Stars</span>
                            <span className="text-sm font-bold text-slate-200">{githubStats.githubData.stars}</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded-lg">
                            <span className="block text-slate-500">Contributions</span>
                            <span className="text-sm font-bold text-slate-200">{githubStats.githubData.contributions}</span>
                          </div>
                        </div>
                        {githubStats.githubData.languages && Object.keys(githubStats.githubData.languages).length > 0 && (
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Languages Detected:</span>
                            <div className="flex flex-wrap gap-1">
                              {Object.keys(githubStats.githubData.languages).slice(0, 4).map(lang => (
                                <span key={lang} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Looking For */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3 font-semibold">Looking For (Role types for teammates)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {ROLE_OPTIONS.map((role) => {
                        const selected = formData.lookingFor.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleToggleTag('lookingFor', role)}
                            className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${
                              selected 
                                ? 'bg-blue-500/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/30' 
                                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
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
                    <h3 className="text-xl font-bold text-white mb-1">Preferences & Visibility</h3>
                    <p className="text-xs text-slate-400">Control how other users find you on HackMate.</p>
                  </div>

                  {/* Availability Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Availability Status</label>
                    <select
                      className="block w-full px-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    >
                      {AVAILABILITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Profile Visibility Toggle */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-blue-400">
                        {formData.profileVisibility ? <FaEye className="text-lg" /> : <FaEyeSlash className="text-lg" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Profile Visibility</h4>
                        <p className="text-xs text-slate-400">
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
                          formData.profileVisibility ? 'bg-blue-600' : 'bg-slate-800'
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
          <div className="mt-8 flex justify-between items-center border-t border-slate-850 pt-5">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-850 text-slate-300 font-semibold rounded-lg text-sm hover:bg-slate-800 transition-colors"
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
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors ml-auto"
              >
                Next <FaChevronRight className="text-xs" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm shadow-lg shadow-blue-500/20 transition-all ml-auto disabled:opacity-50"
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
