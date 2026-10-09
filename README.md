# ZimMarket — Zimbabwe's Premier Marketplace

A production-ready, scalable marketplace platform built for Zimbabwe. Buy, sell, advertise businesses, offer services, and discover products across Harare, Bulawayo, Mutare, Gweru, and 8+ other cities.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** PostgreSQL (production) / SQLite (development)
- **ORM:** Prisma
- **Auth:** JWT + bcrypt (HTTP-only cookies)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Quick Start (Local Development)

```bash
#1. Install dependencies
npm install

#2. Set up database (SQLite for dev)
npx prisma db push

#3. Seed demo data
npm run db:seed

#4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@zimmarket.co.zw | Admin123! |
| Seller | seller@example.com | Seller123! |
| Buyer | buyer@example.com | Buyer123! |

## Deploy to Vercel (Free)

### Step 1: Get a PostgreSQL Database

**Option A — Vercel Postgres (easiest):**
1. Go to your Vercel project → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` it gives you

**Option B — Neon (free, recommended):**
1. Go to [neon.tech](https://neon.tech), create a free account
2. Create a project, copy the connection string
3. Format: `postgresql://user:password@host/dbname?sslmode=require`

**Option C — Supabase (free):**
1. Go to [supabase.com](https://supabase.com), create a project
2. Go to Settings → Database → Connection string → URI

### Step 2: Deploy

**One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/zimmarket&env=DATABASE_PROVIDER,DATABASE_URL,JWT_SECRET&envDescription=Database%20and%20auth%20configuration&envLink=https://github.com/YOUR_USERNAME/zimmarket/blob/main/.env.example)

**Manual deploy:**

```bash
#1. Push to GitHub
git init
git add -A
git commit -m "Initial ZimMarket commit"
git remote add origin https://github.com/YOUR_USERNAME/zimmarket.git
git push -u origin main

#2. Go to vercel.com → New Project → Import your repo

#3. Set environment variables in Vercel:
# DATABASE_PROVIDER = postgresql
# DATABASE_URL = your-postgresql-connection-string
# JWT_SECRET = any-random-32-char-string

#4. Deploy!
```

### Step 3: Set Up Database

After first deploy, run this in Vercel's dashboard (Settings → Functions → Console) or locally:

```bash
# Point your local .env to the production database temporarily
DATABASE_PROVIDER="postgresql" DATABASE_URL="your-prod-url" npx prisma db push

# Seed demo data (optional)
DATABASE_PROVIDER="postgresql" DATABASE_URL="your-prod-url" npm run db:seed
```

## Features

### Marketplace
- 26 categories (Vehicles, Property, Electronics, Fashion, Agriculture, Jobs, Services...)
- Listing creation with multi-image upload, condition, pricing, location
- Full-text search with filters (category, city, price, condition)
- AI natural language search ("Samsung phones under $300 in Harare")
- Location-based discovery across12 Zimbabwean cities
- Favourites, saved searches, follow sellers

### Seller Tools
- Seller dashboard with analytics (views, enquiries, followers, reviews)
- Listing management (drafts, active, sold, expired)
- Review and reputation system (1-5 stars)
- Subscription plans (Free, Seller Plus, Professional, Enterprise)
- Promotion system (boost, featured, category featured)
- Advertising platform

### Trust & Safety
- 5-level seller verification (Unverified → Phone → ID → Business → Trusted)
- Report system (11 report types with admin workflow)
- Admin moderation queue
- Anti-fraud architecture
- Audit logging

### Admin Panel
- Full admin dashboard with10 management sections
- User management, listing moderation, category management
- Report handling, verification approvals
- Subscription and payment tracking
- Platform analytics

### Technical
- Mobile-first responsive design
- Secure authentication (bcrypt, JWT, HTTP-only cookies)
- RBAC (Role-Based Access Control)
- Input validation, XSS/SQL injection protection
- Structured audit logging
- SEO-friendly architecture

## Project Structure

```
zimmarket/
├── prisma/          # Database schema & seed
├── src/
│   ├── app/
│   │   ├── (auth)/  # Login, register, forgot password
│   │   ├── admin/   # Admin dashboard pages
│   │   ├── api/     # API routes
│   │   ├── explore/ # Search & browse
│   │   ├── listing/ # Listing detail
│   │   ├── messages/# In-app messaging
│   │   ├── profile/ # User profile
│   │   ├── seller/  # Seller dashboard
│   │   └── ...      # Other pages
│   ├── components/  # Reusable UI components
│   ├── lib/         # Utilities (auth, db, helpers)
│   └── types/       # TypeScript type definitions
├── public/          # Static assets
├── .env.example     # Environment template
└── vercel.json      # Vercel deployment config
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PROVIDER` | Yes | `postgresql` for production, `sqlite` for dev |
| `DATABASE_URL` | Yes | Database connection string |
| `JWT_SECRET` | Yes | Random string for signing JWT tokens (min 32 chars) |
| `NODE_ENV` | No | `production` or `development` |
| `NEXT_PUBLIC_APP_URL` | No | Your app's public URL |

## License

Private — All rights reserved.

## Disclaimer

ZimMarket is a marketplace platform. We do not guarantee transactions between users. Legal documents (Terms of Service, Privacy Policy) must be reviewed by a qualified Zimbabwean legal professional before production launch.
