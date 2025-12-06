/**
 * Twilio Routes
 * Routes for Twilio integration and voice calls
 */

import express from 'express';
import * as twilioController from '../controllers/twilioController.js';

const router = express.Router();

/**
 * @route   POST /api/twilio/validate
 * @desc    Validate Twilio credentials
 * @access  Public
 */
router.post('/validate', twilioController.validateCredentials);

/**
 * @route   POST /api/twilio/voice/stream
 * @desc    Provide TwiML to start Twilio Media Stream
 * @access  Public
 */
router.post('/voice/stream', twilioController.voiceStream);

/**
 * @route   POST /api/twilio/call
 * @desc    Initiate an outbound call
 * @access  Public
 */
router.post('/call', twilioController.initiateCall);

/**
 * @route   GET /api/twilio/call/:sid
 * @desc    Get call status by SID
 * @access  Public
 */
router.get('/call/:sid', twilioController.getCallStatus);

/**
 * @route   POST /api/twilio/status
 * @desc    Handle Twilio status webhook
 * @access  Public
 */
router.post('/status', twilioController.handleStatus);

/**
 * @route   GET /api/twilio/conversation/:sid
 * @desc    Get conversation for a call SID
 * @access  Public
 */
router.get('/conversation/:sid', twilioController.getConversationBySid);

/**
 * @route   GET /api/twilio/transcripts/:sid/stream
 * @desc    Stream live transcripts via SSE
 * @access  Public
 */
router.get('/transcripts/:sid/stream', twilioController.streamTranscripts);

/**
 * @route   GET /api/twilio/audio/:audioId
 * @desc    Serve generated TTS audio by id
 * @access  Public
 */
router.get('/audio/:audioId', twilioController.serveAudio);

export default router;
