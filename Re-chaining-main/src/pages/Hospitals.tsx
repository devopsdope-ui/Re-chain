import { useStore } from '@/store';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { Building2, MapPin } from 'lucide-react';

export function HospitalsPage() {
  const { hospitals, incidents, role } = useStore();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Hospitals</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Hospital capacity, blood inventory, and live status</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {hospitals.map(h => {
          const icuPct = (h.occupied.icu / h.capacity.icu) * 100;
          const erPct = (h.occupied.er / h.capacity.er) * 100;
          const incoming = incidents.filter(i => i.assignedHospitalId === h.id && (i.status === 'assigned' || i.status === 'transporting'));
          return (
            <Card key={h.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                    <Building2 size={16} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{h.name}</div>
                    <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={10} /> {h.area} · {h.specialty.join(', ')}
                    </div>
                  </div>
                </div>
                <Badge color={h.status === 'operational' ? 'green' : h.status === 'power_failure' ? 'yellow' : 'red'}>
                  {h.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-muted)' }}>ICU</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{h.occupied.icu}/{h.capacity.icu}</span>
                  </div>
                  <ProgressBar value={h.occupied.icu} max={h.capacity.icu} color={icuPct > 90 ? 'red' : icuPct > 70 ? 'yellow' : 'green'} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-muted)' }}>ER</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{h.occupied.er}/{h.capacity.er}</span>
                  </div>
                  <ProgressBar value={h.occupied.er} max={h.capacity.er} color={erPct > 90 ? 'red' : erPct > 70 ? 'yellow' : 'green'} />
                </div>
              </div>

              {role !== 'Public' ? (
                <div>
                  <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Blood Inventory</div>
                  <div className="grid grid-cols-8 gap-1">
                    {Object.entries(h.blood).map(([type, qty]) => (
                      <div key={type} className="text-center p-1 rounded border" style={{ borderColor: 'var(--border)' }}>
                        <div className="text-[9px] font-bold" style={{ color: 'var(--text-primary)' }}>{type}</div>
                        <div className="text-xs" style={{ color: qty < 5 ? '#ef4444' : 'var(--text-secondary)' }}>{qty}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs p-2 rounded border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-center">REDACTED FOR YOUR ROLE</div>
              )}

              {incoming.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Incoming ({incoming.length})</div>
                  {incoming.map(inc => (
                    <div key={inc.id} className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>{inc.label}</span>
                      <span className="text-blue-400 font-mono">{inc.etaMinutes ?? '—'}m</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
