/**
 * GitHub issues/discussions collector
 */

import { v4 as uuidv4 } from 'uuid';
import type { Mention, Entity } from '../types';
import { analyzeSentiment, extractTags } from '../sentiment';

interface GitHubIssue {
  id: number;
  title: string;
  body: string | null;
  user: {
    login: string;
  };
  html_url: string;
  created_at: string;
  repository_url: string;
}

export async function collectGitHub(entity: Entity): Promise<Mention[]> {
  try {
    const query = encodeURIComponent(entity.name);
    const url = `https://api.github.com/search/issues?q=${query}&sort=created&order=desc&per_page=20`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MarketSentimentAnalyzer/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('GitHub rate limit reached');
        return [];
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const issues: GitHubIssue[] = data?.items || [];

    const mentions: Mention[] = issues.map(issue => {
      const fullText = `${issue.title} ${issue.body || ''}`.trim();
      const content = fullText.slice(0, 200);
      const { sentiment, score } = analyzeSentiment(fullText);
      const tags = extractTags(fullText, entity.name);

      // Extract repo name from repository_url
      const repoMatch = issue.repository_url.match(/repos\/(.+)/);
      const platform = repoMatch ? repoMatch[1] : 'github.com';

      return {
        id: uuidv4(),
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        source: 'GitHub',
        platform,
        author: issue.user.login,
        content,
        fullText,
        url: issue.html_url,
        sentiment,
        sentimentScore: score,
        publishedAt: new Date(issue.created_at).getTime(),
        collectedAt: Date.now(),
        tags,
      };
    });

    return mentions;
  } catch (error) {
    console.error(`GitHub collection error for ${entity.name}:`, error);
    return [];
  }
}
