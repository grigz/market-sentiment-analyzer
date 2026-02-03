/**
 * Hacker News data collector using Algolia API
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface HNResult {
  objectID: string;
  title: string;
  author: string;
  url: string;
  created_at: string;
  story_text?: string;
  comment_text?: string;
}

export async function collectHackerNews(entity: Entity): Promise<Mention[]> {
  try {
    const query = encodeURIComponent(entity.name);
    // Filter to last 7 days (created_at_i is Unix timestamp in seconds)
    const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
    const url = `https://hn.algolia.com/api/v1/search?query=${query}&tags=story&numericFilters=created_at_i>${sevenDaysAgo}&hitsPerPage=20`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HN API error: ${response.status}`);
    }

    const data = await response.json();
    const results: HNResult[] = data.hits || [];

    const mentions: Mention[] = results.map(result => {
      const fullText = result.story_text || result.title || '';
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'Hacker News',
        platform: 'news.ycombinator.com',
        author: result.author || 'unknown',
        content,
        fullText,
        url: result.url || `https://news.ycombinator.com/item?id=${result.objectID}`,
        sentiment,
        sentimentScore: score,
        publishedAt: new Date(result.created_at).getTime(),
        collectedAt: Date.now(),
        tags,
      };
    });

    return mentions;
  } catch (error) {
    console.error(`HN collection error for ${entity.name}:`, error);
    return [];
  }
}
