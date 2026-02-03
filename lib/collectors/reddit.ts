/**
 * Reddit data collector using JSON API
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    author: string;
    subreddit: string;
    url: string;
    permalink: string;
    created_utc: number;
    score: number;
  };
}

export async function collectReddit(entity: Entity): Promise<Mention[]> {
  try {
    const query = encodeURIComponent(entity.name);
    // Use old.reddit.com which is more lenient with API access
    const url = `https://old.reddit.com/search.json?q=${query}&sort=new&t=week&limit=20`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      // Reddit often returns 403 for automated requests - fail gracefully
      console.warn(`Reddit API returned ${response.status} - may be blocking automated requests`);
      return [];
    }

    const data = await response.json();
    const posts: RedditPost[] = data?.data?.children || [];

    const mentions: Mention[] = posts.map(post => {
      const fullText = `${post.data.title} ${post.data.selftext}`.trim();
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'Reddit',
        platform: `r/${post.data.subreddit}`,
        author: post.data.author,
        content,
        fullText,
        url: `https://reddit.com${post.data.permalink}`,
        sentiment,
        sentimentScore: score,
        publishedAt: post.data.created_utc * 1000,
        collectedAt: Date.now(),
        tags,
      };
    });

    return mentions;
  } catch (error) {
    console.warn(`Reddit collection error for ${entity.name}:`, error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}
