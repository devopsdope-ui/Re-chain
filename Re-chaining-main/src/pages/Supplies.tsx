import { useStore } from '@/store';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { Package, Truck } from 'lucide-react';

export function SuppliesPage() {
  const { supplies, supplyRequests } = useStore();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Supplies</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Medical supplies, relief materials, and active requests</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Inventory</h2>
          <div className="space-y-2">
            {supplies.map(s => (
              <Card key={s.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-blue-400" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                  </div>
                  <Badge color={s.status === 'available' ? 'green' : s.status === 'stuck' ? 'red' : s.status === 'in_transit' ? 'blue' : 'gray'}>
                    {s.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>{s.location}</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{s.quantity} {s.unit}</span>
                </div>
                {s.status === 'stuck' && <div className="text-xs text-red-400 mt-1">Truck stranded — awaiting route clearance</div>}
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Active Requests</h2>
          <div className="space-y-2">
            {supplyRequests.map(r => (
              <Card key={r.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-yellow-400" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.item}</span>
                  </div>
                  <Badge color={r.priority === 'urgent' ? 'red' : r.priority === 'high' ? 'yellow' : 'gray'}>{r.priority}</Badge>
                </div>
                <div className="text-xs space-y-0.5" style={{ color: 'var(--text-muted)' }}>
                  <div>Requester: <span style={{ color: 'var(--text-secondary)' }}>{r.requester}</span></div>
                  <div>Quantity: <span style={{ color: 'var(--text-secondary)' }}>{r.quantity} {r.unit}</span></div>
                  <div>Area: <span style={{ color: 'var(--text-secondary)' }}>{r.area}</span></div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: 'var(--text-muted)' }}>{r.status}</span>
                  </div>
                  <ProgressBar value={r.status === 'delivered' ? 100 : r.status === 'dispatched' ? 66 : r.status === 'allocated' ? 33 : 10} color={r.status === 'delivered' ? 'green' : 'blue'} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
