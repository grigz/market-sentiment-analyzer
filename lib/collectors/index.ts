/**
 * Main collector aggregator
 */

import type { Entity, Mention, ScanResult } from '../types';
import { db } from '../db';
import { collectHackerNews } from './hackernews';
import { collectReddit } from './reddit';
import { collectGDELT } from './gdelt';
import { collectGitHub } from './github';
import { categorizeInsight } from '../sentiment';

/**
 * Collect mentions from all sources for a single entity
 */
async function collectForEntity(entity: Entity): Promise<Mention[]> {
  const collectors = [
    collectHackerNews(entity),
    collectReddit(entity),
    collectGDELT(entity),
    collectGitHub(entity),
  ];

  const results = await Promise.allSettled(collectors);

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

    // Filter to last 2 days
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    const recentMentions = uniqueMentions.filter(m => m.publishedAt >= twoDaysAgo);

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
