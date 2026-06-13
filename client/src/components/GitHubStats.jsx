import React from 'react';
import { FaGithub, FaStar, FaCodeBranch, FaCalendarAlt, FaAward } from 'react-icons/fa';

const GitHubStats = ({ githubData, githubScore, username, className = '' }) => {
  if (!githubData) return null;

  const { repos = 0, stars = 0, languages = {}, contributions = 0 } = githubData;
  const languageList = Object.entries(languages || {});

  // Group levels and assign display colors/styles
  const getLevelBadgeStyles = (level) => {
    switch (level) {
      case 'Advanced':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          bar: 'bg-emerald-500',
          percent: 'w-full',
        };
      case 'Intermediate':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          bar: 'bg-amber-500',
          percent: 'w-2/3',
        };
      case 'Beginner':
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          bar: 'bg-blue-500',
          percent: 'w-1/3',
        };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header Card */}
      {username && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center">
              <FaGithub className="text-xl text-slate-300" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">GitHub Profile</span>
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
              >
                @{username}
              </a>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">Global Score</span>
            <span className="inline-flex items-center gap-1 text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              <FaAward className="text-emerald-400 text-sm" /> {githubScore || 0}
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Repos Card */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/20 transition-all duration-300 group text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2.5 mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
            <FaCodeBranch className="text-sm" />
          </div>
          <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Repositories</span>
          <span className="text-xl font-black text-slate-200 mt-0.5 block">{repos}</span>
        </div>

        {/* Stars Card */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/20 transition-all duration-300 group text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-2.5 mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
            <FaStar className="text-sm" />
          </div>
          <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Stars</span>
          <span className="text-xl font-black text-slate-200 mt-0.5 block">{stars}</span>
        </div>

        {/* Contributions Card */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/20 transition-all duration-300 group text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2.5 mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
            <FaCalendarAlt className="text-sm" />
          </div>
          <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Contributions</span>
          <span className="text-xl font-black text-slate-200 mt-0.5 block">{contributions}</span>
        </div>

        {/* Rank Score Card */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/20 transition-all duration-300 group text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2.5 mx-auto sm:mx-0 group-hover:scale-110 transition-transform">
            <FaAward className="text-sm" />
          </div>
          <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">GitHub Rating</span>
          <span className="text-xl font-black text-slate-200 mt-0.5 block">{githubScore || 0}</span>
        </div>
      </div>

      {/* Languages Proficiency Panel */}
      {languageList.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Language Proficiency Analysis
          </h4>
          <div className="space-y-3">
            {languageList.slice(0, 5).map(([lang, level]) => {
              const styles = getLevelBadgeStyles(level);
              return (
                <div key={lang} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{lang}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${styles.bg}`}
                    >
                      {level}
                    </span>
                  </div>
                  {/* Visual Progress Indicator */}
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${styles.bar} ${styles.percent}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubStats;
