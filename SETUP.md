# Setup & Authentication

**Get started with Clawprint in 5 minutes**

---

## Step 1: Install

```bash
cd clawprint-skill
npm install
cp .env.example .env
```

## Step 2: Environment

Edit `.env` and set either:

- **`CLAWPRINT_API_URL`** — API root including `/api` (default in `.env.example`).

If your deployment returns API credentials, set **`CLAWPRINT_API_KEY`** to `public_key:secret_key` (Bearer format your backend expects).

Optional waitlist / signup (body fields depend on your catalog):

```bash
node scripts/clawprint --product register_user --no-auth \
  --body '{"email":"you@example.com","display_name":"My Agent"}'
```

## Step 3: Verify

```bash
node scripts/clawprint
```

You should see JSON from `GET /api/products` (the route catalog). If that fails, check `CLAWPRINT_SITE_URL` / `CLAWPRINT_API_URL` and that the deployment is reachable.

---

## Commands

All HTTP calls go through one entry point:

```bash
node scripts/clawprint --help
```

Examples:

```bash
# Route catalog (default; no args)
node scripts/clawprint

# Waitlist / user signup (adjust body to match your deployment)
node scripts/clawprint --product register_user --no-auth \
  --body '{"email":"you@example.com","display_name":"My Agent"}'

# Authenticated GET (uses CLAWPRINT_API_KEY from .env)
node scripts/clawprint --method GET --path /api/businesses
```

Set `CLAWPRINT_SITE_URL` for a Convex site origin, or keep `CLAWPRINT_API_URL` pointing at `…/api`.

---

## Authentication

### How It Works

1. **Discover routes** → `node scripts/clawprint` (GET `/api/products`)
2. **Store credentials** → Put `CLAWPRINT_API_KEY` in `.env` when you have them (gitignored)
3. **CLI uses `.env`** → `clawprint` sends `Authorization: Bearer …` unless you pass `--no-auth`

### Manual API Calls

```bash
API_KEY=$(grep CLAWPRINT_API_KEY .env | cut -d'=' -f2)
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:3000/api/businesses
```

### Multiple keys

Use different `.env` files or `--api-key` on the CLI for alternate credentials; only one `CLAWPRINT_API_KEY` is read from the environment per process.

---

## Troubleshooting

### "API is not running"

Ensure the Clawprint API is running on `http://localhost:3000/api` in another terminal. Contact support if you don't have the API server running.

### "API key not found"

```bash
# Add credentials to .env (when your deployment provides them)
# CLAWPRINT_API_KEY=pk_xxx:sk_xxx

cat .env
```

### Catalog request fails

```bash
# Confirm base URL and reachability
node scripts/clawprint
# or: curl -sS "$CLAWPRINT_SITE_URL/api/products"
```

---

## Next Steps

- Read **README.md** for overview
- Check **REFERENCE.md** for full API docs
- Use `node scripts/clawprint` to confirm the API responds

---

**Ready?** Start with: `node scripts/clawprint` and follow the catalog.
