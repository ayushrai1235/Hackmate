import User from '../models/User.js';
import Team from '../models/Team.js';
import Report from '../models/Report.js';
import Match from '../models/Match.js';

// @desc    Get all users (paginated and searchable)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalUsers / limitNum);

    return res.status(200).json({
      users,
      totalPages,
      currentPage: pageNum,
      totalUsers,
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    return res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// @desc    Ban or unban a user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
export const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set or toggle
    user.isBanned = isBanned !== undefined ? isBanned : !user.isBanned;
    await user.save();

    return res.status(200).json({
      user,
      message: `User has been successfully ${user.isBanned ? 'banned' : 'unbanned'}.`,
    });
  } catch (error) {
    console.error('Admin banUser error:', error);
    return res.status(500).json({ message: 'Error updating user ban status', error: error.message });
  }
};

// @desc    Get all teams
// @route   GET /api/admin/teams
// @access  Private/Admin
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json(teams);
  } catch (error) {
    console.error('Admin getTeams error:', error);
    return res.status(500).json({ message: 'Error retrieving teams', error: error.message });
  }
};

// @desc    Delete a team
// @route   DELETE /api/admin/teams/:id
// @access  Private/Admin
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await Team.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Team successfully deleted' });
  } catch (error) {
    console.error('Admin deleteTeam error:', error);
    return res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('reporter', 'name email avatar')
      .populate('reported', 'name email avatar isBanned')
      .sort({ createdAt: -1 });

    return res.status(200).json(reports);
  } catch (error) {
    console.error('Admin getReports error:', error);
    return res.status(500).json({ message: 'Error retrieving reports', error: error.message });
  }
};

// @desc    Update a report status
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    await report.save();

    // Populate references before returning
    const updatedReport = await Report.findById(id)
      .populate('reporter', 'name email avatar')
      .populate('reported', 'name email avatar isBanned');

    return res.status(200).json({
      report: updatedReport,
      message: 'Report status successfully updated',
    });
  } catch (error) {
    console.error('Admin updateReport error:', error);
    return res.status(500).json({ message: 'Error updating report status', error: error.message });
  }
};

// @desc    Get analytics metrics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTeams = await Team.countDocuments({});
    const totalMatches = await Match.countDocuments({});

    // Active today: lastActive within the current calendar day
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activeToday = await User.countDocuments({
      lastActive: { $gte: startOfToday },
    });

    return res.status(200).json({
      totalUsers,
      totalTeams,
      totalMatches,
      activeToday,
    });
  } catch (error) {
    console.error('Admin getAnalytics error:', error);
    return res.status(500).json({ message: 'Error retrieving analytics', error: error.message });
  }
};
