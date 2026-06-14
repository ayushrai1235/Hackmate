import api from './api';

/**
 * Fetch all chats for the authenticated user
 * @returns {Promise<Array>} List of chats with participant info and unread counts
 */
export const getChats = async () => {
  const response = await api.get('/chats');
  return response.data.chats;
};

/**
 * Fetch messages for a specific chat with cursor-based pagination
 * @param {string} chatId - ID of the chat room
 * @param {string} [before] - Optional ISO Date string cursor for fetching older messages
 * @param {number} [limit=20] - Number of messages to retrieve
 * @returns {Promise<{messages: Array, nextCursor: string, hasMore: boolean}>}
 */
export const getMessages = async (chatId, before = null, limit = 20) => {
  const params = { limit };
  if (before) {
    params.before = before;
  }
  const response = await api.get(`/chats/${chatId}/messages`, { params });
  return response.data;
};

/**
 * Send a message via REST fallback
 * @param {string} chatId - ID of the chat room
 * @param {string} content - Message text content
 * @param {Array<{name: string, url: string, type: string}>} [attachments] - List of attachments
 * @returns {Promise<object>} The saved message object
 */
export const sendMessage = async (chatId, content, attachments = []) => {
  const response = await api.post(`/chats/${chatId}/messages`, { content, attachments });
  return response.data.message;
};
