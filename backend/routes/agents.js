/**
 * Agent Routes
 * Routes for agent management
 */

import express from 'express';
import * as agentController from '../controllers/agentController.js';
import { authenticateToken } from '../utils/auth.js';
import { validateAgent, validateAgentId } from '../middleware/validation.js';
import { agentLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

/**
 * @route   GET /api/agents
 * @desc    Get all agents (user-specific)
 * @access  Private
 */
router.get('/', authenticateToken, agentController.getAllAgents);

/**
 * @route   GET /api/agents/stats
 * @desc    Get agent stats (user-specific)
 * @access  Private
 */
router.get('/stats', authenticateToken, agentController.getStats);

/**
 * @route   GET /api/agents/:id
 * @desc    Get single agent (user-specific)
 * @access  Private
 */
router.get('/:id', authenticateToken, validateAgentId, agentController.getAgent);

/**
 * @route   POST /api/agents
 * @desc    Create agent
 * @access  Private
 */
router.post('/', authenticateToken, agentLimiter, validateAgent, agentController.createAgent);

/**
 * @route   PUT /api/agents/:id
 * @desc    Update agent (user-specific)
 * @access  Private
 */
router.put('/:id', authenticateToken, agentLimiter, validateAgentId, validateAgent, agentController.updateAgent);

/**
 * @route   DELETE /api/agents/:id
 * @desc    Delete agent (user-specific)
 * @access  Private
 */
router.delete('/:id', authenticateToken, validateAgentId, agentController.deleteAgent);

/**
 * @route   POST /api/agents/voice/test
 * @desc    Test voice sample generation
 * @access  Private
 */
router.post('/voice/test', authenticateToken, agentController.testVoice);

export default router;
