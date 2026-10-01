import { useStore } from '@/store';
import { Badge, Button } from '@/components/ui';
import { Check, X, MapPin, Fuel, Activity, AlertCircle, Pin, ThumbsDown } from 'lucide-react';
import type { Incident, Ambulance, Hospital, Road, AllocationDecision } from '@/types';

interface ContextDrawerProps {
  type: 'incident' | 'ambulance' | 'hospital';
  data: Incident | Ambulance | Hospital;
  hospitals: Hospital[];
  ambulances: Ambulance[];
  incidents: Incident[];
  decisions: AllocationDecision[];
  roads: Road[];
  onAllocate: (incident: Incident) => void;
  onApprove: (decisionId: string) => void;
  onOverride: (decisionId: string, reason: string, hospitalId: string) => void;
  onClose: () => void;
}

export function ContextDrawer({ type, data, hospitals, ambulances, incidents, decisions, roads, onAllocate, onApprove, onOverride, onClose }: ContextDrawerProps) {
  const { role } = useStore();

  if (type === 'incident') return <IncidentDrawer data={data as Incident} hospitals={hospitals} ambulances={ambulances} decisions={decisions} roads={roads} onAllocate={onAllocate} onApprove={onApprove} onOverride={onOverride} onClose={onClose} role={role} />;
  if (type === 'ambulance') return <AmbulanceDrawer data={data as Ambulance} hospitals={hospitals} incidents={incidents} onClose={onClose} />;
  if (type === 'hospital') return <HospitalDrawer data={data as Hospital} incidents={incidents} onClose={onClose} role={role} />;
  return null;
}

function IncidentDrawer({ data, hospitals, ambulances, decisions, roads, onAllocate, onApprove, onOverride, onClose, role }: {
  data: Incident; hospitals: Hospital[]; ambulances: Ambulance[]; decisions: AllocationDecision[]; roads: Road[];
  onAllocate: (i: Incident) => void; onApprove: (id: string) => void; onOverride: (id: string, reason: string, hospId: string) => void; onClose: () => void; role: string;
}) {
  const decision = decisions.find(d => d.incidentId === data.id);
  const sevColor = data.severity === 'red' ? 'red' : data.severity === 'yellow' ? 'yellow' : 'green';

  return (
    <div className="animate-fadeIn">
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${data.severity === 'red' ? 'bg-red-400 animate-pulse-dot' : 'bg-yellow-400'}`} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{data.id}</h3>
          <Badge color={sevColor as 'red' | 'yellow' | 'green'}>{data.severity.toUpperCase()}</Badge>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-tertiary)]"><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{data.label}</h4>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{data.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Location</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{data.area}</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Urgency</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{data.urgency}/100</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Patients</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{data.patientCount} total</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Critical (Red)</div>
            <div className="font-medium text-red-400">{data.redPatients}</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>SLA</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{data.slaMinutes} min</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Blood Needed</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{data.bloodNeeded.join(', ')}</div>
          </div>
        </div>

        {/* Assignment status */}
        {data.status === 'active' && (
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <div className="text-xs font-medium text-yellow-400 mb-1">Unassigned — Awaiting Allocation</div>
            <Button size="sm" variant="primary" onClick={() => onAllocate(data)} className="w-full">
              Allocate Resources
            </Button>
          </div>
        )}

        {/* Decision explanation */}
        {decision && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-tertiary)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Allocation Decision</span>
                <Badge color={decision.status === 'approved' ? 'green' : decision.status === 'overridden' ? 'purple' : decision.status === 'stale' ? 'gray' : 'blue'}>
                  {decision.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div>Decision ID: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{decision.id.slice(0, 20)}</span></div>
                <div>Ambulance: <span className="font-mono text-blue-400">{decision.ambulanceId}</span></div>
                <div>Score: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{decision.score}</span></div>
                {data.etaMinutes && <div>ETA: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{data.etaMinutes} min</span></div>}
              </div>
            </div>

            {/* WHY THIS HOSPITAL? */}
            <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <div className="text-xs font-bold mb-2 text-blue-400">WHY THIS HOSPITAL?</div>

              <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                Selected: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{decision.selectedHospitalName}</span>
              </div>

              {decision.nearestHospitalName !== decision.selectedHospitalName && (
                <div className="mb-2">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Nearest: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{decision.nearestHospitalName}</span>
                  </div>
                  <div className="text-xs font-medium text-red-400 mb-1">Rejected because:</div>
                  <div className="space-y-1">
                    {decision.explanation.nearestRejectedReasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-red-400">
                        <X size={12} className="mt-0.5 shrink-0" /> {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs font-medium text-green-400 mb-1">Selected because:</div>
              <div className="space-y-1">
                {decision.explanation.selectedReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-green-400">
                    <Check size={12} className="mt-0.5 shrink-0" /> {r}
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Expected benefit: <span className="font-bold text-green-400">+{decision.explanation.expectedSurvivors - decision.explanation.baselineSurvivors}</span> estimated survivors
                </div>
              </div>
            </div>

            {/* Alternatives */}
            <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Alternatives Considered</div>
              <div className="space-y-1.5">
                {decision.alternatives.map(alt => (
                  <div key={alt.hospitalId} className={`flex items-center justify-between text-xs p-1.5 rounded ${alt.accepted ? 'bg-green-500/10' : ''}`}>
                    <div>
                      <span style={{ color: alt.accepted ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{alt.hospitalName}</span>
                      <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>{alt.etaMinutes}min · {alt.distance}km</span>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: alt.accepted ? '#10b981' : 'var(--text-muted)' }}>{alt.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {role === 'Control Room' || role === 'Judge' ? (
              <div className="flex gap-2">
                {decision.status === 'suggested' && (
                  <Button size="sm" variant="primary" onClick={() => onApprove(decision.id)} className="flex-1">
                    <Check size={14} /> Approve
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => {
                  const reason = prompt('Override reason (required):');
                  if (reason) {
                    const newHosp = prompt('Redirect to hospital ID (e.g. H1):', 'H1');
                    if (newHosp) onOverride(decision.id, reason, newHosp);
                  }
                }} className="flex-1">
                  <ThumbsDown size={14} /> Override
                </Button>
                <Button size="sm" variant="ghost" onClick={() => useStore().dispatch({ type: 'PIN_DECISION', id: decision.id })}>
                  <Pin size={14} />
                </Button>
              </div>
            ) : (
              <div className="text-xs p-2 rounded border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-center">
                REDACTED FOR YOUR ROLE — {role} cannot approve decisions
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AmbulanceDrawer({ data, hospitals, incidents, onClose }: { data: Ambulance; hospitals: Hospital[]; incidents: Incident[]; onClose: () => void }) {
  const assignedIncident = incidents.find(i => i.id === data.assignedIncidentId);
  const assignedHosp = hospitals.find(h => h.id === data.assignedHospitalId);
  const homeHosp = hospitals.find(h => h.id === data.homeHospital);

  const statusColors: Record<string, string> = {
    idle: 'gray', dispatched: 'blue', transporting: 'yellow', returning: 'green', broken: 'red',
  };

  return (
    <div className="animate-fadeIn">
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{data.id}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-tertiary)]"><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Type</div>
            <div className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{data.type}</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Status</div>
            <div className="font-medium capitalize" style={{ color: `var(--text-${statusColors[data.status] === 'gray' ? 'muted' : 'primary'})` }}>{data.status}</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Fuel</div>
            <div className="flex items-center gap-1.5">
              <Fuel size={12} style={{ color: data.fuel < 30 ? '#ef4444' : 'var(--text-primary)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{data.fuel}%</span>
            </div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Capability</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Level {data.capability}</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Home Base</div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{homeHosp?.name ?? data.homeHospital}</div>
          </div>
          <div className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Position</div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--text-primary)' }}>{data.position.lat.toFixed(4)}, {data.position.lng.toFixed(4)}</div>
          </div>
        </div>

        {assignedIncident && (
          <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
            <div className="text-xs font-medium text-blue-400 mb-1">Current Assignment</div>
            <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <div>Incident: <span style={{ color: 'var(--text-primary)' }}>{assignedIncident.label}</span></div>
              {assignedHosp && <div>Destination: <span style={{ color: 'var(--text-primary)' }}>{assignedHosp.name}</span></div>}
              {assignedIncident.etaMinutes && <div>ETA: <span className="text-blue-400">{assignedIncident.etaMinutes} min</span></div>}
            </div>
          </div>
        )}

        {data.status === 'broken' && (
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 text-xs font-medium text-red-400">
              <AlertCircle size={14} /> Vehicle out of service
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HospitalDrawer({ data, incidents, onClose, role }: { data: Hospital; incidents: Incident[]; onClose: () => void; role: string }) {
  const incomingIncidents = incidents.filter(i => i.assignedHospitalId === data.id && (i.status === 'assigned' || i.status === 'transporting'));
  const icuAvail = data.capacity.icu - data.occupied.icu;
  const erAvail = data.capacity.er - data.occupied.er;
  const canSeeBlood = role !== 'Public';

  return (
    <div className="animate-fadeIn">
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-green-400" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{data.name}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-tertiary)]"><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Badge color={data.status === 'operational' ? 'green' : data.status === 'power_failure' ? 'yellow' : 'red'}>
            {data.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.area} · {data.specialty.join(', ')}</span>
        </div>

        <div className="space-y-2">
          <CapacityBar label="ICU" occupied={data.occupied.icu} capacity={data.capacity.icu} />
          <CapacityBar label="ER" occupied={data.occupied.er} capacity={data.capacity.er} />
          <CapacityBar label="Ward" occupied={data.occupied.ward} capacity={data.capacity.ward} />
        </div>

        {canSeeBlood ? (
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Blood Inventory</div>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(data.blood).map(([type, qty]) => (
                <div key={type} className="p-1.5 rounded border text-center" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{type}</div>
                  <div className="text-xs" style={{ color: qty < 5 ? '#ef4444' : 'var(--text-secondary)' }}>{qty}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs p-2 rounded border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-center">
            REDACTED FOR YOUR ROLE
          </div>
        )}

        {incomingIncidents.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Incoming ({incomingIncidents.length})</div>
            <div className="space-y-1.5">
              {incomingIncidents.map(inc => (
                <div key={inc.id} className="flex items-center justify-between text-xs p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{inc.label}</span>
                  <span className="text-blue-400 font-mono">{inc.etaMinutes ?? '—'}min</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CapacityBar({ label, occupied, capacity }: { label: string; occupied: number; capacity: number }) {
  const pct = (occupied / capacity) * 100;
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{occupied}/{capacity} ({Math.round(pct)}%)</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
