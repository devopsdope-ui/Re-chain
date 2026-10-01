import { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Film, Play, Pause, AlertCircle, Check } from 'lucide-react';
import { useStore } from '@/store';

export function ReplaysPage() {
  const { dispatch } = useStore();
  const [replayMode, setReplayMode] = useState(false);

  const replays = [
    { id: 'r1', name: 'Mumbai Monsoon Surge — Full Run', date: '2026-09-28', duration: '15:00', events: 14, verified: true },
    { id: 'r2', name: 'Mumbai Monsoon Surge — Chaos Test', date: '2026-09-29', duration: '12:30', events: 10, verified: true },
    { id: 'r3', name: 'Mumbai Monsoon Surge — Autopilot Demo', date: '2026-09-30', duration: '08:45', events: 6, verified: true },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Replays</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Prerecorded scenario replays — use if live simulation is unavailable</p>

      {replayMode && (
        <Card className="p-4 mb-4 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">LIVE CONNECTION UNAVAILABLE — REPLAY MODE</span>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Using saved simulation state. The judge can continue the demonstration with prerecorded data.
          </p>
          <Button size="sm" variant="primary" onClick={() => { setReplayMode(false); dispatch({ type: 'PLAY' }); }}>
            <Play size={12} /> Start Replay
          </Button>
        </Card>
      )}

      <div className="space-y-2">
        {replays.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <Film size={18} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.date} · {r.duration} · {r.events} events</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {r.verified && <Badge color="green"><Check size={10} className="inline" /> Verified</Badge>}
                <Button size="sm" variant="default" onClick={() => setReplayMode(true)}>
                  <Play size={12} /> Load
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
