# Testing Guide

This directory contains test suites for the backend API.

## Test Files

### 1. `simple-auth-test.js` (Recommended for Quick Testing)
A simple test script that doesn't require any test framework. Perfect for quick API testing.

**Run:**
```bash
npm run test:simple
```

**Features:**
- No dependencies required (uses axios which is already installed)
- Easy to understand and modify
- Provides colored console output
- Tests all authentication endpoints

### 2. `auth.test.js` (Professional Test Suite)
Comprehensive test suite using Jest and Supertest for professional testing.

**Run:**
```bash
npm test
```

**Features:**
- Full test coverage
- Professional test framework
- Detailed assertions
- Can generate coverage reports

## Prerequisites

Before running tests, make sure:

1. **Server is running:**
   ```bash
   npm run dev
   ```

2. **Database is configured:**
   - Set `DATABASE_URL` in your `.env` file
   - Or the tests will run in in-memory mode

3. **Environment variables:**
   - `JWT_SECRET` must be set
   - Other variables have defaults

## Running Tests

### Quick Test (Simple Script)
```bash
# Make sure server is running in another terminal
npm run dev

# In another terminal, run:
npm run test:simple
```

### Full Test Suite (Jest)
```bash
# Install test dependencies first (if not already installed)
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Test Coverage

The tests cover:

### Registration (`POST /api/auth/register`)
- ✅ Successful registration
- ✅ Duplicate email handling
- ✅ Invalid email format
- ✅ Weak password validation
- ✅ Missing required fields
- ✅ Password complexity requirements

### Login (`POST /api/auth/login`)
- ✅ Successful login
- ✅ Invalid credentials
- ✅ Non-existent user
- ✅ Missing fields
- ✅ Invalid email format

### Profile (`GET /api/auth/profile`)
- ✅ Get profile with valid token
- ✅ Unauthorized access (no token)
- ✅ Invalid token handling

### Update Profile (`PUT /api/auth/profile`)
- ✅ Update name
- ✅ Update email
- ✅ Email conflict detection
- ✅ Validation errors
- ✅ Unauthorized access

### Token Verification (`GET /api/auth/verify`)
- ✅ Verify valid token
- ✅ Invalid token handling
- ✅ Missing token

### Logout (`POST /api/auth/logout`)
- ✅ Successful logout
- ✅ Unauthorized access

## Writing New Tests

### For Simple Tests
Edit `simple-auth-test.js` and add your test function:

```javascript
async function testNewFeature() {
  log('\n🧪 Testing New Feature', 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/new-endpoint`, data);
    logTest('New Feature - Success', response.status === 200);
  } catch (error) {
    logTest('New Feature - Success', false, error.message);
  }
}
```

### For Jest Tests
Edit `auth.test.js` and add a new describe block:

```javascript
describe('New Feature', () => {
  it('should work correctly', async () => {
    const response = await request(app)
      .post('/api/auth/new-endpoint')
      .send(data)
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
  });
});
```

## Troubleshooting

### Tests fail with "ECONNREFUSED"
- Make sure the server is running on the correct port
- Check `PORT` in your `.env` file

### Tests fail with "JWT_SECRET required"
- Set `JWT_SECRET` in your `.env` file
- Minimum 32 characters recommended

### Database errors
- Ensure `DATABASE_URL` is set correctly
- Or tests will run without database (some features may not work)

### Rate limiting errors
- Tests may hit rate limits if run too quickly
- Wait a few seconds between test runs
- Or adjust rate limits in `constants/index.js` for testing

