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
    const url = `https://www.reddit.com/search.json?q=${query}&sort=new&t=week&limit=20`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MarketSentimentAnalyzer/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
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
    console.error(`Reddit collection error for ${entity.name}:`, error);
    return [];
  }
}
