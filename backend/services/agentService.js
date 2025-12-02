/**
 * Agent Service
 * Business logic for agent operations
 */

import * as agentRepository from '../db/repositories/agentRepository.js';
import { generateSpeech } from './elevenlabsService.js';
import { NotFoundError, BadRequestError, ValidationError } from '../errors/AppError.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Get all agents for a user
 */
export async function getUserAgents(userId) {
    try {
        const agents = await agentRepository.getAllAgentsByUser(userId);
        return agents;
    } catch (error) {
        logger.error('Error getting user agents', error);
        throw error;
    }
}

/**
 * Get agent by ID (ensures user owns the agent)
 */
export async function getUserAgent(agentId, userId) {
    const agent = await agentRepository.getAgentByIdAndUser(agentId, userId);

    if (!agent) {
        throw new NotFoundError('Agent not found or you do not have permission to access it');
    }

    return agent;
}

/**
 * Get agent stats for a user
 */
export async function getUserAgentStats(userId) {
    try {
        const stats = await agentRepository.getAgentStatsByUser(userId);
        return stats;
    } catch (error) {
        logger.error('Error getting user agent stats', error);
        throw error;
    }
}

/**
 * Create a new agent
 */
export async function createAgent(agentData, userId) {
    try {
        // Add user_id to agent data
        const dataWithUserId = {
            ...agentData,
            user_id: userId,
        };

        const agent = await agentRepository.createAgent(dataWithUserId);

        logger.info('Agent created successfully', { agentId: agent.id, userId });

        return agent;
    } catch (error) {
        logger.error('Error creating agent', error);
        throw error;
    }
}

/**
 * Update an agent (ensures user owns the agent)
 */
export async function updateAgent(agentId, agentData, userId) {
    // First verify the agent exists and belongs to the user
    const existingAgent = await agentRepository.getAgentByIdAndUser(agentId, userId);

    if (!existingAgent) {
        throw new NotFoundError('Agent not found or you do not have permission to update it');
    }

    try {
        const updatedAgent = await agentRepository.updateAgent(agentId, agentData);

        logger.info('Agent updated successfully', { agentId, userId });

        return updatedAgent;
    } catch (error) {
        logger.error('Error updating agent', error);
        throw error;
    }
}

/**
 * Delete an agent (ensures user owns the agent)
 */
export async function deleteAgent(agentId, userId) {
    // First verify the agent exists and belongs to the user
    const existingAgent = await agentRepository.getAgentByIdAndUser(agentId, userId);

    if (!existingAgent) {
        throw new NotFoundError('Agent not found or you do not have permission to delete it');
    }

    try {
        await agentRepository.deleteAgent(agentId);

        logger.info('Agent deleted successfully', { agentId, userId });

        return { success: true, message: 'Agent deleted successfully' };
    } catch (error) {
        logger.error('Error deleting agent', error);
        throw error;
    }
}

/**
 * Test voice sample generation
 */
export async function testVoiceSample(voiceOptions) {
    try {
        const { voiceId, stability, similarityBoost, speed, text } = voiceOptions;

        const testText = text || "Hello! This is a test of your selected voice settings. How does this sound?";

        // Generate base64 audio (audio/mpeg) from ElevenLabs
        let audioBase64;
        try {
            audioBase64 = await generateSpeech(testText, {
                voiceId: voiceId || 'default',
                stability: typeof stability === 'number' ? stability : 0.5,
                similarityBoost: typeof similarityBoost === 'number' ? similarityBoost : 0.75,
                speed: typeof speed === 'number' ? speed : 1.0
            });
        } catch (error) {
            throw new BadRequestError(`Voice generation failed: ${error.message}`);
        }

        if (!audioBase64 || audioBase64 === '') {
            throw new BadRequestError('Voice generation service is not available. Please check ElevenLabs configuration.');
        }

        // Build a proper data URL that the browser can play directly
        const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

        return {
            success: true,
            audioUrl,
            audioBase64, // included for clients that prefer Blob URLs
            message: 'Voice sample generated successfully'
        };
    } catch (error) {
        logger.error('Error generating voice sample', error);
        throw error;
    }
}

export default {
    getUserAgents,
    getUserAgent,
    getUserAgentStats,
    createAgent,
    updateAgent,
    deleteAgent,
    testVoiceSample,
};

