/**
 * Twilio Controller
 * Handles HTTP requests for Twilio routes
 */

import twilio from 'twilio';
import { getAgentById } from '../db/repositories/agentRepository.js';
import { setCallMapping, updateStatus, getAudio, getConversation } from '../utils/callStore.js';
import { subscribe } from '../utils/transcriptBus.js';
import { generateSpeech } from '../services/elevenlabsService.js';
import { storeAudio } from '../utils/callStore.js';
import * as callRepo from '../db/repositories/callRepository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Validate Twilio credentials
 */
export async function validateCredentials(req, res, next) {
  try {
    const { accountSid, authToken, phoneNumber } = req.body;

    if (!accountSid || !authToken || !phoneNumber) {
      return sendError(res, 'Missing required credentials', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate credentials by fetching account info
    const client = twilio(accountSid, authToken);
    
    try {
      await client.api.accounts(accountSid).fetch();
      
      // Validate phone number format
      if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        return sendSuccess(res, {
          valid: false,
          error: 'Invalid phone number format. Use E.164 format (+1234567890)',
        });
      }

      return sendSuccess(res, {
        valid: true,
        message: 'Credentials validated successfully',
      });
    } catch (error) {
      return sendSuccess(res, {
        valid: false,
        error: 'Invalid Twilio credentials',
      });
    }
  } catch (error) {
    logger.error('Validate credentials error', error);
    next(error);
  }
}

/**
 * Provide TwiML to start Twilio Media Stream
 */
export async function voiceStream(req, res, next) {
  try {
    const { VOICE_GATEWAY_WS_URL } = process.env;
    const SERVER_URL = process.env.SERVER_URL;
    const wsUrl = VOICE_GATEWAY_WS_URL || 
      (SERVER_URL ? SERVER_URL.replace('http', 'ws') + '/voice-stream' : 'ws://localhost:3000/voice-stream');

    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect();
    connect.stream({ url: `${wsUrl}?source=twilio` });

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    logger.error('Voice stream error', error);
    next(error);
  }
}

/**
 * Initiate an outbound call
 */
export async function initiateCall(req, res, next) {
  try {
    const { agentId, phoneNumber } = req.body || {};

    if (!agentId || !phoneNumber) {
      return sendError(res, 'agentId and phoneNumber are required', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate E.164 phone format
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      return sendError(res, 'Invalid phone number format. Use E.164 format (+1234567890)', HTTP_STATUS.BAD_REQUEST);
    }

    // Load agent and Twilio config
    const agent = await getAgentById(agentId);
    if (!agent) {
      return sendError(res, 'Agent not found', HTTP_STATUS.NOT_FOUND);
    }

    const cfg = agent.twilioConfig || agent.twilio_config;
    if (!cfg || !cfg.accountSid || !cfg.authToken || !cfg.phoneNumber) {
      return sendError(res, 'Agent Twilio configuration is incomplete', HTTP_STATUS.BAD_REQUEST);
    }

    // Build TwiML
    const { VOICE_GATEWAY_WS_URL } = process.env;
    const SERVER_URL = process.env.SERVER_URL;
    const wsUrl = VOICE_GATEWAY_WS_URL || 
      (SERVER_URL ? SERVER_URL.replace('http', 'ws') + '/voice-stream' : 'ws://localhost:3000/voice-stream');
    const twimlResponse = new twilio.twiml.VoiceResponse();

    // Optional greeting
    let greetingText = '';
    try {
      const vs = agent.voiceSettings || agent.voice_settings;
      const configuredGreeting = vs?.greeting;
      if (configuredGreeting && typeof configuredGreeting === 'string') {
        greetingText = configuredGreeting.trim();
      } else if (agent.system_prompt && typeof agent.system_prompt === 'string') {
        const firstSentence = agent.system_prompt.split(/\.|\n/)[0] || '';
        greetingText = firstSentence.trim().slice(0, 240);
      }
    } catch (err) {
      logger.warn('Error extracting greeting text', err);
    }

    if (greetingText) {
      try {
        if (SERVER_URL) {
          const vs = agent.voiceSettings || agent.voice_settings || {};
          const audioBase64 = await generateSpeech(greetingText, {
            voiceId: vs.voiceId || 'default',
            stability: vs.stability,
            similarityBoost: vs.similarityBoost,
            speed: vs.speed,
          });
          if (audioBase64 && audioBase64.length > 0) {
            const audioId = storeAudio(audioBase64, 'audio/mpeg');
            const audioUrl = `${SERVER_URL}/api/twilio/audio/${audioId}`;
            twimlResponse.play(audioUrl);
          } else {
            twimlResponse.say({ voice: 'alice', language: 'en-US' }, greetingText);
          }
        } else {
          twimlResponse.say({ voice: 'alice', language: 'en-US' }, greetingText);
        }
      } catch (err) {
        logger.warn('Greeting TTS failed, falling back to <Say>', err);
        twimlResponse.say({ voice: 'alice', language: 'en-US' }, greetingText);
      }
    }

    const connect = twimlResponse.connect();
    connect.stream({ url: `${wsUrl}?source=twilio&agentId=${encodeURIComponent(agentId)}` });
    const twiml = twimlResponse.toString();

    // Create the call
    const client = twilio(cfg.accountSid, cfg.authToken);
    logger.info('Outbound call request', { to: phoneNumber, from: cfg.phoneNumber, wsUrl });

    const statusCallbackUrl = SERVER_URL ? `${SERVER_URL}/api/twilio/status` : null;
    if (!statusCallbackUrl) {
      logger.warn('SERVER_URL not set — status callbacks will be disabled');
    }

    const call = await client.calls.create({
      to: phoneNumber,
      from: cfg.phoneNumber,
      twiml,
      ...(statusCallbackUrl ? {
        statusCallback: statusCallbackUrl,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
      } : {}),
    });

    logger.info('Call created', { sid: call.sid, status: call.status });
    
    // Save call to database
    try {
      await callRepo.createCallConversation(
        agentId,
        call.sid,
        'outbound',
        cfg.phoneNumber,
        phoneNumber
      );
      logger.info('Call saved to database');
    } catch (dbError) {
      logger.error('Error saving call to database', dbError);
    }
    
    // Map callSid to agentId
    try {
      setCallMapping(call.sid, agentId);
    } catch (err) {
      logger.warn('Error setting call mapping', err);
    }

    return sendSuccess(res, {
      sid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from,
    });
  } catch (error) {
    logger.error('Twilio outbound call error', error);
    next(error);
  }
}

/**
 * Get call status by SID
 */
export async function getCallStatus(req, res, next) {
  try {
    const { sid } = req.params;
    const { agentId } = req.query;

    if (!sid || !agentId) {
      return sendError(res, 'sid and agentId are required', HTTP_STATUS.BAD_REQUEST);
    }

    const agent = await getAgentById(agentId);
    if (!agent) {
      return sendError(res, 'Agent not found', HTTP_STATUS.NOT_FOUND);
    }

    const cfg = agent.twilioConfig || agent.twilio_config;
    if (!cfg || !cfg.accountSid || !cfg.authToken) {
      return sendError(res, 'Agent Twilio configuration is incomplete', HTTP_STATUS.BAD_REQUEST);
    }

    const client = twilio(cfg.accountSid, cfg.authToken);
    const call = await client.calls(sid).fetch();

    return sendSuccess(res, {
      sid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from,
      duration: call.duration,
      direction: call.direction,
      startTime: call.startTime,
      endTime: call.endTime,
    });
  } catch (error) {
    logger.error('Twilio call status error', error);
    next(error);
  }
}

/**
 * Handle Twilio status webhook
 */
export async function handleStatus(req, res, next) {
  try {
    const {
      CallSid,
      CallStatus,
      CallDuration,
      From,
      To,
      Timestamp,
      SequenceNumber,
      EventType,
      AnsweredBy,
    } = req.body || {};

    logger.info('Twilio status callback', {
      CallSid, EventType, CallStatus, CallDuration, From, To, Timestamp, SequenceNumber,
    });

    // Update call status in database
    if (CallSid) {
      try {
        const metadata = {};
        
        if (CallStatus === 'in-progress' && AnsweredBy) {
          metadata.answeredAt = new Date().toISOString();
        }
        
        if (['completed', 'failed', 'busy', 'no-answer'].includes(CallStatus)) {
          metadata.endedAt = new Date().toISOString();
          if (CallDuration) {
            metadata.duration = parseInt(CallDuration) || 0;
          }
        }
        
        await callRepo.updateCallStatus(CallSid, CallStatus || EventType, metadata);
        logger.info('Call status updated in database');
      } catch (dbError) {
        logger.error('Error updating call status in database', dbError);
      }
    }

    // Update call status in in-memory store
    try {
      if (CallSid) updateStatus(CallSid, CallStatus || EventType);
    } catch (err) {
      logger.warn('Error updating call status in memory', err);
    }

    res.type('text/plain').send('ok');
  } catch (error) {
    logger.error('Twilio status callback error', error);
    next(error);
  }
}

/**
 * Get conversation for a call SID
 */
export async function getConversationBySid(req, res, next) {
  try {
    const { sid } = req.params;
    if (!sid) {
      return sendError(res, 'sid is required', HTTP_STATUS.BAD_REQUEST);
    }

    const history = getConversation(sid) || [];

    return sendSuccess(res, {
      sid,
      messages: history,
    });
  } catch (error) {
    logger.error('Twilio conversation fetch error', error);
    next(error);
  }
}

/**
 * Stream live transcripts via SSE
 */
export async function streamTranscripts(req, res, next) {
  try {
    const { sid } = req.params;
    if (!sid) {
      return sendError(res, 'sid is required', HTTP_STATUS.BAD_REQUEST);
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Send initial ping/meta
    res.write(`data: ${JSON.stringify({ type: 'meta', sid })}\n\n`);

    // Subscribe to transcript bus
    const unsubscribe = subscribe(
      sid,
      (payload) => {
        try {
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
        } catch (err) {
          logger.warn('Error writing transcript data', err);
        }
      },
      () => {
        try {
          res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        } catch (err) {
          logger.warn('Error writing done signal', err);
        }
        try {
          res.end();
        } catch (err) {
          logger.warn('Error ending response', err);
        }
      }
    );

    // Cleanup on client disconnect
    req.on('close', () => {
      try {
        unsubscribe();
      } catch (err) {
        logger.warn('Error unsubscribing', err);
      }
      try {
        res.end();
      } catch (err) {
        logger.warn('Error ending response on close', err);
      }
    });
  } catch (error) {
    logger.error('Twilio transcript stream error', error);
    next(error);
  }
}

/**
 * Serve generated TTS audio by id
 */
export async function serveAudio(req, res, next) {
  try {
    const { audioId } = req.params;
    const blob = getAudio(audioId);
    
    if (!blob) {
      return sendError(res, 'Audio not found', HTTP_STATUS.NOT_FOUND);
    }
    
    const buf = Buffer.from(blob.base64, 'base64');
    res.set('Content-Type', blob.contentType || 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    return res.send(buf);
  } catch (error) {
    logger.error('Twilio audio serve error', error);
    next(error);
  }
}

export default {
  validateCredentials,
  voiceStream,
  initiateCall,
  getCallStatus,
  handleStatus,
  getConversationBySid,
  streamTranscripts,
  serveAudio,
};

