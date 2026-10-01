import { Card, Badge } from '@/components/ui';
import { Plug, Check, AlertCircle } from 'lucide-react';

const INTEGRATIONS = [
  { id: 'i1', name: 'Mumbai Emergency Services (112)', status: 'connected', type: 'API', desc: 'Receives emergency calls and auto-creates incidents' },
  { id: 'i2', name: 'Hospital Information System (HIS)', status: 'connected', type: 'HL7 FHIR', desc: 'Syncs hospital capacity and patient admissions' },
  { id: 'i3', name: 'IMD Weather Service', status: 'connected', type: 'API', desc: 'Real-time rainfall and flood alerts' },
  { id: 'i4', name: 'Google Maps Traffic', status: 'connected', type: 'API', desc: 'Road conditions and traffic data' },
  { id: 'i5', name: 'Blood Bank Network', status: 'degraded', type: 'API', desc: 'City-wide blood inventory tracking' },
  { id: 'i6', name: 'Aadhaar Identity Service', status: 'connected', type: 'Govt API', desc: 'Beneficiary identity verification' },
  { id: 'i7', name: 'RBI Payment Gateway', status: 'connected', type: 'Financial', desc: 'Fund transfer and escrow management' },
  { id: 'i8', name: 'Drone Surveillance Feed', status: 'disconnected', type: 'Video', desc: 'Aerial damage assessment (awaiting deployment)' },
];

export function IntegrationsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Integrations</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>External systems connected to ReliefChain</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INTEGRATIONS.map(i => (
          <Card key={i.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i.status === 'connected' ? 'bg-green-500/15' : i.status === 'degraded' ? 'bg-yellow-500/15' : 'bg-red-500/15'}`}>
                  <Plug size={18} className={i.status === 'connected' ? 'text-green-400' : i.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{i.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{i.type}</div>
                </div>
              </div>
              <Badge color={i.status === 'connected' ? 'green' : i.status === 'degraded' ? 'yellow' : 'red'}>
                {i.status === 'connected' ? <Check size={10} className="inline" /> : <AlertCircle size={10} className="inline" />} {i.status}
              </Badge>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{i.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
