/**
 * Redis database operations using Upstash
 */

import { Redis } from '@upstash/redis';
import type { Entity, Mention, CompanyInsight } from './types';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Entity operations
 */
export const db = {
  // Entity CRUD
  async createEntity(entity: Entity): Promise<void> {
    await redis.sadd('entities:all', entity.id);
    await redis.hset(`entity:${entity.id}`, { ...entity });
  },

  async getEntity(id: string): Promise<Entity | null> {
    const entity = await redis.hgetall(`entity:${id}`);
    return entity ? (entity as unknown as Entity) : null;
  },

  async getAllEntities(): Promise<Entity[]> {
    const ids = await redis.smembers('entities:all');
    if (!ids || ids.length === 0) return [];

    const entities = await Promise.all(
      ids.map(id => this.getEntity(id as string))
    );
    return entities.filter((e): e is Entity => e !== null);
  },

  async updateEntity(id: string, updates: Partial<Entity>): Promise<void> {
    const existing = await this.getEntity(id);
    if (!existing) throw new Error('Entity not found');

    await redis.hset(`entity:${id}`, { ...existing, ...updates });
  },

  async deleteEntity(id: string): Promise<void> {
    await redis.srem('entities:all', id);
    await redis.del(`entity:${id}`);
    await redis.del(`mentions:entity:${id}`);
  },

  // Mention operations
  async createMention(mention: Mention): Promise<void> {
    const mentionKey = `mention:${mention.id}`;
    const entityKey = `mentions:entity:${mention.entityId}`;

    // Store mention data
    await redis.hset(mentionKey, { ...mention });

    // Add to entity's mention list (sorted by timestamp)
    await redis.zadd(entityKey, {
      score: mention.publishedAt,
      member: mention.id,
    });

    // Set TTL to 7 days (604800 seconds)
    await redis.expire(mentionKey, 604800);
    await redis.expire(entityKey, 604800);
  },

  async getMention(id: string): Promise<Mention | null> {
    const mention = await redis.hgetall(`mention:${id}`);
    return mention ? (mention as unknown as Mention) : null;
  },

  async getMentionsByEntity(
    entityId: string,
    limit = 100
  ): Promise<Mention[]> {
    // Get mention IDs sorted by timestamp (newest first)
    const mentionIds = await redis.zrange(
      `mentions:entity:${entityId}`,
      0,
      limit - 1,
      { rev: true }
    );

    if (!mentionIds || mentionIds.length === 0) return [];

    const mentions = await Promise.all(
      mentionIds.map(id => this.getMention(id as string))
    );

    const validMentions = mentions.filter((m): m is Mention => m !== null);

    // Deduplicate by URL (same article may be stored with different IDs)
    const uniqueByUrl = new Map<string, Mention>();
    for (const mention of validMentions) {
      const existing = uniqueByUrl.get(mention.url);
      if (!existing || mention.collectedAt > existing.collectedAt) {
        uniqueByUrl.set(mention.url, mention);
      }
    }

    return Array.from(uniqueByUrl.values())
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, limit);
  },

  async getRecentMentions(hours = 168): Promise<Mention[]> {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const entities = await this.getAllEntities();

    const allMentions = await Promise.all(
      entities.map(entity => this.getMentionsByEntity(entity.id))
    );

    // Deduplicate by URL (same article may have been collected multiple times)
    const uniqueByUrl = new Map<string, Mention>();
    for (const mention of allMentions.flat()) {
      if (mention.publishedAt >= cutoffTime) {
        // Keep the most recently collected version
        const existing = uniqueByUrl.get(mention.url);
        if (!existing || mention.collectedAt > existing.collectedAt) {
          uniqueByUrl.set(mention.url, mention);
        }
      }
    }

    return Array.from(uniqueByUrl.values())
      .sort((a, b) => b.publishedAt - a.publishedAt);
  },

  // Company insights
  async createInsight(insight: CompanyInsight): Promise<void> {
    const key = `insights:company:${insight.entityId}`;
    const insightId = `${insight.category}:${Date.now()}`;

    await redis.hset(key, { [insightId]: JSON.stringify(insight) });
    await redis.expire(key, 604800); // 7 days TTL
  },

  async getInsightsByCompany(entityId: string): Promise<CompanyInsight[]> {
    const insights = await redis.hgetall(`insights:company:${entityId}`);
    if (!insights) return [];

    return Object.values(insights).map(val =>
      JSON.parse(val as string) as unknown as CompanyInsight
    );
  },

  // Metadata
  async setLastScan(timestamp: number): Promise<void> {
    await redis.set('metadata:last_scan', timestamp);
  },

  async getLastScan(): Promise<number | null> {
    const timestamp = await redis.get('metadata:last_scan');
    return timestamp as number | null;
  },

  // Cleanup (for testing)
  async clearAll(): Promise<void> {
    const entities = await this.getAllEntities();
    await Promise.all(entities.map(e => this.deleteEntity(e.id)));
    await redis.del('metadata:last_scan');
  },

  // Clear all mentions but keep entities
  async clearAllMentions(): Promise<void> {
    const entities = await this.getAllEntities();

    for (const entity of entities) {
      // Get all mention IDs for this entity
      const mentionIds = await redis.zrange(`mentions:entity:${entity.id}`, 0, -1);

      // Delete each mention
      for (const mentionId of mentionIds) {
        await redis.del(`mention:${mentionId}`);
      }

      // Delete the entity's mention list
      await redis.del(`mentions:entity:${entity.id}`);

      // Delete insights for companies
      await redis.del(`insights:company:${entity.id}`);
    }
  },
};
