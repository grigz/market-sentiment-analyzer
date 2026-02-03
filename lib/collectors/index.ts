/**
 * Main collector aggregator
 */

import type { Entity, Mention, ScanResult } from '../types';
import { db } from '../db';
import { collectHackerNews } from './hackernews';
import { collectReddit } from './reddit';
import { collectGDELT } from './gdelt';
import { collectGitHub } from './github';
import { collectBluesky } from './bluesky';
import { collectX } from './x';
import { collectLinkedIn } from './linkedin';
import { categorizeInsight } from '../sentiment';

/**
 * Collect mentions from all sources for a single entity
 */
async function collectForEntity(entity: Entity): Promise<Mention[]> {
  const collectorNames = [
    'HackerNews',
    'Reddit',
    'GDELT',
    // 'GitHub', // Disabled - too many posts
    'Bluesky',
    'X',
    'LinkedIn',
  ];

  const collectors = [
    collectHackerNews(entity),
    collectReddit(entity),
    collectGDELT(entity),
    // collectGitHub(entity), // Disabled - too many posts
    collectBluesky(entity),
    collectX(entity),
    collectLinkedIn(entity),
  ];

  const results = await Promise.allSettled(collectors);

  // Log results from each collector
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`  ${collectorNames[index]}: ${result.value.length} mentions`);
    } else {
      console.error(`  ${collectorNames[index]}: FAILED - ${result.reason}`);
    }
  });

  const allMentions = results
    .filter((r): r is PromiseFulfilledResult<Mention[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);

  return allMentions;
}

/**
 * Deduplicate mentions based on URL
 */
function deduplicateMentions(mentions: Mention[]): Mention[] {
  const seen = new Set<string>();
  const unique: Mention[] = [];

  for (const mention of mentions) {
    if (!seen.has(mention.url)) {
      seen.add(mention.url);
      unique.push(mention);
    }
  }

  return unique;
}

/**
 * Generate company insights from mentions
 */
async function generateInsights(entity: Entity, mentions: Mention[]): Promise<void> {
  if (entity.type !== 'company') return;

  for (const mention of mentions) {
    const { category, confidence } = categorizeInsight(mention.fullText);

    if (confidence > 0.3) {
      await db.createInsight({
        entityId: entity.id,
        category,
        insight: mention.content,
        evidence: [mention.id],
        firstSeenAt: mention.publishedAt,
        lastSeenAt: mention.publishedAt,
      });
    }
  }
}

/**
 * Run full scan for all enabled entities
 */
export async function runScan(): Promise<ScanResult> {
  const entities = await db.getAllEntities();
  const enabledEntities = entities.filter(e => e.enabled);

  if (enabledEntities.length === 0) {
    return {
      entitiesScanned: 0,
      mentionsCollected: 0,
      sources: [],
      timestamp: Date.now(),
    };
  }

  const allMentions: Mention[] = [];
  const sources = new Set<string>();

  for (const entity of enabledEntities) {
    console.log(`Scanning ${entity.name}...`);

    const mentions = await collectForEntity(entity);
    const uniqueMentions = deduplicateMentions(mentions);

    // Filter to last 7 days (1 week)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    console.log(`  Before filtering: ${uniqueMentions.length} unique mentions`);
    const recentMentions = uniqueMentions.filter(m => m.publishedAt >= sevenDaysAgo);
    console.log(`  After 7-day filter: ${recentMentions.length} mentions (filtered out ${uniqueMentions.length - recentMentions.length})`);

    // Log breakdown by source
    const sourceBreakdown = recentMentions.reduce((acc, m) => {
      acc[m.source] = (acc[m.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`  Sources breakdown:`, sourceBreakdown);

    // Store mentions
    for (const mention of recentMentions) {
      await db.createMention(mention);
      sources.add(mention.source);
      allMentions.push(mention);
    }

    // Generate company insights
    await generateInsights(entity, recentMentions);

    console.log(`Collected ${recentMentions.length} mentions for ${entity.name}`);
  }

  // Update last scan timestamp
  const timestamp = Date.now();
  await db.setLastScan(timestamp);

  return {
    entitiesScanned: enabledEntities.length,
    mentionsCollected: allMentions.length,
    sources: Array.from(sources),
    timestamp,
  };
}
