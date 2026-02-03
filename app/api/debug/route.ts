/**
 * Debug API - Test individual collectors
 */

import { NextRequest, NextResponse } from 'next/server';
import { collectHackerNews } from '@/lib/collectors/hackernews';
import { collectReddit } from '@/lib/collectors/reddit';
import { collectGDELT } from '@/lib/collectors/gdelt';
import { collectGitHub } from '@/lib/collectors/github';
import { collectBluesky } from '@/lib/collectors/bluesky';
import type { Entity } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || 'Next.js';

  const testEntity: Entity = {
    id: 'test-123',
    name: keyword,
    type: 'keyword',
    createdAt: Date.now(),
    enabled: true,
  };

  const results = {
    keyword,
    timestamp: new Date().toISOString(),
    collectors: {} as Record<string, any>,
  };

  // Test each collector individually
  try {
    const hn = await collectHackerNews(testEntity);
    results.collectors.hackerNews = {
      success: true,
      count: hn.length,
      sample: hn[0] || null,
    };
  } catch (error) {
    results.collectors.hackerNews = {
      success: false,
      error: String(error),
    };
  }

  try {
    const reddit = await collectReddit(testEntity);
    results.collectors.reddit = {
      success: true,
      count: reddit.length,
      sample: reddit[0] || null,
    };
  } catch (error) {
    results.collectors.reddit = {
      success: false,
      error: String(error),
    };
  }

  try {
    const gdelt = await collectGDELT(testEntity);
    results.collectors.gdelt = {
      success: true,
      count: gdelt.length,
      sample: gdelt[0] || null,
    };
  } catch (error) {
    results.collectors.gdelt = {
      success: false,
      error: String(error),
    };
  }

  try {
    const github = await collectGitHub(testEntity);
    results.collectors.github = {
      success: true,
      count: github.length,
      sample: github[0] || null,
    };
  } catch (error) {
    results.collectors.github = {
      success: false,
      error: String(error),
    };
  }

  try {
    const bluesky = await collectBluesky(testEntity);
    results.collectors.bluesky = {
      success: true,
      count: bluesky.length,
      sample: bluesky[0] || null,
    };
  } catch (error) {
    results.collectors.bluesky = {
      success: false,
      error: String(error),
    };
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
