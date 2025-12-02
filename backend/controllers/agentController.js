/**
 * Agent Controller
 * Handles HTTP requests for agent routes
 */

import * as agentService from '../services/agentService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { SUCCESS_MESSAGES, HTTP_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Get all agents for the current user
 */
export async function getAgents(req, res, next) {
  try {
    const agents = await agentService.getUserAgents(req.user.id);
    return sendSuccess(res, agents);
  } catch (error) {
    logger.error('Get agents error', error);
    next(error);
  }
}

/**
 * Get agent stats for the current user
 */
export async function getStats(req, res, next) {
  try {
    const stats = await agentService.getUserAgentStats(req.user.id);
    return sendSuccess(res, stats);
  } catch (error) {
    logger.error('Get stats error', error);
    next(error);
  }
}

/**
 * Get a single agent by ID
 */
export async function getAgent(req, res, next) {
  try {
    const agent = await agentService.getUserAgent(req.params.id, req.user.id);
    return sendSuccess(res, agent);
  } catch (error) {
    logger.error('Get agent error', error);
    next(error);
  }
}

/**
 * Create a new agent
 */
export async function createAgent(req, res, next) {
  try {
    const agent = await agentService.createAgent(req.body, req.user.id);
    return sendSuccess(
      res,
      agent,
      'Agent created successfully',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error('Create agent error', error);
    next(error);
  }
}

/**
 * Update an agent
 */
export async function updateAgent(req, res, next) {
  try {
    const updatedAgent = await agentService.updateAgent(
      req.params.id,
      req.body,
      req.user.id
    );
    return sendSuccess(
      res,
      updatedAgent,
      'Agent updated successfully'
    );
  } catch (error) {
    logger.error('Update agent error', error);
    next(error);
  }
}

/**
 * Delete an agent
 */
export async function deleteAgent(req, res, next) {
  try {
    const result = await agentService.deleteAgent(req.params.id, req.user.id);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    logger.error('Delete agent error', error);
    next(error);
  }
}

/**
 * Test voice sample generation
 */
export async function testVoice(req, res, next) {
  try {
    const result = await agentService.testVoiceSample(req.body);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    logger.error('Voice test error', error);
    next(error);
  }
}

export default {
  getAgents,
  getStats,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  testVoice,
};

