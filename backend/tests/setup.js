/**
 * Test Setup
 * Configuration and utilities for tests
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock logger to avoid console output during tests
import logger from '../utils/logger.js';

logger.info = () => { };
logger.error = () => { };
logger.warn = () => { };
logger.success = () => { };
logger.debug = () => { };

export default {};

