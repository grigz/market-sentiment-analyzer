/**
 * X (Twitter) data collector
 * Note: X API requires authentication and has strict rate limits
 * Free tier is very limited - consider using Bearer Token from Twitter Developer account
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface XTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
  };
}

interface XUser {
  id: string;
  name: string;
  username: string;
}

export async function collectX(entity: Entity): Promise<Mention[]> {
  // Check if X/Twitter bearer token is available
  const bearerToken = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    console.warn('X/Twitter API: No bearer token configured. Skipping X data collection.');
    console.warn('To enable X data collection, add X_BEARER_TOKEN to your environment variables.');
    return [];
  }

  try {
    const query = encodeURIComponent(entity.name);
    // Using Twitter API v2 recent search endpoint
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=25&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=name,username`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('X API: Invalid or expired bearer token');
      } else if (response.status === 429) {
        console.warn('X API: Rate limit exceeded');
      } else {
        console.warn(`X API error: ${response.status}`);
      }
      return [];
    }

    const data = await response.json();
    const tweets: XTweet[] = data.data || [];
    const users: XUser[] = data.includes?.users || [];

    // Create a map of user IDs to user objects for quick lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    const mentions: Mention[] = tweets.map(tweet => {
      const fullText = tweet.text;
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      const user = userMap.get(tweet.author_id);
      const author = user ? `${user.name} (@${user.username})` : 'Unknown';

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'X (Twitter)',
        platform: 'x.com',
        author,
        content,
        fullText,
        url: `https://x.com/i/web/status/${tweet.id}`,
        sentiment,
        sentimentScore: score,
        publishedAt: new Date(tweet.created_at).getTime(),
        collectedAt: Date.now(),
        tags,
      };
    });

    return mentions;
  } catch (error) {
    console.error(`X collection error for ${entity.name}:`, error);
    return [];
  }
}
