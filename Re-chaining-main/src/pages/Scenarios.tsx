import { Card, Badge, Button } from '@/components/ui';
import { Library, Play, Calendar, MapPin } from 'lucide-react';

const SCENARIOS = [
  { id: 'mumbai-monsoon', name: 'Mumbai Monsoon Surge', status: 'active', events: 14, duration: '15 min', seed: 42, desc: 'Heavy rainfall causes widespread flooding across Mumbai' },
  { id: 'cyclone-odisha', name: 'Cyclone Odisha 2024', status: 'draft', events: 18, duration: '30 min', seed: 128, desc: 'Category 4 cyclone makes landfall near Puri' },
  { id: 'earthquake-delhi', name: 'Delhi Earthquake Drill', status: 'draft', events: 12, duration: '20 min', seed: 256, desc: '6.2 magnitude earthquake simulation for NCR' },
  { id: 'flood-chennai', name: 'Chennai Floods 2023', status: 'archived', events: 16, duration: '25 min', seed: 99, desc: 'Northeast monsoon causes severe urban flooding' },
];

export function ScenariosPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Scenarios</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Pre-configured disaster scenarios for testing and demonstration</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SCENARIOS.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Library size={16} className="text-blue-400" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
              </div>
              <Badge color={s.status === 'active' ? 'green' : s.status === 'draft' ? 'yellow' : 'gray'}>{s.status}</Badge>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div><span style={{ color: 'var(--text-muted)' }}>Events:</span> <span style={{ color: 'var(--text-secondary)' }}>{s.events}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Duration:</span> <span style={{ color: 'var(--text-secondary)' }}>{s.duration}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Seed:</span> <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{s.seed}</span></div>
            </div>
            <Button size="sm" variant={s.status === 'active' ? 'primary' : 'default'} disabled={s.status !== 'active'}>
              <Play size={12} /> {s.status === 'active' ? 'Load Scenario' : 'Not Available'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
