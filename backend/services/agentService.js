/**
 * Agent Service
 * Business logic for agent operations
 */

import * as agentRepo from '../db/repositories/agentRepository.js';
import { generateSpeech } from './elevenlabsService.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Get all agents for a user
 */
export async function getAllAgents(userId) {
    const agents = await agentRepo.getAllAgentsByUser(userId);
    return agents;
}

/**
 * Get agent stats for a user
 */
export async function getAgentStats(userId) {
    const stats = await agentRepo.getAgentStatsByUser(userId);
    return stats;
}

/**
 * Get single agent by ID (user-specific)
 */
export async function getAgentById(agentId, userId) {
    const agent = await agentRepo.getAgentByIdAndUser(agentId, userId);

    if (!agent) {
        throw new NotFoundError('Agent not found or you do not have permission to access it.');
    }

    return agent;
}

/**
 * Create a new agent
 */
export async function createAgent(agentData, userId) {
    const agentDataWithUser = {
        ...agentData,
        user_id: userId,
    };

    const agent = await agentRepo.createAgent(agentDataWithUser);

    logger.info('Agent created successfully', { agentId: agent.id, userId });

    return agent;
}

/**
 * Update an agent (user-specific)
 */
export async function updateAgent(agentId, updates, userId) {
    // Verify agent exists and belongs to user
    const existingAgent = await agentRepo.getAgentByIdAndUser(agentId, userId);

    if (!existingAgent) {
        throw new NotFoundError('Agent not found or you do not have permission to update it.');
    }

    const updatedAgent = await agentRepo.updateAgent(agentId, updates);

    logger.info('Agent updated successfully', { agentId, userId });

    return updatedAgent;
}

/**
 * Delete an agent (user-specific)
 */
export async function deleteAgent(agentId, userId) {
    // Verify agent exists and belongs to user
    const existingAgent = await agentRepo.getAgentByIdAndUser(agentId, userId);

    if (!existingAgent) {
        throw new NotFoundError('Agent not found or you do not have permission to delete it.');
    }

    await agentRepo.deleteAgent(agentId);

    logger.info('Agent deleted successfully', { agentId, userId });
}

/**
 * Test voice sample generation
 */
export async function testVoiceSample(voiceSettings, text) {
    const testText = text || "Hello! This is a test of your selected voice settings. How does this sound?";

    const audioBase64 = await generateSpeech(testText, {
        voiceId: voiceSettings?.voiceId || 'default',
        stability: typeof voiceSettings?.stability === 'number' ? voiceSettings.stability : 0.5,
        similarityBoost: typeof voiceSettings?.similarityBoost === 'number' ? voiceSettings.similarityBoost : 0.75,
        speed: typeof voiceSettings?.speed === 'number' ? voiceSettings.speed : 1.0,
    });

    if (!audioBase64) {
        throw new Error('Voice generation service is not available. Please check ElevenLabs configuration.');
    }

    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return {
        audioUrl,
        audioBase64,
    };
}

export default {
    getAllAgents,
    getAgentStats,
    getAgentById,
    createAgent,
    updateAgent,
    deleteAgent,
    testVoiceSample,
};

