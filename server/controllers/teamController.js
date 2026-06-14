import { Team, User, Notification, Chat } from '../models/index.js';
import { computeTeamHealth } from '../services/teamHealthService.js';
import { computeMatchScore } from '../services/matchmakingService.js';

// ── GET /api/teams ── list teams for discovery (paginated) ──
export const discoverTeams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Team.countDocuments(query);
    const teams = await Team.find(query)
      .populate('owner', 'name avatar')
      .populate('members', 'name avatar role skills')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add health score to each team for discovery
    const teamsWithHealth = await Promise.all(
      teams.map(async (team) => {
        const health = await computeTeamHealth(team, team.members);
        return {
          ...team.toJSON(),
          teamHealthScore: health.healthScore,
        };
      })
    );

    return res.status(200).json({
      teams: teamsWithHealth,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('discoverTeams error:', error);
    return res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
};

// ── GET /api/teams/mine ── list teams for current user ──
export const getMyTeams = async (req, res) => {
  try {
    const userId = req.user._id;
    const teams = await Team.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate('owner', 'name avatar')
      .populate('members', 'name avatar role skills')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ teams });
  } catch (error) {
    console.error('getMyTeams error:', error);
    return res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
};

// ── POST /api/teams ── create a new team ──
export const createTeam = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, description, hackathonName, requiredRoles, logo } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // Check if user already owns a team or is at limit (optional, but good practice)
    
    const team = await Team.create({
      name,
      description,
      hackathonName,
      requiredRoles: requiredRoles || [],
      logo,
      owner: userId,
      members: [userId],
    });

    // Create a corresponding team chat
    await Chat.create({
      teamId: team._id,
      isTeamChat: true,
      participants: [userId],
    });

    const populated = await Team.findById(team._id)
      .populate('owner', 'name avatar')
      .populate('members', 'name avatar role skills experienceLevel techStack githubScore');

    return res.status(201).json({ team: populated });
  } catch (error) {
    console.error('createTeam error:', error);
    return res.status(500).json({ message: 'Error creating team', error: error.message });
  }
};

// ── GET /api/teams/:id ── get team details with health analysis ──
export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name avatar role skills experienceLevel techStack githubScore')
      .populate('members', 'name avatar role skills experienceLevel techStack githubScore lookingFor')
      .populate('joinRequests', 'name avatar role skills')
      .populate('invites', 'name avatar role skills');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Compute team health
    const teamHealth = await computeTeamHealth(team, team.members);

    return res.status(200).json({ team, teamHealth });
  } catch (error) {
    console.error('getTeam error:', error);
    return res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
};

// ── PUT /api/teams/:id ── update team ──
export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can update the team' });
    }

    const allowedFields = ['name', 'description', 'hackathonName', 'requiredRoles', 'logo'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updated = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name avatar')
      .populate('members', 'name avatar role skills');

    return res.status(200).json({ team: updated });
  } catch (error) {
    console.error('updateTeam error:', error);
    return res.status(500).json({ message: 'Error updating team', error: error.message });
  }
};

// ── DELETE /api/teams/:id ── delete team ──
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can delete the team' });
    }

    await Team.findByIdAndDelete(req.params.id);
    await Chat.findOneAndDelete({ teamId: req.params.id });

    return res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('deleteTeam error:', error);
    return res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
};

// ── POST /api/teams/:id/join-request ── request to join a team ──
export const requestToJoinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const userId = req.user._id;
    if (team.members.includes(userId)) {
      return res.status(400).json({ message: 'Already a team member' });
    }
    if (team.joinRequests.includes(userId)) {
      return res.status(400).json({ message: 'Join request already pending' });
    }

    team.joinRequests.push(userId);
    await team.save();

    // Notify owner
    await Notification.create({
      receiver: team.owner,
      sender: userId,
      type: 'join_request',
      message: `${req.user.name} wants to join your team ${team.name}`,
      metadata: { teamId: team._id },
    });

    return res.status(200).json({ message: 'Join request sent' });
  } catch (error) {
    console.error('requestToJoinTeam error:', error);
    return res.status(500).json({ message: 'Error sending join request', error: error.message });
  }
};

// ── PUT /api/teams/:id/join-request/:userId/accept ── accept a join request ──
export const acceptJoinRequest = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can accept requests' });
    }

    const { userId } = req.params;
    if (!team.joinRequests.map(String).includes(userId)) {
      return res.status(400).json({ message: 'No pending request from this user' });
    }

    if (team.members.length >= 6) {
      return res.status(400).json({ message: 'Team is already full (max 6 members)' });
    }

    team.joinRequests = team.joinRequests.filter((id) => id.toString() !== userId);
    if (!team.members.map(String).includes(userId)) {
      team.members.push(userId);
    }
    await team.save();

    // Add user to the team chat room
    await Chat.findOneAndUpdate(
      { teamId: team._id },
      { $addToSet: { participants: userId } }
    );

    // Notify user
    await Notification.create({
      receiver: userId,
      sender: req.user._id,
      type: 'request_accepted',
      message: `Your request to join ${team.name} has been accepted!`,
      metadata: { teamId: team._id },
    });

    const populated = await Team.findById(team._id)
      .populate('owner', 'name avatar')
      .populate('members', 'name avatar role skills');

    return res.status(200).json({ team: populated });
  } catch (error) {
    console.error('acceptJoinRequest error:', error);
    return res.status(500).json({ message: 'Error accepting request', error: error.message });
  }
};

// ── PUT /api/teams/:id/join-request/:userId/reject ── reject a join request ──
export const rejectJoinRequest = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can reject requests' });
    }

    const { userId } = req.params;
    team.joinRequests = team.joinRequests.filter((id) => id.toString() !== userId);
    await team.save();

    return res.status(200).json({ message: 'Join request rejected' });
  } catch (error) {
    console.error('rejectJoinRequest error:', error);
    return res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
};

// ── POST /api/teams/:id/invite ── invite a user to the team ──
export const inviteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can send invites' });
    }

    if (team.members.map(String).includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    if (team.invites.map(String).includes(userId)) {
      return res.status(400).json({ message: 'Invite already sent to this user' });
    }

    team.invites.push(userId);
    await team.save();

    // Notify user
    await Notification.create({
      receiver: userId,
      sender: req.user._id,
      type: 'team_invite',
      message: `You've been invited to join team ${team.name}`,
      metadata: { teamId: team._id },
    });

    return res.status(200).json({ message: 'Invite sent' });
  } catch (error) {
    console.error('inviteUser error:', error);
    return res.status(500).json({ message: 'Error sending invite', error: error.message });
  }
};

// ── PUT /api/teams/:id/invite/:userId/respond ── respond to a team invite ──
export const respondToInvite = async (req, res) => {
  try {
    const { accept } = req.body;
    const { id: teamId, userId } = req.params;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!team.invites.map(String).includes(userId)) {
      return res.status(400).json({ message: 'No pending invite for this user' });
    }

    team.invites = team.invites.filter((id) => id.toString() !== userId);

    if (accept) {
      if (team.members.length >= 6) {
        return res.status(400).json({ message: 'Team is already full (max 6 members)' });
      }
      if (!team.members.map(String).includes(userId)) {
        team.members.push(userId);
      }

      // Add user to the team chat room
      await Chat.findOneAndUpdate(
        { teamId: team._id },
        { $addToSet: { participants: userId } }
      );
      
      // Notify owner
      await Notification.create({
        receiver: team.owner,
        sender: userId,
        type: 'team_accepted',
        message: `${req.user.name} accepted your invite to join ${team.name}`,
        metadata: { teamId: team._id },
      });
    }

    await team.save();

    return res.status(200).json({ 
      message: accept ? 'Invite accepted' : 'Invite rejected',
      team: accept ? team : null
    });
  } catch (error) {
    console.error('respondToInvite error:', error);
    return res.status(500).json({ message: 'Error responding to invite', error: error.message });
  }
};

// ── DELETE /api/teams/:id/members/:userId ── remove a member ──
export const removeMember = async (req, res) => {
  try {
    const { id: teamId, userId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team owner can remove members' });
    }

    if (userId === team.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove the team owner' });
    }

    team.members = team.members.filter((id) => id.toString() !== userId);
    await team.save();

    // Remove user from the team chat room
    await Chat.findOneAndUpdate(
      { teamId: team._id },
      { $pull: { participants: userId } }
    );

    return res.status(200).json({ message: 'Member removed' });
  } catch (error) {
    console.error('removeMember error:', error);
    return res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

// ── GET /api/teams/:id/recommendations ── suggested users for missing roles ──
export const getTeamRecommendations = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'name avatar role skills experienceLevel techStack githubScore lookingFor');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Verify requester is team owner or member
    const userId = req.user._id.toString();
    const isMember = team.members.some((m) => m._id.toString() === userId);
    const isOwner = team.owner.toString() === userId;

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Only team members can view recommendations' });
    }

    const memberIds = team.members.map((m) => m._id);
    const requiredRoles = team.requiredRoles || [];
    const memberRoles = team.members.map((m) => (m.role || '').toLowerCase()).filter(Boolean);

    // Find missing roles
    const missingRoles = requiredRoles.filter(
      (role) => !memberRoles.includes(role.toLowerCase())
    );

    // For each missing role, find top 3 candidates with match scores
    const recommendations = [];

    for (const role of missingRoles) {
      const candidates = await User.find({
        _id: { $nin: memberIds },
        role: { $regex: new RegExp(`^${escapeRegex(role)}$`, 'i') },
        onboardingComplete: true,
        profileVisibility: true,
      })
        .sort({ githubScore: -1, lastActive: -1 })
        .limit(10) // fetch more to rank by match score
        .select('name avatar role skills experienceLevel githubScore techStack lookingFor bio');

      // Rank by average match score against existing team members
      const scored = candidates.map((candidate) => {
        const scores = team.members.map((member) =>
          computeMatchScore(member, candidate)
        );
        const avgScore =
          scores.length > 0
            ? Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length)
            : 0;
        const topReasons = scores
          .flatMap((r) => r.reasons)
          .filter(Boolean)
          .slice(0, 3);

        return {
          ...candidate.toJSON(),
          matchScore: avgScore,
          matchReasons: topReasons,
        };
      });

      // Sort by match score descending, keep top 3
      scored.sort((a, b) => b.matchScore - a.matchScore);

      recommendations.push({
        role,
        users: scored.slice(0, 3),
      });
    }

    return res.status(200).json({ recommendations, missingRoles });
  } catch (error) {
    console.error('getTeamRecommendations error:', error);
    return res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
};

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
