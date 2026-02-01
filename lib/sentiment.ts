/**
 * Keyword-based sentiment analysis
 */

import type { SentimentType } from './types';

// Sentiment keyword lists
const POSITIVE_KEYWORDS = [
  'great',
  'excellent',
  'amazing',
  'love',
  'fantastic',
  'best',
  'innovative',
  'powerful',
  'easy',
  'fast',
  'reliable',
  'helpful',
  'perfect',
  'outstanding',
  'brilliant',
  'awesome',
  'wonderful',
  'impressive',
  'superb',
  'terrific',
  'good',
  'nice',
  'solid',
  'strong',
  'effective',
  'efficient',
  'useful',
  'quality',
  'recommend',
  'success',
];

const NEGATIVE_KEYWORDS = [
  'terrible',
  'awful',
  'horrible',
  'hate',
  'worst',
  'broken',
  'slow',
  'buggy',
  'useless',
  'disappointing',
  'frustrating',
  'poor',
  'fail',
  'crash',
  'issue',
  'problem',
  'bad',
  'difficult',
  'hard',
  'confusing',
  'complicated',
  'annoying',
  'waste',
  'suck',
  'garbage',
  'trash',
  'inferior',
  'lacking',
  'unstable',
  'unreliable',
];

/**
 * Analyze sentiment of text using keyword matching
 */
export function analyzeSentiment(text: string): {
  sentiment: SentimentType;
  score: number;
} {
  const lowerText = text.toLowerCase();

  // Count positive and negative keywords
  let positiveCount = 0;
  let negativeCount = 0;

  for (const keyword of POSITIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  }

  for (const keyword of NEGATIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  }

  // Calculate net sentiment
  const netSentiment = positiveCount - negativeCount;

  // Determine sentiment type
  let sentiment: SentimentType;
  if (netSentiment > 0) {
    sentiment = 'positive';
  } else if (netSentiment < 0) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  // Calculate score (0-100 scale)
  // Base score of 50 (neutral), adjust by keyword counts
  const rawScore = 50 + netSentiment * 10;
  const score = Math.max(0, Math.min(100, rawScore));

  return { sentiment, score };
}

/**
 * Extract tags/keywords from text
 */
export function extractTags(text: string, entityName: string): string[] {
  const tags: string[] = [];

  // Include entity name as a tag
  tags.push(entityName.toLowerCase());

  // Extract hashtags
  const hashtagRegex = /#(\w+)/g;
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    tags.push(match[1].toLowerCase());
  }

  // Extract common technical terms (simplified)
  const technicalTerms = [
    'api',
    'sdk',
    'framework',
    'library',
    'platform',
    'service',
    'app',
    'software',
    'tool',
    'feature',
    'performance',
    'security',
    'scalability',
    'ui',
    'ux',
  ];

  const lowerText = text.toLowerCase();
  for (const term of technicalTerms) {
    if (lowerText.includes(term) && !tags.includes(term)) {
      tags.push(term);
    }
  }

  return tags.slice(0, 10); // Limit to 10 tags
}

/**
 * Categorize company insight based on content
 */
export function categorizeInsight(text: string): {
  category: 'culture' | 'opinion' | 'challenge';
  confidence: number;
} {
  const lowerText = text.toLowerCase();

  // Culture indicators
  const cultureKeywords = [
    'work',
    'employee',
    'culture',
    'team',
    'management',
    'office',
    'remote',
    'hiring',
    'benefits',
    'salary',
  ];

  // Opinion indicators
  const opinionKeywords = [
    'think',
    'believe',
    'feel',
    'opinion',
    'view',
    'perspective',
    'seems',
    'appears',
    'consider',
  ];

  // Challenge indicators
  const challengeKeywords = [
    'problem',
    'issue',
    'bug',
    'error',
    'fail',
    'broken',
    'difficult',
    'struggle',
    'challenge',
    'complaint',
  ];

  // Count matches
  const cultureCount = cultureKeywords.filter(k => lowerText.includes(k)).length;
  const opinionCount = opinionKeywords.filter(k => lowerText.includes(k)).length;
  const challengeCount = challengeKeywords.filter(k => lowerText.includes(k)).length;

  // Determine category
  const max = Math.max(cultureCount, opinionCount, challengeCount);

  if (max === 0) {
    return { category: 'opinion', confidence: 0.5 };
  }

  if (challengeCount === max) {
    return { category: 'challenge', confidence: challengeCount / 3 };
  }

  if (cultureCount === max) {
    return { category: 'culture', confidence: cultureCount / 3 };
  }

  return { category: 'opinion', confidence: opinionCount / 3 };
}
