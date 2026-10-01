import { Card, Badge } from '@/components/ui';
import { Users, Building, Heart, Truck, Wallet, ShieldCheck, Eye } from 'lucide-react';

const STAKEHOLDERS = [
  { id: 's1', name: 'Control Room Operators', count: 12, role: 'Operational', icon: ShieldCheck, color: 'text-blue-400', desc: 'Monitor live ops, approve/override decisions, manage fleet' },
  { id: 's2', name: 'Hospitals', count: 8, role: 'Medical', icon: Building, color: 'text-green-400', desc: 'Receive patients, manage capacity, request supplies' },
  { id: 's3', name: 'Ambulance Teams', count: 12, role: 'Field', icon: Truck, color: 'text-yellow-400', desc: 'Transport patients, report field conditions' },
  { id: 's4', name: 'NGO Partners', count: 5, role: 'Relief', icon: Heart, color: 'text-red-400', desc: 'Distribute supplies, manage relief camps' },
  { id: 's5', name: 'Donors', count: 7, role: 'Funding', icon: Wallet, color: 'text-purple-400', desc: 'Pledge and track fund allocation' },
  { id: 's6', name: 'Government Bodies', count: 3, role: 'Authority', icon: Building, color: 'text-blue-400', desc: 'Policy oversight, emergency declarations' },
];

export function StakeholdersPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Stakeholders</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Organizations and teams involved in the disaster response</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {STAKEHOLDERS.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</div>
                <Badge color="gray">{s.count} active</Badge>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            <div className="mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>Role: {s.role}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
