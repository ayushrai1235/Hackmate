import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  FaTimes,
  FaHeart,
  FaStar,
  FaBriefcase,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaGithub,
  FaInfoCircle,
} from 'react-icons/fa';

const SwipeCard = ({ user, onSwipe, onViewProfile, isTop = false, style = {} }) => {
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotation tied to horizontal drag
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);

  // Overlay opacities tied to drag distance
  const likeOpacity = useTransform(x, [0, 80, 150], [0, 0.5, 1]);
  const passOpacity = useTransform(x, [-150, -80, 0], [1, 0.5, 0]);
  const superOpacity = useTransform(y, [-150, -80, 0], [1, 0.5, 0]);

  // Background tint
  const bgGradient = useTransform(
    x,
    [-200, 0, 200],
    [
      'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 100%)',
      'linear-gradient(135deg, transparent 0%, transparent 100%)',
      'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 100%)',
    ]
  );

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;

    // Super like: strong upward swipe
    if (offset.y < -80 && Math.abs(offset.x) < 100) {
      setExitY(-600);
      onSwipe?.('super');
      return;
    }

    // Right swipe (like)
    if (offset.x > 120 || (offset.x > 60 && velocity.x > 500)) {
      setExitX(600);
      onSwipe?.('right');
      return;
    }

    // Left swipe (pass)
    if (offset.x < -120 || (offset.x < -60 && velocity.x < -500)) {
      setExitX(-600);
      onSwipe?.('left');
      return;
    }

    // Not enough — spring back (handled by dragConstraints)
  };

  const matchScore = user.matchScore || 0;
  const scoreColor =
    matchScore >= 75
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : matchScore >= 45
        ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
        : 'text-slate-400 border-slate-600/30 bg-slate-600/10';

  return (
    <motion.div
      className="absolute inset-0 touch-none select-none"
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
        ...style,
        zIndex: isTop ? 10 : style.zIndex || 0,
        cursor: isTop ? 'grab' : 'default',
      }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
      initial={{ scale: style.scale || 1, y: style.y || 0, opacity: 1 }}
      animate={{
        scale: style.scale || 1,
        y: style.y || 0,
        opacity: 1,
      }}
      exit={{
        x: exitX,
        y: exitY || 0,
        opacity: 0,
        rotate: exitX > 0 ? 20 : exitX < 0 ? -20 : 0,
        transition: { duration: 0.4, ease: 'easeOut' },
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
    >
      <motion.div
        className="w-full h-full rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col"
        style={{ background: isTop ? bgGradient : 'rgba(15,23,42,0.6)' }}
      >
        {/* ─── Swipe Overlays ─── */}
        {isTop && (
          <>
            {/* LIKE overlay */}
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              style={{ opacity: likeOpacity }}
            >
              <div className="border-4 border-emerald-400 rounded-2xl px-8 py-4 rotate-[-15deg] bg-emerald-500/10 backdrop-blur-sm">
                <span className="text-emerald-400 text-4xl font-black tracking-wider">LIKE ✓</span>
              </div>
            </motion.div>

            {/* PASS overlay */}
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              style={{ opacity: passOpacity }}
            >
              <div className="border-4 border-red-400 rounded-2xl px-8 py-4 rotate-[15deg] bg-red-500/10 backdrop-blur-sm">
                <span className="text-red-400 text-4xl font-black tracking-wider">PASS ✗</span>
              </div>
            </motion.div>

            {/* SUPER LIKE overlay */}
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              style={{ opacity: superOpacity }}
            >
              <div className="border-4 border-yellow-400 rounded-2xl px-8 py-4 bg-yellow-500/10 backdrop-blur-sm">
                <span className="text-yellow-400 text-4xl font-black tracking-wider">⭐ SUPER</span>
              </div>
            </motion.div>
          </>
        )}

        {/* ─── Card Banner ─── */}
        <div className="h-28 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-purple-900/60 relative flex-shrink-0">
          {/* Match Score Badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black ${scoreColor}`}>
              {matchScore}% Match
            </div>
          </div>

          {/* GitHub score */}
          {user.githubScore > 0 && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-lg">
              <FaGithub className="text-slate-300 text-xs" />
              <span className="text-[10px] font-bold text-emerald-400">{user.githubScore}</span>
            </div>
          )}

          {/* View profile button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile?.(user);
            }}
            className="absolute bottom-3 right-3 z-10 bg-slate-950/70 hover:bg-slate-900 border border-slate-700 text-slate-300 p-2 rounded-full text-xs transition-colors"
            title="View Full Profile"
          >
            <FaInfoCircle className="text-sm" />
          </button>
        </div>

        {/* ─── Card Body ─── */}
        <div className="flex-1 px-5 pb-3 flex flex-col relative bg-slate-950/50 backdrop-blur-xl">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-900 absolute -top-8 shadow-lg shadow-black/30">
            <img
              src={
                user.avatar?.secureUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1e293b&color=94a3b8&size=128`
              }
              alt={user.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* User Info */}
          <div className="pt-10 space-y-1 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white truncate">{user.name}</h2>
              <span className="text-[9px] uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 flex-shrink-0 ml-2">
                {user.availability || 'Available'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="flex items-center gap-0.5">
                <FaBriefcase className="text-[9px]" /> {user.role} · {user.experienceLevel}
              </span>
              {user.college && (
                <span className="flex items-center gap-0.5">
                  <FaGraduationCap className="text-[9px]" /> {user.college}
                  {user.yearOfStudy ? ` (${user.yearOfStudy})` : ''}
                </span>
              )}
              {user.city && (
                <span className="flex items-center gap-0.5">
                  <FaMapMarkerAlt className="text-[9px]" /> {user.city}
                </span>
              )}
            </p>
          </div>

          {/* Bio */}
          <p className="text-[11px] text-slate-300 mt-3 leading-relaxed line-clamp-2 italic">
            "{user.bio || 'Ready to build something awesome at the next hackathon!'}"
          </p>

          {/* Skills & Tech Stack */}
          <div className="mt-3 space-y-2.5 flex-1 overflow-hidden">
            {user.skills?.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                  Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-900/20 text-blue-400 border border-blue-800/15 text-[10px] px-2 py-0.5 rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.techStack?.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                  Tech Stack
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.techStack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="bg-emerald-900/20 text-emerald-400 border border-emerald-800/15 text-[10px] px-2 py-0.5 rounded font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.lookingFor?.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                  Looking For
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.lookingFor.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="bg-purple-900/20 text-purple-400 border border-purple-800/15 text-[10px] px-2 py-0.5 rounded font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Action Buttons ─── */}
          {isTop && (
            <div className="flex items-center justify-center gap-4 pt-3 pb-2 mt-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipe?.('left');
                }}
                className="w-12 h-12 rounded-full border-2 border-red-500/30 hover:border-red-500 text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center shadow-lg hover:shadow-red-500/15 active:scale-90"
                title="Pass (← key)"
              >
                <FaTimes className="text-lg" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipe?.('super');
                }}
                className="w-10 h-10 rounded-full border-2 border-yellow-500/30 hover:border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition-all flex items-center justify-center shadow-lg hover:shadow-yellow-500/15 active:scale-90"
                title="Super Like (↑ key)"
              >
                <FaStar className="text-sm" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipe?.('right');
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-90"
                title="Like (→ key)"
              >
                <FaHeart className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SwipeCard;
