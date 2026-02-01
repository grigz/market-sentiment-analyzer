'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonsProps {
  entityId?: string;
}

export default function ExportButtons({ entityId }: ExportButtonsProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    setLoading(true);
    try {
      const url = entityId
        ? `/api/export/${format}?entityId=${entityId}`
        : `/api/export/${format}`;

      const response = await fetch(url);
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('csv')}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
      <button
        onClick={() => handleExport('json')}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        Export JSON
      </button>
    </div>
  );
}
