/**
 * Mastodon data collector using public API
 * Searches across mastodon.social instance
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface MastodonStatus {
  id: string;
  content: string;
  created_at: string;
  url: string;
  account: {
    username: string;
    acct: string;
  };
}

export async function collectMastodon(entity: Entity): Promise<Mention[]> {
  try {
    const query = encodeURIComponent(entity.name);
    // Use mastodon.social public API (no auth needed for search)
    const url = `https://mastodon.social/api/v2/search?q=${query}&type=statuses&limit=20`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Mastodon API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const statuses: MastodonStatus[] = data.statuses || [];

    const mentions: Mention[] = statuses.map(status => {
      // Strip HTML tags from content
      const fullText = status.content.replace(/<[^>]*>/g, '');
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'Mastodon',
        platform: 'mastodon.social',
        author: `@${status.account.acct}`,
        content,
        fullText,
        url: status.url,
        sentiment,
        sentimentScore: score,
        publishedAt: new Date(status.created_at).getTime(),
        collectedAt: Date.now(),
        tags,
      };
    });

    return mentions;
  } catch (error) {
    console.error(`Mastodon collection error for ${entity.name}:`, error);
    return [];
  }
}
