import User from '../models/User.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import { getGitHubStats } from '../services/githubService.js';
 
// Helper to fetch GitHub data & calculate score using githubService
const fetchGithubStats = async (username) => {
  if (!username) return null;
  try {
    const stats = await getGitHubStats(username);
    if (!stats) return null;
    return {
      githubScore: stats.githubScore,
      githubData: {
        repos: stats.repos,
        stars: stats.stars,
        languages: stats.languages,
        contributions: stats.contributions,
      },
    };
  } catch (error) {
    console.error(`Error fetching GitHub data in helper for ${username}:`, error.message);
    return null;
  }
};
 
// GET /api/users/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const unreadCount = await Notification.countDocuments({ receiver: req.user._id, isRead: false });
    return res.status(200).json({ user, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving profile', error: error.message });
  }
};

// PUT /api/users/onboarding
export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateFields = { ...req.body, onboardingComplete: true };

    // Update avatar check
    if (req.body.avatar && (!req.body.avatar.secureUrl || !req.body.avatar.publicId)) {
      delete updateFields.avatar; // don't write empty avatars
    }

    if (updateFields.githubUsername) {
      const gitStats = await fetchGithubStats(updateFields.githubUsername);
      if (gitStats) {
        updateFields.githubScore = gitStats.githubScore;
        updateFields.githubData = gitStats.githubData;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Onboarding update error:', error);
    return res.status(500).json({ message: 'Failed to complete onboarding', error: error.message });
  }
};

// PUT /api/users/me
export const updateMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateFields = { ...req.body };

    // Update avatar check
    if (req.body.avatar && (!req.body.avatar.secureUrl || !req.body.avatar.publicId)) {
      delete updateFields.avatar;
    }

    // Check if githubUsername has changed or is newly added
    if (updateFields.githubUsername && updateFields.githubUsername !== req.user.githubUsername) {
      const gitStats = await fetchGithubStats(updateFields.githubUsername);
      if (gitStats) {
        updateFields.githubScore = gitStats.githubScore;
        updateFields.githubData = gitStats.githubData;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// GET /api/users/github-stats/:username
export const getGithubStats = async (req, res) => {
  try {
    const { username } = req.params;
    const stats = await fetchGithubStats(username);
    if (!stats) {
      return res.status(404).json({ message: 'GitHub user not found or rate limited' });
    }
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching GitHub stats', error: error.message });
  }
};

// GET /api/users/:id
export const getUserProfile = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check profile visibility (only allow self to view private profile)
    if (!targetUser.profileVisibility && req.user._id.toString() !== targetUser._id.toString()) {
      return res.status(403).json({ message: 'This profile is private', isPrivate: true });
    }

    // Find all teams where targetUser is owner or member
    const teamsJoined = await Team.find({
      $or: [
        { owner: targetUser._id },
        { members: targetUser._id }
      ]
    }).populate('owner members', 'name avatar');

    // Extract hackathons
    const hackathons = Array.from(new Set(teamsJoined.map(t => t.hackathonName).filter(Boolean)));

    // Fetch projects/repos list on-the-fly if they have GitHub
    let projects = [];
    if (targetUser.githubUsername) {
      try {
        const headers = {};
        if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
          const auth = Buffer.from(`${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`).toString('base64');
          headers['Authorization'] = `Basic ${auth}`;
        }
        const reposRes = await axios.get(
          `https://api.github.com/users/${targetUser.githubUsername}/repos?per_page=6&sort=updated`,
          { headers }
        );
        projects = (reposRes.data || []).map((repo) => ({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
          forks: repo.forks_count,
        }));
      } catch (err) {
        console.error('Error fetching repositories for public profile view:', err.message);
      }
    }

    return res.status(200).json({
      user: targetUser,
      teamsJoined,
      hackathons,
      projects,
    });
  } catch (error) {
    console.error('Error retrieving public user profile:', error);
    return res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

// GET /api/users
export const getDiscoverUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const users = await User.find({
      _id: { $ne: currentUserId },
      onboardingComplete: true,
      profileVisibility: true,
      isBanned: { $ne: true },
    }).select('-passwordHash');
    return res.status(200).json(users);
  } catch (error) {
    console.error('Fetch discover users error:', error);
    return res.status(500).json({ message: 'Error retrieving discover users', error: error.message });
  }
};


// GET /api/users/search
export const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const {
      role,
      skills,
      college,
      city,
      experienceLevel,
      minGithubScore,
      techStack,
      lookingFor,
      availability,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      _id: { $ne: currentUserId },
      onboardingComplete: true,
      profileVisibility: true,
      isBanned: { $ne: true },
    };

    // Filter by Role (multi-select)
    if (role) {
      const rolesArray = Array.isArray(role)
        ? role
        : role.split(',').map(r => r.trim()).filter(Boolean);
      if (rolesArray.length > 0) {
        query.role = { $in: rolesArray };
      }
    }

    // Filter by Skills (multi-select)
    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? skills
        : skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        query.skills = { $in: skillsArray.map(s => new RegExp(`^${s}$`, 'i')) };
      }
    }

    // Filter by Tech Stack (multi-select)
    if (techStack) {
      const techStackArray = Array.isArray(techStack)
        ? techStack
        : techStack.split(',').map(t => t.trim()).filter(Boolean);
      if (techStackArray.length > 0) {
        query.techStack = { $in: techStackArray.map(t => new RegExp(`^${t}$`, 'i')) };
      }
    }

    // Filter by Looking For (multi-select)
    if (lookingFor) {
      const lookingForArray = Array.isArray(lookingFor)
        ? lookingFor
        : lookingFor.split(',').map(l => l.trim()).filter(Boolean);
      if (lookingForArray.length > 0) {
        query.lookingFor = { $in: lookingForArray.map(l => new RegExp(`^${l}$`, 'i')) };
      }
    }

    // Filter by College (text)
    if (college) {
      query.college = { $regex: college.trim(), $options: 'i' };
    }

    // Filter by City (text)
    if (city) {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    // Filter by Experience Level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Filter by GitHub Score range
    if (minGithubScore !== undefined && minGithubScore !== '') {
      query.githubScore = { $gte: Number(minGithubScore) };
    }

    // Filter by Availability
    if (availability) {
      query.availability = availability;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .skip(skip)
      .limit(limitNum)
      .sort({ githubScore: -1, lastActive: -1 });

    const totalPages = Math.ceil(totalUsers / limitNum);

    return res.status(200).json({
      users,
      totalPages,
      currentPage: pageNum,
      totalUsers,
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};

