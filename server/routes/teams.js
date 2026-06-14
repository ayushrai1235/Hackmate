import express from 'express';
import {
  discoverTeams,
  getMyTeams,
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  requestToJoinTeam,
  acceptJoinRequest,
  rejectJoinRequest,
  inviteUser,
  respondToInvite,
  removeMember,
  getTeamRecommendations,
} from '../controllers/teamController.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/', isAuth, discoverTeams);
router.get('/mine', isAuth, getMyTeams);
router.post('/', isAuth, createTeam);
router.get('/:id', isAuth, getTeam);
router.put('/:id', isAuth, updateTeam);
router.delete('/:id', isAuth, deleteTeam);

// Join requests
router.post('/:id/join-request', isAuth, requestToJoinTeam);
router.put('/:id/join-request/:userId/accept', isAuth, acceptJoinRequest);
router.put('/:id/join-request/:userId/reject', isAuth, rejectJoinRequest);

// Invites
router.post('/:id/invite', isAuth, inviteUser);
router.put('/:id/invite/:userId/respond', isAuth, respondToInvite);

// Members
router.delete('/:id/members/:userId', isAuth, removeMember);

// Recommendations
router.get('/:id/recommendations', isAuth, getTeamRecommendations);

export default router;
