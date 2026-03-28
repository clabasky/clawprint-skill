#!/usr/bin/env node

/**
 * API Authentication Test Suite
 * Tests API key generation, storage, and validation
 */

const https = require('https');
const http = require('http');
const assert = require('assert');

const API_URL = process.env.CLAWPRINT_API_URL || 'http://localhost:3000/api';

// Test results tracking
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

/**
 * Make HTTP request helper
 */
function makeRequest(method, path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const requestOptions = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      timeout: 10000,
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            body: parsed,
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

/**
 * Run a test
 */
async function test(name, fn) {
  testsRun++;
  process.stdout.write(`  ${testsRun}. ${name}... `);

  try {
    await fn();
    testsPassed++;
    console.log('✅');
  } catch (error) {
    testsFailed++;
    console.log('❌');
    failedTests.push({ name, error: error.message });
  }
}

/**
 * Test suite
 */
async function runTests() {
  console.log('\n🔐 API Authentication Test Suite\n');

  let agentEmail = null;
  let agentPublicKey = null;
  let agentSecretKey = null;
  let apiKey = null;

  // ============================================================================
  // SUITE 1: Agent Registration
  // ============================================================================

  console.log('📋 Suite 1: Agent Registration\n');

  await test('Health check - API is running', async () => {
    const res = await makeRequest('GET', '/health');
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.ok(res.body.version, 'Health check should return version');
  });

  await test('Register agent with email only', async () => {
    agentEmail = `test-agent-${Date.now()}@clawprint.test`;
    const res = await makeRequest('POST', '/users', {
      body: {
        email: agentEmail,
      },
    });
    assert.strictEqual(res.statusCode, 201, `Expected 201, got ${res.statusCode}`);
    assert.ok(res.body.user, 'Should return user');
    assert.ok(res.body.public_key, 'Should return public_key');
    assert.ok(res.body.secret_key, 'Should return secret_key');
    assert.ok(res.body.public_key.startsWith('pk_'), 'Public key should start with pk_');
    assert.ok(res.body.secret_key.startsWith('sk_'), 'Secret key should start with sk_');
  });

  await test('Register agent with email and name', async () => {
    const email = `test-agent-${Date.now()}@clawprint.test`;
    const res = await makeRequest('POST', '/users', {
      body: {
        email,
        display_name: 'Test Agent',
      },
    });
    assert.strictEqual(res.statusCode, 201, `Expected 201, got ${res.statusCode}`);
    assert.strictEqual(res.body.user.email, email, 'Email should match');
    assert.strictEqual(res.body.user.display_name, 'Test Agent', 'Display name should match');
  });

  await test('Reject duplicate email', async () => {
    const res = await makeRequest('POST', '/users', {
      body: {
        email: agentEmail, // Re-use from first test
      },
    });
    assert.strictEqual(res.statusCode, 409, `Expected 409, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error message');
  });

  await test('Reject invalid email format', async () => {
    const res = await makeRequest('POST', '/users', {
      body: {
        email: 'not-an-email',
      },
    });
    assert.strictEqual(res.statusCode, 400, `Expected 400, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error message');
  });

  await test('Reject missing email', async () => {
    const res = await makeRequest('POST', '/users', {
      body: {
        display_name: 'Test',
      },
    });
    assert.strictEqual(res.statusCode, 400, `Expected 400, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error message');
  });

  // Register agent for auth tests
  {
    const res = await makeRequest('POST', '/users', {
      body: {
        email: `test-agent-${Date.now()}@clawprint.test`,
        display_name: 'Test Agent for Auth',
      },
    });
    agentPublicKey = res.body.public_key;
    agentSecretKey = res.body.secret_key;
    apiKey = `${agentPublicKey}:${agentSecretKey}`;
  }

  // ============================================================================
  // SUITE 2: Bearer Token Authentication
  // ============================================================================

  console.log('\n🔑 Suite 2: Bearer Token Authentication\n');

  await test('Accept valid Bearer token', async () => {
    const res = await makeRequest('GET', '/businesses', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.ok(Array.isArray(res.body), 'Should return array');
  });

  await test('Reject missing Authorization header', async () => {
    const res = await makeRequest('GET', '/businesses');
    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error');
    assert.ok(res.body.error.includes('Authorization'), 'Error should mention Authorization');
  });

  await test('Reject invalid Bearer format', async () => {
    const res = await makeRequest('GET', '/businesses', {
      headers: {
        Authorization: 'InvalidFormat',
      },
    });
    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error');
  });

  await test('Reject Bearer without token', async () => {
    const res = await makeRequest('GET', '/businesses', {
      headers: {
        Authorization: 'Bearer ',
      },
    });
    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error');
  });

  await test('Reject malformed token (wrong format)', async () => {
    const res = await makeRequest('GET', '/businesses', {
      headers: {
        Authorization: 'Bearer invalid:token:format',
      },
    });
    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error');
  });

  await test('Reject unknown public key', async () => {
    const res = await makeRequest('GET', '/businesses', {
      headers: {
        Authorization: 'Bearer pk_unknown:sk_unknown',
      },
    });
    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error');
  });

  await test('Reject wrong secret key', async () => {
    const res = await makeRequest('GET', '/businesses', {
      headers: {
        Authorization: `Bearer ${agentPublicKey}:sk_wrong`,
      },
    });
    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.ok(res.body.error, 'Should return error');
  });

  // ============================================================================
  // SUITE 3: Protected Endpoints
  // ============================================================================

  console.log('\n🛡️  Suite 3: Protected Endpoints\n');

  const protectedEndpoints = [
    { method: 'GET', path: '/businesses' },
    { method: 'POST', path: '/businesses', body: { legal_name: 'Test', sponsor_email: 'test@example.com' } },
    { method: 'GET', path: '/invoices?business_id=test' },
  ];

  for (const endpoint of protectedEndpoints) {
    await test(`${endpoint.method} ${endpoint.path} - requires auth`, async () => {
      const res = await makeRequest(endpoint.method, endpoint.path);
      assert.strictEqual(res.statusCode, 401, `Expected 401 without auth, got ${res.statusCode}`);
    });

    await test(`${endpoint.method} ${endpoint.path} - accepts valid auth`, async () => {
      const res = await makeRequest(endpoint.method, endpoint.path, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: endpoint.body,
      });
      // Accept 200, 201, 400 (validation error is ok, we're testing auth)
      assert.ok([200, 201, 400].includes(res.statusCode), `Expected 200/201/400, got ${res.statusCode}`);
    });
  }

  // ============================================================================
  // SUITE 4: Business Lifecycle with Authentication
  // ============================================================================

  console.log('\n🏢 Suite 4: Business Lifecycle with Authentication\n');

  let businessId = null;

  await test('Create business with authentication', async () => {
    const res = await makeRequest('POST', '/businesses', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: {
        legal_name: `Test Business ${Date.now()}`,
        sponsor_email: `sponsor-${Date.now()}@example.com`,
      },
    });
    assert.strictEqual(res.statusCode, 201, `Expected 201, got ${res.statusCode}`);
    assert.ok(res.body.business_id, 'Should return business_id');
    businessId = res.body.business_id;
  });

  await test('Get business with authentication', async () => {
    if (!businessId) {
      throw new Error('No business_id from previous test');
    }
    const res = await makeRequest('GET', `/businesses/${businessId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.strictEqual(res.body.business_id, businessId, 'Should return correct business');
  });

  // ============================================================================
  // SUITE 5: Invoice Operations with Authentication
  // ============================================================================

  console.log('\n📄 Suite 5: Invoice Operations with Authentication\n');

  let invoiceId = null;

  await test('Create invoice requires authentication', async () => {
    const res = await makeRequest('POST', '/invoices', {
      body: {
        business_id: 'test',
        customer_email: 'test@example.com',
        line_items: [{ description: 'Test', quantity: 1, unit_price: 100 }],
      },
    });
    assert.strictEqual(res.statusCode, 401, `Expected 401 without auth, got ${res.statusCode}`);
  });

  await test('Create invoice with authentication', async () => {
    if (!businessId) {
      throw new Error('No business_id from previous test');
    }
    const res = await makeRequest('POST', '/invoices', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: {
        business_id: businessId,
        customer_email: `customer-${Date.now()}@example.com`,
        line_items: [{ description: 'Test Service', quantity: 1, unit_price: 5000, tax_rate: 10 }],
      },
    });
    assert.strictEqual(res.statusCode, 201, `Expected 201, got ${res.statusCode}`);
    assert.ok(res.body.invoice_id, 'Should return invoice_id');
    invoiceId = res.body.invoice_id;
  });

  await test('List invoices with authentication', async () => {
    if (!businessId) {
      throw new Error('No business_id from previous test');
    }
    const res = await makeRequest('GET', `/invoices?business_id=${businessId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.ok(Array.isArray(res.body.invoices), 'Should return invoices array');
  });

  // ============================================================================
  // Print Results
  // ============================================================================

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`\nTotal:  ${testsRun}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`Success Rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%\n`);

  if (failedTests.length > 0) {
    console.log('❌ Failed Tests:\n');
    failedTests.forEach((test, i) => {
      console.log(`${i + 1}. ${test.name}`);
      console.log(`   Error: ${test.error}\n`);
    });
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
