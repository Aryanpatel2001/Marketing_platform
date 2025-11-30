/**
 * Simple Authentication API Test Script
 * Run this with: node tests/simple-auth-test.js
 * 
 * This is a simple test script that doesn't require Jest.
 * Useful for quick testing without installing test dependencies.
 */

import axios from 'axios';
import { appConfig } from '../config/app.js';

const BASE_URL = `http://localhost:${appConfig.port}${appConfig.apiPrefix}/auth`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let authToken = null;
let userId = null;
let userEmail = null;
let userPassword = null;

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, error = null) {
  if (passed) {
    results.passed++;
    log(`✓ ${name}`, 'green');
  } else {
    results.failed++;
    log(`✗ ${name}`, 'red');
    if (error) {
      log(`  Error: ${error}`, 'red');
    }
  }
  results.tests.push({ name, passed, error });
}

async function testRegister() {
  log('\n📝 Testing Register Endpoint', 'blue');
  
  const timestamp = Date.now();
  const testUser = {
    email: `testuser${timestamp}@example.com`,
    password: 'Test1234',
    name: 'Test User',
  };

  try {
    // Test 1: Successful registration
    const response = await axios.post(`${BASE_URL}/register`, testUser);
    if (response.status === 201 && response.data.success && response.data.data.token) {
      logTest('Register - Success', true);
      authToken = response.data.data.token;
      userId = response.data.data.user.id;
      userEmail = testUser.email;
      userPassword = testUser.password;
    } else {
      logTest('Register - Success', false, 'Invalid response structure');
    }
  } catch (error) {
    logTest('Register - Success', false, error.response?.data?.message || error.message);
  }

  try {
    // Test 2: Duplicate email
    await axios.post(`${BASE_URL}/register`, testUser);
    logTest('Register - Duplicate Email', false, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 409 || error.response?.status === 400) {
      logTest('Register - Duplicate Email', true);
    } else {
      logTest('Register - Duplicate Email', false, error.message);
    }
  }

  try {
    // Test 3: Invalid email
    await axios.post(`${BASE_URL}/register`, {
      email: 'invalid-email',
      password: 'Test1234',
      name: 'Test User',
    });
    logTest('Register - Invalid Email', false, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('Register - Invalid Email', true);
    } else {
      logTest('Register - Invalid Email', false, error.message);
    }
  }

  try {
    // Test 4: Weak password
    await axios.post(`${BASE_URL}/register`, {
      email: `test${timestamp}@example.com`,
      password: 'weak',
      name: 'Test User',
    });
    logTest('Register - Weak Password', false, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('Register - Weak Password', true);
    } else {
      logTest('Register - Weak Password', false, error.message);
    }
  }
}

async function testLogin() {
  log('\n🔐 Testing Login Endpoint', 'blue');

  try {
    // Test 1: Successful login
    const response = await axios.post(`${BASE_URL}/login`, {
      email: userEmail,
      password: userPassword,
    });
    if (response.status === 200 && response.data.success && response.data.data.token) {
      logTest('Login - Success', true);
      authToken = response.data.data.token;
    } else {
      logTest('Login - Success', false, 'Invalid response structure');
    }
  } catch (error) {
    logTest('Login - Success', false, error.response?.data?.message || error.message);
  }

  try {
    // Test 2: Invalid credentials
    await axios.post(`${BASE_URL}/login`, {
      email: userEmail,
      password: 'WrongPassword',
    });
    logTest('Login - Invalid Password', false, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Login - Invalid Password', true);
    } else {
      logTest('Login - Invalid Password', false, error.message);
    }
  }

  try {
    // Test 3: Non-existent user
    await axios.post(`${BASE_URL}/login`, {
      email: 'nonexistent@example.com',
      password: 'Test1234',
    });
    logTest('Login - Non-existent User', false, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Login - Non-existent User', true);
    } else {
      logTest('Login - Non-existent User', false, error.message);
    }
  }
}

async function testProfile() {
  log('\n👤 Testing Profile Endpoints', 'blue');

  try {
    // Test 1: Get profile
    const response = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (response.status === 200 && response.data.success && response.data.data.user) {
      logTest('Get Profile - Success', true);
    } else {
      logTest('Get Profile - Success', false, 'Invalid response structure');
    }
  } catch (error) {
    logTest('Get Profile - Success', false, error.response?.data?.message || error.message);
  }

  try {
    // Test 2: Get profile without token
    await axios.get(`${BASE_URL}/profile`);
    logTest('Get Profile - No Token', false, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Get Profile - No Token', true);
    } else {
      logTest('Get Profile - No Token', false, error.message);
    }
  }

  try {
    // Test 3: Update profile
    const response = await axios.put(
      `${BASE_URL}/profile`,
      { name: 'Updated Test User' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (response.status === 200 && response.data.success) {
      logTest('Update Profile - Success', true);
    } else {
      logTest('Update Profile - Success', false, 'Invalid response structure');
    }
  } catch (error) {
    logTest('Update Profile - Success', false, error.response?.data?.message || error.message);
  }
}

async function testVerify() {
  log('\n✅ Testing Token Verification', 'blue');

  try {
    // Test 1: Verify token
    const response = await axios.get(`${BASE_URL}/verify`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (response.status === 200 && response.data.success && response.data.data.user) {
      logTest('Verify Token - Success', true);
    } else {
      logTest('Verify Token - Success', false, 'Invalid response structure');
    }
  } catch (error) {
    logTest('Verify Token - Success', false, error.response?.data?.message || error.message);
  }

  try {
    // Test 2: Verify invalid token
    await axios.get(`${BASE_URL}/verify`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    logTest('Verify Token - Invalid Token', false, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Verify Token - Invalid Token', true);
    } else {
      logTest('Verify Token - Invalid Token', false, error.message);
    }
  }
}

async function testLogout() {
  log('\n🚪 Testing Logout', 'blue');

  try {
    const response = await axios.post(`${BASE_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (response.status === 200 && response.data.success) {
      logTest('Logout - Success', true);
    } else {
      logTest('Logout - Success', false, 'Invalid response structure');
    }
  } catch (error) {
    logTest('Logout - Success', false, error.response?.data?.message || error.message);
  }
}

async function runAllTests() {
  log('\n🧪 Starting Authentication API Tests', 'blue');
  log('=' .repeat(50), 'blue');
  
  // Check if server is running
  try {
    await axios.get(`http://localhost:${appConfig.port}/health`);
    log('✓ Server is running\n', 'green');
  } catch (error) {
    log('✗ Server is not running. Please start the server first!', 'red');
    log('  Run: npm run dev', 'yellow');
    process.exit(1);
  }

  await testRegister();
  await testLogin();
  await testProfile();
  await testVerify();
  await testLogout();

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('\n📊 Test Summary', 'blue');
  log(`Total Tests: ${results.passed + results.failed}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log('\n' + '='.repeat(50), 'blue');

  if (results.failed > 0) {
    log('\n❌ Some tests failed. Check the errors above.', 'red');
    process.exit(1);
  } else {
    log('\n✅ All tests passed!', 'green');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test execution failed: ${error.message}`, 'red');
  process.exit(1);
});

