import { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { Monitor, Server, Layers, Radio, Database, GitBranch, ScrollText, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react';

const COMPONENTS = [
  { id: 'frontend', name: 'Frontend', icon: Monitor, color: 'text-blue-400', desc: 'React + TypeScript + Vite + Tailwind CSS. Renders live ops map, dashboards, decision logs, and ledger views. Manages simulation state via React context.', tech: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Recharts'] },
  { id: 'api', name: 'API Layer', icon: Server, color: 'text-green-400', desc: 'RESTful API layer that routes requests between frontend and backend services. Handles authentication, request validation, and response formatting.', tech: ['REST', 'JSON', 'JWT Auth'] },
  { id: 'services', name: 'Services', icon: Layers, color: 'text-purple-400', desc: 'Domain services: allocation engine, simulation controller, fund manager, anomaly detector, ledger manager. Each service encapsulates business logic.', tech: ['Allocation Service', 'Sim Service', 'Fund Service', 'Audit Service'] },
  { id: 'eventbus', name: 'Event Bus', icon: Radio, color: 'text-yellow-400', desc: 'Pub/sub event bus that propagates state changes across services. When a road closes, the event triggers reallocation across all affected incidents.', tech: ['Pub/Sub', 'Event Sourcing', 'Real-time Updates'] },
  { id: 'sim', name: 'Simulation / Live Data', icon: Database, color: 'text-blue-400', desc: 'Deterministic simulation engine with seed=42. Generates 14 events over 15 simulation minutes. Produces realistic disaster scenarios with changing conditions.', tech: ['Seed=42', '14 Events', '15-min Duration', 'PRNG (mulberry32)'] },
  { id: 'alloc', name: 'Allocation Engine', icon: GitBranch, color: 'text-green-400', desc: 'Multi-factor optimization: severity, travel time, hospital capacity, projected ICU, blood compatibility, road conditions, ambulance type, fuel, fairness. Scores all hospitals and selects the best — not just nearest.', tech: ['Multi-factor Scoring', 'Projected Capacity', 'Fairness Weighting'] },
  { id: 'db', name: 'Database', icon: Database, color: 'text-orange-400', desc: 'PostgreSQL database storing hospitals, ambulances, incidents, decisions, ledger blocks, and fund flows. Row-level security ensures role-based access.', tech: ['PostgreSQL', 'RLS Policies', 'Indexed Queries'] },
  { id: 'ledger', name: 'Ledger', icon: ScrollText, color: 'text-purple-400', desc: 'Hash-chained ledger with Merkle roots. Every allocation, dispatch, fund movement is recorded as an immutable block. Tamper detection via chain verification.', tech: ['Hash Chain', 'Merkle Trees', 'Tamper Detection'] },
  { id: 'audit', name: 'Audit / Verification', icon: ShieldCheck, color: 'text-red-400', desc: 'Anomaly detection engine that identifies duplicate claims, ghost deliveries, over-allocation, and unusual vendor pricing using deterministic rules.', tech: ['Rule-based Detection', 'Evidence Collection', 'Investigation Tracking'] },
];

export function ArchitecturePage({ highlightId }: { highlightId: string | null }) {
  const [selected, setSelected] = useState<string | null>(null);
  const component = COMPONENTS.find(c => c.id === selected);

  return (
    <div className="p-6 max-w-4xl mx-auto" id={highlightId === 'D1' ? 'highlight-target' : undefined}>
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>System Architecture</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Click any component to see its purpose and technology stack</p>

      {/* Flow diagram */}
      <Card className="p-6 mb-4">
        <div className="flex flex-col items-center gap-2">
          {COMPONENTS.map((c, i) => (
            <div key={c.id} className="w-full flex flex-col items-center">
              <button
                onClick={() => setSelected(selected === c.id ? null : c.id)}
                className={`w-full max-w-md flex items-center gap-3 p-3 rounded-lg border transition-all ${selected === c.id ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--border)] hover:border-blue-500/30'}`}
                style={{ background: selected === c.id ? undefined : 'var(--bg-tertiary)' }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected === c.id ? 'bg-blue-500/20' : 'bg-[var(--bg-secondary)]'}`}>
                  <c.icon size={18} className={c.color} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                </div>
                {selected === c.id ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
              </button>

              {selected === c.id && (
                <div className="w-full max-w-md mt-1 p-4 rounded-lg border animate-fadeIn" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{c.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.tech.map(t => <Badge key={t} color="blue">{t}</Badge>)}
                  </div>
                </div>
              )}

              {i < COMPONENTS.length - 1 && (
                <div className="my-0.5 text-blue-500/30 text-xl">↓</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {!component && (
        <Card className="p-4 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Data flows top-down: user interactions trigger API calls, which invoke services, which read/write to the database and ledger, with all changes verified by the audit layer.
          </p>
        </Card>
      )}
    </div>
  );
}
