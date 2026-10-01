import { useStore } from '@/store';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { Truck, Fuel, Activity } from 'lucide-react';

export function FleetPage() {
  const { ambulances, hospitals } = useStore();

  const statusColors: Record<string, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
    idle: 'gray', dispatched: 'blue', transporting: 'yellow', returning: 'green', broken: 'red',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Fleet Management</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>All ambulances and their current status</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ambulances.map(amb => {
          const home = hospitals.find(h => h.id === amb.homeHospital);
          return (
            <Card key={amb.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${amb.status === 'broken' ? 'bg-red-500/15' : amb.status === 'dispatched' ? 'bg-blue-500/15' : 'bg-gray-500/15'}`}>
                    <Truck size={16} className={amb.status === 'broken' ? 'text-red-400' : amb.status === 'dispatched' ? 'text-blue-400' : 'text-gray-400'} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{amb.id}</div>
                    <div className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{amb.type} ambulance</div>
                  </div>
                </div>
                <Badge color={statusColors[amb.status]}>{amb.status}</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Fuel</span>
                  <span style={{ color: amb.fuel < 30 ? '#ef4444' : 'var(--text-primary)' }}>{amb.fuel}%</span>
                </div>
                <ProgressBar value={amb.fuel} color={amb.fuel < 30 ? 'red' : 'green'} />
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Home base</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{home?.name ?? amb.homeHospital}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Capability</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Level {amb.capability}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Position</span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>{amb.position.lat.toFixed(3)}, {amb.position.lng.toFixed(3)}</span>
                </div>
                {amb.assignedIncidentId && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Assigned</span>
                    <span className="font-mono text-blue-400">{amb.assignedIncidentId}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
