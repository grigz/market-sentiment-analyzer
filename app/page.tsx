'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, MessageSquare, TrendingUp, Database } from 'lucide-react';
import type { Entity, Mention } from '@/lib/types';
import EntityManager from '@/components/EntityManager';
import ExportButtons from '@/components/ExportButtons';
import MetricCard from '@/components/Dashboard/MetricCard';
import KeywordMetrics from '@/components/Dashboard/KeywordMetrics';
import CompanyMetrics from '@/components/Dashboard/CompanyMetrics';
import PlatformDistribution from '@/components/PlatformDistribution';
import { formatRelativeTime } from '@/lib/utils';

export default function Dashboard() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [lastScan, setLastScan] = useState<number | null>(null);
  const [, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entitiesRes, mentionsRes] = await Promise.all([
        fetch('/api/entities'),
        fetch('/api/mentions'),
      ]);

      const entitiesData = await entitiesRes.json();
      const mentionsData = await mentionsRes.json();

      if (entitiesData.success) setEntities(entitiesData.data);
      if (mentionsData.success) setMentions(mentionsData.data);

      // Get last scan time from localStorage (set during scan)
      const lastScanTime = localStorage.getItem('lastScan');
      if (lastScanTime) setLastScan(parseInt(lastScanTime));
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/scan', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        const scanTime = data.data.timestamp;
        setLastScan(scanTime);
        localStorage.setItem('lastScan', scanTime.toString());
        await fetchData();
        alert(`Scan completed! Collected ${data.data.mentionsCollected} mentions.`);
      } else {
        alert('Scan failed: ' + data.error);
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalMentions = mentions.length;
  const positiveMentions = mentions.filter(m => m.sentiment === 'positive').length;
  const negativeMentions = mentions.filter(m => m.sentiment === 'negative').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Last 48 hours of market sentiment
            {lastScan && (
              <span className="ml-2 text-xs">
                (Last scan: {formatRelativeTime(lastScan)})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportButtons />
          <button
            onClick={handleScan}
            disabled={scanning || entities.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      <EntityManager entities={entities} onUpdate={fetchData} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Mentions"
          value={totalMentions}
          icon={MessageSquare}
          trend="Last 2 days"
        />
        <MetricCard
          title="Positive"
          value={positiveMentions}
          icon={TrendingUp}
          trend={`${((positiveMentions / totalMentions) * 100 || 0).toFixed(1)}%`}
        />
        <MetricCard
          title="Negative"
          value={negativeMentions}
          icon={TrendingUp}
          trend={`${((negativeMentions / totalMentions) * 100 || 0).toFixed(1)}%`}
        />
        <MetricCard
          title="Tracked Entities"
          value={entities.length}
          icon={Database}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeywordMetrics entities={entities} mentions={mentions} />
        <CompanyMetrics entities={entities} mentions={mentions} />
      </div>

      <PlatformDistribution mentions={mentions} />
    </div>
  );
}
