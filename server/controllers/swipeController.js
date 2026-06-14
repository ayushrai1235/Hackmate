import { User, Swipe, Match, Chat, Notification, Report } from '../models/index.js';
import mongoose from 'mongoose';
import { computeMatchScore } from '../services/matchmakingService.js';
import { createNotification } from '../services/notificationService.js';

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
    const usersWithScores = users.map((u) => {
      const { score, reasons } = computeMatchScore(currentUser, u);
      return {
        ...u.toJSON(),
        matchScore: score,
        matchReasons: reasons,
      };
    });

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
      await createNotification(
        targetId,
        currentUserId,
        notifType,
        action === 'super'
          ? `${req.user.name} super liked you! ⭐`
          : `${req.user.name} liked your profile`,
        { swipeId: swipe._id }
      );

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

          await Promise.all([
            createNotification(
              currentUserId,
              targetId,
              'matched',
              `You matched with ${targetUser.name}! 🎉`,
              { matchId: match._id, chatId: chat?._id }
            ),
            createNotification(
              targetId,
              currentUserId,
              'matched',
              `You matched with ${currentUserData.name}! 🎉`,
              { matchId: match._id, chatId: chat?._id }
            ),
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
