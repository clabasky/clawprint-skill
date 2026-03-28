#!/usr/bin/env node

/**
 * Setup Agent CLI
 * Register an agent with Clawprint API and store credentials locally
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.CLAWPRINT_API_URL || 'http://localhost:3000/api';
const ENV_FILE = path.join(__dirname, '../.env');

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const error = new Error(parsed.error || `HTTP ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.response = parsed;
            reject(error);
          }
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

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Read existing .env file
 */
function readEnv() {
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf8');
    const env = {};
    content.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    return env;
  }
  return {};
}

/**
 * Write .env file
 */
function writeEnv(env) {
  const content = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  fs.writeFileSync(ENV_FILE, content, 'utf8');
}

async function setupAgent() {
  console.log('🔐 Clawprint Agent Setup\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  let email = null;
  let displayName = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[++i];
    } else if (args[i] === '--name' && args[i + 1]) {
      displayName = args[++i];
    }
  }

  // Validate email
  if (!email) {
    console.error('❌ Error: --email is required');
    console.error('Usage: node setup-agent.js --email <email> [--name <name>]');
    console.error('');
    console.error('Example:');
    console.error('  node setup-agent.js --email my-agent@clawprint.ai --name "My Agent"');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Error: Invalid email address');
    process.exit(1);
  }

  console.log('📡 Registering agent with Clawprint API...');
  console.log(`   API: ${API_URL}`);
  console.log(`   Email: ${email}`);
  if (displayName) {
    console.log(`   Name: ${displayName}`);
  }
  console.log('');

  try {
    // Register agent
    const response = await makeRequest('POST', '/users', {
      email,
      display_name: displayName,
    });

    const { public_key, secret_key, message } = response;

    if (!public_key || !secret_key) {
      throw new Error('Server did not return API keys');
    }

    // Read existing .env
    const env = readEnv();

    // Store credentials
    env.CLAWPRINT_API_KEY = `${public_key}:${secret_key}`;
    env.CLAWPRINT_API_URL = API_URL;

    // Write .env
    writeEnv(env);

    console.log('✅ Agent registered successfully!\n');
    console.log('📋 API Credentials:');
    console.log(`   Public Key: ${public_key}`);
    console.log(`   Secret Key: ${secret_key.substring(0, 8)}...`);
    console.log('');
    console.log('💾 Credentials saved to: .env');
    console.log('   CLAWPRINT_API_KEY=${public_key}:${secret_key}');
    console.log('   CLAWPRINT_API_URL=${API_URL}');
    console.log('');
    console.log('⚠️  Keep your secret key safe!');
    console.log('   Do not commit .env to version control.');
    console.log('   Do not share your secret key.');
    console.log('');
    console.log('🚀 You can now use the Clawprint API client:');
    console.log('');
    console.log('   const api = require(\'./lib/api-client\');');
    console.log('');
    console.log('   // Create a business');
    console.log('   const business = await api.businesses.create({');
    console.log('     legal_name: \'My Business LLC\',');
    console.log('     sponsor_email: \'sponsor@example.com\'');
    console.log('   });');
    console.log('');
  } catch (error) {
    console.error('❌ Error registering agent:');
    if (error.response) {
      console.error(`   Status: ${error.statusCode}`);
      console.error(`   Message: ${error.response.error || error.message}`);
      if (error.statusCode === 409) {
        console.error('');
        console.error('   This email is already registered.');
        console.error('   Use a different email address.');
      }
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

setupAgent();
