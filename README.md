# 🛡️ Champion On-Call

### Managed Repair Marketplace — Investor Demo

> **"Houses don't make claims, people do."**

Champion On-Call is a managed repair marketplace that connects Florida property insurance policyholders with vetted, ranked contractors — instantly. Think of it as an HMO for property insurance: a network of pre-screened providers, transparent quality rankings, and aligned incentives that reduce litigation, speed up repairs, and protect policyholders.

---

## The Problem: Florida's Litigation Crisis

Florida represents **9% of U.S. homeowners insurance claims** but **76% of all homeowners insurance lawsuits**. The result: carriers flee the market, premiums skyrocket, and policyholders suffer.

The root cause isn't weather — it's the gap between the loss event and the repair. When policyholders are left to find their own contractors, bad actors exploit the information asymmetry with inflated estimates, unnecessary litigation, and assignment-of-benefits abuse.

## The Solution: Managed Repair Platforms

Champion On-Call eliminates this gap with:

- **Pre-vetted contractor network** — eliminates bad-actor risk
- **Champion Score ranking** — weighted 5-category quality score drives competition
- **First-come-first-served dispatch** — atomic blast acceptance ensures fastest response
- **Network benefit incentive** — 100% vs 80% payout aligns policyholder interests
- **Geo-verified check-in** — prevents phantom inspections
- **Real-time executive dashboard** — enables proactive operations oversight

## The Product Demo

This repository is a **fully functional MVP** with three complete user experiences:

| Role | Experience | Key Features |
|------|-----------|--------------|
| **Policyholder** | Report & Choose | FNOL wizard, photo upload, provider marketplace, benefit warning modal |
| **Contractor** | Respond & Earn | Real-time blast polling, FCFS claim acceptance, geo proximity check-in |
| **Executive** | Monitor & Optimize | Claims dashboard, contractor rankings, vetting queue, analytics charts |

### Demo Accounts (seeded automatically)

**Executives:** David Lockard (CEO), David M. Sholl (CLO), Paul Udouj (VP Ops)
**Policyholders:** Maria Gonzalez, James Rivera
**Contractors:** 10 Miami-Dade area contractors with varied scores and statuses

## The Team

| Name | Title |
|------|-------|
| **David Lockard, Esq.** | Chief Executive Officer |
| **David M. Sholl, Esq.** | Chief Legal Officer |
| **Paul Udouj, Esq.** | VP, Operations |

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or use Docker)
- npm

### Quick Start (with Docker)

```bash
# Clone and enter
git clone <repo-url> && cd champion-on-call-v11

# Copy environment
cp .env.example .env

# Start everything (database + app)
docker compose up --build
```

The app will be available at **http://localhost:3000**

### Quick Start (without Docker)

```bash
# Install dependencies
npm install

# Copy environment and configure DATABASE_URL
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed

# Start dev server
npm run dev
```

## Database + Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Deploy migrations (production)
npx prisma migrate deploy

# Seed data
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## Docker Setup

The `docker-compose.yml` includes:

- **db**: PostgreSQL 16 Alpine with health checks and persistent volume
- **app**: Next.js application that waits for db readiness, runs migrations, seeds data, and starts

```bash
docker compose up --build     # Build and start
docker compose down           # Stop
docker compose down -v && docker compose up --build   # Reset database
```

## Mobile Demo Instructions

1. Deploy to Vercel (connect the GitHub repo)
2. Set `DATABASE_URL` in Vercel environment variables (use Neon or Supabase for hosted PostgreSQL)
3. Run `npx prisma migrate deploy` and `npx prisma db seed` against the production database
4. Open the Vercel URL on your phone
5. Select a demo persona and explore

For investor demos, the contractor geo check-in includes a **Demo Mode toggle** that bypasses the 100m proximity requirement.

## Architecture Notes

### Tech Stack

- **Next.js 14** with App Router
- **TypeScript** throughout
- **Tailwind CSS** with custom navy (#0A1F44) / crimson (#D71920) brand palette
- **Prisma ORM** with PostgreSQL
- **Recharts** for analytics visualizations
- **Zod** for API input validation
- **Sonner** for toast notifications

### Key Business Logic

**FCFS Atomic Blast Acceptance** (`/api/claims/[id]/accept`)
Uses a Prisma interactive transaction to ensure exactly one contractor can accept a blasting claim. Returns 409 Conflict if already taken.

**Champion Score** (weighted average):
Communication 15% · Professionalism 20% · Punctuality 20% · Cleanliness 15% · Quality 30%

**Benefit Penalty Logic:**
Network (vetted) contractor = 100% of Xactimate estimate.
Non-network contractor = 80% of Xactimate estimate.
Warning modal shown before non-network selection.

**Geo Check-In:**
Uses navigator.geolocation + Haversine distance calculation.
100-meter proximity threshold with demo bypass toggle.

## Known MVP Limitations

- **Auth**: Demo cookie-based auth — no production OAuth/JWT
- **File uploads**: Local filesystem — production would use S3/R2
- **Notifications**: Polling (8s) — production would use WebSockets/push
- **Payments**: No payment processing
- **Xactimate**: Demo estimates randomly generated at claim creation
- **Geo**: Application-level Haversine (no PostGIS) — sufficient for demo
- **Ratings**: Seeded static ratings — no user-submitted rating flow yet

---

**Champion Insurance Corp.** — Investor Demo Repository
