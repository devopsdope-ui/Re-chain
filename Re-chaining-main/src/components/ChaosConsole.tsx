import { Waves, Power, Truck, TrendingUp, Construction, Droplet } from 'lucide-react';

const CHAOS_BUTTONS = [
  { label: 'Flood Andheri Subway', icon: Waves, color: 'text-blue-400' },
  { label: 'Hospital Loses Power', icon: Power, color: 'text-yellow-400' },
  { label: 'Kill 5 Ambulances', icon: Truck, color: 'text-red-400' },
  { label: 'Surge x2', icon: TrendingUp, color: 'text-orange-400' },
  { label: 'Block Bridge', icon: Construction, color: 'text-red-400' },
  { label: 'Blood Shortage', icon: Droplet, color: 'text-red-400' },
];

export function ChaosConsole({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Chaos Console</div>
      <div className="grid grid-cols-2 gap-1.5">
        {CHAOS_BUTTONS.map(btn => (
          <button
            key={btn.label}
            onClick={() => onAction(btn.label)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded border text-[11px] hover:bg-[var(--bg-tertiary)] transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <btn.icon size={12} className={btn.color} />
            <span className="truncate">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
