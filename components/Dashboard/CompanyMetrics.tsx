import type { Entity, Mention } from '@/lib/types';
import { percentage } from '@/lib/utils';

interface CompanyMetricsProps {
  entities: Entity[];
  mentions: Mention[];
}

export default function CompanyMetrics({ entities, mentions }: CompanyMetricsProps) {
  const companies = entities.filter(e => e.type === 'company');

  const companyData = companies.map(company => {
    const companyMentions = mentions.filter(m => m.entityId === company.id);
    const totalMentions = companyMentions.length;

    const positive = companyMentions.filter(m => m.sentiment === 'positive').length;
    const negative = companyMentions.filter(m => m.sentiment === 'negative').length;
    const neutral = companyMentions.filter(m => m.sentiment === 'neutral').length;

    return {
      company,
      totalMentions,
      positive,
      negative,
      neutral,
    };
  });

  if (companies.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Companies</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No companies tracked yet. Add companies to see metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Companies</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">
                Company
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
            {companyData.map(({ company, totalMentions, positive, negative, neutral }) => (
              <tr key={company.id} className="border-b border-border last:border-0">
                <td className="py-3 px-3 font-medium">{company.name}</td>
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
