# Security Guide

## API Key Safety

### Are My API Keys Safe?

**Yes! Your API keys are secure.** ✅

- Environment variables in Vercel are **server-side only**
- API keys are **never exposed** to the browser
- Visitors **cannot see or steal** your keys
- Keys are only used in backend API routes and cron jobs

### How It Works

1. Visitor accesses your app → Sees the dashboard (client-side)
2. Visitor clicks "Scan Now" → Calls `/api/scan` endpoint (server-side)
3. Server uses your API keys to fetch data (backend only)
4. Server returns only the results to the browser
5. **API keys never leave the server** ✅

---

## Potential Security Risks

### Quota Abuse Risk

While your API keys are safe, there's a risk of **quota abuse**:

**Scenario:**
- Someone finds your public Vercel URL
- They spam the "Scan Now" button
- Uses up your Google API quota (100 free queries/day)
- Or triggers excessive X/Twitter API calls
- **Result:** Your free tier quota depleted, no more data collection

**Impact:**
- They cannot steal your keys ✅
- But they can waste your API quota ❌

---

## Security Solutions

### Option 1: Password Protection (Recommended)

Add a password to protect the "Scan Now" button.

**Setup:**
1. Generate a secure password:
   ```bash
   openssl rand -base64 16
   ```

2. Add to Vercel environment variables:
   - **Key**: `SCAN_PASSWORD`
   - **Value**: Your generated password
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

3. Redeploy your app

**How it works:**
- When anyone clicks "Scan Now", they'll be prompted for a password
- Password is saved in browser localStorage for convenience
- Only people with the password can trigger scans
- Cron jobs still work automatically (they use CRON_SECRET)

**To use:**
- Click "Scan Now"
- Enter your password when prompted
- Password is saved in your browser
- You won't be asked again unless you clear browser data

### Option 2: Vercel Password Protection (Simplest)

Make your entire app require a password.

**Setup:**
1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Deployment Protection**
3. Enable **"Password Protection"**
4. Set a password
5. Save

**How it works:**
- **Entire site** requires password to access
- Good for internal/private tools
- Downside: Can't share publicly

### Option 3: Vercel Authentication (Team Access)

Use Vercel's built-in authentication.

**Setup:**
1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Deployment Protection**
3. Enable **"Vercel Authentication"**
4. Choose who can access (Vercel team members)

**How it works:**
- Users must log in with Vercel account
- Good for team collaboration
- Free on Hobby plan for team members

### Option 4: Remove Manual Scan Button

If you only want automated daily scans.

**Setup:**
1. Comment out or remove the "Scan Now" button in `app/page.tsx`
2. Rely only on automated cron scans (once daily)
3. No one can manually trigger scans

**Pros:**
- Completely prevents manual scan abuse
- Automated scans still work

**Cons:**
- You can't manually trigger scans for testing
- Less flexible

---

## Recommended Setup

### For Personal Use (Just You)
**Use Option 1:** Password protection
- Add `SCAN_PASSWORD` to Vercel
- You'll be prompted once, then it's saved in your browser
- Blocks unauthorized scans

### For Team Use (Multiple People)
**Use Option 3:** Vercel Authentication
- Only your team can access
- No password to remember
- Built-in security

### For Public Dashboard (Anyone Can View, Only You Can Scan)
**Use Option 1:** Password protection
- Public can view data
- Only you can trigger scans (with password)
- Best balance of openness and security

### For Fully Private Tool
**Use Option 2:** Vercel Password Protection
- Entire app is private
- Simplest solution
- Good for sensitive data

---

## API Rate Limits

Even with security, be aware of API limits:

### Free Tier Limits

**Google Custom Search (LinkedIn):**
- 100 queries/day free
- $5 per 1,000 after that
- Max 10,000/day

**X/Twitter (Free Tier):**
- Very limited (~1,500 tweets/month)
- May need Basic ($100/mo) or Pro ($5,000/mo) for real usage

**Bluesky:**
- No authentication required
- Generous rate limits
- Completely free

**Hacker News, Reddit, GDELT, GitHub:**
- All have generous free tiers
- Sufficient for daily scans

### Quota Management

**With Password Protection:**
- Only you can trigger scans → Full control over quota usage
- Cron runs once daily → Predictable quota consumption
- Example: 10 entities × 1 scan/day = 10 LinkedIn queries/day (well within 100/day limit)

**Without Password Protection:**
- Anyone can trigger scans → Unpredictable quota usage
- Risk of hitting limits quickly
- **Not recommended** if using paid APIs

---

## Best Practices

1. ✅ **Always set SCAN_PASSWORD** if using:
   - Google API (LinkedIn)
   - X/Twitter API (especially paid tiers)

2. ✅ **Use Vercel Deployment Protection** for:
   - Internal company tools
   - Sensitive competitive intelligence

3. ✅ **Monitor API usage** in:
   - Google Cloud Console (for LinkedIn queries)
   - Twitter Developer Portal (for X API usage)

4. ✅ **Rotate passwords** periodically:
   - Update `SCAN_PASSWORD` every 3-6 months
   - Update `CRON_SECRET` if exposed

5. ✅ **Check Vercel logs** regularly:
   - Look for suspicious scan patterns
   - Monitor for unauthorized attempts

---

## What If Someone Spams My App?

### If You Have Password Protection:
- They'll be blocked → No problem ✅

### If You Don't Have Password Protection:
1. They spam "Scan Now" button
2. Your quota gets used up
3. **Solution:**
   - Add `SCAN_PASSWORD` to Vercel immediately
   - Redeploy app
   - Reset your Google API key if needed (in Google Cloud Console)

---

## Environment Variables Security Checklist

### Required (Always Safe)
- ✅ `UPSTASH_REDIS_REST_URL` - Server-side only
- ✅ `UPSTASH_REDIS_REST_TOKEN` - Server-side only
- ✅ `CRON_SECRET` - Server-side only (used by Vercel cron)

### Recommended for Quota Protection
- ✅ `SCAN_PASSWORD` - Prevents manual scan abuse

### Optional (Enable Features)
- ✅ `X_BEARER_TOKEN` - Server-side only, but protect with SCAN_PASSWORD
- ✅ `GOOGLE_API_KEY` - Server-side only, but protect with SCAN_PASSWORD
- ✅ `GOOGLE_SEARCH_ENGINE_ID` - Server-side only

**All of these are safe from direct exposure.** The concern is quota abuse via the scan button.

---

## Summary

### Your API Keys Are Safe ✅
- Never exposed to browser
- Server-side only
- Cannot be stolen by visitors

### But Protect Your Quotas 🔒
- Add `SCAN_PASSWORD` to prevent abuse
- Use Vercel Deployment Protection for private tools
- Monitor API usage regularly

### Recommended Setup
```bash
# In Vercel Environment Variables:
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
CRON_SECRET=...
SCAN_PASSWORD=... # ADD THIS!
X_BEARER_TOKEN=... (optional)
GOOGLE_API_KEY=... (optional)
GOOGLE_SEARCH_ENGINE_ID=... (optional)
```

With `SCAN_PASSWORD` set, you're fully protected! 🎉
