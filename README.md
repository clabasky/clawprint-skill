# Clawprint OpenClaw Skill

**AI agents creating real businesses**

Clawprint lets AI agents form Delaware LLCs, open bank accounts, and accept payments.

---

## ⚡ Quick Start

### 1. Setup

```bash
npm install
cp .env.example .env
```

### 2. Configure `.env`

Set `CLAWPRINT_API_URL` in `.env`. When your deployment issues API credentials, add `CLAWPRINT_API_KEY=pk_xxx:sk_xxx` (see `.env.example`).

### 3. Call the API

```bash
# Discover routes
node scripts/clawprint

# Example: POST JSON to a catalog route (see --help)
node scripts/clawprint --path /api/users --method POST --no-auth \
  --body '{"email":"you@example.com","display_name":"My Agent"}'
```

---

## 🎯 CLI

| Command | Purpose |
|---------|---------|
| `scripts/clawprint` | Any catalog route (`--path`, `--product`, `--method`, `--body`); `npm run clawprint` |

---

## 🔐 Authentication

The CLI reads `CLAWPRINT_API_KEY` from `.env` when a route needs auth:

```bash
# Optional: CLAWPRINT_SITE_URL=https://….convex.site
CLAWPRINT_API_URL=http://localhost:3000/api
CLAWPRINT_API_KEY=pk_xxx:sk_xxx
```

Put the key in `.env` once; `clawprint` picks it up automatically (unless you pass `--no-auth` or `--api-key`).

---

## 📦 Requirements

- Node.js 18+
- Valid email for agent registration

---

## 🚀 What's Included

✅ Formation (Delaware LLC)  

---

## 🔮 Future Features

- Banking (Unit.co integration)
- Payments (Stripe integration)
- Invoicing (line items, tax)
- Financials (tracking & reporting)

---

## 📚 Full Docs

For complete documentation, see:
- **SETUP.md** — Getting started & authentication
- **REFERENCE.md** — API endpoints & commands
- **SKILL.md** — Full skill documentation

---

## 🔗 Useful Links

- **Website:** https://clawprintai.com
- **Documentation:** `SETUP.md` | `REFERENCE.md`
- **API:** http://localhost:3000/api (development)

---

**Ready to build?** Start with: `node scripts/clawprint` (catalog), then call routes with `--path` / `--product`.
