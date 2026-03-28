#!/usr/bin/env node

/**
 * Clawprint API Client
 * Complete client library for interacting with the Clawprint business API
 */

const https = require('https');
const http = require('http');

class ClawprintAPIClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.CLAWPRINT_API_URL || 'http://localhost:3000/api';
    this.apiKey = options.apiKey || process.env.CLAWPRINT_API_KEY;
    this.timeout = options.timeout || 30000; // 30 seconds
  }

  /**
   * Make an HTTP request
   */
  async request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
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
        timeout: this.timeout,
      };

      // Add authorization header if API key is set
      if (this.apiKey) {
        options.headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
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

  // Health check
  async health() {
    return this.request('GET', '/health');
  }

  // Users (waitlist / registration)
  users = {
    register: async (email, displayName) => {
      return this.request('POST', '/users', {
        email,
        display_name: displayName,
      });
    },
  };

  // Businesses
  businesses = {
    create: async (data) => {
      return this.request('POST', '/businesses', data);
    },

    list: async () => {
      return this.request('GET', '/businesses');
    },

    get: async (id) => {
      return this.request('GET', `/businesses/${id}`);
    },

    getStatus: async (id) => {
      return this.request('GET', `/businesses/${id}/status`);
    },

    getFinancials: async (id, period = 'all') => {
      return this.request('GET', `/businesses/${id}/financials?period=${period}`);
    },

    update: async (id, updates) => {
      return this.request('PATCH', `/businesses/${id}`, updates);
    },

    dissolve: async (id) => {
      return this.request('DELETE', `/businesses/${id}`);
    },
  };

  // Sponsors
  sponsors = {
    getOrCreate: async (data) => {
      return this.request('POST', '/sponsors', data);
    },

    getByEmail: async (email) => {
      return this.request('GET', `/sponsors?email=${encodeURIComponent(email)}`);
    },
  };

  // Invoices
  invoices = {
    create: async (data) => {
      return this.request('POST', '/invoices', data);
    },

    list: async (businessId, options = {}) => {
      let query = `?business_id=${encodeURIComponent(businessId)}`;
      if (options.status) {
        query += `&status=${encodeURIComponent(options.status)}`;
      }
      if (options.limit) {
        query += `&limit=${Math.min(options.limit, 100)}`;
      }
      return this.request('GET', `/invoices${query}`);
    },

    get: async (id) => {
      return this.request('GET', `/invoices/${id}`);
    },

    update: async (id, updates) => {
      return this.request('PATCH', `/invoices/${id}`, updates);
    },

    delete: async (id) => {
      return this.request('DELETE', `/invoices/${id}`);
    },

    generatePaymentLink: async (id) => {
      return this.request('POST', `/invoices/${id}/payment-link`);
    },

    getPaymentLink: async (id) => {
      return this.request('GET', `/invoices/${id}/payment-link`);
    },
  };
}

// Export singleton instance
let defaultClient = null;

function getClient(options) {
  if (!defaultClient) {
    defaultClient = new ClawprintAPIClient(options);
  }
  return defaultClient;
}

module.exports = {
  ClawprintAPIClient,
  getClient,
  // Export default instance methods
  health: () => getClient().health(),
  users: getClient().users,
  businesses: getClient().businesses,
  sponsors: getClient().sponsors,
  invoices: getClient().invoices,
};
