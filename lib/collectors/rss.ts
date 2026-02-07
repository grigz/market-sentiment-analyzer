/**
 * RSS feed data collector
 * Aggregates from multiple tech news sites
 */

import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

// RSS feed sources
const RSS_FEEDS = [
  {
    url: 'https://techcrunch.com/feed/',
    source: 'TechCrunch',
    platform: 'techcrunch.com',
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    source: 'The Verge',
    platform: 'theverge.com',
  },
  {
    url: 'https://www.cloudnativenow.com/feed/',
    source: 'Cloud Native Now',
    platform: 'cloudnativenow.com',
  },
];

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  contentSnippet?: string;
  content?: string;
  'dc:creator'?: string;
}

export async function collectRSS(entity: Entity): Promise<Mention[]> {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MarketSentimentBot/1.0)',
    },
  });

  const allMentions: Mention[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      const items: RSSItem[] = feedData.items || [];

      // Filter items that mention the entity
      const entityLower = entity.name.toLowerCase();
      const relevantItems = items.filter(item => {
        const title = (item.title || '').toLowerCase();
        const content = (item.contentSnippet || item.content || '').toLowerCase();
        return title.includes(entityLower) || content.includes(entityLower);
      });

      // Filter to last 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentItems = relevantItems.filter(item => {
        if (!item.pubDate) return true;
        const pubTime = new Date(item.pubDate).getTime();
        return pubTime >= sevenDaysAgo;
      });

      const mentions: Mention[] = recentItems.map(item => {
        const fullText = `${item.title || ''} ${item.contentSnippet || item.content || ''}`;
        const content = fullText.slice(0, 200);
        const { sentiment, score } = analyzeSentiment(fullText);
        const tags = extractTags(fullText, entity.name);

        // Get author from various possible fields
        const author = item.creator || item.author || item['dc:creator'] || 'Unknown';

        return {
          id: uuidv4(),
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.type,
          source: feed.source,
          platform: feed.platform,
          author,
          content,
          fullText,
          url: item.link || '',
          sentiment,
          sentimentScore: score,
          publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
          collectedAt: Date.now(),
          tags,
        };
      });

      allMentions.push(...mentions);
    } catch (error) {
      console.error(`RSS collection error for ${feed.source}:`, error instanceof Error ? error.message : 'Unknown error');
      // Continue with other feeds even if one fails
    }
  }

  return allMentions;
}
