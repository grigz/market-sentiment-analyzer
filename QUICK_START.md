# Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies ✅
Dependencies are already installed!

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Upstash Redis credentials:

```bash
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
CRON_SECRET=$(openssl rand -base64 32)
```

**Get Upstash Redis credentials:**
1. Go to https://upstash.com
2. Sign up (free tier available)
3. Create a new Redis database
4. Copy the REST URL and token
5. Paste into your `.env.local` file

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## First Steps

### 1. Add Entities
- Click "Add Entity" button
- Add a keyword (e.g., "Next.js 15")
- Add a company (e.g., "Vercel")

### 2. Run Initial Scan
- Click "Scan Now" button
- Wait 30-60 seconds for data collection
- Dashboard will refresh automatically

### 3. Explore Data
- **Dashboard**: Overview metrics and charts
- **Keywords Tab**: Detailed keyword mentions
- **Companies Tab**: Company intelligence and insights

### 4. Export Data
- Click "Export CSV" or "Export JSON" buttons
- Download automatically starts

## Deploy to Vercel

```bash
# 1. Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# 2. Push to GitHub
gh repo create market-sentiment-analyzer --public
git push -u origin main

# 3. Deploy to Vercel
# Visit vercel.com
# Import your GitHub repo
# Add environment variables in Vercel dashboard
# Deploy!
```

## Troubleshooting

**No data showing?**
- Check that entities are added
- Run "Scan Now" manually
- Verify Redis credentials in `.env.local`

**Build errors?**
```bash
rm -rf .next
npm run build
```

**TypeScript errors?**
```bash
npm run lint
```

## Next Steps

- Add more keywords/companies
- Wait for automatic scans (every 12 hours in production)
- Export and analyze data
- Customize sentiment keywords in `lib/sentiment.ts`

Enjoy! 🚀
