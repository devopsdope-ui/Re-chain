import { useMemo } from 'react';
import { useStore } from '@/store';
import { Card, SectionTitle, Badge, ProgressBar } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { MUMBAI_AREAS } from '@/sim/world';
import { Rng } from '@/sim/rng';

export function ForecastPage() {
  const { hospitals, incidents, simTime } = useStore();

  const forecastData = useMemo(() => {
    const rng = new Rng(42);
    const data: { time: string; forecast: number; actual: number }[] = [];
    for (let t = 0; t <= 30; t++) {
      const base = 40 + Math.sin(t * 0.3) * 15;
      const forecast = Math.round(base + rng.int(-3, 3));
      const actual = t <= simTime ? Math.round(base + rng.int(-5, 5)) : null as any;
      data.push({ time: `T+${t}`, forecast, actual: actual ?? forecast });
    }
    return data;
  }, [simTime]);

  const icuPressure = useMemo(() => {
    return hospitals.map(h => ({
      name: h.name.split(' ')[0],
      current: Math.round((h.occupied.icu / h.capacity.icu) * 100),
      projected: Math.min(100, Math.round((h.occupied.icu / h.capacity.icu) * 100 + h.occupied.icu * 0.1)),
    }));
  }, [hospitals]);

  const equityData = useMemo(() => {
    const areas = Object.keys(MUMBAI_AREAS).slice(0, 6);
    const rng = new Rng(99);
    return areas.map(area => {
      const inc = incidents.filter(i => i.area === area);
      const waitTime = rng.int(5, 25) + inc.reduce((s, i) => s + i.redPatients, 0) * 0.5;
      const accessScore = Math.max(20, 100 - waitTime * 2);
      return { area, waitTime: Math.round(waitTime), accessScore: Math.round(accessScore) };
    });
  }, [incidents]);

  const fairnessScore = Math.round(equityData.reduce((s, e) => s + e.accessScore, 0) / equityData.length);
  const underserved = equityData.filter(e => e.accessScore < 50);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Forecast & Equity</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>10-30 minute forecast of hospital load, demand hotspots, and ICU pressure with equity metrics</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Forecast chart */}
        <Card className="p-4">
          <SectionTitle action={<Badge color="blue">10-30 min forecast</Badge>}>Hospital Load Forecast</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={4} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12 }} />
              <ReferenceLine x={`T+${Math.round(simTime)}`} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'NOW', fontSize: 9, fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="forecast" stroke="#eab308" strokeWidth={2} dot={false} name="Forecast" />
              <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* ICU Pressure */}
        <Card className="p-4">
          <SectionTitle action={<Badge color={icuPressure.filter(h => h.projected > 90).length > 0 ? 'red' : 'green'}>
            {icuPressure.filter(h => h.projected > 90).length} hospitals critical
          </Badge>}>ICU Pressure by Hospital</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={icuPressure}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12 }} />
              <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="5 5" />
              <Bar dataKey="current" fill="#3b82f6" name="Current %" />
              <Bar dataKey="projected" fill="#eab308" name="Projected %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Equity metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <SectionTitle>Wait Time by Area</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={equityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis type="category" dataKey="area" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={70} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12 }} />
              <Bar dataKey="waitTime" fill="#f59e0b" name="Wait (min)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <SectionTitle>Access Score by Area</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={equityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis type="category" dataKey="area" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={70} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12 }} />
              <Bar dataKey="accessScore" fill="#10b981" name="Access Score" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <SectionTitle>Equity Summary</SectionTitle>
          <div className="space-y-3">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Overall Fairness Score</div>
              <div className="text-2xl font-bold" style={{ color: fairnessScore > 70 ? '#10b981' : fairnessScore > 50 ? '#eab308' : '#ef4444' }}>{fairnessScore}/100</div>
              <ProgressBar value={fairnessScore} color={fairnessScore > 70 ? 'green' : fairnessScore > 50 ? 'yellow' : 'red'} />
            </div>
            <div>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Underserved Zones</div>
              {underserved.length === 0 ? (
                <div className="text-xs text-green-400">No underserved zones detected</div>
              ) : (
                <div className="space-y-1">
                  {underserved.map(u => (
                    <div key={u.area} className="flex items-center justify-between text-xs p-1.5 rounded border border-red-500/20" style={{ borderColor: 'var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{u.area}</span>
                      <span className="text-red-400">Access: {u.accessScore}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
