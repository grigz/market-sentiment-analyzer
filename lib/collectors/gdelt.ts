/**
 * GDELT news data collector
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface GDELTArticle {
  url: string;
  title: string;
  seendate: string;
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

export async function collectGDELT(entity: Entity): Promise<Mention[]> {
  try {
    const query = encodeURIComponent(entity.name);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=20&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GDELT API error: ${response.status}`);
    }

    const data = await response.json();
    const articles: GDELTArticle[] = data?.articles || [];

    const mentions: Mention[] = articles.map(article => {
      const fullText = article.title || '';
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      // Parse date (format: YYYYMMDDHHMMSS)
      const year = parseInt(article.seendate.slice(0, 4));
      const month = parseInt(article.seendate.slice(4, 6)) - 1;
      const day = parseInt(article.seendate.slice(6, 8));
      const hour = parseInt(article.seendate.slice(8, 10));
      const minute = parseInt(article.seendate.slice(10, 12));
      const publishedAt = new Date(year, month, day, hour, minute).getTime();

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'GDELT News',
        platform: article.domain || 'news',
        author: article.domain || 'unknown',
        content,
        fullText,
        url: article.url,
        sentiment,
        sentimentScore: score,
        publishedAt,
        collectedAt: Date.now(),
        tags,
      };
    });

    return mentions;
  } catch (error) {
    console.error(`GDELT collection error for ${entity.name}:`, error);
    return [];
  }
}
