'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonsProps {
  entityId?: string;
}

export default function ExportButtons({ entityId }: ExportButtonsProps) {
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingJson, setLoadingJson] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    const setLoading = format === 'csv' ? setLoadingCsv : setLoadingJson;
    setLoading(true);
    try {
      const url = entityId
        ? `/api/export/${format}?entityId=${entityId}`
        : `/api/export/${format}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMsg = typeof errorData.error === 'string'
          ? errorData.error
          : JSON.stringify(errorData.error || errorData);
        throw new Error(errorMsg || `Export failed with status ${response.status}`);
      }

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
      console.error(`${format.toUpperCase()} export failed:`, error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('csv')}
        disabled={loadingCsv || loadingJson}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {loadingCsv ? 'Exporting...' : 'Export CSV'}
      </button>
      <button
        onClick={() => handleExport('json')}
        disabled={loadingCsv || loadingJson}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {loadingJson ? 'Exporting...' : 'Export JSON'}
      </button>
    </div>
  );
}
