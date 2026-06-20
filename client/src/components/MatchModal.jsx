import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FaComments, FaUsers, FaArrowRight } from 'react-icons/fa';

const MatchModal = ({ isOpen, onClose, matchData, currentUser }) => {
  const hasConfettiFired = useRef(false);

  useEffect(() => {
    if (isOpen && !hasConfettiFired.current) {
      hasConfettiFired.current = true;

      // Fire confetti bursts
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Big center burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
        });
      }, 300);
    }

    if (!isOpen) {
      hasConfettiFired.current = false;
    }
  }, [isOpen]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => onClose?.('continue'), 8000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!matchData) return null;

  // Extract the matched user (the one who isn't currentUser)
  const matchedUser = matchData.users?.find(
    (u) => u._id !== currentUser?._id
  ) || matchData.users?.[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose?.('continue')}
          />

          {/* Content Card */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center p-8 max-w-md w-full glass-panel rounded-3xl border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/15 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/15 rounded-full filter blur-3xl pointer-events-none" />

            {/* Celebration emoji */}
            <motion.div
              className="text-6xl mb-3 relative z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 250, damping: 12 }}
            >
              🎉
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl font-cabinet font-black bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              It's A Match!
            </motion.h1>

            {/* Avatars Grid */}
            <motion.div
              className="flex items-center justify-center gap-6 mb-8 relative z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {/* Current user avatar */}
              <div className="relative group">
                <motion.div
                  className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-lg p-0.5 bg-slate-950"
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(16,185,129,0.2)',
                      '0 0 30px rgba(16,185,129,0.4)',
                      '0 0 15px rgba(16,185,129,0.2)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <img
                    src={
                      currentUser?.avatar?.secureUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'You')}&background=0f172a&color=cbd5e1&size=128`
                    }
                    alt={currentUser?.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </motion.div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] font-outfit font-semibold text-slate-300 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md">
                  You
                </div>
              </div>

              {/* Heart connector */}
              <motion.div
                className="text-3xl filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ❤️
              </motion.div>

              {/* Matched user avatar */}
              <div className="relative group">
                <motion.div
                  className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/80 shadow-lg p-0.5 bg-slate-950"
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(99,102,241,0.2)',
                      '0 0 30px rgba(99,102,241,0.4)',
                      '0 0 15px rgba(99,102,241,0.2)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <img
                    src={
                      matchedUser?.avatar?.secureUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser?.name || 'Match')}&background=0f172a&color=cbd5e1&size=128`
                    }
                    alt={matchedUser?.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </motion.div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] font-outfit font-semibold text-slate-300 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md">
                  {matchedUser?.name?.split(' ')[0] || 'Match'}
                </div>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-sm font-sans text-slate-300/90 mb-8 max-w-xs leading-relaxed relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              You and <span className="text-white font-bold">{matchedUser?.name}</span> want to hack together! Start a conversation or invite them to your team.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 w-full relative z-10 font-outfit"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => onClose?.('chat')}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <FaComments className="text-base" /> Start Chat
              </button>

              <button
                onClick={() => onClose?.('team')}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer hover:border-indigo-500/30"
              >
                <FaUsers className="text-base text-indigo-400" /> Invite to Team
              </button>
            </motion.div>

            {/* Continue swiping link */}
            <motion.button
              onClick={() => onClose?.('continue')}
              className="mt-6 text-xs font-outfit text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Continue Swiping{' '}
              <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;
