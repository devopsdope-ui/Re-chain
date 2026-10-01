import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import type { Role } from '@/types';

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  path: string;
  icon: string;
}

function parseFilters(query: string): { text: string; filters: Record<string, string> } {
  const filters: Record<string, string> = {};
  const parts = query.split(/\s+/);
  const textParts: string[] = [];
  for (const p of parts) {
    if (p.includes(':')) {
      const [k, v] = p.split(':');
      filters[k.toLowerCase()] = v.toLowerCase();
    } else {
      textParts.push(p);
    }
  }
  return { text: textParts.join(' '), filters };
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { incidents, decisions, hospitals, ambulances, ledger, funds, events } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo((): SearchResult[] => {
    const { text, filters } = parseFilters(query);
    const t = text.toLowerCase();
    const all: SearchResult[] = [];

    if (!filters.type || filters.type === 'incident') {
      incidents.forEach(i => {
        if (!t || i.label.toLowerCase().includes(t) || i.area.toLowerCase().includes(t)) {
          if (!filters.severity || (filters.severity === 'red' && i.severity === 'red') || (filters.severity === 'yellow' && i.severity === 'yellow')) {
            all.push({ type: 'Incident', title: i.label, subtitle: `${i.area} · ${i.severity.toUpperCase()} · ${i.patientCount} patients`, path: '/live-ops', icon: '⚠' });
          }
        }
      });
    }
    if (!filters.type || filters.type === 'decision') {
      decisions.forEach(d => {
        if (!t || d.incidentLabel.toLowerCase().includes(t) || d.selectedHospitalName.toLowerCase().includes(t)) {
          if (!filters.hospital || d.selectedHospitalName.toLowerCase().includes(filters.hospital)) {
            all.push({ type: 'Decision', title: d.incidentLabel, subtitle: `${d.selectedHospitalName} · Score: ${d.score} · ${d.status}`, path: '/decisions', icon: '🔀' });
          }
        }
      });
    }
    if (!filters.type || filters.type === 'hospital') {
      hospitals.forEach(h => {
        if (!t || h.name.toLowerCase().includes(t) || h.area.toLowerCase().includes(t)) {
          if (!filters.hospital || h.name.toLowerCase().includes(filters.hospital)) {
            all.push({ type: 'Hospital', title: h.name, subtitle: `${h.area} · ICU: ${h.capacity.icu - h.occupied.icu}/${h.capacity.icu} avail`, path: '/hospitals', icon: '🏥' });
          }
        }
      });
    }
    if (!filters.type || filters.type === 'ambulance') {
      ambulances.forEach(a => {
        if (!t || a.id.toLowerCase().includes(t)) {
          all.push({ type: 'Ambulance', title: a.id, subtitle: `${a.type} · ${a.status} · Fuel: ${a.fuel}%`, path: '/fleet', icon: '🚑' });
        }
      });
    }
    if (!filters.type || filters.type === 'ledger') {
      ledger.slice(-10).forEach(b => {
        all.push({ type: `Block #${b.index}`, title: `Block ${b.index}`, subtitle: `${b.entries.length} entries · ${b.hash.slice(0, 16)}...`, path: '/ledger', icon: '📦' });
      });
    }
    if (!filters.type || filters.type === 'fund') {
      funds.forEach(f => {
        if (!t || f.donor.toLowerCase().includes(t) || f.purpose.toLowerCase().includes(t)) {
          all.push({ type: 'Fund', title: f.donor, subtitle: `₹${(f.amount / 10000000).toFixed(1)} Cr · ${f.stage} · ${f.purpose}`, path: '/funds', icon: '💰' });
        }
      });
    }
    if (!filters.type || filters.type === 'scenario') {
      all.push({ type: 'Scenario', title: 'Mumbai Monsoon Surge', subtitle: 'Active scenario · 14 events', path: '/scenarios', icon: '📋' });
    }
    if (!filters.type || filters.type === 'replay') {
      all.push({ type: 'Replay', title: 'Mumbai Monsoon Surge Replay', subtitle: 'Prerecorded · seed=42', path: '/replays', icon: '🎬' });
    }

    return all.slice(0, 20);
  }, [query, incidents, decisions, hospitals, ambulances, ledger, funds]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].path);
      onClose();
    }
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden animate-fadeIn" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search incidents, decisions, hospitals... (type:decision severity:red)"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <button onClick={onClose}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No results found</div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                onClick={() => { navigate(r.path); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selectedIndex ? 'bg-blue-600/10' : ''}`}
              >
                <span className="text-lg">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.title}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.subtitle}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>{r.type}</span>
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>Filters: type:decision · severity:red · hospital:KEM</span>
          <span>↑↓ Navigate · Enter Select · Esc Close</span>
        </div>
      </div>
    </div>
  );
}
