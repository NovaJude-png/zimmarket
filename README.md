# ZimMarket — Zimbabwe's Premier Marketplace

Buy, sell, advertise businesses, and discover products across12 Zimbabwean cities.

## Tech Stack

- **Next.js 14** — Full-stack React framework (App Router, TypeScript)
- **PostgreSQL** — Production database (via Prisma ORM)
- **Tailwind CSS** — Mobile-first responsive design
- **JWT + bcrypt** — Secure authentication
- **Vercel** — Deployment platform

## Features

- 26 marketplace categories (Vehicles, Property, Electronics, Fashion, Agriculture, Jobs, Services...)
- AI natural language search ("Samsung phones under $300 in Harare")
- In-app messaging, reviews, favourites, follow sellers
- Seller dashboard with analytics
- Multi-level seller verification (5 levels)
- Admin panel with user/listing/moderation management
- Subscription plans and advertising platform
- Report and trust & safety system

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@zimmarket.co.zw | Admin123! |
| Seller | seller@example.com | Seller123! |
| Buyer | buyer@example.com | Buyer123! |

---

## Deploy to Vercel (Free, ~5 minutes)

### Step 1: Get a Free PostgreSQL Database

Go to **[neon.tech](https://neon.tech)** (free, no credit card):
1. Sign up / Sign in
2. Click **"Create a project"**
3. Name it `zimmarket`
4. Copy the connection string — looks like:
   ```
   postgresql://neondb_owner:abc123@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Push to GitHub

```bash
# In the zimmarket folder:
git init
git add -A
git commit -m "Initial ZimMarket commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/zimmarket.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub
2. Click **"Add New..." → "Project"**
3. Find your `zimmarket` repo → Click **"Import"**
4. Click **"Environment Variables"** and add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon connection string from Step 1 |
   | `JWT_SECRET` | Any random 32+ character string |

5. Click **"Deploy"**
6. Wait ~60 seconds → Your site is live! 🎉

### Step 4: Set Up Database Tables

After Vercel deploys, you need to create the database tables:

**Option A — From your computer:**
```bash
# Install Vercel CLI
npm i -g vercel
vercel link

# Pull the production env vars
vercel env pull .env.production

# Push the database schema
DATABASE_URL="your-neon-url" npx prisma db push

# Seed demo data (optional)
DATABASE_URL="your-neon-url" npx ts-node --compiler-options '{"module":"commonjs","esModuleInterop":true}' prisma/seed.ts
```

**Option B — Use Vercel's built-in terminal:**
1. In Vercel dashboard → your project → **Settings** → **Integrations** → Add Neon
2. It auto-connects your DATABASE_URL

### Step 5: Visit Your Live Site

Your ZimMarket is now live at `https://your-project.vercel.app` 🇿🇼

---

## Local Development

```bash
#1. Get a free PostgreSQL database at neon.tech (see Step 1 above)

#2. Create .env file
echo 'DATABASE_URL="your-neon-connection-string"' > .env
echo 'JWT_SECRET="any-random-string-at-least-32-chars"' >> .env

#3. Install dependencies
npm install

#4. Create database tables
npx prisma db push

#5. Seed demo data
npm run db:seed

#6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
zimmarket/
├── prisma/
│   ├── schema.prisma    # Database schema (30+ models)
│   └── seed.ts          # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/      # Login, register, forgot password
│   │   ├── admin/       # Admin dashboard (10 sections)
│   │   ├── api/         # REST API routes
│   │   ├── explore/     # Search & browse with filters
│   │   ├── listing/     # Listing detail page
│   │   ├── messages/    # In-app messaging
│   │   ├── profile/     # User profile
│   │   ├── seller/      # Seller dashboard
│   │   └── ...          # Home, saved, notifications, etc.
│   ├── components/      # Reusable UI components
│   ├── lib/             # Auth, database, utilities
│   └── types/           # TypeScript definitions
├── .env.example         # Environment template
├── vercel.json          # Vercel deployment config
└── README.md            # This file
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Random string for signing tokens (min 32 chars) |
| `NODE_ENV` | No | `production` or `development` |
| `NEXT_PUBLIC_APP_URL` | No | Your app's public URL |

## License

Private — All rights reserved.
