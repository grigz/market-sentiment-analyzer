/**
 * Utility functions
 */

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get time range for last N hours
 */
export function getTimeRange(hours: number): { start: number; end: number } {
  const end = Date.now();
  const start = end - hours * 60 * 60 * 1000;
  return { start, end };
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Sanitize entity name
 */
export function sanitizeEntityName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Get sentiment color class
 */
export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'negative':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  }
}

/**
 * Check if entity name appears in text with proper word boundaries
 * Returns true if the entity appears as complete words, not just substrings
 */
export function entityMatchesText(entityName: string, text: string): boolean {
  if (!text || !entityName) return false;

  // Normalize both for comparison
  const normalizedText = text.toLowerCase();
  const normalizedEntity = entityName.toLowerCase();

  // Handle boolean operators - if entity contains AND/OR/NOT, check each term
  const booleanPattern = /\b(AND|OR|NOT)\b/i;
  if (booleanPattern.test(entityName)) {
    // Extract individual terms (excluding boolean operators and parentheses)
    const terms = entityName
      .replace(/[()]/g, ' ')
      .split(/\s+/)
      .filter(term => !['and', 'or', 'not'].includes(term.toLowerCase()))
      .filter(term => term.length > 0);

    // At least one term must match for OR logic
    // For AND logic, all terms should match (but we'll be lenient here)
    return terms.some(term => {
      const cleanTerm = term.replace(/['"]/g, '');
      return entityMatchesText(cleanTerm, text);
    });
  }

  // Remove quotes from entity name for matching
  const cleanEntity = normalizedEntity.replace(/['"]/g, '');

  // Create word boundary regex
  // \b doesn't work well with special characters, so we use a more flexible pattern
  const pattern = new RegExp(
    `(?:^|[\\s.,;!?()\\[\\]{}'"'-])${escapeRegex(cleanEntity)}(?:[\\s.,;!?()\\[\\]{}'"'-]|$)`,
    'i'
  );

  return pattern.test(normalizedText);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
