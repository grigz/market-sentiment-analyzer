'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Entity, Mention } from '@/lib/types';
import ExportButtons from '@/components/ExportButtons';
import SentimentBadge from '@/components/SentimentBadge';
import { truncate } from '@/lib/utils';

export default function CompaniesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
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

  const companies = entities.filter(e => e.type === 'company');
  const companyMentions = mentions.filter(m => m.entityType === 'company');

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Company intelligence and insights
          </p>
        </div>
        <ExportButtons />
      </div>

      {companies.length === 0 ? (
        <div className="bg-background border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            No companies tracked. Add companies from the Dashboard.
          </p>
        </div>
      ) : (
        companies.map(company => {
          const companyMentionsList = companyMentions.filter(
            m => m.entityId === company.id
          );

          // Categorize mentions
          const cultureMentions = companyMentionsList.filter(m =>
            m.fullText.toLowerCase().includes('culture') ||
            m.fullText.toLowerCase().includes('work') ||
            m.fullText.toLowerCase().includes('employee')
          );

          const challengeMentions = companyMentionsList.filter(
            m => m.sentiment === 'negative'
          );

          const opinionMentions = companyMentionsList.filter(
            m =>
              !cultureMentions.includes(m) &&
              !challengeMentions.includes(m)
          );

          const positiveSentiment = companyMentionsList.filter(
            m => m.sentiment === 'positive'
          ).length;
          const negativeSentiment = companyMentionsList.filter(
            m => m.sentiment === 'negative'
          ).length;

          return (
            <div key={company.id} className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">{company.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {companyMentionsList.length} total mentions
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">+{positiveSentiment}</span>
                  <span className="text-red-600">-{negativeSentiment}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    Culture Signals
                    <span className="text-xs text-muted-foreground">
                      ({cultureMentions.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {cultureMentions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : (
                      cultureMentions.slice(0, 3).map(mention => (
                        <div
                          key={mention.id}
                          className="text-xs p-2 bg-secondary rounded border border-border"
                        >
                          <p>{truncate(mention.content, 100)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <SentimentBadge sentiment={mention.sentiment} />
                            <a
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    Opinions
                    <span className="text-xs text-muted-foreground">
                      ({opinionMentions.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {opinionMentions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : (
                      opinionMentions.slice(0, 3).map(mention => (
                        <div
                          key={mention.id}
                          className="text-xs p-2 bg-secondary rounded border border-border"
                        >
                          <p>{truncate(mention.content, 100)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <SentimentBadge sentiment={mention.sentiment} />
                            <a
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    Challenges
                    <span className="text-xs text-muted-foreground">
                      ({challengeMentions.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {challengeMentions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : (
                      challengeMentions.slice(0, 3).map(mention => (
                        <div
                          key={mention.id}
                          className="text-xs p-2 bg-secondary rounded border border-border"
                        >
                          <p>{truncate(mention.content, 100)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <SentimentBadge sentiment={mention.sentiment} />
                            <a
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
