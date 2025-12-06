/**
 * Agent Controller
 * Handles HTTP requests for agent routes
 */

import * as agentService from '../services/agentService.js';
import { sendSuccess, sendError, sendNotFound } from '../utils/response.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Get all agents (user-specific)
 */
export async function getAllAgents(req, res, next) {
  try {
    const agents = await agentService.getAllAgents(req.user.id);
    return sendSuccess(res, agents);
  } catch (error) {
    logger.error('Get agents error', error);
    next(error);
  }
}

/**
 * Get agent stats (user-specific)
 */
export async function getStats(req, res, next) {
  try {
    const stats = await agentService.getAgentStats(req.user.id);
    return sendSuccess(res, stats);
  } catch (error) {
    logger.error('Get stats error', error);
    next(error);
  }
}

/**
 * Get single agent (user-specific)
 */
export async function getAgent(req, res, next) {
  try {
    const agent = await agentService.getAgentById(req.params.id, req.user.id);
    return sendSuccess(res, agent);
  } catch (error) {
    logger.error('Get agent error', error);
    next(error);
  }
}

/**
 * Create agent
 */
export async function createAgent(req, res, next) {
  try {
    const agent = await agentService.createAgent(req.body, req.user.id);
    return sendSuccess(res, agent, 'Agent created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Create agent error', error);
    next(error);
  }
}

/**
 * Update agent (user-specific)
 */
export async function updateAgent(req, res, next) {
  try {
    const updatedAgent = await agentService.updateAgent(
      req.params.id,
      req.body,
      req.user.id
    );
    return sendSuccess(res, updatedAgent, 'Agent updated successfully');
  } catch (error) {
    logger.error('Update agent error', error);
    next(error);
  }
}

/**
 * Delete agent (user-specific)
 */
export async function deleteAgent(req, res, next) {
  try {
    await agentService.deleteAgent(req.params.id, req.user.id);
    return sendSuccess(res, null, 'Agent deleted successfully');
  } catch (error) {
    logger.error('Delete agent error', error);
    next(error);
  }
}

/**
 * Test voice sample
 */
export async function testVoice(req, res, next) {
  try {
    const { voiceId, stability, similarityBoost, speed, text } = req.body;
    
    const voiceSettings = {
      voiceId,
      stability,
      similarityBoost,
      speed,
    };

    const result = await agentService.testVoiceSample(voiceSettings, text);
    
    return sendSuccess(res, {
      ...result,
      message: 'Voice sample generated successfully',
    });
  } catch (error) {
    logger.error('Voice test error', error);
    next(error);
  }
}

export default {
  getAllAgents,
  getStats,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  testVoice,
};

