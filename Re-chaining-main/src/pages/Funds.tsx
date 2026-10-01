import { useStore } from '@/store';
import { Card, Badge, Button, SectionTitle, ProgressBar } from '@/components/ui';
import { formatINR } from '@/sim/ledger';
import { Wallet, ArrowRight, Building, Users, Truck, Check, ChevronRight } from 'lucide-react';

export function FundsPage({ highlightId }: { highlightId: string | null }) {
  const { funds, dispatch } = useStore();

  const totalPledged = funds.filter(f => f.stage === 'pledged').reduce((s, f) => s + f.amount, 0);
  const totalAllocated = funds.filter(f => f.stage === 'allocated').reduce((s, f) => s + f.amount, 0);
  const totalReleased = funds.filter(f => f.stage === 'released').reduce((s, f) => s + f.amount, 0);
  const totalDelivered = funds.filter(f => f.stage === 'delivered').reduce((s, f) => s + f.amount, 0);
  const totalVerified = funds.filter(f => f.stage === 'verified').reduce((s, f) => s + f.amount, 0);
  const totalAll = funds.reduce((s, f) => s + f.amount, 0);

  const stages = [
    { label: 'Pledged', value: totalPledged, color: 'bg-yellow-500', text: 'text-yellow-400' },
    { label: 'Allocated', value: totalAllocated, color: 'bg-blue-500', text: 'text-blue-400' },
    { label: 'Released', value: totalReleased, color: 'bg-purple-500', text: 'text-purple-400' },
    { label: 'Delivered', value: totalDelivered, color: 'bg-green-500', text: 'text-green-400' },
    { label: 'Verified', value: totalVerified, color: 'bg-green-600', text: 'text-green-500' },
  ];

  const flowSteps = ['Donors', 'Emergency Pool', 'Tranches', 'Escrow', 'NGO / Hospital / Vendor', 'Delivery', 'Verification'];

  return (
    <div className="p-6 max-w-5xl mx-auto" id={highlightId === 'O4' ? 'highlight-target' : undefined}>
      <div className="mb-5">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Emergency Funds</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Total pool: {formatINR(totalAll)} — tracking fund flow from donors to verified delivery
        </p>
      </div>

      {/* Sankey-style flow */}
      <Card className="p-4 mb-4">
        <SectionTitle>Fund Flow Pipeline</SectionTitle>
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-4">
          {flowSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  i === 0 ? 'border-yellow-500/50 bg-yellow-500/10' :
                  i === flowSteps.length - 1 ? 'border-green-500/50 bg-green-500/10' :
                  'border-blue-500/50 bg-blue-500/10'
                }`}>
                  {i === 0 ? <Users size={18} className="text-yellow-400" /> :
                   i === flowSteps.length - 1 ? <Check size={18} className="text-green-400" /> :
                   i === flowSteps.length - 2 ? <Truck size={18} className="text-blue-400" /> :
                   <Building size={18} className="text-blue-400" />}
                </div>
                <div className="text-[10px] mt-1 text-center max-w-[80px]" style={{ color: 'var(--text-secondary)' }}>{step}</div>
              </div>
              {i < flowSteps.length - 1 && <ChevronRight size={16} className="text-blue-500/30" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Stage summary */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {stages.map(s => (
          <Card key={s.label} className="p-3">
            <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className={`text-sm font-bold ${s.text}`}>{formatINR(s.value)}</div>
            <div className="mt-1.5">
              <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: `${(s.value / totalAll) * 100}%` }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Donor list */}
      <Card className="p-4">
        <SectionTitle>Donor Transactions</SectionTitle>
        <div className="space-y-2">
          {funds.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Wallet size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{f.donor}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.purpose} → {f.recipient}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatINR(f.amount)}</div>
                <Badge color={f.stage === 'verified' ? 'green' : f.stage === 'delivered' ? 'green' : f.stage === 'released' ? 'purple' : f.stage === 'allocated' ? 'blue' : 'yellow'}>
                  {f.stage}
                </Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => {
                const stages = ['pledged', 'allocated', 'released', 'delivered', 'verified'] as const;
                const idx = stages.indexOf(f.stage as any);
                if (idx < stages.length - 1) {
                  dispatch({ type: 'ADD_LEDGER', entries: [{
                    type: 'fund_release',
                    description: `${f.donor} fund moved from ${f.stage} to ${stages[idx + 1]}`,
                    amount: f.amount,
                    entityId: f.id,
                  }]});
                }
              }}>
                <ArrowRight size={14} />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
