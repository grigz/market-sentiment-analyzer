/**
 * Dev.to data collector using public API
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  user: {
    username: string;
    name: string;
  };
  body_markdown?: string;
}

export async function collectDevTo(entity: Entity): Promise<Mention[]> {
  try {
    // Dev.to doesn't have a search API, so we'll get recent articles and filter
    // This is a limitation, but we can search top articles
    const tag = entity.name.toLowerCase().replace(/\s+/g, '-');
    const url = `https://dev.to/api/articles?tag=${tag}&per_page=20`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Dev.to API error: ${response.status}`);
      return [];
    }

    const articles: DevToArticle[] = await response.json();

    const mentions: Mention[] = articles.map(article => {
      const fullText = `${article.title} ${article.description}`;
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'Dev.to',
        platform: 'dev.to',
        author: article.user.name || article.user.username,
        content,
        fullText,
        url: article.url,
        sentiment,
        sentimentScore: score,
        publishedAt: new Date(article.published_at).getTime(),
        collectedAt: Date.now(),
        tags,
      };
    });

    return mentions;
  } catch (error) {
    console.error(`Dev.to collection error for ${entity.name}:`, error);
    return [];
  }
}
