import { useStore } from '@/store';
import { Card, Badge, Button } from '@/components/ui';
import { Sliders, Weight, AlertTriangle, Save } from 'lucide-react';
import { useState } from 'react';

export function PolicyStudioPage() {
  const { dispatch } = useStore();
  const [weights, setWeights] = useState({
    distance: 3, eta: 2, icu: 40, er: 20, specialty: 25, blood: 20, road: 40, fairness: 10,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Policy Studio</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Tune allocation weights and constraints — changes affect future decisions</p>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={18} className="text-blue-400" />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Allocation Weights</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(weights).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{key} weight</span>
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{val}</span>
              </div>
              <input
                type="range" min={0} max={50} value={val}
                onChange={e => setWeights({ ...weights, [key]: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <AlertTriangle size={14} /> Policy changes will apply to all new allocation decisions. Existing decisions remain unchanged.
          </div>
        </div>

        <Button variant="primary" className="mt-4" onClick={() => dispatch({ type: 'SET_ALERT', alert: 'Policy weights saved — new decisions will use updated weights' })}>
          <Save size={14} /> Save Policy
        </Button>
      </Card>
    </div>
  );
}
