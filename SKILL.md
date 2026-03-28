---
name: clawprint
description: |
  Create Delaware LLCs for AI agents with human sponsor oversight.
  Use when an agent needs to form a legal business entity.
---

# Clawprint — LLC Formation for AI Agents

Form Delaware LLCs for AI agents. Each agent gets a legal business entity with an EIN and bank account.

---

## HTTP API — discovery first

When using the Clawprint HTTP API (not the local scripts), **always call the products catalog first**:

1. **`GET {origin}/api/products`** — No authentication. Returns a JSON **array** of route definitions: `id`, `method`, `path`, `description`, and `agent_integration` (headers, body shape, auth, and step-by-step call instructions).
2. **Choose next calls from that list** — Only use methods and paths that appear in the catalog; follow each entry’s `agent_integration` for auth and payloads.

`{origin}` is your deployed API base (for example the Convex site URL or your app’s API origin). Example:

```bash
curl -sS "{origin}/api/products" -H "Accept: application/json"
```

After you have the catalog, register users, create businesses, and perform other operations using the routes and credentials described there.

---

## Quick Start

### Create a Business

```bash
node scripts/create-business.js \
  --name "My AI LLC" \
  --purpose "Software development" \
  --sponsor sponsor@example.com
```

Returns: business ID, formation status, timeline.

The sponsor receives an email to verify identity (one-time KYC).

### Check Status

```bash
node scripts/check-status.js --business-id <id>
```

Shows:
- LLC formation status (forming → filed → active)
- EIN status (pending → assigned)
- Bank account status (pending → active)

---

## How It Works

### What You Get

Each agent business is a **Delaware LLC** with:
- Legal business entity registered with the state
- EIN (tax ID) from the IRS
- FDIC-insured bank account (routing & account number)

### Legal Model

- **Agent** — Operates the business
- **Sponsor** — Legal owner, provides KYC, maintains oversight
- **Operating Agreement** — Delegates authority to agent

### Timeline

1. Submit business details via `create-business.js`
2. Sponsor verifies identity via email (KYC)
3. Clawprint files LLC with Delaware
4. IRS issues EIN (1-5 business days)
5. Bank account opened (2-5 business days)
6. **Business is active** (3-10 days total)

### Requirements

**For Sponsor:**
- US citizen or resident
- Valid SSN for IRS reporting
- Email for KYC verification

**For Agent:**
- Valid business name and purpose
- Sponsor email

---

## Cost

Formation: ~$150 (Delaware filing + registered agent + misc)  
Ongoing: ~$10/month (registered agent)

---

## Sponsor Dashboard

After KYC, sponsor can:
- View all their sponsored businesses
- See business status in real-time
- Manage bank account access

---

## Limitations

- **US only** (Delaware LLCs only)
- **3-10 day timeline** (cannot be expedited)
- **Sponsor required** (sponsor maintains legal responsibility)

---

**For complete API reference, see REFERENCE.md**
