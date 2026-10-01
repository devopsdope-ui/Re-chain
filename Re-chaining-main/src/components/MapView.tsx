import { useMemo } from 'react';
import { useStore } from '@/store';
import { MUMBAI_AREAS } from '@/sim/world';
import type { Incident, Ambulance, Hospital, Road, GeoPoint } from '@/types';

// Project lat/lng to x/y on an SVG canvas
function project(pos: GeoPoint, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, size: { w: number; h: number }) {
  const x = ((pos.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * size.w;
  const y = ((bounds.maxLat - pos.lat) / (bounds.maxLat - bounds.minLat)) * size.h;
  return { x, y };
}

const BOUNDS = { minLat: 18.98, maxLat: 19.15, minLng: 72.78, maxLng: 72.92 };
const SIZE = { w: 800, h: 600 };

interface MapViewProps {
  incidents: Incident[];
  ambulances: Ambulance[];
  hospitals: Hospital[];
  roads: Road[];
  selectedType: 'incident' | 'ambulance' | 'hospital' | null;
  selectedId: string | null;
  onSelect: (type: 'incident' | 'ambulance' | 'hospital', id: string) => void;
  simTime: number;
}

export function MapView({ incidents, ambulances, hospitals, roads, selectedType, selectedId, onSelect, simTime }: MapViewProps) {
  const proj = useMemo(() => (pos: GeoPoint) => project(pos, BOUNDS, SIZE), []);

  const roadColors: Record<string, string> = {
    open: '#2a3548',
    slow: '#b45309',
    flooded: '#1e40af',
    blocked: '#dc2626',
  };

  return (
    <div className="relative w-full h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(var(--text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <svg viewBox={`0 0 ${SIZE.w} ${SIZE.h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Water/land suggestion */}
        <rect x={0} y={0} width={SIZE.w} height={SIZE.h} fill="var(--bg-primary)" />
        <text x={20} y={30} fill="var(--text-muted)" fontSize={11} className="font-mono">MUMBAI · SIMULATED DATA</text>
        <text x={20} y={48} fill="var(--text-muted)" fontSize={9} className="font-mono">T+{Math.floor(simTime)}:{String(Math.floor((simTime % 1) * 60)).padStart(2, '0')}</text>

        {/* Roads */}
        {roads.map(r => {
          const p1 = proj(r.fromPos);
          const p2 = proj(r.toPos);
          return (
            <g key={r.id} onClick={() => {}} style={{ cursor: 'pointer' }}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={roadColors[r.condition]} strokeWidth={r.condition === 'open' ? 2 : 3}
                strokeDasharray={r.condition === 'blocked' ? '8,4' : r.condition === 'flooded' ? undefined : undefined}
                opacity={r.condition === 'open' ? 0.4 : 0.8}
              />
              {r.condition !== 'open' && (
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 4} fill={roadColors[r.condition]} fontSize={7} textAnchor="middle" className="font-mono">
                  {r.condition.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}

        {/* Hospitals */}
        {hospitals.map(h => {
          const p = proj(h.position);
          const selected = selectedType === 'hospital' && selectedId === h.id;
          const icuRatio = h.occupied.icu / h.capacity.icu;
          const color = h.status === 'power_failure' ? '#f59e0b' : h.status === 'full' || h.status === 'overloaded' ? '#dc2626' : icuRatio > 0.8 ? '#f59e0b' : '#10b981';
          return (
            <g key={h.id} onClick={() => onSelect('hospital', h.id)} style={{ cursor: 'pointer' }}>
              <rect x={p.x - 12} y={p.y - 12} width={24} height={24} rx={4}
                fill={color} opacity={0.15} stroke={color} strokeWidth={selected ? 3 : 1.5}
              />
              <rect x={p.x - 8} y={p.y - 8} width={16} height={16} rx={2} fill={color} opacity={0.3} />
              <text x={p.x} y={p.y + 3} fill={color} fontSize={9} textAnchor="middle" className="font-mono font-bold">H</text>
              <text x={p.x} y={p.y - 16} fill="var(--text-primary)" fontSize={8} textAnchor="middle" className="font-mono" opacity={selected ? 1 : 0.7}>
                {h.name.split(' ')[0]}
              </text>
              <text x={p.x} y={p.y + 22} fill="var(--text-muted)" fontSize={7} textAnchor="middle" className="font-mono">
                ICU {h.capacity.icu - h.occupied.icu}/{h.capacity.icu}
              </text>
            </g>
          );
        })}

        {/* Incidents */}
        {incidents.map(inc => {
          const p = proj(inc.position);
          const selected = selectedType === 'incident' && selectedId === inc.id;
          const color = inc.severity === 'red' ? '#ef4444' : inc.severity === 'yellow' ? '#eab308' : '#22c55e';
          const radius = inc.severity === 'red' ? 14 : inc.severity === 'yellow' ? 10 : 8;
          return (
            <g key={inc.id} onClick={() => onSelect('incident', inc.id)} style={{ cursor: 'pointer' }}>
              {inc.severity === 'red' && (
                <circle cx={p.x} cy={p.y} r={radius + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.3}>
                  <animate attributeName="r" values={`${radius};${radius + 10};${radius}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={p.x} cy={p.y} r={radius} fill={color} opacity={0.2} stroke={color} strokeWidth={selected ? 3 : 2} />
              <circle cx={p.x} cy={p.y} r={radius - 5} fill={color} opacity={0.5} />
              <text x={p.x} y={p.y + 3} fill="white" fontSize={8} textAnchor="middle" className="font-mono font-bold">{inc.redPatients}</text>
              <text x={p.x} y={p.y - radius - 4} fill="var(--text-primary)" fontSize={8} textAnchor="middle" className="font-mono" opacity={selected ? 1 : 0.7}>
                {inc.id}
              </text>
            </g>
          );
        })}

        {/* Ambulances */}
        {ambulances.map(a => {
          const p = proj(a.position);
          const selected = selectedType === 'ambulance' && selectedId === a.id;
          const color = a.status === 'broken' ? '#dc2626' : a.status === 'dispatched' ? '#3b82f6' : a.status === 'transporting' ? '#eab308' : '#6b7280';
          return (
            <g key={a.id} onClick={() => onSelect('ambulance', a.id)} style={{ cursor: 'pointer' }}>
              <circle cx={p.x} cy={p.y} r={7} fill={color} opacity={0.2} stroke={color} strokeWidth={selected ? 2.5 : 1.5} />
              <circle cx={p.x} cy={p.y} r={4} fill={color} opacity={0.7} />
              {a.status === 'dispatched' && (
                <text x={p.x} y={p.y - 10} fill={color} fontSize={7} textAnchor="middle" className="font-mono">{a.id.replace('AMB-', 'A')}</text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${SIZE.w - 180}, ${SIZE.h - 130})`}>
          <rect x={0} y={0} width={170} height={120} rx={6} fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth={1} opacity={0.9} />
          <text x={10} y={18} fill="var(--text-secondary)" fontSize={9} className="font-mono font-bold">LEGEND</text>
          <circle cx={16} cy={32} r={5} fill="#ef4444" opacity={0.3} stroke="#ef4444" strokeWidth={1.5} />
          <text x={28} y={35} fill="var(--text-muted)" fontSize={8}>Red Incident</text>
          <rect x={11} y={44} width={10} height={10} rx={2} fill="#10b981" opacity={0.3} stroke="#10b981" strokeWidth={1.5} />
          <text x={28} y={52} fill="var(--text-muted)" fontSize={8}>Hospital</text>
          <circle cx={16} cy={64} r={4} fill="#3b82f6" opacity={0.7} />
          <text x={28} y={67} fill="var(--text-muted)" fontSize={8}>Ambulance (dispatched)</text>
          <line x1={11} y1={80} x2={21} y2={80} stroke="#dc2626" strokeWidth={2.5} strokeDasharray="4,2" />
          <text x={28} y={83} fill="var(--text-muted)" fontSize={8}>Blocked road</text>
          <line x1={11} y1={94} x2={21} y2={94} stroke="#1e40af" strokeWidth={3} />
          <text x={28} y={97} fill="var(--text-muted)" fontSize={8}>Flooded road</text>
          <line x1={11} y1={108} x2={21} y2={108} stroke="#2a3548" strokeWidth={2} />
          <text x={28} y={111} fill="var(--text-muted)" fontSize={8}>Open road</text>
        </g>
      </svg>

      {/* Simulated data banner */}
      <div className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
        SIMULATED DATA — FOR DEMONSTRATION ONLY
      </div>
    </div>
  );
}
