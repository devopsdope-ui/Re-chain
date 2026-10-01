import { Card, Badge } from '@/components/ui';
import { FolderOpen, FileText, Tag } from 'lucide-react';

const COLLECTIONS = [
  { id: 'c1', name: 'Allocation Strategies', count: 8, desc: 'Different weighting configurations for the allocation engine' },
  { id: 'c2', name: 'Chaos Scenarios', count: 12, desc: 'Pre-built disruption sequences for testing system resilience' },
  { id: 'c3', name: 'Fund Flow Patterns', count: 5, desc: 'Common fund distribution patterns observed in past disasters' },
  { id: 'c4', name: 'Audit Rules', count: 15, desc: 'Anomaly detection rules and thresholds' },
];

export function CollectionsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Collections</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Curated sets of configurations, rules, and patterns</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COLLECTIONS.map(c => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen size={16} className="text-blue-400" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
              <Badge color="gray">{c.count} items</Badge>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
