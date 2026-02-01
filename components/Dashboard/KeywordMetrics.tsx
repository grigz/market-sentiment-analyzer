import type { Entity, Mention } from '@/lib/types';
import { percentage } from '@/lib/utils';

interface KeywordMetricsProps {
  entities: Entity[];
  mentions: Mention[];
}

export default function KeywordMetrics({ entities, mentions }: KeywordMetricsProps) {
  const keywords = entities.filter(e => e.type === 'keyword');

  const keywordData = keywords.map(keyword => {
    const keywordMentions = mentions.filter(m => m.entityId === keyword.id);
    const totalMentions = keywordMentions.length;

    const positive = keywordMentions.filter(m => m.sentiment === 'positive').length;
    const negative = keywordMentions.filter(m => m.sentiment === 'negative').length;
    const neutral = keywordMentions.filter(m => m.sentiment === 'neutral').length;

    return {
      keyword,
      totalMentions,
      positive,
      negative,
      neutral,
    };
  });

  if (keywords.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Keywords</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No keywords tracked yet. Add keywords to see metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Keywords</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">
                Keyword
              </th>
              <th className="text-center py-2 px-3 text-sm font-medium text-muted-foreground">
                Mentions
              </th>
              <th className="text-center py-2 px-3 text-sm font-medium text-muted-foreground">
                Positive
              </th>
              <th className="text-center py-2 px-3 text-sm font-medium text-muted-foreground">
                Negative
              </th>
              <th className="text-center py-2 px-3 text-sm font-medium text-muted-foreground">
                Neutral
              </th>
            </tr>
          </thead>
          <tbody>
            {keywordData.map(({ keyword, totalMentions, positive, negative, neutral }) => (
              <tr key={keyword.id} className="border-b border-border last:border-0">
                <td className="py-3 px-3 font-medium">{keyword.name}</td>
                <td className="py-3 px-3 text-center">{totalMentions}</td>
                <td className="py-3 px-3 text-center">
                  <span className="text-green-600">{positive}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({percentage(positive, totalMentions)}%)
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="text-red-600">{negative}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({percentage(negative, totalMentions)}%)
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="text-gray-600">{neutral}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({percentage(neutral, totalMentions)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
