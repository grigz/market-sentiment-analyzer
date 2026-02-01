'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Mention } from '@/lib/types';

interface PlatformDistributionProps {
  mentions: Mention[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function PlatformDistribution({ mentions }: PlatformDistributionProps) {
  // Count mentions per source
  const sourceCounts = mentions.reduce((acc, mention) => {
    acc[mention.source] = (acc[mention.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value,
  }));

  if (data.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Platform Distribution</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No data available yet. Run a scan to see platform distribution.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Platform Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
