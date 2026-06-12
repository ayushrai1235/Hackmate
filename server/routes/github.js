import express from 'express';
import { getGitHubStats } from '../services/githubService.js';
import User from '../models/User.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:username', isAuth, async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Username parameter is required' });
    }

    const stats = await getGitHubStats(username.trim());
    if (!stats) {
      return res.status(404).json({ message: 'GitHub user not found or rate limited' });
    }

    // Update User record in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          githubUsername: stats.username,
          githubScore: stats.githubScore,
          githubData: {
            repos: stats.repos,
            stars: stats.stars,
            languages: stats.languages,
            contributions: stats.contributions,
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User record not found' });
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error('GitHub API Route error:', error.message);
    return res.status(500).json({ message: 'Error fetching GitHub stats', error: error.message });
  }
});

export default router;
