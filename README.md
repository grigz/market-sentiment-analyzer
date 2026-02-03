# Market Sentiment Analyzer

A Next.js web application for tracking market sentiment across keywords and companies in real-time. Aggregates data from multiple sources including Hacker News, GDELT News, GitHub, Bluesky, and optionally Reddit, X/Twitter, and LinkedIn.

## Features

- **Entity Tracking**: Monitor both keywords and companies
- **Multi-Source Data**: Collect mentions from 7 data sources (3 work out-of-the-box, 4 optional)
- **Sentiment Analysis**: Automated positive/negative/neutral scoring
- **Dashboard Analytics**: Visual metrics, charts, and distribution graphs
- **Detail Views**: Separate tabs for keywords and companies with granular insights
- **Company Intelligence**: Categorized insights into culture, opinions, and challenges
- **Export Capabilities**: Download data in CSV and JSON formats
- **Automated Scanning**: Runs daily at midnight UTC via Vercel Cron
- **2-Day Window**: Focus on the most recent 48 hours of data

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: Upstash Redis (serverless)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Export**: Papa Parse (CSV generation)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Upstash Redis account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd market-sentiment-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```bash
# Upstash Redis (required)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Cron secret (generate with: openssl rand -base64 32)
CRON_SECRET=your-secret-here

# Bluesky (optional - free, highly recommended)
BLUESKY_IDENTIFIER=your-username.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# X/Twitter (optional - paid plans only)
X_BEARER_TOKEN=your-bearer-token

# LinkedIn via Google (optional)
GOOGLE_API_KEY=your-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# Optional: For enhanced sentiment analysis (future)
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

To get Upstash credentials:
- Sign up at [upstash.com](https://upstash.com)
- Create a new Redis database
- Copy the REST URL and token from the database dashboard

See "Setting Up Optional Data Sources" section below for Bluesky, X, and LinkedIn setup.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Adding Entities

1. Navigate to the Dashboard
2. Click "Add Entity" in the "Tracked Entities" section
3. Enter the entity name (e.g., "React 19" or "Vercel")
4. Select type: Keyword or Company
5. Click "Add"

### Scanning for Data

**Manual Scan:**
- Click the "Scan Now" button on the Dashboard
- Wait for the scan to complete (typically 30-60 seconds)
- Dashboard will refresh with new data

**Automatic Scan:**
- Runs every 12 hours via Vercel Cron (production only)
- No manual intervention required

### Viewing Data

**Dashboard Tab:**
- Overview metrics (total mentions, sentiment breakdown)
- Keywords table with sentiment distribution
- Companies table with sentiment distribution
- Platform distribution pie chart

**Keywords Tab:**
- Detailed list of all keyword mentions
- Expandable content previews
- Links to original sources
- Filter by date range

**Companies Tab:**
- Company intelligence categorized into:
  - Culture Signals (employee sentiment, workplace discussions)
  - Opinions (public discourse, reviews)
  - Challenges (negative mentions, complaints)
- Sentiment trend graphs
- Evidence linking to source mentions

### Exporting Data

Click "Export CSV" or "Export JSON" buttons in the header:
- **CSV**: Tabular format with all mention data
- **JSON**: Structured format including entities, mentions, and insights

Downloads automatically with timestamped filename.

## Data Sources

The app collects data from multiple sources. Here's what works out of the box vs. what requires API credentials:

### ✅ Always Active (No Auth Required)

1. **Hacker News** (Algolia API)
   - Tech discussions, startup news
   - No authentication required
   - Unlimited requests
   - ✅ Working out of the box

2. **GDELT News** (Global Database of Events)
   - News articles from worldwide sources
   - 250 queries/day free tier
   - Multiple languages supported
   - ✅ Working out of the box

3. **GitHub** (Search API)
   - Issues and discussions
   - 10 requests/minute (unauthenticated)
   - Public repositories only
   - ✅ Working out of the box

### ⚠️ Partially Working (May Be Blocked)

4. **Reddit** (JSON API)
   - Community discussions across subreddits
   - ⚠️ May be blocked by Reddit's anti-automation measures
   - Uses old.reddit.com with browser-like headers
   - No authentication required, but success rate varies

### 🔐 Requires Authentication

5. **Bluesky** (AT Protocol API)
   - Decentralized social network
   - 🔐 **Requires free Bluesky account** (see setup below)
   - Free and unlimited once configured

6. **X (Twitter)** - Requires Bearer Token
   - Get API access at [developer.twitter.com](https://developer.twitter.com)
   - Add `X_BEARER_TOKEN` to environment variables
   - ⚠️ **Note**: Free tier no longer available, requires paid plan ($100+/month)

7. **LinkedIn** - Requires Google Custom Search API
   - Get API key at [console.cloud.google.com](https://console.cloud.google.com)
   - Add `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`
   - Searches LinkedIn posts via Google
   - Alternative: Direct LinkedIn API (requires LinkedIn Developer approval)

## Setting Up Optional Data Sources

### Bluesky Setup (Recommended - Free & Easy)

Bluesky now requires authentication but it's completely free:

1. **Get a Bluesky account** (if you don't have one):
   - Sign up at https://bsky.app

2. **Create an App Password**:
   - Go to https://bsky.app/settings/app-passwords
   - Click "Add App Password"
   - Name it "Market Sentiment Analyzer"
   - Copy the generated password (format: `xxxx-xxxx-xxxx-xxxx`)
   - ⚠️ Save it immediately - you won't see it again!

3. **Add to your environment variables**:
   ```bash
   BLUESKY_IDENTIFIER=your-username.bsky.social
   BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

4. **For Vercel deployments**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add both `BLUESKY_IDENTIFIER` and `BLUESKY_APP_PASSWORD`
   - Select all environments (Production, Preview, Development)
   - Redeploy your application

### X/Twitter Setup (Optional - Paid Only)

X's API is now paid-only. Basic tier starts at $100/month:

1. Apply for API access at https://developer.twitter.com
2. Subscribe to a paid plan (Basic, Pro, or Enterprise)
3. Get your Bearer Token from the developer portal
4. Add to environment variables:
   ```bash
   X_BEARER_TOKEN=your-bearer-token
   ```

### LinkedIn Setup (Optional - Via Google)

Use Google Custom Search API to search LinkedIn:

1. **Create Google Cloud Project**:
   - Go to https://console.cloud.google.com
   - Create a new project

2. **Enable Custom Search API**:
   - Navigate to APIs & Services → Library
   - Search for "Custom Search API"
   - Click Enable

3. **Get API Key**:
   - Go to APIs & Services → Credentials
   - Create Credentials → API Key
   - Copy your API key

4. **Create Custom Search Engine**:
   - Go to https://programmablesearchengine.google.com
   - Create a new search engine
   - Add `linkedin.com` as a site to search
   - Get your Search Engine ID

5. **Add to environment variables**:
   ```bash
   GOOGLE_API_KEY=your-api-key
   GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
   ```

## Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub

2. Import to Vercel:
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework preset: Next.js (auto-detected)

3. Add environment variables in Vercel dashboard:

   **Required:**
   - `UPSTASH_REDIS_REST_URL` - Your Upstash Redis URL
   - `UPSTASH_REDIS_REST_TOKEN` - Your Upstash Redis token
   - `CRON_SECRET` - Generate with: `openssl rand -base64 32`

   **Optional (for additional data sources):**
   - `BLUESKY_IDENTIFIER` - Your Bluesky username (e.g., username.bsky.social)
   - `BLUESKY_APP_PASSWORD` - App password from Bluesky settings
   - `X_BEARER_TOKEN` - X/Twitter API bearer token (paid plans only)
   - `GOOGLE_API_KEY` - For LinkedIn data via Google Custom Search
   - `GOOGLE_SEARCH_ENGINE_ID` - For LinkedIn data via Google Custom Search

4. Deploy

### Verify Cron Job

After deployment:
1. Go to Vercel Dashboard → Your Project → Cron
2. Verify the `/api/cron/scan` job is active
3. Schedule should show: `0 */12 * * *` (every 12 hours)

## API Documentation

### Entities API

**GET /api/entities**
- Returns all tracked entities

**POST /api/entities**
```json
{
  "name": "React 19",
  "type": "keyword"
}
```

**DELETE /api/entities?id={entityId}**
- Removes entity and all associated mentions

### Mentions API

**GET /api/mentions**
- Query params:
  - `entityId` (optional): Filter by entity
  - `hours` (optional): Time window (default: 48)

### Scan API

**POST /api/scan**
- Triggers data collection for all enabled entities
- Returns scan results

### Export APIs

**GET /api/export/csv**
- Downloads CSV file

**GET /api/export/json**
- Downloads JSON file

Both support `?entityId={id}` for entity-specific exports.

## Sentiment Analysis

The app uses keyword-based sentiment analysis:

**Positive keywords**: great, excellent, amazing, love, innovative, etc.
**Negative keywords**: terrible, awful, broken, slow, buggy, etc.
**Neutral**: Default when no strong sentiment detected

**Scoring**: 0-100 scale (50 = neutral)

### Upgrading to AI-based Sentiment

To use OpenAI or Anthropic for enhanced sentiment:

1. Add API key to environment variables
2. Update `lib/sentiment.ts` to call AI API
3. Adjust `analyzeSentiment()` function

Example cost: ~$2/month for 10,000 mentions with GPT-3.5.

## Troubleshooting

### Only GitHub data appears (other sources return 0 mentions)

**Common Causes:**

1. **Bluesky returns 403**:
   - Bluesky now requires authentication
   - **Solution**: Add `BLUESKY_IDENTIFIER` and `BLUESKY_APP_PASSWORD` environment variables
   - See "Setting Up Optional Data Sources" above

2. **Reddit returns 403**:
   - Reddit actively blocks automated requests
   - This is expected behavior - Reddit's anti-bot measures are aggressive
   - **Solution**: Code uses best-effort approach with browser-like headers, but may still be blocked

3. **X returns 402 (Payment Required)**:
   - X/Twitter no longer has a free API tier
   - **Solution**: Either subscribe to X API ($100+/month) or skip X data collection

4. **LinkedIn returns 403**:
   - Google Custom Search API not configured
   - **Solution**: Add `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` or skip LinkedIn

5. **HackerNews/GDELT data collected but filtered out**:
   - Check Vercel logs for "After 2-day filter" messages
   - Data older than 48 hours is automatically filtered
   - **Solution**: Verify timestamps in collector responses

### No data showing after scan

**Check:**
- Entity names are correctly spelled
- Entities are enabled (not disabled)
- Time window is set to 48 hours
- Redis connection is working (check env vars)
- Check Vercel logs for actual API errors

**Solution:**
- Run scan manually with "Scan Now" button
- Check browser console for errors
- Check Vercel deployment logs for detailed error messages
- Verify Upstash Redis credentials
- Review "Sources breakdown" in logs to see which sources are working

### Rate limit errors

**Symptoms:**
- Scan completes but with fewer results than expected
- Console shows 403 or 429 errors

**Solution:**
- GitHub: 10 req/min limit when unauthenticated (this is normal)
- Reddit: May show 403 due to anti-bot measures (expected)
- Bluesky: Add authentication to avoid 403 errors
- Wait and retry (limits reset hourly for most APIs)

### Cron job not running

**Check:**
- Vercel deployment is successful
- `vercel.json` exists with cron configuration
- Environment variable `CRON_SECRET` is set

**Solution:**
- Manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/scan`
- Check Vercel logs for cron execution

### Export download fails

**Symptoms:**
- Button clicks but no download
- Browser console shows errors

**Solution:**
- Check browser pop-up blocker
- Verify API endpoint returns data
- Test with smaller data set

## Cost Analysis

**Monthly Costs (Free Tier):**

| Service | Free Tier | Est. Usage | Cost |
|---------|-----------|------------|------|
| Upstash Redis | 10K commands/day | ~500/day | $0 |
| Vercel | 100 GB bandwidth | <10 GB | $0 |
| Hacker News | Unlimited | Unlimited | $0 |
| Reddit | 60 req/min | <100/day | $0 |
| GDELT | 250 queries/day | ~50/day | $0 |
| GitHub | 10 req/min | ~50/day | $0 |
| **Total** | | | **$0** |

## Future Enhancements

- [ ] AI-powered sentiment (OpenAI/Anthropic)
- [ ] Email alerts on sentiment spikes
- [ ] Slack/Discord webhooks
- [ ] Custom data sources (RSS, Twitter/X)
- [ ] Historical trending (30-day view)
- [ ] Comparative analysis (keyword A vs B)
- [ ] Dark mode toggle
- [ ] Advanced filtering and search

## Project Structure

```
market-sentiment-analyzer/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── keywords/page.tsx     # Keywords detail
│   ├── companies/page.tsx    # Companies detail
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       ├── entities/         # Entity CRUD
│       ├── scan/             # Data collection
│       ├── mentions/         # Mention queries
│       ├── export/           # CSV/JSON export
│       └── cron/             # Automated scan
├── components/
│   ├── Dashboard/            # Dashboard components
│   ├── Navigation.tsx        # Navigation bar
│   ├── EntityManager.tsx     # Entity management
│   ├── ExportButtons.tsx     # Export UI
│   ├── SentimentBadge.tsx    # Sentiment display
│   └── PlatformDistribution.tsx # Chart
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── db.ts                 # Redis operations
│   ├── utils.ts              # Utility functions
│   ├── sentiment.ts          # Sentiment analysis
│   └── collectors/           # Data collectors
│       ├── hackernews.ts
│       ├── reddit.ts
│       ├── gdelt.ts
│       ├── github.ts
│       ├── bluesky.ts
│       ├── x.ts
│       ├── linkedin.ts
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── vercel.json
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues or questions:
- GitHub Issues: [your-repo-url/issues]
- Email: [your-email]
