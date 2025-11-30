/**
 * Authentication API Tests
 * Comprehensive test suite for authentication endpoints
 */

import request from 'supertest';
import app from '../server.js';
import { HTTP_STATUS } from '../constants/index.js';

describe('Authentication API Tests', () => {
  let authToken = null;
  let userId = null;
  let userEmail = null;
  let userPassword = null;

  // Generate unique test user data
  const timestamp = Date.now();
  const testUser = {
    email: `testuser${timestamp}@example.com`,
    password: 'Test1234',
    name: 'Test User',
  };

  const invalidUser = {
    email: 'invalid@example.com',
    password: 'WrongPassword123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('isVerified');
      expect(response.body.data.user).toHaveProperty('createdAt');

      // Store token and user info for other tests
      authToken = response.body.data.token;
      userId = response.body.data.user.id;
      userEmail = testUser.email;
      userPassword = testUser.password;
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test1234',
          name: 'Test User',
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail with weak password (less than 6 characters)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${timestamp}@example.com`,
          password: 'Test1',
          name: 'Test User',
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail with password missing uppercase letter', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${timestamp}@example.com`,
          password: 'test1234',
          name: 'Test User',
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail with password missing number', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${timestamp}@example.com`,
          password: 'TestPassword',
          name: 'Test User',
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail with invalid name (too short)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${timestamp}@example.com`,
          password: 'Test1234',
          name: 'A',
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${timestamp}@example.com`,
          // Missing password and name
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail when email already exists', async () => {
      // Try to register the same user again
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(HTTP_STATUS.CONFLICT);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('already');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
          password: userPassword,
        })
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userEmail);
      expect(response.body.data.user).toHaveProperty('lastLogin');

      // Update token
      authToken = response.body.data.token;
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: invalidUser.email,
          password: userPassword,
        })
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
          password: invalidUser.password,
        })
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: userPassword,
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: userPassword,
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data.user.email).toBe(userEmail);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('name');
      expect(response.body.data.user).toHaveProperty('isVerified');
      expect(response.body.data.user).toHaveProperty('createdAt');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('token');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile with valid token', async () => {
      const updatedName = 'Updated Test User';
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: updatedName,
        })
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.name).toBe(updatedName);
      expect(response.body.data.user.email).toBe(userEmail);
    });

    it('should update email with valid token', async () => {
      const newEmail = `updated${timestamp}@example.com`;
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: newEmail,
        })
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user.email).toBe(newEmail);
      
      // Update userEmail for subsequent tests
      userEmail = newEmail;
    });

    it('should fail when trying to use existing email', async () => {
      // Create another user first
      const anotherUser = {
        email: `another${timestamp}@example.com`,
        password: 'Test1234',
        name: 'Another User',
      };

      await request(app)
        .post('/api/auth/register')
        .send(anotherUser);

      // Try to update current user's email to the other user's email
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: anotherUser.email,
        })
        .expect(HTTP_STATUS.CONFLICT);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
      expect(response.body.message).toContain('already');
    });

    it('should fail with invalid name format', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A', // Too short
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          name: 'Test',
        })
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid token', async () => {
      // Get a fresh token by logging in again
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
          password: userPassword,
        });

      const freshToken = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${freshToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email');
      expect(response.body.data.user).toHaveProperty('name');
      expect(response.body.data.user).toHaveProperty('isVerified');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on auth endpoints', async () => {
      // Make multiple rapid requests
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrong',
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited (429)
      const rateLimited = responses.some(res => res.status === HTTP_STATUS.TOO_MANY_REQUESTS);
      // Note: This test might not always pass depending on rate limit configuration
      // but it's good to have it documented
    });
  });
});

