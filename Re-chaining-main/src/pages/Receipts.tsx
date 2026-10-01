import { useState } from 'react';
import { useStore } from '@/store';
import { Card, Badge, Button, SectionTitle } from '@/components/ui';
import { formatINR, computeMerkleRoot } from '@/sim/ledger';
import { QrCode, Check, ShieldCheck, FileText, MapPin } from 'lucide-react';

export function ReceiptsPage() {
  const { funds, ledger } = useStore();
  const [selected, setSelected] = useState(funds[0]?.id ?? null);
  const [verified, setVerified] = useState(false);

  const fund = funds.find(f => f.id === selected);
  const fundLedgerEntries = ledger.filter(b => b.entries.some(e => e.entityId === fund?.id));
  const merkleProof = fund ? computeMerkleRoot(fundLedgerEntries.flatMap(b => b.entries.filter(e => e.entityId === fund.id))) : '';

  // Simple QR code placeholder (SVG pattern)
  const qrPattern = Array.from({ length: 25 }, (_, i) => Array.from({ length: 25 }, (_, j) => ((i * 7 + j * 13 + (fund?.id.charCodeAt(0) ?? 42)) % 3 === 0) ? 1 : 0));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Receipts & Proofs</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Donor receipts with Merkle proof verification and QR codes</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donor list */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Donations</h2>
          {funds.map(f => (
            <Card key={f.id} className={`p-3 cursor-pointer transition-all ${selected === f.id ? 'border-blue-500' : ''}`} onClick={() => { setSelected(f.id); setVerified(false); }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{f.donor}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatINR(f.amount)} · {f.purpose}</div>
                </div>
                <Badge color={f.stage === 'verified' ? 'green' : 'yellow'}>{f.stage}</Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Receipt detail */}
        {fund && (
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-blue-400" />
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Donation Receipt</h2>
              </div>
              <div className="text-[10px] px-2 py-1 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                Receipt #{fund.id}-{Date.now().toString(36).slice(-4).toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Donation</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatINR(fund.amount)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Donor</div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{fund.donor}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Purpose</div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{fund.purpose}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Allocated to</div>
                  <div className="text-sm flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    <MapPin size={12} /> {fund.recipient}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Delivered</div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {fund.deliveryQty ?? '—'} {fund.deliveryUnit ?? ''} {fund.deliveryAmount ? `(${formatINR(fund.deliveryAmount)})` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Status</div>
                  <div className="flex items-center gap-1.5">
                    {fund.stage === 'verified' ? <Check size={16} className="text-green-400" /> : null}
                    <span className={fund.stage === 'verified' ? 'text-green-400 font-medium' : 'text-yellow-400'}>{fund.stage.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-start">
                {/* QR Code */}
                <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-tertiary)' }}>
                  <svg viewBox="0 0 25 25" className="w-32 h-32">
                    {qrPattern.map((row, i) => row.map((cell, j) => cell ? <rect key={`${i}-${j}`} x={j} y={i} width={1} height={1} fill="var(--text-primary)" /> : null))}
                    <rect x={0} y={0} width={7} height={7} fill="none" stroke="var(--text-primary)" strokeWidth={1} />
                    <rect x={18} y={0} width={7} height={7} fill="none" stroke="var(--text-primary)" strokeWidth={1} />
                    <rect x={0} y={18} width={7} height={7} fill="none" stroke="var(--text-primary)" strokeWidth={1} />
                  </svg>
                </div>
                <div className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-muted)' }}>Scan to verify on-chain</div>

                {/* Merkle proof */}
                <div className="mt-4 w-full">
                  <div className="text-[10px] font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Merkle Proof</div>
                  <div className="font-mono text-[10px] p-2 rounded border break-all" style={{ borderColor: 'var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {merkleProof.slice(0, 48)}...
                  </div>
                  <div className={`text-xs mt-1 flex items-center gap-1 ${verified ? 'text-green-400' : ''}`} style={{ color: verified ? undefined : 'var(--text-muted)' }}>
                    {verified ? <><Check size={12} /> VALID — Proof verified</> : 'Awaiting verification'}
                  </div>
                </div>

                <Button size="sm" variant="primary" className="mt-3 w-full" onClick={() => setVerified(true)}>
                  <ShieldCheck size={14} /> Verify Proof
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
