import { User, Swipe, Match, Chat, Notification, Report } from '../models/index.js';
import mongoose from 'mongoose';

// ── Helper: compute match score between two users ──
// Based on: skills overlap + lookingFor ↔ role alignment + techStack overlap
const computeMatchScore = (currentUser, targetUser) => {
  let score = 0;
  let maxScore = 0;

  // 1. Skills overlap (weight: 40)
  if (currentUser.skills?.length && targetUser.skills?.length) {
    const overlap = currentUser.skills.filter((s) =>
      targetUser.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
    ).length;
    const union = new Set([
      ...currentUser.skills.map((s) => s.toLowerCase()),
      ...targetUser.skills.map((s) => s.toLowerCase()),
    ]).size;
    score += union > 0 ? (overlap / union) * 40 : 0;
  }
  maxScore += 40;

  // 2. LookingFor ↔ target's role match (weight: 30)
  // If current user's lookingFor includes the target's role, strong signal
  if (currentUser.lookingFor?.length && targetUser.role) {
    const lookingNorm = currentUser.lookingFor.map((l) => l.toLowerCase());
    if (lookingNorm.includes(targetUser.role.toLowerCase())) {
      score += 30;
    } else {
      // Partial: check if target's lookingFor includes current user's role
      const targetLooking = (targetUser.lookingFor || []).map((l) => l.toLowerCase());
      if (currentUser.role && targetLooking.includes(currentUser.role.toLowerCase())) {
        score += 15; // half credit for reverse match
      }
    }
  }
  maxScore += 30;

  // 3. TechStack overlap (weight: 20)
  if (currentUser.techStack?.length && targetUser.techStack?.length) {
    const overlap = currentUser.techStack.filter((t) =>
      targetUser.techStack.map((x) => x.toLowerCase()).includes(t.toLowerCase())
    ).length;
    const union = new Set([
      ...currentUser.techStack.map((t) => t.toLowerCase()),
      ...targetUser.techStack.map((t) => t.toLowerCase()),
    ]).size;
    score += union > 0 ? (overlap / union) * 20 : 0;
  }
  maxScore += 20;

  // 4. Experience-level compatibility (weight: 10)
  // Same level or adjacent levels score higher
  const levels = ['beginner', 'intermediate', 'advanced'];
  if (currentUser.experienceLevel && targetUser.experienceLevel) {
    const curIdx = levels.indexOf(currentUser.experienceLevel.toLowerCase());
    const tgtIdx = levels.indexOf(targetUser.experienceLevel.toLowerCase());
    if (curIdx >= 0 && tgtIdx >= 0) {
      const diff = Math.abs(curIdx - tgtIdx);
      score += diff === 0 ? 10 : diff === 1 ? 6 : 2;
    }
  }
  maxScore += 10;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
};

// ── Helper: reset super likes if past midnight ──
const resetSuperLikesIfNeeded = async (user) => {
  const now = new Date();
  const resetAt = user.superLikesResetAt ? new Date(user.superLikesResetAt) : null;

  if (!resetAt || now >= resetAt) {
    // Set next reset to midnight tonight
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);

    user.superLikesRemaining = 3;
    user.superLikesResetAt = nextMidnight;
    await user.save();
  }
  return user;
};

// ── GET /api/swipes/feed?page=1&limit=10 ──
export const getFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Gather IDs to exclude
    // 1. Users we've already swiped on
    const swipedIds = await Swipe.find({ swiper: currentUserId }).distinct('target');

    // 2. Users we've matched with
    const matches = await Match.find({
      $or: [{ userA: currentUserId }, { userB: currentUserId }],
    });
    const matchedIds = matches.map((m) =>
      m.userA.toString() === currentUserId.toString() ? m.userB : m.userA
    );

    // 3. Users we've blocked / reported
    const reportedIds = await Report.find({ reporter: currentUserId }).distinct('reported');

    // Combine all exclusions
    const excludeIds = [
      currentUserId,
      ...swipedIds,
      ...matchedIds,
      ...reportedIds,
    ];

    const filter = {
      _id: { $nin: excludeIds },
      onboardingComplete: true,
      profileVisibility: true,
    };

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ lastActive: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash'),
      User.countDocuments(filter),
    ]);

    // Compute match scores
    const currentUser = await User.findById(currentUserId);
    const usersWithScores = users.map((u) => ({
      ...u.toJSON(),
      matchScore: computeMatchScore(currentUser, u),
    }));

    return res.status(200).json({
      users: usersWithScores,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('getFeed error:', error);
    return res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
};

// ── POST /api/swipes ──
export const createSwipe = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { targetId, action } = req.body;

    if (!targetId || !['left', 'right', 'super'].includes(action)) {
      return res.status(400).json({ message: 'Invalid targetId or action' });
    }

    if (targetId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot swipe on yourself' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Super like: check daily limit
    if (action === 'super') {
      let currentUser = await User.findById(currentUserId);
      currentUser = await resetSuperLikesIfNeeded(currentUser);

      if (currentUser.superLikesRemaining <= 0) {
        return res.status(429).json({
          message: 'No super likes remaining today',
          resetsAt: currentUser.superLikesResetAt,
        });
      }

      currentUser.superLikesRemaining -= 1;
      await currentUser.save();
    }

    // Upsert swipe
    const swipe = await Swipe.findOneAndUpdate(
      { swiper: currentUserId, target: targetId },
      { swiper: currentUserId, target: targetId, action },
      { upsert: true, new: true }
    );

    let matched = false;
    let match = null;
    let chat = null;

    const io = req.app.get('io');

    // On right or super: create notification and check for mutual match
    if (action === 'right' || action === 'super') {
      // Create notification for target
      const notifType = action === 'super' ? 'super_liked' : 'liked';
      const notification = await Notification.create({
        receiver: targetId,
        sender: currentUserId,
        type: notifType,
        message:
          action === 'super'
            ? `${req.user.name} super liked you! ⭐`
            : `${req.user.name} liked your profile`,
        metadata: { swipeId: swipe._id },
      });

      // Emit real-time notification
      if (io) {
        io.to(`user:${targetId}`).emit('notification:new', notification);
      }

      // Check for mutual swipe
      const mutualSwipe = await Swipe.findOne({
        swiper: targetId,
        target: currentUserId,
        action: { $in: ['right', 'super'] },
      });

      if (mutualSwipe) {
        matched = true;

        // Store userA/userB in sorted order for consistency
        const [userA, userB] = [currentUserId.toString(), targetId].sort();

        // Create match (ignore duplicate error)
        try {
          // Create chat first
          chat = await Chat.create({
            participants: [currentUserId, targetId],
          });

          match = await Match.create({
            userA: new mongoose.Types.ObjectId(userA),
            userB: new mongoose.Types.ObjectId(userB),
            chatId: chat._id,
          });
        } catch (dupErr) {
          if (dupErr.code === 11000) {
            // Match already exists
            match = await Match.findOne({
              $or: [
                { userA: currentUserId, userB: targetId },
                { userA: targetId, userB: currentUserId },
              ],
            });
            matched = !!match;
          } else {
            throw dupErr;
          }
        }

        if (matched && match) {
          // Create match notifications for both users
          const currentUserData = await User.findById(currentUserId).select('name avatar');

          const [notifA, notifB] = await Promise.all([
            Notification.create({
              receiver: currentUserId,
              sender: targetId,
              type: 'matched',
              message: `You matched with ${targetUser.name}! 🎉`,
              metadata: { matchId: match._id, chatId: chat?._id },
            }),
            Notification.create({
              receiver: targetId,
              sender: currentUserId,
              type: 'matched',
              message: `You matched with ${currentUserData.name}! 🎉`,
              metadata: { matchId: match._id, chatId: chat?._id },
            }),
          ]);

          // Emit match events to both users
          if (io) {
            const matchPayload = {
              match,
              chat,
              users: [currentUserData, targetUser],
            };
            io.to(`user:${currentUserId}`).emit('match:created', matchPayload);
            io.to(`user:${targetId}`).emit('match:created', matchPayload);
          }
        }
      }
    }

    return res.status(200).json({ swipe, matched, match, chat });
  } catch (error) {
    console.error('createSwipe error:', error);
    return res.status(500).json({ message: 'Error creating swipe', error: error.message });
  }
};

// ── GET /api/swipes/interested-in-me ──
export const getInterestedInMe = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get users we've already matched with so we exclude them
    const matches = await Match.find({
      $or: [{ userA: currentUserId }, { userB: currentUserId }],
    });
    const matchedIds = matches.map((m) =>
      m.userA.toString() === currentUserId.toString() ? m.userB : m.userA
    );

    // Find swipes where someone liked / super-liked current user
    const incomingSwipes = await Swipe.find({
      target: currentUserId,
      action: { $in: ['right', 'super'] },
      swiper: { $nin: matchedIds },
    })
      .populate('swiper', '-passwordHash')
      .sort({ action: -1, createdAt: -1 }); // 'super' sorts before 'right'

    // Map to user objects with swipe metadata
    const users = incomingSwipes.map((s) => ({
      ...s.swiper.toJSON(),
      swipeAction: s.action,
      swipedAt: s.createdAt,
    }));

    return res.status(200).json({ users });
  } catch (error) {
    console.error('getInterestedInMe error:', error);
    return res.status(500).json({ message: 'Error fetching interested users', error: error.message });
  }
};
