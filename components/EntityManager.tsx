'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Entity } from '@/lib/types';

interface EntityManagerProps {
  entities: Entity[];
  onUpdate: () => void;
}

export default function EntityManager({ entities, onUpdate }: EntityManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'keyword' | 'company'>('keyword');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type }),
      });

      if (response.ok) {
        setName('');
        setIsAdding(false);
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add entity');
      }
    } catch (error) {
      console.error('Add entity error:', error);
      alert('Failed to add entity');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;

    try {
      const response = await fetch(`/api/entities?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Delete entity error:', error);
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Tracked Entities</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Entity
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-secondary rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Entity name"
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <select
              value={type}
              onChange={e => setType(e.target.value as 'keyword' | 'company')}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="keyword">Keyword</option>
              <option value="company">Company</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={loading || !name.trim()}
                className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setName('');
                }}
                className="px-3 py-2 text-sm bg-background border border-border rounded-md hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {entities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No entities yet. Add a keyword or company to start tracking.
          </p>
        ) : (
          entities.map(entity => (
            <div
              key={entity.id}
              className="flex items-center justify-between p-3 bg-secondary rounded-md"
            >
              <div>
                <span className="font-medium">{entity.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({entity.type})
                </span>
              </div>
              <button
                onClick={() => handleDelete(entity.id)}
                className="p-1 hover:bg-background rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
