import User from '../models/User.js';
import Team from '../models/Team.js';
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
    return res.status(200).json({ user });
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
    }).select('-password');
    return res.status(200).json(users);
  } catch (error) {
    console.error('Fetch discover users error:', error);
    return res.status(500).json({ message: 'Error retrieving discover users', error: error.message });
  }
};
