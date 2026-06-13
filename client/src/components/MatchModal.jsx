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
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'],
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
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'],
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
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose?.('continue')}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full"
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.8 }}
          >
            {/* Celebration emoji */}
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 10 }}
            >
              🎉
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              It's A Match!
            </motion.h1>

            {/* Avatars */}
            <motion.div
              className="flex items-center justify-center gap-6 mb-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Current user avatar */}
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full overflow-hidden border-3 border-emerald-500 shadow-lg shadow-emerald-500/30"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(16,185,129,0.3)',
                      '0 0 40px rgba(16,185,129,0.5)',
                      '0 0 20px rgba(16,185,129,0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img
                    src={
                      currentUser?.avatar?.secureUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'You')}&background=1e293b&color=94a3b8&size=128`
                    }
                    alt={currentUser?.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[9px] font-bold text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                  You
                </div>
              </div>

              {/* Heart connector */}
              <motion.div
                className="text-3xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                💜
              </motion.div>

              {/* Matched user avatar */}
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full overflow-hidden border-3 border-blue-500 shadow-lg shadow-blue-500/30"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59,130,246,0.3)',
                      '0 0 40px rgba(59,130,246,0.5)',
                      '0 0 20px rgba(59,130,246,0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <img
                    src={
                      matchedUser?.avatar?.secureUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser?.name || 'Match')}&background=1e293b&color=94a3b8&size=128`
                    }
                    alt={matchedUser?.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[9px] font-bold text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {matchedUser?.name?.split(' ')[0] || 'Match'}
                </div>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-sm text-slate-400 mb-8 max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              You and <span className="text-white font-semibold">{matchedUser?.name}</span> both
              want to hack together! Start a conversation or invite them to your team.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <button
                onClick={() => onClose?.('chat')}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <FaComments /> Start Chat
              </button>

              <button
                onClick={() => onClose?.('team')}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <FaUsers /> Invite To Team
              </button>
            </motion.div>

            {/* Continue swiping link */}
            <motion.button
              onClick={() => onClose?.('continue')}
              className="mt-4 text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Continue Swiping <FaArrowRight className="text-[9px]" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;
