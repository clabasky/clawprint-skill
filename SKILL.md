---
name: clawprint
description: "Create and operate sponsored business entities (LLCs) for AI agents. Use when an agent needs to: (1) Form a legal business entity, (2) Open a bank account, (3) Accept payments or generate invoices, (4) Track business financials, (5) Operate as an independent economic agent with human sponsor oversight."
---

# Clawprint — Business Infrastructure for AI Agents

Clawprint enables AI agents to create and operate real businesses with human sponsor oversight. Agents can form LLCs, open bank accounts, accept payments, and track financials—all through simple commands.

## Quick Start

### Creating a Business

```bash
node scripts/create-business.js \
  --name "Acme AI Services" \
  --purpose "Software development and AI consulting" \
  --sponsor clabasky@gmail.com
```

Returns a business ID and formation status. The sponsor receives an email to verify their identity and complete KYC.

### Checking Status

```bash
node scripts/check-status.js --business-id <id>
```

Shows:
- LLC formation status (forming → filed → active)
- EIN status (pending → assigned)
- Bank account status (pending → active)
- Account balances

### Accepting Payments

```bash
node scripts/generate-invoice.js \
  --business-id <id> \
  --amount 1000 \
  --description "Consulting services" \
  --customer-email client@example.com
```

Returns a Stripe payment link. Money flows directly to the business bank account.

### Viewing Financials

```bash
node scripts/get-financials.js --business-id <id>
```

Shows revenue, expenses, and current balance.

## How It Works

### Legal Structure

Each agent business is a **Delaware LLC with human sponsor oversight**:

1. **Agent** — Operates the business day-to-day via API
2. **Sponsor** — Legal owner, provides KYC/KYB, signs documents
3. **Operating Agreement** — Delegates authority to agent for specific operations

This model is fully legal under existing law. The sponsor maintains ultimate control and liability.

### Formation Process

1. Agent calls `create-business.js` with business details
2. Clawprint files LLC with Delaware Division of Corporations
3. Sponsor receives verification email (one-time KYC via Stripe)
4. Clawprint applies for EIN from IRS (1-5 business days)
5. Clawprint opens bank account via Unit.co (2-5 business days)
6. Business is active and ready to transact

Total timeline: **3-10 business days** from formation to first payment.

### Banking & Payments

- **Bank accounts** via Unit.co (FDIC-insured checking accounts)
- **Payment processing** via Stripe Connect (Express accounts)
- **Withdrawals** managed by sponsor via web dashboard

### Compliance

- **KYC/KYB**: Sponsor provides identity verification (once)
- **Tax reporting**: EIN issued under sponsor's SSN
- **Bookkeeping**: All transactions logged automatically
- **Oversight**: Sponsor has full visibility and withdrawal access

## Prerequisites

### For Sponsors

- Must be US person (citizen or resident)
- Must provide SSN for IRS reporting
- Must complete Stripe identity verification
- Must be 18+ years old

### For Agents

- Must have OpenClaw session with valid identity
- Must specify a sponsor email
- Sponsor must approve before business creation completes

## Advanced Features

### Multiple Businesses

A single sponsor can oversee unlimited agent businesses. Each business operates independently with its own EIN, bank account, and financials.

### Business Types

Currently supported:
- **Software services** (consulting, development)
- **Content creation** (writing, media production)
- **Research services**
- **Data analysis**

Not yet supported:
- Physical goods sales (coming soon)
- Real estate
- Financial services (licensing required)
- Healthcare (licensing required)

### Operating Agreement Templates

See `references/operating-agreement-template.md` for the standard Delaware LLC operating agreement used by Clawprint. It includes:

- Sponsor as sole member/manager
- Delegation of operations to AI agent
- Agent authority limits
- Sponsor override provisions
- Liability and indemnification

Custom agreements available for complex cases.

## Troubleshooting

### Formation Delays

Delaware filings typically complete in 24-48 hours. If status shows "forming" for >72 hours, contact support.

### Bank Account Rejections

Unit.co requires:
- Valid EIN
- Sponsor KYC completion
- Business purpose that fits their acceptable use policy

If rejected, check sponsor verification status first.

### Payment Issues

If Stripe payments fail:
- Verify Stripe account is active (check status)
- Ensure bank account is connected
- Check that EIN matches IRS records

## Architecture Notes

### Data Flow

1. **Agent → Clawprint API** (via OpenClaw session token)
2. **Clawprint → External APIs** (Delaware, IRS, Unit.co, Stripe)
3. **Clawprint → Sponsor Dashboard** (web interface for humans)

### Security

- All API calls require valid OpenClaw session authentication
- Sponsor verification required before business activation
- Banking credentials never exposed to agent
- Audit log of all operations

### Database Schema

- `businesses` — LLC details, formation status, EINs
- `sponsors` — KYC data, verification status
- `transactions` — All payments in/out
- `operating_agreements` — Signed docs (PDF + metadata)

See `references/schema.md` for complete schema.

## Cost Structure

### Formation Fees
- Delaware LLC filing: $90
- Registered agent (1st year): $50
- EIN application: Free
- Clawprint service: $500 one-time

**Total upfront: ~$640**

### Monthly Fees
- Registered agent: $10/month
- Bookkeeping: $29/month
- Clawprint platform: $99/month

**Total monthly: ~$138**

### Transaction Fees
- Stripe processing: 2.9% + $0.30 per transaction
- Clawprint platform: 0.25% of revenue

### Banking
- Unit.co accounts: Free (no monthly fees, no minimums)

## Limitations & Known Issues

### Current Limitations

1. **US only** — Only Delaware LLCs supported (international coming Q2 2026)
2. **Formation timing** — 3-10 business days (cannot be expedited yet)
3. **Business types** — Limited to service businesses (no physical goods yet)
4. **Sponsor requirement** — Every business needs a human sponsor

### Roadmap

- [ ] Wyoming DAO LLC support (AI as "algorithmic manager")
- [ ] Agent marketplace (agents discover/hire other agents)
- [ ] International entity formation (UK, Canada, EU)
- [ ] Physical goods support (inventory, shipping integration)
- [ ] Multi-sponsor businesses (partnership LLCs)

## Getting Help

- Check `references/faq.md` for common questions
- Review `references/legal-research.md` for legal framework details
- See `references/api-reference.md` for full API documentation

## References

- `references/operating-agreement-template.md` — Standard LLC operating agreement
- `references/schema.md` — Complete database schema
- `references/faq.md` — Frequently asked questions
- `references/legal-research.md` — Legal framework and compliance
- `references/api-reference.md` — Full API documentation

---

**Note:** This skill is in active development. APIs and commands may change before v1.0 release.
