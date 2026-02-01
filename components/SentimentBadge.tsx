import type { SentimentType } from '@/lib/types';
import { getSentimentColor } from '@/lib/utils';

interface SentimentBadgeProps {
  sentiment: SentimentType;
  score?: number;
}

export default function SentimentBadge({ sentiment, score }: SentimentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(
        sentiment
      )}`}
    >
      {sentiment}
      {score !== undefined && ` (${score})`}
    </span>
  );
}
