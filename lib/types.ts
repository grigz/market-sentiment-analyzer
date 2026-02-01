/**
 * Core data types for Market Sentiment Analyzer
 */

export type EntityType = 'keyword' | 'company';
export type SentimentType = 'positive' | 'negative' | 'neutral';
export type InsightCategory = 'culture' | 'opinion' | 'challenge' | 'sentiment';

/**
 * Entity (Keyword or Company)
 */
export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  createdAt: number;
  enabled: boolean;
}

/**
 * Mention from various sources
 */
export interface Mention {
  id: string;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  source: string;
  platform: string;
  author: string;
  content: string;
  fullText: string;
  url: string;
  sentiment: SentimentType;
  sentimentScore: number;
  publishedAt: number;
  collectedAt: number;
  tags: string[];
}

/**
 * Company-specific insights
 */
export interface CompanyInsight {
  entityId: string;
  category: InsightCategory;
  insight: string;
  evidence: string[];
  firstSeenAt: number;
  lastSeenAt: number;
}

/**
 * Dashboard metrics
 */
export interface EntityMetrics {
  entityId: string;
  entityName: string;
  entityType: EntityType;
  totalMentions: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  platformBreakdown: Record<string, number>;
  trending: boolean;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Scan result
 */
export interface ScanResult {
  entitiesScanned: number;
  mentionsCollected: number;
  sources: string[];
  timestamp: number;
}
