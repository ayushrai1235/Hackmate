import React from 'react';
import { FaGithub, FaCheckCircle } from 'react-icons/fa';

const GitHubBadge = ({ score, className = '' }) => {
  if (!score || score <= 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-950/20 backdrop-blur-sm group hover:border-emerald-400/50 hover:shadow-emerald-500/10 transition-all duration-300 ${className}`}
    >
      <FaGithub className="text-slate-200 group-hover:rotate-12 transition-transform duration-300" />
      <span className="text-slate-300">GitHub Verified</span>
      <FaCheckCircle className="text-emerald-500 animate-pulse" />
      <span className="pl-1 border-l border-slate-800 text-[10px] uppercase tracking-wider text-emerald-300">
        Score: {score}
      </span>
    </div>
  );
};

export default GitHubBadge;
