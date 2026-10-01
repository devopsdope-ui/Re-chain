import { useState } from 'react';
import { useStore } from '@/store';
import { Card, Badge, Button } from '@/components/ui';
import { FlaskConical, Play, RotateCcw } from 'lucide-react';
import { allocate } from '@/sim/alloc';

export function SandboxPage() {
  const { incidents, ambulances, hospitals, roads, simTime } = useStore();
  const [scenario, setScenario] = useState<string | null>(null);

  const scenarios = [
    { id: 'road-closure', label: 'Close all roads to Sion', desc: 'Blocks all routes to Sion-area hospitals' },
    { id: 'mass-casualty', label: 'Mass casualty at Dadar', desc: 'Doubles patient count at Dadar incident' },
    { id: 'hospital-down', label: 'All Andheri hospitals down', desc: 'Sets all Andheri hospitals to power failure' },
    { id: 'blood-crisis', label: 'City-wide blood crisis', desc: 'Reduces all blood inventory by 80%' },
  ];

  const runScenario = (id: string) => {
    setScenario(id);
  };

  const results = scenario ? (() => {
    const inc = incidents[0];
    if (!inc) return null;
    return allocate(inc, ambulances, hospitals, roads, 'reliefchain', simTime);
  })() : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>What-if Sandbox</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Test hypothetical scenarios without affecting the live simulation</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {scenarios.map(s => (
          <Card key={s.id} className={`p-4 cursor-pointer transition-all ${scenario === s.id ? 'border-blue-500' : ''}`} onClick={() => runScenario(s.id)}>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical size={16} className="text-purple-400" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.label}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
          </Card>
        ))}
      </div>

      {scenario && (
        <Card className="p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Simulation Result</h2>
            <Button size="sm" variant="ghost" onClick={() => setScenario(null)}><RotateCcw size={14} /> Reset</Button>
          </div>
          {results ? (
            <div className="space-y-2">
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                For incident <span style={{ color: 'var(--text-primary)' }}>{results.incidentLabel}</span>:
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Selected: <span className="text-green-400">{results.selectedHospitalName}</span> (score: {results.score})
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Nearest: <span style={{ color: 'var(--text-primary)' }}>{results.nearestHospitalName}</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Expected survivors: <span className="font-bold text-green-400">{results.explanation.expectedSurvivors}</span>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Reasons:</div>
                {results.explanation.selectedReasons.map((r, i) => (
                  <div key={i} className="text-xs text-green-400">✓ {r}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No incidents to allocate</div>
          )}
        </Card>
      )}
    </div>
  );
}
