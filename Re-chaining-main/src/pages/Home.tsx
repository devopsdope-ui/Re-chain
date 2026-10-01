import { useStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Card, StatCard, Badge, Button, SectionTitle, ProgressBar } from '@/components/ui';
import { formatINR } from '@/sim/ledger';
import {
  AlertTriangle, Truck, Heart, Droplet, Activity, Clock,
  Building, Package, Shield, ArrowRight, Zap, GitBranch, Wallet, ScrollText, TrendingUp, Users,
} from 'lucide-react';
import type { Role } from '@/types';

export function HomePage({ highlightId }: { highlightId: string | null }) {
  const { stats, incidents, decisions, hospitals, ambulances, funds, anomalies, ledger, role, dispatch, autopilotActive } = useStore();
  const navigate = useNavigate();

  const criticalIncidents = incidents.filter(i => i.severity === 'red' && i.status !== 'resolved');
  const recentDecisions = [...decisions].slice(-5).reverse();
  const pendingDecisions = decisions.filter(d => d.status === 'suggested');
  const hospitalOverloads = hospitals.filter(h => h.status !== 'operational');
  const totalFunds = funds.reduce((s, f) => s + f.amount, 0);

  const quickActions = [
    { label: 'Live Ops', path: '/live-ops', icon: Activity },
    { label: 'Decisions', path: '/decisions', icon: GitBranch },
    { label: 'Compare', path: '/compare', icon: TrendingUp },
    { label: 'Ledger', path: '/ledger', icon: ScrollText },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" id={highlightId === 'O1' ? 'highlight-target' : undefined}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {role === 'Judge' ? 'Judge Dashboard' : role === 'Donor' ? 'Donor Portal' : role === 'Public' ? 'Public Dashboard' : 'Mission Control'}
            </h1>
            <Badge color="red">Mumbai Monsoon Surge</Badge>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            SIMULATED DATA — FOR DEMONSTRATION ONLY · Disaster response coordination platform
          </p>
        </div>
        {!autopilotActive && (
          <Button variant="primary" onClick={() => dispatch({ type: 'AUTOPILOT_START' })}>
            <Zap size={14} /> Run Autopilot
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Critical Incidents" value={criticalIncidents.length} icon={<AlertTriangle size={16} />} color="text-red-400" sub={`${incidents.filter(i => i.status === 'active').length} awaiting allocation`} />
        <StatCard label="Active Ambulances" value={stats.activeAmbulances} icon={<Truck size={16} />} color="text-blue-400" sub={`${Math.round((stats.activeAmbulances / ambulances.length) * 100)}% utilization`} />
        <StatCard label="ICU Available" value={stats.icuAvailability} icon={<Heart size={16} />} color="text-green-400" sub={`${stats.icuOverloads} hospitals overloaded`} />
        <StatCard label="Blood Units" value={stats.bloodAvailability} icon={<Droplet size={16} />} color="text-red-400" sub="Across all hospitals" />
        <StatCard label="Pending Decisions" value={pendingDecisions.length} icon={<GitBranch size={16} />} color="text-yellow-400" sub="Awaiting approval" />
        <StatCard label="Est. Survivors" value={stats.estimatedSurvivors} icon={<Users size={16} />} color="text-green-400" sub={`Baseline: ${stats.baselineSurvivors}`} />
        <StatCard label="Avg Red Treatment" value={`${stats.avgRedTreatmentTime}m`} icon={<Clock size={16} />} color="text-blue-400" sub={`Worst: ${stats.worstTreatmentTime}m`} />
        <StatCard label="Equity Score" value={`${stats.equityScore}/100`} icon={<TrendingUp size={16} />} color="text-green-400" sub="Fairness across areas" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Needs Attention */}
        <Card className="p-4">
          <SectionTitle>Needs Attention</SectionTitle>
          <div className="space-y-2">
            {criticalIncidents.slice(0, 3).map(inc => (
              <div key={inc.id} className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-dot" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{inc.label}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{inc.redPatients} critical · {inc.area}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate('/live-ops')}>View</Button>
              </div>
            ))}
            {hospitalOverloads.map(h => (
              <div key={h.id} className="flex items-center gap-2 p-2 rounded border border-yellow-500/20" style={{ borderColor: 'var(--border)' }}>
                <Building size={14} className="text-yellow-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{h.name}</div>
                  <div className="text-[10px] text-yellow-400">{h.status.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
            {anomalies.filter(a => a.status === 'new' || a.status === 'escalated').slice(0, 2).map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded border border-red-500/20" style={{ borderColor: 'var(--border)' }}>
                <Shield size={14} className="text-red-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.title}</div>
                  <div className="text-[10px] text-red-400">{a.severity} anomaly</div>
                </div>
              </div>
            ))}
            {criticalIncidents.length === 0 && hospitalOverloads.length === 0 && (
              <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>All systems nominal</div>
            )}
          </div>
        </Card>

        {/* Recent Decisions */}
        <Card className="p-4">
          <SectionTitle action={<Button size="sm" variant="ghost" onClick={() => navigate('/decisions')}>All <ArrowRight size={12} /></Button>}>Recent Decisions</SectionTitle>
          <div className="space-y-2">
            {recentDecisions.length === 0 ? (
              <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No decisions yet — start the simulation</div>
            ) : recentDecisions.map(d => (
              <div key={d.id} className="p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{d.incidentLabel}</span>
                  <Badge color={d.status === 'approved' ? 'green' : d.status === 'overridden' ? 'purple' : d.status === 'stale' ? 'gray' : 'blue'}>
                    {d.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  → {d.selectedHospitalName} · Score: {d.score} · +{d.explanation.expectedSurvivors - d.explanation.baselineSurvivors} survivors
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions + Recent Ledger */}
        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(a => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:border-blue-500/50 transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <a.icon size={18} className="text-blue-400" />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle action={<Button size="sm" variant="ghost" onClick={() => navigate('/ledger')}>All <ArrowRight size={12} /></Button>}>Recent Ledger Activity</SectionTitle>
            <div className="space-y-1.5">
              {ledger.slice(-4).reverse().map(block => (
                <div key={block.index} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>#{block.index}</span>
                  <span className="flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{block.entries[0]?.description ?? 'Empty'}</span>
                  {block.verified && <span className="text-green-400 text-[10px]">✓</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Fund summary */}
      <Card className="p-4 mt-4">
        <SectionTitle action={<Button size="sm" variant="ghost" onClick={() => navigate('/funds')}>Details <ArrowRight size={12} /></Button>}>Emergency Fund Pool</SectionTitle>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Pledged', value: funds.filter(f => f.stage === 'pledged').reduce((s, f) => s + f.amount, 0), color: 'text-yellow-400' },
            { label: 'Allocated', value: funds.filter(f => f.stage === 'allocated').reduce((s, f) => s + f.amount, 0), color: 'text-blue-400' },
            { label: 'Released', value: funds.filter(f => f.stage === 'released').reduce((s, f) => s + f.amount, 0), color: 'text-purple-400' },
            { label: 'Delivered', value: funds.filter(f => f.stage === 'delivered').reduce((s, f) => s + f.amount, 0), color: 'text-green-400' },
            { label: 'Verified', value: funds.filter(f => f.stage === 'verified').reduce((s, f) => s + f.amount, 0), color: 'text-green-400' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              <div className={`text-sm font-bold ${s.color}`}>{formatINR(s.value)}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ProgressBar value={funds.filter(f => f.stage === 'verified' || f.stage === 'delivered').reduce((s, f) => s + f.amount, 0)} max={totalFunds} color="green" />
        </div>
      </Card>
    </div>
  );
}
