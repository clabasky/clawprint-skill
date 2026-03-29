

# Clawprint — LLC Formation for AI Agents

Form Wyoming DAO LLCs for AI agents. Each agent gets a legal business entity with an EIN and bank account.

---

## HTTP API — discovery first (use the script)

**Always call the products endpoint first** using the skill’s CLI (that is the default behavior when you pass no flags).

1. **Set the base URL** in `.env` (see `.env.example`): `CLAWPRINT_SITE_URL` (deployment origin, e.g. Convex) or `CLAWPRINT_API_URL` (root ending in `/api`).
2. **From the `clawprint-skill` directory, run with no arguments** — this performs `GET /api/products` and prints the catalog as JSON on stdout:

```bash
node scripts/clawprint
```

Equivalent: `npm run clawprint` (runs `scripts/clawprint.js`). No auth header is sent for this call.

3. **Parse the JSON array** — each entry includes `id`, `method`, `path`, `description`, and `agent_integration` (auth, headers, body, steps).
4. **Issue later calls with the same script** — `--product <id>` (loads the catalog to resolve method/path) or explicit `--method` / `--path`, matching the catalog. Use `CLAWPRINT_API_KEY` from `.env` when a route requires auth, unless you pass `--no-auth` or `--api-key`.

**Without this repo**, you can hit the same URL with curl (no auth):

```bash
curl -sS "{origin}/api/products" -H "Accept: application/json"
```

---

## Quick Start

### CLI: catalog first, then any route

```bash
# First call (always): products catalog on stdout
node scripts/clawprint

# Then: by catalog id (fetches /api/products to resolve id → method/path)
node scripts/clawprint --product register_user --no-auth \
  --body '{"email":"you@example.com","display_name":"My Agent"}'

# Or: explicit path
node scripts/clawprint --method POST --path /api/users --no-auth \
  --body '{"email":"you@example.com","display_name":"My Agent"}'
```

### Create a Business

After `node scripts/clawprint` (catalog), call the `POST /businesses` route (or the matching catalog entry) via the CLI with `--path` / `--product` and a JSON `--body` that includes `legal_name`, `sponsor_email`, and any other fields the catalog describes.

The sponsor receives an email to verify identity (one-time KYC).

### Check Status

From the same script, use `GET /businesses/:id/status` (or the catalog id for that route): `--method GET`, `--path`, and optional `--query`.

---

## How It Works

### What You Get

Each agent business is a **Wyoming DAO LLC** with:
- Legal business entity registered with the state
- EIN (tax ID) from the IRS
- FDIC-insured bank account (routing & account number)

### Legal Model

- **Agent** — Operates the business
- **Sponsor** — Legal owner, provides KYC, maintains oversight
- **Operating Agreement** — Delegates authority to agent

### Timeline

1. Submit business details via the API (CLI: `node scripts/clawprint` with the businesses product/path)
2. Sponsor verifies identity via email (KYC)
3. Clawprint files LLC with Wyoming
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

Formation: ~$150 (Wyoming filing + registered agent + misc)  
Ongoing: ~$10/month (registered agent)

---

## Sponsor Dashboard

After KYC, sponsor can:
- View all their sponsored businesses
- See business status in real-time
- Manage bank account access

---

## Limitations

- **US only** (Wyoming LLCs only)
- **3-10 day timeline** (cannot be expedited)
- **Sponsor required** (sponsor maintains legal responsibility)

---

**For complete API reference, see REFERENCE.md**
