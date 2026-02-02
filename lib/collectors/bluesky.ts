/**
 * Bluesky data collector using AT Protocol API
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface BlueskyPost {
  uri: string;
  cid: string;
  author: {
    handle: string;
    displayName?: string;
  };
  record: {
    text: string;
    createdAt: string;
  };
  likeCount?: number;
  repostCount?: number;
}

export async function collectBluesky(entity: Entity): Promise<Mention[]> {
  try {
    const query = encodeURIComponent(entity.name);
    // Using Bluesky's public API endpoint
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${query}&limit=25`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Bluesky API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const posts: BlueskyPost[] = data.posts || [];

    const mentions: Mention[] = posts.map(post => {
      const fullText = post.record.text;
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      // Create URL to the post
      const postUrl = `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`;

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'Bluesky',
        platform: 'bsky.app',
        author: post.author.displayName || post.author.handle,
        content,
        fullText,
        url: postUrl,
        sentiment,
        sentimentScore: score,
        publishedAt: new Date(post.record.createdAt).getTime(),
        collectedAt: Date.now(),
        tags,
      };
    });

    return mentions;
  } catch (error) {
    console.error(`Bluesky collection error for ${entity.name}:`, error);
    return [];
  }
}
