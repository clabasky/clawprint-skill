'use strict';

const https = require('https');
const http = require('http');

/**
 * Resolve site origin (Convex / app) vs legacy API root (…/api).
 */
function getUrlConfig() {
  const site = (
    process.env.CLAWPRINT_SITE_URL ||
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ||
    ''
  )
    .trim()
    .replace(/\/$/, '');
  if (site) return { mode: 'site', base: site };
  const api = (process.env.CLAWPRINT_API_URL || 'http://localhost:3000/api')
    .trim()
    .replace(/\/$/, '');
  return { mode: 'apiRoot', base: api };
}

/**
 * Build absolute URL for a Clawprint route.
 * Accepts "/api/products", "api/products", "/users", "users", etc.
 */
function buildClawprintUrl(path) {
  let p = String(path || '').trim() || '/api/products';
  if (!p.startsWith('/')) p = `/${p}`;
  const { mode, base } = getUrlConfig();
  if (mode === 'site') {
    if (p.startsWith('/api')) return base + p;
    return `${base}/api${p}`;
  }
  let rel = p.replace(/^\/+/, '');
  if (rel.startsWith('api/')) rel = rel.slice(4);
  return `${base}/${rel}`;
}

/**
 * HTTP request to Clawprint. Pass either `url` (absolute) or `path` (segment under /api).
 */
function clawprintRequest({
  method = 'GET',
  path,
  url: absoluteUrl,
  body = null,
  auth = true,
  apiKey = null,
  timeout = 30000,
}) {
  const href = absoluteUrl || buildClawprintUrl(path);
  const u = new URL(href);
  const isHttps = u.protocol === 'https:';
  const lib = isHttps ? https : http;
  const port = u.port || (isHttps ? 443 : 80);

  const headers = {
    Accept: 'application/json',
  };

  const key = apiKey !== null && apiKey !== undefined ? apiKey : process.env.CLAWPRINT_API_KEY;
  if (auth && key) {
    headers.Authorization = `Bearer ${key}`;
  }

  let payload = null;
  if (body !== undefined && body !== null && method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
    payload = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return new Promise((resolve, reject) => {
    const opts = {
      method,
      hostname: u.hostname,
      port,
      path: u.pathname + u.search,
      headers,
      timeout,
    };

    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch {
          parsed = { raw: data };
        }
        const result = {
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          ok: res.statusCode >= 200 && res.statusCode < 300,
        };
        if (result.ok) resolve(result);
        else {
          const err = new Error(
            (parsed && parsed.error) || `HTTP ${res.statusCode}`,
          );
          err.statusCode = res.statusCode;
          err.response = parsed;
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = {
  getUrlConfig,
  buildClawprintUrl,
  clawprintRequest,
};
