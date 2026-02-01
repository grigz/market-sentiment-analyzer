# Deployment Checklist

## Pre-Deployment

### 1. Local Testing
- [x] Dependencies installed (`npm install`)
- [x] ESLint passing (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] App runs locally (`npm run dev`)
- [ ] All pages load without errors
- [ ] Can add entities
- [ ] Can run scans
- [ ] Can export data

### 2. Environment Setup
- [ ] `.env.local` file created
- [ ] Upstash Redis account created
- [ ] Redis REST URL obtained
- [ ] Redis REST token obtained
- [ ] Cron secret generated (`openssl rand -base64 32`)

### 3. Code Quality
- [x] TypeScript compilation successful
- [x] No ESLint errors
- [ ] All imports used
- [ ] No console errors in browser

## GitHub Setup

### 1. Initialize Repository
```bash
cd /Users/dbetting/market-sentiment-analyzer
git init
git add .
git commit -m "Initial commit: Market Sentiment Analyzer"
```

### 2. Create GitHub Repository
```bash
# Option 1: Using GitHub CLI
gh repo create market-sentiment-analyzer --public --source=. --remote=origin --push

# Option 2: Manual
# 1. Go to github.com
# 2. Create new repository: market-sentiment-analyzer
# 3. Copy the remote URL
git remote add origin https://github.com/YOUR_USERNAME/market-sentiment-analyzer.git
git branch -M main
git push -u origin main
```

## Vercel Deployment

### 1. Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./`
6. Click "Deploy" (will fail initially - need env vars)

### 2. Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
UPSTASH_REDIS_REST_URL = https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN = your-token-here
CRON_SECRET = your-generated-secret
```

Make sure to add them to:
- [x] Production
- [x] Preview
- [x] Development

### 3. Redeploy
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete
4. Click "Visit" to open your deployed app

### 4. Verify Deployment
- [ ] App loads at vercel.app URL
- [ ] Can add entities
- [ ] Can trigger scan
- [ ] Dashboard updates with data
- [ ] Export buttons work
- [ ] No errors in browser console

### 5. Verify Cron Job
1. Go to Vercel Dashboard → Your Project → Cron
2. Check that `/api/cron/scan` is listed
3. Schedule should be: `0 */12 * * *`
4. Status should be: "Active"

Test cron manually:
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/scan
```

## Post-Deployment

### 1. Initial Data Collection
1. Open your deployed app
2. Add 2-3 test entities:
   - Keyword: "Next.js 15"
   - Keyword: "TypeScript"
   - Company: "Vercel"
3. Click "Scan Now"
4. Wait 30-60 seconds
5. Verify data appears

### 2. Test All Features
- [ ] Dashboard shows metrics
- [ ] Keywords tab shows mentions
- [ ] Companies tab shows insights
- [ ] Sentiment badges display correctly
- [ ] Platform distribution chart renders
- [ ] CSV export downloads
- [ ] JSON export downloads
- [ ] Links to sources work

### 3. Monitor First 24 Hours
- [ ] Check Vercel logs for errors
- [ ] Verify cron job runs (check at 00:00 and 12:00)
- [ ] Check Upstash Redis dashboard for usage
- [ ] Test from mobile device

## Troubleshooting

### Build Fails
```bash
# Locally test build
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for ESLint errors
npm run lint
```

### Cron Not Running
1. Verify `vercel.json` exists in repo
2. Check Environment Variables include `CRON_SECRET`
3. Redeploy project
4. Check Vercel Cron dashboard

### No Data After Scan
1. Check browser console for errors
2. Verify Upstash Redis credentials
3. Check Vercel function logs
4. Test collectors individually:
   - Visit `/api/scan` in browser
   - Check response JSON

### Redis Connection Error
1. Verify environment variables in Vercel
2. Check Upstash dashboard - database active?
3. Test connection:
   ```bash
   curl https://your-redis-url.upstash.io/get/test \
     -H "Authorization: Bearer your-token"
   ```

## Monitoring

### Daily Checks
- [ ] App is accessible
- [ ] Scans are running (check dashboard timestamp)
- [ ] No errors in Vercel logs
- [ ] Upstash usage within free tier

### Weekly Checks
- [ ] Review sentiment analysis accuracy
- [ ] Check for new data sources to add
- [ ] Update tracked entities as needed
- [ ] Export data for backup

### Monthly Checks
- [ ] Review Upstash usage (should be <10K commands/day)
- [ ] Review Vercel usage (should be <100 GB bandwidth)
- [ ] Update dependencies (`npm update`)
- [ ] Check for Next.js updates

## Performance Optimization (Optional)

### If Needed
- [ ] Enable Redis caching for API calls
- [ ] Add rate limiting to prevent abuse
- [ ] Implement pagination for large datasets
- [ ] Add image optimization
- [ ] Enable compression

## Security Checklist

- [x] Environment variables not committed to Git
- [x] `.gitignore` includes `.env.local`
- [x] Cron endpoint protected with secret
- [x] No API keys in client-side code
- [ ] Upstash Redis has password enabled
- [ ] Vercel preview deployments secured

## Success Criteria

Your deployment is successful when:
- ✅ App is live and accessible
- ✅ Can add and remove entities
- ✅ Scans collect data from all 4 sources
- ✅ Dashboard displays metrics and charts
- ✅ Export functionality works
- ✅ Cron job runs automatically
- ✅ No errors in production logs
- ✅ Mobile responsive
- ✅ Free tier usage maintained

## Next Steps After Deployment

1. Share the URL with stakeholders
2. Add more relevant entities
3. Monitor sentiment trends
4. Export weekly reports
5. Consider AI sentiment upgrade (optional)

## Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Upstash Documentation](https://docs.upstash.com)
- [Project README](/README.md)
- [Quick Start Guide](/QUICK_START.md)

---

**Your Vercel App URL**: `https://market-sentiment-analyzer.vercel.app`

*Update this after deployment!*
