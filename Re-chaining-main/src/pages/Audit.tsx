import { useState } from 'react';
import { useStore } from '@/store';
import { Card, Badge, Button, SectionTitle } from '@/components/ui';
import { ShieldCheck, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import type { AnomalyStatus } from '@/types';

const STATUS_COLORS: Record<AnomalyStatus, 'gray' | 'yellow' | 'green' | 'red' | 'blue'> = {
  new: 'yellow',
  investigating: 'blue',
  resolved: 'green',
  escalated: 'red',
};

const SEV_COLORS: Record<string, 'gray' | 'yellow' | 'green' | 'red'> = {
  low: 'gray', medium: 'yellow', high: 'red', critical: 'red',
};

export function AuditPage({ highlightId }: { highlightId: string | null }) {
  const { anomalies, dispatch } = useStore();
  const [selected, setSelected] = useState<string | null>(anomalies[0]?.id ?? null);
  const [search, setSearch] = useState('');

  const filtered = anomalies.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
  );

  const anomaly = anomalies.find(a => a.id === selected);
  const [notes, setNotes] = useState('');

  return (
    <div className="p-6 max-w-6xl mx-auto" id={highlightId === 'D4' ? 'highlight-target' : undefined}>
      <div className="mb-5">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Audit Center</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Anomaly detection — duplicate claims, over-allocation, ghost deliveries, unusual pricing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Anomaly list */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border mb-2" style={{ borderColor: 'var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anomalies..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }} />
          </div>
          {filtered.map(a => (
            <Card key={a.id} className={`p-3 cursor-pointer transition-all ${selected === a.id ? 'border-blue-500' : ''}`} onClick={() => { setSelected(a.id); setNotes(a.notes); }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.id}</span>
                <Badge color={SEV_COLORS[a.severity]}>{a.severity}</Badge>
              </div>
              <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.title}</div>
              <div className="flex items-center gap-1 mt-1">
                <Badge color={STATUS_COLORS[a.status]}>{a.status}</Badge>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.type.replace('_', ' ')}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Detail */}
        {anomaly ? (
          <Card className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className={anomaly.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'} />
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{anomaly.title}</h2>
              </div>
              <Badge color={STATUS_COLORS[anomaly.status]}>{anomaly.status}</Badge>
            </div>

            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{anomaly.description}</p>

            <SectionTitle>Evidence</SectionTitle>
            <div className="space-y-1.5 mb-4">
              {anomaly.evidence.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded" style={{ background: 'var(--bg-tertiary)' }}>
                  <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{e}</span>
                </div>
              ))}
            </div>

            <SectionTitle>Linked Records</SectionTitle>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {anomaly.linkedRecords.map(r => (
                <span key={r} className="font-mono text-[10px] px-2 py-1 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{r}</span>
              ))}
            </div>

            <SectionTitle>Investigation Notes</SectionTitle>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add investigation notes..."
              className="w-full text-xs p-2 rounded border bg-transparent outline-none resize-none mb-3"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', minHeight: '60px' }}
            />

            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={() => dispatch({ type: 'RESOLVE_ANOMALY', id: anomaly.id, status: 'investigating', notes })}>
                Mark Investigating
              </Button>
              <Button size="sm" variant="default" onClick={() => dispatch({ type: 'RESOLVE_ANOMALY', id: anomaly.id, status: 'resolved', notes })}>
                Resolve
              </Button>
              <Button size="sm" variant="danger" onClick={() => dispatch({ type: 'RESOLVE_ANOMALY', id: anomaly.id, status: 'escalated', notes })}>
                Escalate
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 lg:col-span-2 flex flex-col items-center justify-center">
            <ShieldCheck size={32} className="text-green-400 mb-2" />
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select an anomaly to investigate</div>
          </Card>
        )}
      </div>
    </div>
  );
}
