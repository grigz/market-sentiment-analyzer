/**
 * X (Twitter) data collector using Google Custom Search
 * Note: This uses Google Custom Search API instead of expensive X API ($100+/month)
 * Searches publicly indexed content from twitter.com and x.com
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
}

export async function collectX(entity: Entity): Promise<Mention[]> {
  // Check for Google Custom Search API credentials
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.warn('X collection: Google Custom Search API not configured.');
    console.warn('To enable X data collection via Google, add GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID.');
    console.warn('This is a free/low-cost alternative to the expensive X API ($100+/month).');
    return [];
  }

  try {
    // Search for X/Twitter posts mentioning the entity
    // Use both twitter.com and x.com domains to catch all content
    // Note: entity.name can include boolean operators (AND, OR, NOT)
    const query = encodeURIComponent(`(site:twitter.com OR site:x.com) ${entity.name}`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&num=10&dateRestrict=w1`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Google Custom Search API: Rate limit exceeded');
      } else {
        console.warn(`Google Custom Search API error: ${response.status}`);
      }
      return [];
    }

    const data = await response.json();
    const results: GoogleSearchResult[] = data.items || [];

    const mentions: Mention[] = results.map(result => {
      const fullText = `${result.title} ${result.snippet}`;
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      // Extract username from URL if possible
      let author = 'X User';
      const usernameMatch = result.link.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
      if (usernameMatch && usernameMatch[1] !== 'i') {
        author = `@${usernameMatch[1]}`;
      }

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
        url: result.link,
        sentiment,
        sentimentScore: score,
        publishedAt: Date.now(), // Google doesn't provide exact timestamp
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
