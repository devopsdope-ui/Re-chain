import { useState } from 'react';
import { useStore } from '@/store';
import { Card, Badge, Button, SectionTitle } from '@/components/ui';
import { verifyChain } from '@/sim/ledger';
import { ShieldCheck, AlertTriangle, Check, X, Bug, RotateCcw, Search } from 'lucide-react';

export function LedgerPage({ highlightId }: { highlightId: string | null }) {
  const { ledger, dispatch, alert } = useStore();
  const [search, setSearch] = useState('');
  const [verification, setVerification] = useState<{ valid: boolean; corruptedBlock: number | null; reason: string } | null>(null);

  const handleVerify = () => {
    dispatch({ type: 'VERIFY_LEDGER' });
    const result = verifyChain(ledger);
    setVerification(result);
  };

  const handleTamper = () => {
    const blockIndex = Math.min(17, ledger.length - 1);
    dispatch({ type: 'TAMPER', blockIndex });
    setVerification({ valid: false, corruptedBlock: blockIndex, reason: 'Hash mismatch detected' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_LEDGER' });
    setVerification({ valid: true, corruptedBlock: null, reason: '' });
  };

  const filtered = ledger.filter(b => {
    if (!search) return true;
    const t = search.toLowerCase();
    return b.entries.some(e => e.description.toLowerCase().includes(t)) || String(b.index).includes(t);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto" id={highlightId === 'O4' || highlightId === 'D4' ? 'highlight-target' : undefined}>
      <div className="mb-5">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Transparent Ledger</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Hash-chained ledger with Merkle roots — every allocation, dispatch, and fund movement is recorded and verifiable
        </p>
      </div>

      {/* Verification panel */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Verification</SectionTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={handleVerify}>
              <ShieldCheck size={14} /> Verify Ledger
            </Button>
            <Button size="sm" variant="danger" onClick={handleTamper}>
              <Bug size={14} /> Tamper Demo
            </Button>
            <Button size="sm" variant="default" onClick={handleReset}>
              <RotateCcw size={14} /> Reset Ledger
            </Button>
          </div>
        </div>

        {verification ? (
          verification.valid ? (
            <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 animate-fadeIn">
              <div className="flex items-center gap-2 text-sm font-medium text-green-400 mb-1">
                <Check size={16} /> Chain Verified
              </div>
              <div className="text-xs text-green-400/70 space-y-0.5">
                <div>✓ All {ledger.length} blocks valid</div>
                <div>✓ Hash chain intact</div>
                <div>✓ Merkle roots match</div>
                <div>✓ No tampering detected</div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 animate-fadeIn">
              <div className="flex items-center gap-2 text-sm font-medium text-red-400 mb-1">
                <X size={16} /> VERIFICATION FAILED
              </div>
              <div className="text-xs text-red-400/70 space-y-0.5">
                <div>✕ Corrupted Block: #{verification.corruptedBlock}</div>
                <div>✕ Reason: {verification.reason}</div>
                <div className="mt-1">Click "Reset Ledger" to restore valid state</div>
              </div>
            </div>
          )
        ) : (
          <div className="text-xs p-3 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Click "Verify Ledger" to check chain integrity. Try the "Tamper Demo" to see detection in action.
          </div>
        )}
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border mb-3 max-w-sm" style={{ borderColor: 'var(--border)' }}>
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search blocks and entries..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Blocks */}
      <div className="space-y-2">
        {filtered.slice().reverse().map(block => {
          const isCorrupted = verification?.corruptedBlock === block.index;
          return (
            <Card key={block.index} className={`p-3 ${isCorrupted ? 'border-red-500/50' : ''}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  Block #{block.index}
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  T+{block.timestamp.toFixed(1)}
                </span>
                {isCorrupted ? (
                  <Badge color="red"><AlertTriangle size={10} className="inline mr-1" />CORRUPTED</Badge>
                ) : (
                  <Badge color="green"><Check size={10} className="inline mr-1" />VERIFIED</Badge>
                )}
                <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {block.entries.length} entries
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2 text-[10px] font-mono">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Hash: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{block.hash.slice(0, 24)}...</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Prev: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{block.previousHash.slice(0, 24)}...</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Merkle: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{block.merkleRoot.slice(0, 24)}...</span>
                </div>
              </div>

              <div className="space-y-1">
                {block.entries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded" style={{ background: 'var(--bg-tertiary)' }}>
                    <Badge color={
                      entry.type === 'dispatch' ? 'blue' :
                      entry.type === 'fund_pledge' || entry.type === 'fund_release' ? 'green' :
                      entry.type === 'supply_transfer' ? 'yellow' :
                      entry.type === 'vendor_payment' ? 'purple' :
                      'gray'
                    }>{entry.type.replace('_', ' ')}</Badge>
                    <span className="flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{entry.description}</span>
                    {entry.amount && <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>₹{entry.amount.toLocaleString('en-IN')}</span>}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
