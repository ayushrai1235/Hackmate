import api from './api';

const swipeService = {
  /**
   * Fetch paginated feed of users to swipe on.
   * Excludes: self, blocked, already-swiped, matched.
   */
  getFeed: async (page = 1, limit = 10) => {
    const res = await api.get(`/swipes/feed?page=${page}&limit=${limit}`);
    return res.data;
  },

  /**
   * Create a swipe action on a target user.
   * @param {string} targetId - The user being swiped on
   * @param {'left'|'right'|'super'} action - Swipe direction
   * @returns {{ swipe, matched, match?, chat? }}
   */
  createSwipe: async (targetId, action) => {
    const res = await api.post('/swipes', { targetId, action });
    return res.data;
  },

  /**
   * Get users who right-swiped or super-liked the current user.
   * Excludes already-matched users.
   */
  getInterestedInMe: async () => {
    const res = await api.get('/swipes/interested-in-me');
    return res.data;
  },
};

export default swipeService;
