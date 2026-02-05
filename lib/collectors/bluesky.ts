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
  // Note: Bluesky searchPosts API now requires authentication
  // See: https://docs.bsky.app/docs/api/app-bsky-feed-search-posts
  const identifier = process.env.BLUESKY_IDENTIFIER; // username or email
  const password = process.env.BLUESKY_APP_PASSWORD; // app password from settings

  // Debug: Check if env vars exist (don't log the actual values for security)
  console.log(`  Bluesky env check - identifier: ${identifier ? 'SET' : 'NOT SET'}, password: ${password ? 'SET' : 'NOT SET'}`);

  if (!identifier || !password) {
    console.warn('Bluesky API: No credentials configured. Skipping Bluesky data collection.');
    console.warn('To enable Bluesky, add BLUESKY_IDENTIFIER and BLUESKY_APP_PASSWORD to environment variables.');
    console.warn('Get an app password from: https://bsky.app/settings/app-passwords');
    return [];
  }

  try {
    // First, authenticate to get an access token
    const authResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.warn(`Bluesky authentication failed: ${authResponse.status} - ${authError}`);
      return [];
    }

    const authData = await authResponse.json();
    const accessToken = authData.accessJwt;

    // Now search for posts with authentication
    const query = encodeURIComponent(entity.name);
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${query}&limit=25`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`Bluesky search API error: ${response.status} - ${errorBody}`);
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
