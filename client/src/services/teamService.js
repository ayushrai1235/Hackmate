import api from './api';

const teamService = {
  discoverTeams: async (page = 1, search = '') => {
    const response = await api.get(`/teams?page=${page}&search=${search}`);
    return response.data;
  },

  getMyTeams: async () => {
    const response = await api.get('/teams/mine');
    return response.data;
  },

  getTeam: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  updateTeam: async (id, teamData) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },

  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  requestToJoin: async (id) => {
    const response = await api.post(`/teams/${id}/join-request`);
    return response.data;
  },

  acceptJoinRequest: async (teamId, userId) => {
    const response = await api.put(`/teams/${teamId}/join-request/${userId}/accept`);
    return response.data;
  },

  rejectJoinRequest: async (teamId, userId) => {
    const response = await api.put(`/teams/${teamId}/join-request/${userId}/reject`);
    return response.data;
  },

  inviteUser: async (teamId, userId) => {
    const response = await api.post(`/teams/${teamId}/invite`, { userId });
    return response.data;
  },

  respondToInvite: async (teamId, userId, accept) => {
    const response = await api.put(`/teams/${teamId}/invite/${userId}/respond`, { accept });
    return response.data;
  },

  removeMember: async (teamId, userId) => {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  getRecommendations: async (id) => {
    const response = await api.get(`/teams/${id}/recommendations`);
    return response.data;
  },
};

export default teamService;
