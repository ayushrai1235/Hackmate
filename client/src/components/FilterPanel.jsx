import React, { useState, useEffect } from 'react';
import { 
  FaUserTag, FaLaptopCode, FaGraduationCap, FaMapMarkerAlt, 
  FaTrophy, FaCalendarCheck, FaTags, FaSearchPlus, FaTimes 
} from 'react-icons/fa';

const ROLE_OPTIONS = ['Developer', 'Designer', 'Product Manager', 'Other'];
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const AVAILABILITY_OPTIONS = ['Available for Teams', 'Open to Offers', 'Not Available'];

const FilterPanel = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    role: initialFilters.role || [],
    skills: initialFilters.skills || [],
    college: initialFilters.college || '',
    city: initialFilters.city || '',
    experienceLevel: initialFilters.experienceLevel || '',
    minGithubScore: initialFilters.minGithubScore || 0,
    availability: initialFilters.availability || '',
    techStack: initialFilters.techStack || [],
    lookingFor: initialFilters.lookingFor || [],
    ...initialFilters
  });

  const [skillInput, setSkillInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [lookingInput, setLookingInput] = useState('');

  // Propagate changes on state changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters]);

  const updateFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field, item) => {
    const current = filters[field];
    if (current.includes(item)) {
      updateFilter(field, current.filter(i => i !== item));
    } else {
      updateFilter(field, [...current, item]);
    }
  };

  const handleAddTag = (field, inputState, setInputState) => {
    const value = inputState.trim();
    if (!value) return;
    if (!filters[field].includes(value)) {
      updateFilter(field, [...filters[field], value]);
    }
    setInputState('');
  };

  const handleRemoveTag = (field, index) => {
    const current = [...filters[field]];
    current.splice(index, 1);
    updateFilter(field, current);
  };

  const handleClearAll = () => {
    const cleared = {
      role: [],
      skills: [],
      college: '',
      city: '',
      experienceLevel: '',
      minGithubScore: 0,
      availability: '',
      techStack: [],
      lookingFor: []
    };
    setFilters(cleared);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6 text-slate-100 border border-white/5">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <h3 className="font-bold text-base bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent font-cabinet">
          Filters
        </h3>
        <button
          onClick={handleClearAll}
          className="text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:bg-white/5 px-2.5 py-1.5 rounded-lg transition-all font-outfit"
        >
          Clear All
        </button>
      </div>

      {/* Role Options */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <FaUserTag /> Roles
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          {ROLE_OPTIONS.map(role => {
            const isSelected = filters.role.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleArrayItem('role', role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <FaLaptopCode /> Experience
        </label>
        <select
          value={filters.experienceLevel}
          onChange={(e) => updateFilter('experienceLevel', e.target.value)}
          className="premium-input block w-full px-3 py-2 text-sm"
        >
          <option value="">Any Experience</option>
          {EXPERIENCE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Skills Filter (Tags) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <FaTags /> Skills Required
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag('skills', skillInput, setSkillInput);
              }
            }}
            className="premium-input block w-full px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={() => handleAddTag('skills', skillInput, setSkillInput)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            Add
          </button>
        </div>
        {filters.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5 border border-slate-850/50 rounded-lg p-2 bg-slate-950/20">
            {filters.skills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 text-xxs font-semibold border border-blue-900/40">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('skills', idx)}
                  className="text-blue-400 hover:text-blue-200 transition-colors"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tech Stack Filter (Tags) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <FaSearchPlus /> Tech Stack
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add tech..."
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag('techStack', techInput, setTechInput);
              }
            }}
            className="premium-input block w-full px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={() => handleAddTag('techStack', techInput, setTechInput)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            Add
          </button>
        </div>
        {filters.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5 border border-slate-850/50 rounded-lg p-2 bg-slate-950/20">
            {filters.techStack.map((tech, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 text-xxs font-semibold border border-emerald-900/40">
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('techStack', idx)}
                  className="text-emerald-400 hover:text-emerald-200 transition-colors"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* College Info */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <FaGraduationCap /> College / University
        </label>
        <input
          type="text"
          placeholder="e.g. Stanford University"
          value={filters.college}
          onChange={(e) => updateFilter('college', e.target.value)}
          className="premium-input block w-full px-3 py-2 text-sm"
        />
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <FaMapMarkerAlt /> City
        </label>
        <input
          type="text"
          placeholder="e.g. San Francisco"
          value={filters.city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="premium-input block w-full px-3 py-2 text-sm"
        />
      </div>

      {/* GitHub Score range */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 font-outfit"><FaTrophy /> Min GitHub Score</span>
          <span className="text-indigo-400 font-semibold font-outfit">{filters.minGithubScore}+</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="5"
          value={filters.minGithubScore}
          onChange={(e) => updateFilter('minGithubScore', parseInt(e.target.value))}
          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <FaCalendarCheck /> Availability Status
        </label>
        <select
          value={filters.availability}
          onChange={(e) => updateFilter('availability', e.target.value)}
          className="premium-input block w-full px-3 py-2 text-sm"
        >
          <option value="">Any Status</option>
          {AVAILABILITY_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Looking For (Tags) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <FaUserTag /> Looking For
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add looking for..."
            value={lookingInput}
            onChange={(e) => setLookingInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag('lookingFor', lookingInput, setLookingInput);
              }
            }}
            className="premium-input block w-full px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={() => handleAddTag('lookingFor', lookingInput, setLookingInput)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            Add
          </button>
        </div>
        {filters.lookingFor.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5 border border-slate-850/50 rounded-lg p-2 bg-slate-950/20">
            {filters.lookingFor.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 text-xxs font-semibold border border-purple-900/40">
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('lookingFor', idx)}
                  className="text-purple-400 hover:text-purple-200 transition-colors"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default FilterPanel;
