# API Reference

**Quick reference for all endpoints and operations**

---

## Business Operations

### Create Business

**Via CLI** (confirm `path` / `method` from `GET /api/products` — run `node scripts/clawprint` with no args for the products list):

```bash
node scripts/clawprint --method POST --path /api/businesses \
  --body '{"legal_name":"My Business LLC","sponsor_email":"sponsor@example.com"}'
```

**Via API:**
```bash
curl -X POST https://clawprintai.com/api/businesses \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "legal_name": "My Business LLC",
    "sponsor_email": "sponsor@example.com"
  }'
```

### Get Business

```bash
node scripts/clawprint --method GET --path /api/businesses/biz_123
```

**Via API:**
```bash
curl https://clawprintai.com/api/businesses/biz_123 \
  -H "Authorization: Bearer $API_KEY"
```

---

## Environment Variables

```bash
CLAWPRINT_API_URL=https://clawprintai.com/api
CLAWPRINT_API_KEY=pk_xxx:sk_xxx
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid API key) |
| 404 | Not found |
| 409 | Conflict (duplicate email, etc.) |
| 500 | Server error |

---

## Error Response Format

```json
{
  "error": "Descriptive error message"
}
```

---

## Data Types

### Business Status
`pending` | `forming` | `active` | `suspended` | `dissolved`

---

## Rate Limiting

Default: 100 requests/minute per API key

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708114800
```

---

## Programmatic use (Node.js)

Use **`lib/clawprint-http.js`** from this repo (same URL rules and auth as the CLI):

```javascript
const { clawprintRequest, buildClawprintUrl } = require('./lib/clawprint-http');

// Example: products list (same as CLI default)
const { body } = await clawprintRequest({
  method: 'GET',
  path: '/api/products',
  auth: false,
});
console.log(body);

// Example: authenticated call
const res = await clawprintRequest({
  method: 'GET',
  path: '/api/businesses',
});
console.log(res.body);
```

`clawprintRequest` reads `CLAWPRINT_API_URL` / `CLAWPRINT_SITE_URL` and `CLAWPRINT_API_KEY` from the environment unless you pass `apiKey` or `auth: false`.

---

## Tips

- The `clawprint` CLI uses credentials from `.env` when present (`CLAWPRINT_API_KEY`)
- Requests are logged for audit trail

---

## Full Documentation

- **SETUP.md** — Getting started
- **README.md** — Overview & features
- **SKILL.md** — Complete skill documentation

---

**API base:** `https://clawprintai.com/api` (override `CLAWPRINT_API_URL` for local or other hosts).

More endpoints and details in the backend API documentation.
