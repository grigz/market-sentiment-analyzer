'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { Entity, Mention } from '@/lib/types';
import ExportButtons from '@/components/ExportButtons';
import SentimentBadge from '@/components/SentimentBadge';
import { formatRelativeTime, truncate } from '@/lib/utils';

export default function KeywordsPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [entitiesRes, mentionsRes] = await Promise.all([
        fetch('/api/entities'),
        fetch('/api/mentions'),
      ]);

      const entitiesData = await entitiesRes.json();
      const mentionsData = await mentionsRes.json();

      if (entitiesData.success) setEntities(entitiesData.data);
      if (mentionsData.success) setMentions(mentionsData.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const keywords = entities.filter(e => e.type === 'keyword');
  const keywordMentions = mentions.filter(m => m.entityType === 'keyword');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Keywords</h1>
          <p className="text-muted-foreground mt-1">
            Detailed view of keyword mentions
          </p>
        </div>
        <ExportButtons />
      </div>

      {keywords.length === 0 ? (
        <div className="bg-background border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            No keywords tracked. Add keywords from the Dashboard.
          </p>
        </div>
      ) : (
        keywords.map(keyword => {
          const keywordMentionsList = keywordMentions.filter(
            m => m.entityId === keyword.id
          );

          return (
            <div key={keyword.id} className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{keyword.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {keywordMentionsList.length} mentions
                </span>
              </div>

              {keywordMentionsList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No mentions yet. Run a scan to collect data.
                </p>
              ) : (
                <div className="space-y-3">
                  {keywordMentionsList.map(mention => {
                    const isExpanded = expandedIds.has(mention.id);

                    return (
                      <div
                        key={mention.id}
                        className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {mention.source}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {mention.platform}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(mention.publishedAt)}
                              </span>
                            </div>

                            <p className="text-sm mb-2">
                              {isExpanded ? mention.fullText : truncate(mention.content, 200)}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                              <SentimentBadge sentiment={mention.sentiment} />
                              <span className="text-xs text-muted-foreground">
                                by {mention.author}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <a
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-background rounded"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => toggleExpand(mention.id)}
                              className="p-2 hover:bg-background rounded"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
