import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { X, Check, Circle, ArrowRight } from 'lucide-react';

interface ReqItem {
  id: string;
  label: string;
  description: string;
  path: string;
}

const REQUIREMENTS: { category: string; items: ReqItem[] }[] = [
  {
    category: 'Objectives',
    items: [
      { id: 'O1', label: 'Dynamic allocation', description: 'Live Ops shows dynamic resource allocation based on multiple factors', path: '/live-ops' },
      { id: 'O2', label: 'Multi-factor decisions', description: 'Decisions page shows scoring across severity, capacity, blood, roads, etc.', path: '/decisions' },
      { id: 'O3', label: 'Dynamic reallocation', description: 'Chaos Console triggers immediate re-planning of all affected decisions', path: '/live-ops' },
      { id: 'O4', label: 'Transparent tracking', description: 'Ledger tracks every allocation, dispatch, and fund movement with verification', path: '/ledger' },
    ],
  },
  {
    category: 'Differentiators',
    items: [
      { id: 'D1', label: 'Architecture', description: 'System architecture page shows the full component stack', path: '/architecture' },
      { id: 'D2', label: 'Working simulation', description: 'Simulation with 14 events, play/pause, speed control, and deterministic seed', path: '/live-ops' },
      { id: 'D3', label: 'Visualization', description: 'Interactive map with live positions, charts, and comparison views', path: '/compare' },
      { id: 'D4', label: 'Verification', description: 'Ledger verification with tamper demo and anomaly detection', path: '/ledger' },
    ],
  },
];

export function EvaluateModal({ open, onClose, onHighlight }: { open: boolean; onClose: () => void; onHighlight: (path: string, elementId: string) => void }) {
  const navigate = useNavigate();
  if (!open) return null;

  const handleShowMe = (path: string, id: string) => {
    navigate(path);
    onClose();
    setTimeout(() => onHighlight(path, id), 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden animate-fadeIn" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>EL-02 Requirements</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Click "Show Me" to navigate to each working feature</p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {REQUIREMENTS.map(cat => (
            <div key={cat.category}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{cat.category}</div>
              <div className="space-y-2">
                {cat.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-blue-600/15 flex items-center justify-center text-xs font-bold text-blue-400">{item.id}</div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShowMe(item.path, item.id)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors whitespace-nowrap"
                    >
                      Show Me <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t flex items-center gap-2 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <Check size={14} className="text-green-400" />
          All features are working and interactive — not static screenshots
        </div>
      </div>
    </div>
  );
}
