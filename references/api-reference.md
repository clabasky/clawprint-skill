# Clawprint API Reference

Complete reference for the Clawprint business infrastructure API.

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api` (development)  
**Production:** `https://api.clawprint.ai/v1`

---

## Authentication

All endpoints (except `/health`) require Bearer token authentication:

```
Authorization: Bearer pk_xxx:sk_xxx
```

Get API credentials by registering a user:

```bash
POST /api/users
```

---

## Endpoints

### Health

#### `GET /health`

Health check endpoint. No authentication required.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-26T12:00:00Z",
  "services": {
    "database": "up",
    "api": "up"
  }
}
```

---

### Users

#### `POST /users`

Register a new user and get API credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "display_name": "My Display Name"
}
```

**Response:**
```json
{
  "user": {
    "user_id": "usr_abc123",
    "email": "user@example.com",
    "display_name": "My Display Name",
    "user_type": "agent",
    "created_at": "2026-02-26T12:00:00Z"
  },
  "api_key": {
    "public_key": "pk_abc123",
    "secret_key": "sk_secret_xyz789"
  }
}
```

**⚠️ Save the secret_key immediately - it's only shown once!**

---

### Sponsors

#### `POST /sponsors`

Get or create a sponsor (human responsible for the business).

**Request:**
```json
{
  "email": "sponsor@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1-555-0100",
  "address": "123 Main St, City, ST 12345"
}
```

**Response:**
```json
{
  "sponsor_id": "spn_abc123",
  "email": "sponsor@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1-555-0100",
  "address": "123 Main St, City, ST 12345",
  "verified_at": null,
  "created_at": "2026-02-26T12:00:00Z"
}
```

#### `GET /sponsors?email=xxx`

Get sponsor by email.

**Query Parameters:**
- `email` (required) - Sponsor email address

**Response:** Same as POST /sponsors

**Error Codes:**
- `404` - Sponsor not found

---

### Businesses

#### `POST /businesses`

Create a new business entity.

**Request:**
```json
{
  "legal_name": "Acme AI Services LLC",
  "purpose": "Software development and consulting",
  "sponsor_email": "sponsor@example.com",
  "type": "llc",
  "formation_state": "delaware",
  "registered_agent_name": "Delaware Registered Agent Inc",
  "registered_agent_address": "123 Main St, Dover, DE 19901",
  "principal_address": "456 Business Ave, City, ST 12345",
  "members": [
    {
      "email": "member@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "manager",
      "ownership_pct": 100
    }
  ]
}
```

**Required fields:**
- `legal_name` - Business legal name
- `sponsor_email` - Email of human sponsor

**Optional fields:**
- `purpose` - Business purpose (default: general business operations)
- `type` - `llc`, `c_corp`, or `s_corp` (default: `llc`)
- `formation_state` - State of formation (default: `delaware`)
- `registered_agent_name` - Registered agent name
- `registered_agent_address` - Registered agent address
- `principal_address` - Principal business address
- `members` - Array of member objects

**Response:**
```json
{
  "business_id": "biz_abc123",
  "legal_name": "Acme AI Services LLC",
  "purpose": "Software development and consulting",
  "sponsor_email": "sponsor@example.com",
  "status": "pending",
  "type": "llc",
  "formation_state": "delaware",
  "ein": null,
  "registered_agent_name": "Delaware Registered Agent Inc",
  "registered_agent_address": "123 Main St, Dover, DE 19901",
  "principal_address": "456 Business Ave, City, ST 12345",
  "formed_at": null,
  "created_at": "2026-02-26T12:00:00Z",
  "updated_at": "2026-02-26T12:00:00Z",
  "members": [...]
}
```

**Status values:**
- `pending` - Awaiting formation
- `forming` - Formation in progress
- `active` - Fully operational
- `suspended` - Temporarily suspended
- `dissolved` - Permanently dissolved

---

#### `GET /businesses`

List all businesses.

**Response:**
```json
[
  {
    "business_id": "biz_abc123",
    "legal_name": "Acme AI Services LLC",
    ...
  },
  ...
]
```

---

#### `GET /businesses/:id`

Get a single business by ID.

**Response:** Same as POST /businesses

**Error Codes:**
- `404` - Business not found

---

#### `GET /businesses/:id/status`

Get detailed formation status for tracking progress.

**Response:**
```json
{
  "business_id": "biz_abc123",
  "legal_name": "Acme AI Services LLC",
  "status": "forming",
  "created_at": "2026-02-26T12:00:00Z",
  "llc": {
    "status": "filed",
    "state": "Delaware",
    "file_number": "1234567",
    "filed_date": "2026-02-20T10:00:00Z"
  },
  "ein": {
    "status": "pending",
    "number": null,
    "assigned_date": null
  },
  "bank_account": {
    "status": "pending",
    "provider": null,
    "routing": null,
    "account_last4": null,
    "opened_date": null
  },
  "sponsor": {
    "email": "sponsor@example.com",
    "verified": true,
    "verified_at": "2026-02-18T14:30:00Z"
  }
}
```

**LLC Status:**
- `pending` - Not yet filed
- `filed` - Filed with state
- `rejected` - Filing rejected

**EIN Status:**
- `pending` - Not yet assigned
- `assigned` - EIN assigned
- `failed` - Application failed

**Bank Status:**
- `pending` - Not yet opened
- `active` - Account active
- `rejected` - Application rejected
- `closed` - Account closed

---

#### `GET /businesses/:id/financials?period=all`

Get financial summary with transactions.

**Query Parameters:**
- `period` (optional) - Time period: `week`, `month`, `year`, or `all` (default: `all`)

**Response:**
```json
{
  "business_id": "biz_abc123",
  "legal_name": "Acme AI Services LLC",
  "period": "all",
  "balance": {
    "current": 50000.00,
    "available": 48000.00,
    "pending": 2000.00
  },
  "revenue": {
    "total": 75000.00,
    "count": 15
  },
  "expenses": {
    "total": 25000.00,
    "count": 42
  },
  "net_income": 50000.00,
  "transactions": [
    {
      "transaction_id": "txn_abc123",
      "business_id": "biz_abc123",
      "amount": 5000.00,
      "type": "credit",
      "description": "Client payment",
      "category": "revenue",
      "date": "2026-02-25T10:00:00Z",
      "created_at": "2026-02-25T10:00:00Z"
    },
    ...
  ]
}
```

**Transaction Types:**
- `credit` - Money in (revenue)
- `debit` - Money out (expense)

---

#### `PATCH /businesses/:id`

Update a business.

**Request:**
```json
{
  "legal_name": "Updated Business Name LLC",
  "purpose": "Updated purpose",
  "status": "active",
  "ein": "12-3456789",
  "registered_agent_name": "New Agent",
  "registered_agent_address": "New Address",
  "principal_address": "New Principal Address"
}
```

All fields are optional. Only provided fields will be updated.

**Response:** Updated business object (same as GET /businesses/:id)

**Error Codes:**
- `404` - Business not found

---

#### `DELETE /businesses/:id`

Dissolve (soft delete) a business. Sets status to `dissolved`.

**Response:**
```json
{
  "message": "Business dissolved successfully"
}
```

**Error Codes:**
- `404` - Business not found

---

## Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Descriptive error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not found
- `409` - Conflict (duplicate resource)
- `500` - Internal server error
- `503` - Service unavailable

---

## Rate Limiting

Rate limiting headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1614556800
```

Default limits:
- 1000 requests per hour per API key
- Burst: 100 requests per minute

---

## Example Usage

### Using curl

```bash
# Health check
curl http://localhost:3000/api/health

# Create business
curl -X POST http://localhost:3000/api/businesses \
  -H "Authorization: Bearer pk_xxx:sk_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "legal_name": "Test LLC",
    "sponsor_email": "sponsor@example.com"
  }'

# Get business status
curl http://localhost:3000/api/businesses/biz_abc123/status \
  -H "Authorization: Bearer pk_xxx:sk_xxx"
```

### Using the API Client (Node.js)

```javascript
const api = require('./lib/api-client');

// Create business
const business = await api.businesses.create({
  legal_name: 'Test LLC',
  sponsor_email: 'sponsor@example.com',
});

// Check status
const status = await api.businesses.getStatus(business.business_id);

// Get financials
const financials = await api.businesses.getFinancials(
  business.business_id,
  'month'
);
```

---

## Support

- **Documentation:** https://docs.clawprint.ai
- **GitHub:** https://github.com/clawprintai/openclaw-skill
- **Email:** support@clawprint.ai

---

**Last Updated:** February 26, 2026
