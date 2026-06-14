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
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);

  // Overlay opacities tied to drag distance
  const likeOpacity = useTransform(x, [0, 80, 150], [0, 0.6, 1]);
  const passOpacity = useTransform(x, [-150, -80, 0], [1, 0.6, 0]);
  const superOpacity = useTransform(y, [-150, -80, 0], [1, 0.6, 0]);

  // Background tint during drag
  const bgGradient = useTransform(
    x,
    [-200, 0, 200],
    [
      'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(15,23,42,0.8) 100%)',
      'linear-gradient(135deg, rgba(30,41,59,0.85) 0%, rgba(15,23,42,0.95) 100%)',
      'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(15,23,42,0.8) 100%)',
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

    // Spring back handled by dragConstraints
  };

  const matchScore = user.matchScore || 0;
  const scoreBadgeStyles =
    matchScore >= 75
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
      : matchScore >= 45
        ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
        : 'text-slate-400 border-white/10 bg-white/5';

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
      dragElastic={0.85}
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
        rotate: exitX > 0 ? 15 : exitX < 0 ? -15 : 0,
        transition: { duration: 0.35, ease: 'easeOut' },
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      whileDrag={{ cursor: 'grabbing', scale: 1.025 }}
    >
      <motion.div
        className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col relative group"
        style={{ background: isTop ? bgGradient : 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(8,10,18,0.95) 100%)' }}
      >
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none" />

        {/* ─── Swipe Overlays ─── */}
        {isTop && (
          <>
          {/* LIKE overlay */}
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              style={{ opacity: likeOpacity }}
            >
              <div className="border-2 border-emerald-400 rounded-2xl px-8 py-3 rotate-[-12deg] bg-emerald-950/80 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <span className="text-emerald-400 text-3xl font-black font-cabinet tracking-widest flex items-center gap-2">
                  LIKE <FaHeart className="text-2xl animate-pulse" />
                </span>
              </div>
            </motion.div>

            {/* PASS overlay */}
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              style={{ opacity: passOpacity }}
            >
              <div className="border-2 border-red-500 rounded-2xl px-8 py-3 rotate-[12deg] bg-red-950/80 backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <span className="text-red-400 text-3xl font-black font-cabinet tracking-widest flex items-center gap-2">
                  PASS <FaTimes className="text-2xl" />
                </span>
              </div>
            </motion.div>

            {/* SUPER LIKE overlay */}
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              style={{ opacity: superOpacity }}
            >
              <div className="border-2 border-yellow-400 rounded-2xl px-8 py-3 bg-yellow-950/80 backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <span className="text-yellow-400 text-3xl font-black font-cabinet tracking-widest flex items-center gap-2">
                  SUPER <FaStar className="text-2xl animate-spin" style={{ animationDuration: '3s' }} />
                </span>
              </div>
            </motion.div>
          </>
        )}

        {/* ─── Card Banner ─── */}
        <div className="h-28 bg-gradient-to-tr from-indigo-950 via-slate-950 to-emerald-950/30 relative flex-shrink-0 border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-t from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Match Score Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${scoreBadgeStyles}`}>
              {matchScore}% Match
            </div>
          </div>

          {/* GitHub score */}
          {user.githubScore > 0 && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-slate-950/80 border border-white/10 px-2.5 py-1 rounded-full shadow-lg">
              <FaGithub className="text-slate-300 text-xs" />
              <span className="text-[10px] font-black text-emerald-400">{user.githubScore}</span>
            </div>
          )}

          {/* View profile button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile?.(user);
            }}
            className="absolute bottom-3 right-4 z-10 bg-slate-950/80 hover:bg-indigo-600/20 hover:border-indigo-400 border border-white/10 text-slate-300 p-2.5 rounded-full text-xs transition-all duration-300 shadow-lg"
            title="View Full Profile"
          >
            <FaInfoCircle className="text-sm" />
          </button>
        </div>

        {/* ─── Card Body ─── */}
        <div className="flex-1 px-6 pb-4 flex flex-col relative bg-slate-950/45 backdrop-blur-xl">
          {/* Avatar Squircle */}
          <div className="w-18 h-18 rounded-[1.25rem] overflow-hidden bg-slate-950 border border-white/10 absolute -top-9 left-6 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/50">
            <img
              src={
                user.avatar?.secureUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=131520&color=6366f1&size=128`
              }
              alt={user.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* User Info */}
          <div className="pt-11 space-y-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-cabinet font-black text-white truncate leading-tight tracking-tight">
                {user.name}
              </h2>
              <span className="text-[9px] uppercase font-black tracking-widest bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0 ml-3">
                {user.availability || 'Available'}
              </span>
            </div>
            
            <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                <FaBriefcase className="text-[9px] text-indigo-400" /> {user.role} · {user.experienceLevel}
              </span>
              {user.college && (
                <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                  <FaGraduationCap className="text-[9px] text-emerald-400" /> {user.college}
                  {user.yearOfStudy ? ` (${user.yearOfStudy})` : ''}
                </span>
              )}
              {user.city && (
                <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                  <FaMapMarkerAlt className="text-[9px] text-pink-400" /> {user.city}
                </span>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-xs text-slate-300 mt-4 leading-relaxed line-clamp-2 italic font-light">
            "{user.bio || 'Ready to build something awesome at the next hackathon!'}"
          </p>

          {/* Skills & Tech Stack */}
          <div className="mt-4 space-y-3 flex-1 overflow-hidden">
            {user.skills?.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                  Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="bg-indigo-950/20 text-indigo-400 border border-indigo-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.techStack?.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                  Tech Stack
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.techStack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.lookingFor?.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                  Looking For
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.lookingFor.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="bg-purple-950/20 text-purple-400 border border-purple-500/10 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
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
            <div className="flex items-center justify-center gap-5 pt-3 pb-2 mt-auto">
              {/* Pass Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipe?.('left');
                }}
                className="w-12 h-12 rounded-full border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-90"
                title="Pass (← key)"
              >
                <FaTimes className="text-lg" />
              </button>

              {/* Super Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipe?.('super');
                }}
                className="w-10 h-10 rounded-full border border-yellow-500/20 hover:border-yellow-500 text-yellow-400 hover:text-white hover:bg-yellow-500/10 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] active:scale-90"
                title="Super Like (↑ key)"
              >
                <FaStar className="text-sm animate-pulse" />
              </button>

              {/* Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipe?.('right');
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 flex items-center justify-center shadow-xl shadow-emerald-500/15 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-90"
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
