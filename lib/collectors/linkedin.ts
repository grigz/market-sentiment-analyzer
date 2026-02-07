/**
 * LinkedIn data collector
 * Note: LinkedIn API requires OAuth authentication and has strict access requirements
 * You need to apply for API access through LinkedIn Developer Program
 * Alternative: Use RSS feeds from LinkedIn's public pages or Google Custom Search
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

/**
 * LinkedIn data collection using Google Custom Search as a workaround
 * This searches for LinkedIn posts/articles mentioning the entity
 */
export async function collectLinkedIn(entity: Entity): Promise<Mention[]> {
  // Check for Google Custom Search API credentials
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.warn('LinkedIn collection: Google Custom Search API not configured.');
    console.warn('To enable LinkedIn data collection via Google, add GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID.');
    console.warn('Alternative: Configure LinkedIn API access (requires LinkedIn Developer approval).');
    return [];
  }

  try {
    // Search for LinkedIn posts mentioning the entity
    // Note: entity.name can include boolean operators (AND, OR, NOT)
    const query = encodeURIComponent(`site:linkedin.com ${entity.name}`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&num=10&dateRestrict=w1`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Google Custom Search API error: ${response.status}`);
      console.warn(`Google API response: ${errorText}`);
      return [];
    }

    const data = await response.json();
    const results = data.items || [];

    const mentions: Mention[] = results.map((result: any) => {
      const fullText = `${result.title} ${result.snippet}`;
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      // Extract author from LinkedIn URL or snippet
      let author = 'LinkedIn User';
      const authorMatch = result.link.match(/linkedin\.com\/in\/([^\/]+)/);
      if (authorMatch) {
        author = authorMatch[1].replace(/-/g, ' ');
      }

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'LinkedIn',
        platform: 'linkedin.com',
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
    console.error(`LinkedIn collection error for ${entity.name}:`, error);
    return [];
  }
}

/**
 * Alternative: Direct LinkedIn API (requires OAuth and approval)
 * Uncomment and configure if you have LinkedIn API access
 */
/*
export async function collectLinkedInDirect(entity: Entity): Promise<Mention[]> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('LinkedIn API: No access token configured');
    return [];
  }

  try {
    // LinkedIn API endpoint for searching posts
    // Note: This requires specific API permissions from LinkedIn
    const url = `https://api.linkedin.com/v2/posts?q=search&keywords=${encodeURIComponent(entity.name)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      console.warn(`LinkedIn API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    // Process LinkedIn API response here
    // Implementation depends on your specific API access level

    return [];
  } catch (error) {
    console.error(`LinkedIn API error for ${entity.name}:`, error);
    return [];
  }
}
*/
