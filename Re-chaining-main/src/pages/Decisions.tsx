import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { Check, X, Pin, ThumbsDown, Search, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';
import type { AllocationDecision, DecisionStatus } from '@/types';

const STATUS_COLORS: Record<DecisionStatus, 'green' | 'blue' | 'purple' | 'gray' | 'yellow'> = {
  suggested: 'blue',
  approved: 'green',
  auto_applied: 'green',
  overridden: 'purple',
  stale: 'gray',
};

export function DecisionsPage({ highlightId }: { highlightId: string | null }) {
  const { decisions, dispatch, role } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const filtered = useMemo(() => {
    return decisions.filter(d => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (pinnedOnly && !d.pinned) return false;
      if (search) {
        const t = search.toLowerCase();
        return d.incidentLabel.toLowerCase().includes(t) ||
               d.selectedHospitalName.toLowerCase().includes(t) ||
               d.ambulanceId.toLowerCase().includes(t) ||
               d.id.toLowerCase().includes(t);
      }
      return true;
    });
  }, [decisions, search, statusFilter, pinnedOnly]);

  const canAct = role === 'Control Room' || role === 'Judge';

  return (
    <div className="p-6 max-w-6xl mx-auto" id={highlightId === 'O2' ? 'highlight-target' : undefined}>
      <div className="mb-5">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Decision Log</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Every allocation decision with full reasoning, alternatives, and override history
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border flex-1 max-w-xs" style={{ borderColor: 'var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search decisions..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'suggested', 'approved', 'auto_applied', 'overridden', 'stale'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${statusFilter === s ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' : ''}`}
              style={{ borderColor: statusFilter === s ? undefined : 'var(--border)', color: statusFilter === s ? undefined : 'var(--text-secondary)' }}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Button size="sm" variant={pinnedOnly ? 'primary' : 'default'} onClick={() => setPinnedOnly(!pinnedOnly)}>
          <Pin size={12} /> Pinned
        </Button>
      </div>

      {/* Decision List */}
      {filtered.length === 0 ? (
        <EmptyState title="No decisions found" message="Start the simulation or trigger events to generate allocation decisions" icon={<GitBranch size={32} />} />
      ) : (
        <div className="space-y-2">
          {filtered.map(d => (
            <Card key={d.id} className="overflow-hidden">
              {/* Summary row */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpanded(expanded === d.id ? null : d.id)}
              >
                {expanded === d.id ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{d.id.slice(0, 16)}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.incidentLabel}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>→ {d.selectedHospitalName}</span>
                </div>
                <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{d.score}</span>
                <Badge color={STATUS_COLORS[d.status]}>{d.status.replace('_', ' ')}</Badge>
                {d.pinned && <Pin size={12} className="text-blue-400" />}
              </div>

              {/* Expanded detail */}
              {expanded === d.id && (
                <div className="border-t p-4 space-y-4 animate-fadeIn" style={{ borderColor: 'var(--border)' }}>
                  {/* Decision metadata */}
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div><span style={{ color: 'var(--text-muted)' }}>Decision ID:</span> <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{d.id}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Ambulance:</span> <span className="font-mono text-blue-400">{d.ambulanceId}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Action:</span> <span style={{ color: 'var(--text-primary)' }}>{d.action}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Engine:</span> <span style={{ color: 'var(--text-primary)' }}>{d.engine}</span></div>
                  </div>

                  {/* Constraints */}
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Constraints</div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.constraints.map((c, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* WHY NOT NEAREST */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                      <div className="text-xs font-bold text-green-400 mb-2">SELECTED: {d.selectedHospitalName}</div>
                      <div className="space-y-1">
                        {d.explanation.selectedReasons.map((r, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-green-400">
                            <Check size={12} className="mt-0.5 shrink-0" /> {r}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <div className="text-xs font-bold text-red-400 mb-2">NEAREST: {d.nearestHospitalName}</div>
                      {d.nearestHospitalName === d.selectedHospitalName ? (
                        <div className="text-xs text-yellow-400">Nearest was the best option</div>
                      ) : (
                        <div className="space-y-1">
                          {d.explanation.nearestRejectedReasons.map((r, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-red-400">
                              <X size={12} className="mt-0.5 shrink-0" /> {r}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expected benefit */}
                  <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Expected benefit: <span className="font-bold text-green-400">+{d.explanation.expectedSurvivors - d.explanation.baselineSurvivors}</span> estimated survivors
                      <span className="ml-3" style={{ color: 'var(--text-muted)' }}>
                        (ReliefChain: {d.explanation.expectedSurvivors} vs Baseline: {d.explanation.baselineSurvivors})
                      </span>
                    </div>
                  </div>

                  {/* Alternatives */}
                  <div>
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Alternatives Considered</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ color: 'var(--text-muted)' }}>
                            <th className="text-left py-1 px-2">Hospital</th>
                            <th className="text-right py-1 px-2">Score</th>
                            <th className="text-right py-1 px-2">Distance</th>
                            <th className="text-right py-1 px-2">ETA</th>
                            <th className="text-left py-1 px-2">Key Reasons</th>
                            <th className="text-center py-1 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.alternatives.map(alt => (
                            <tr key={alt.hospitalId} className="border-t" style={{ borderColor: 'var(--border)' }}>
                              <td className="py-1.5 px-2" style={{ color: 'var(--text-primary)' }}>{alt.hospitalName}</td>
                              <td className="text-right py-1.5 px-2 font-mono" style={{ color: alt.accepted ? '#10b981' : 'var(--text-secondary)' }}>{alt.score}</td>
                              <td className="text-right py-1.5 px-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{alt.distance}km</td>
                              <td className="text-right py-1.5 px-2 font-mono" style={{ color: 'var(--text-secondary)' }}>{alt.etaMinutes}m</td>
                              <td className="py-1.5 px-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>{alt.reasons.slice(0, 2).join(', ')}</td>
                              <td className="text-center py-1.5 px-2">
                                {alt.accepted ? <Check size={14} className="text-green-400 inline" /> : <X size={14} className="text-red-400 inline opacity-50" />}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Override reason */}
                  {d.overrideReason && (
                    <div className="p-2 rounded border border-purple-500/20 bg-purple-500/5 text-xs">
                      <span className="font-medium text-purple-400">Override Reason:</span>
                      <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>{d.overrideReason}</span>
                    </div>
                  )}

                  {/* Actions */}
                  {canAct && d.status === 'suggested' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" onClick={() => dispatch({ type: 'APPROVE_DECISION', id: d.id })}>
                        <Check size={14} /> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => {
                        const reason = prompt('Override reason (required):');
                        if (reason) {
                          const newHosp = prompt('Redirect to hospital ID:', 'H1');
                          if (newHosp) dispatch({ type: 'OVERRIDE_DECISION', id: d.id, reason, newHospitalId: newHosp });
                        }
                      }}>
                        <ThumbsDown size={14} /> Override
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'PIN_DECISION', id: d.id })}>
                        <Pin size={14} /> {d.pinned ? 'Unpin' : 'Pin'}
                      </Button>
                    </div>
                  )}
                  {!canAct && (
                    <div className="text-xs p-2 rounded border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-center">
                      REDACTED FOR YOUR ROLE — {role} cannot approve or override decisions
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
