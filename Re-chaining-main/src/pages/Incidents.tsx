import { useStore } from '@/store';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { AlertTriangle, MapPin, Clock, Users } from 'lucide-react';

export function IncidentsPage() {
  const { incidents } = useStore();
  const sorted = [...incidents].sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'red' ? -1 : 1;
    return b.urgency - a.urgency;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Incidents</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>All active and resolved incidents in the Mumbai Monsoon Surge scenario</p>

      {incidents.length === 0 ? (
        <EmptyState title="No incidents" message="No incidents detected" icon={<AlertTriangle size={32} />} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>ID</th>
                <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Incident</th>
                <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Severity</th>
                <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Area</th>
                <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Patients</th>
                <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Red</th>
                <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Urgency</th>
                <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>SLA</th>
                <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(inc => (
                <tr key={inc.id} className="border-b hover:bg-[var(--bg-tertiary)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-2.5 px-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{inc.id}</td>
                  <td className="py-2.5 px-3" style={{ color: 'var(--text-primary)' }}>{inc.label}</td>
                  <td className="py-2.5 px-3">
                    <Badge color={inc.severity === 'red' ? 'red' : inc.severity === 'yellow' ? 'yellow' : 'green'}>{inc.severity.toUpperCase()}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{inc.area}</td>
                  <td className="py-2.5 px-3 text-right" style={{ color: 'var(--text-primary)' }}>{inc.patientCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-400">{inc.redPatients}</td>
                  <td className="py-2.5 px-3 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{inc.urgency}</td>
                  <td className="py-2.5 px-3 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{inc.slaMinutes}m</td>
                  <td className="py-2.5 px-3">
                    <Badge color={inc.status === 'active' ? 'red' : inc.status === 'assigned' ? 'blue' : inc.status === 'admitted' ? 'green' : 'gray'}>
                      {inc.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
