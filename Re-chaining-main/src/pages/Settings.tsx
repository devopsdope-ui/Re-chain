import { useStore } from '@/store';
import { Card, Badge, Button, SectionTitle } from '@/components/ui';
import { Settings, Sun, Moon, Zap, Clock, Database } from 'lucide-react';

export function SettingsPage() {
  const { theme, dispatch, speed, simTime, ledger, decisions } = useStore();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>System configuration and preferences</p>

      <Card className="p-4 mb-4">
        <SectionTitle>Appearance</SectionTitle>
        <div className="flex gap-2">
          <Button variant={theme === 'dark' ? 'primary' : 'default'} onClick={() => dispatch({ type: 'SET_THEME', theme: 'dark' })}>
            <Moon size={14} /> Dark Mode
          </Button>
          <Button variant={theme === 'light' ? 'primary' : 'default'} onClick={() => dispatch({ type: 'SET_THEME', theme: 'light' })}>
            <Sun size={14} /> Light Mode
          </Button>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <SectionTitle>Simulation</SectionTitle>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Current time</span><span className="font-mono" style={{ color: 'var(--text-primary)' }}>T+{simTime.toFixed(1)}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Speed</span><span style={{ color: 'var(--text-primary)' }}>{speed}x</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Total decisions</span><span style={{ color: 'var(--text-primary)' }}>{decisions.length}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Ledger blocks</span><span style={{ color: 'var(--text-primary)' }}>{ledger.length}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Seed</span><span className="font-mono" style={{ color: 'var(--text-primary)' }}>42</span></div>
        </div>
        <Button variant="danger" className="mt-3" onClick={() => dispatch({ type: 'RESTART' })}>
          <Zap size={14} /> Restart Simulation
        </Button>
      </Card>

      <Card className="p-4 mb-4">
        <SectionTitle>System Info</SectionTitle>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Version</span><span style={{ color: 'var(--text-primary)' }}>1.0.0</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Scenario</span><span style={{ color: 'var(--text-primary)' }}>Mumbai Monsoon Surge</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Data mode</span><Badge color="yellow">SIMULATED</Badge></div>
        </div>
      </Card>

      <div className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
        ReliefChain — Allocate smarter. Prove everything.
      </div>
    </div>
  );
}
