import { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { allocate } from '@/sim/alloc';
import { createBlock } from '@/sim/ledger';
import { Badge, Button } from '@/components/ui';
import { MapView } from '@/components/MapView';
import { ContextDrawer } from '@/components/ContextDrawer';
import { ChaosConsole } from '@/components/ChaosConsole';
import { Zap, Waves, Power, Truck, TrendingUp, Droplet, Terminal, X } from 'lucide-react';
import type { Incident, Ambulance, Hospital } from '@/types';

export function LiveOpsPage({ highlightId }: { highlightId: string | null }) {
  const { incidents, ambulances, hospitals, roads, decisions, simTime, dispatch, running, autopilotActive } = useStore();
  const [selectedType, setSelectedType] = useState<'incident' | 'ambulance' | 'hospital' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showChaos, setShowChaos] = useState(false);
  const [chaosCommand, setChaosCommand] = useState('');

  const selected = useMemo(() => {
    if (!selectedType || !selectedId) return null;
    if (selectedType === 'incident') return incidents.find(i => i.id === selectedId);
    if (selectedType === 'ambulance') return ambulances.find(a => a.id === selectedId);
    if (selectedType === 'hospital') return hospitals.find(h => h.id === selectedId);
    return null;
  }, [selectedType, selectedId, incidents, ambulances, hospitals]);

  const sortedIncidents = useMemo(() =>
    [...incidents].sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'red' ? -1 : 1;
      return b.urgency - a.urgency;
    }), [incidents]);

  const handleSelect = (type: 'incident' | 'ambulance' | 'hospital', id: string) => {
    setSelectedType(type);
    setSelectedId(id);
  };

  const handleManualAllocate = (incident: Incident) => {
    const decision = allocate(incident, ambulances, hospitals, roads, 'reliefchain', simTime);
    if (decision) {
      dispatch({ type: 'ADD_LEDGER', entries: [{
        type: 'dispatch',
        description: `${decision.ambulanceId} dispatched to ${incident.label} → ${decision.selectedHospitalName}`,
        entityId: decision.ambulanceId,
      }]});
    }
  };

  const handleChaos = (action: string) => {
    dispatch({ type: 'CHAOS', action });
    setShowChaos(false);
  };

  const handleChaosCommand = () => {
    if (chaosCommand.trim()) {
      dispatch({ type: 'CHAOS', action: chaosCommand.trim() });
      setChaosCommand('');
      setShowChaos(false);
    }
  };

  return (
    <div className="flex h-full" id={highlightId === 'O1' || highlightId === 'O3' || highlightId === 'D2' ? 'highlight-target' : undefined}>
      {/* Left: Incident Queue */}
      <div className="w-72 shrink-0 border-r overflow-y-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Incident Queue</h2>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sortedIncidents.filter(i => i.status === 'active' || i.status === 'assigned').length} active</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowChaos(!showChaos)}>
            <Zap size={14} className="text-yellow-400" /> Chaos
          </Button>
        </div>

        {showChaos && (
          <div className="p-3 border-b animate-fadeIn" style={{ borderColor: 'var(--border)' }}>
            <ChaosConsole onAction={handleChaos} />
            <div className="flex gap-1.5 mt-2">
              <input
                value={chaosCommand}
                onChange={e => setChaosCommand(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChaosCommand()}
                placeholder="close Sion Circle"
                className="flex-1 text-xs px-2 py-1.5 rounded border bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <Button size="sm" variant="primary" onClick={handleChaosCommand}>
                <Terminal size={12} />
              </Button>
            </div>
          </div>
        )}

        <div className="p-2 space-y-1.5">
          {sortedIncidents.map(inc => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              selected={selectedType === 'incident' && selectedId === inc.id}
              onClick={() => handleSelect('incident', inc.id)}
              onAllocate={() => handleManualAllocate(inc)}
            />
          ))}
        </div>
      </div>

      {/* Center: Map */}
      <div className="flex-1 relative overflow-hidden">
        <MapView
          incidents={incidents}
          ambulances={ambulances}
          hospitals={hospitals}
          roads={roads}
          selectedType={selectedType}
          selectedId={selectedId}
          onSelect={handleSelect}
          simTime={simTime}
        />
      </div>

      {/* Right: Context Drawer */}
      <div className="w-80 shrink-0 border-l overflow-y-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        {selected ? (
          <ContextDrawer
            type={selectedType!}
            data={selected}
            hospitals={hospitals}
            ambulances={ambulances}
            incidents={incidents}
            decisions={decisions}
            roads={roads}
            onAllocate={handleManualAllocate}
            onApprove={(id) => dispatch({ type: 'APPROVE_DECISION', id })}
            onOverride={(id, reason, hospId) => dispatch({ type: 'OVERRIDE_DECISION', id, reason, newHospitalId: hospId })}
            onClose={() => { setSelectedType(null); setSelectedId(null); }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-full border flex items-center justify-center mb-3" style={{ borderColor: 'var(--border)' }}>
              <Zap size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Context Drawer</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Click an incident, ambulance, or hospital on the map or in the queue to see allocation details and reasoning.
            </p>
          </div>
        )}
      </div>

      {autopilotActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg border shadow-lg z-50 flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Autopilot Running</span>
          <Button size="sm" variant="danger" onClick={() => dispatch({ type: 'AUTOPILOT_STOP' })}>Stop</Button>
        </div>
      )}
    </div>
  );
}

function IncidentCard({ incident, selected, onClick, onAllocate }: { incident: Incident; selected: boolean; onClick: () => void; onAllocate: () => void }) {
  const slaRemaining = Math.max(0, incident.slaMinutes - (incident.createdAt || 0));
  const sevColor = incident.severity === 'red' ? 'red' : incident.severity === 'yellow' ? 'yellow' : 'green';
  const statusColors: Record<string, string> = {
    active: 'text-red-400',
    assigned: 'text-blue-400',
    transporting: 'text-yellow-400',
    admitted: 'text-green-400',
    resolved: 'text-gray-400',
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${selected ? 'border-blue-500 bg-blue-500/5' : 'border-transparent hover:border-[var(--border)]'}`}
      style={{ background: selected ? undefined : 'var(--bg-tertiary)' }}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${incident.severity === 'red' ? 'bg-red-400 animate-pulse-dot' : incident.severity === 'yellow' ? 'bg-yellow-400' : 'bg-green-400'}`} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{incident.id}</span>
        </div>
        <Badge color={sevColor as 'red' | 'yellow' | 'green'}>{incident.severity.toUpperCase()}</Badge>
      </div>
      <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{incident.label}</div>
      <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{incident.area} · {incident.patientCount} patients ({incident.redPatients}R · {incident.yellowPatients}Y · {incident.greenPatients}G)</div>
      <div className="flex items-center justify-between text-[10px]">
        <span className={statusColors[incident.status]}>{incident.status.toUpperCase()}</span>
        <span style={{ color: 'var(--text-muted)' }}>SLA: {slaRemaining}m · ETA: {incident.etaMinutes ?? '—'}m</span>
      </div>
      {incident.status === 'active' && (
        <button
          onClick={(e) => { e.stopPropagation(); onAllocate(); }}
          className="w-full mt-2 text-[10px] py-1 rounded border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors"
        >
          Allocate Now
        </button>
      )}
    </div>
  );
}
