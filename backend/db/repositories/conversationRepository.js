/**
 * Conversation Repository
 * Database operations for conversations
 */

import { query } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new conversation
 * @param {string} agentId - The agent ID
 * @param {string} type - Conversation type (e.g., 'call', 'chat')
 * @returns {Promise<Object>} The created conversation
 */
export async function createConversation(agentId, type = 'call') {
  try {
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO conversations (
        id, agent_id, type, status, created_at, updated_at
      ) VALUES ($1, $2, $3, 'active', NOW(), NOW())
      RETURNING *`,
      [id, agentId, type]
    );

    return result[0];
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * End a conversation
 * @param {string} conversationId - The conversation ID
 * @param {number|null} duration - Duration in seconds (optional)
 * @returns {Promise<Object>} The updated conversation
 */
export async function endConversation(conversationId, duration = null) {
  try {
    const updates = ['status = $1', 'updated_at = NOW()'];
    const values = ['completed'];
    let paramIndex = 2;

    if (duration !== null && duration !== undefined) {
      updates.push(`duration = $${paramIndex++}`);
      values.push(duration);
    }

    values.push(conversationId);

    const result = await query(
      `UPDATE conversations 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result[0] || null;
  } catch (error) {
    console.error('Error ending conversation:', error);
    throw error;
  }
}

/**
 * Get conversation by ID
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object|null>} The conversation or null
 */
export async function getConversationById(conversationId) {
  try {
    const result = await query(
      `SELECT * FROM conversations WHERE id = $1`,
      [conversationId]
    );

    return result[0] || null;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

/**
 * Get conversations for an agent
 * @param {string} agentId - The agent ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of conversations
 */
export async function getAgentConversations(agentId, filters = {}) {
  try {
    let sql = `
      SELECT * FROM conversations 
      WHERE agent_id = $1
    `;
    
    const params = [agentId];
    let paramIndex = 2;

    if (filters.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.type) {
      sql += ` AND type = $${paramIndex++}`;
      params.push(filters.type);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    return await query(sql, params);
  } catch (error) {
    console.error('Error fetching agent conversations:', error);
    throw error;
  }
}

export default {
  createConversation,
  endConversation,
  getConversationById,
  getAgentConversations,
};

