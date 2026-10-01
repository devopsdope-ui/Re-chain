import { NavLink } from 'react-router-dom';
import { useStore } from '@/store';
import type { Role } from '@/types';
import {
  Home, Radio, AlertTriangle, Truck, Building2, Package,
  GitBranch, Sliders, FlaskConical, BarChart3, TrendingUp,
  Wallet, ScrollText, FileCheck, ShieldCheck, Library, Film, FolderOpen,
  Users, Plug, Network, Settings, Activity,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: Role[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Home', path: '/', icon: Home },
      { label: 'Live Ops', path: '/live-ops', icon: Radio },
      { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
      { label: 'Fleet', path: '/fleet', icon: Truck },
      { label: 'Hospitals', path: '/hospitals', icon: Building2 },
      { label: 'Supplies', path: '/supplies', icon: Package },
    ],
  },
  {
    title: 'Allocation',
    items: [
      { label: 'Decisions', path: '/decisions', icon: GitBranch },
      { label: 'Policy Studio', path: '/policy-studio', icon: Sliders },
      { label: 'What-if Sandbox', path: '/sandbox', icon: FlaskConical },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Compare', path: '/compare', icon: BarChart3 },
      { label: 'Forecast & Equity', path: '/forecast', icon: TrendingUp },
    ],
  },
  {
    title: 'Ledger & Funds',
    items: [
      { label: 'Funds', path: '/funds', icon: Wallet },
      { label: 'Ledger', path: '/ledger', icon: ScrollText },
      { label: 'Receipts & Proofs', path: '/receipts', icon: FileCheck },
      { label: 'Audit Center', path: '/audit', icon: ShieldCheck },
    ],
  },
  {
    title: 'Library',
    items: [
      { label: 'Scenarios', path: '/scenarios', icon: Library },
      { label: 'Replays', path: '/replays', icon: Film },
      { label: 'Collections', path: '/collections', icon: FolderOpen },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Stakeholders', path: '/stakeholders', icon: Users },
      { label: 'Integrations', path: '/integrations', icon: Plug },
      { label: 'Architecture', path: '/architecture', icon: Network },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

const ROLE_HIDDEN_SECTIONS: Record<Role, string[]> = {
  'Judge': [],
  'Control Room': [],
  'Hospital': ['Library', 'System'],
  'NGO': ['Allocation', 'System'],
  'Donor': ['Allocation', 'System', 'Library'],
  'Auditor': [],
  'Public': ['Allocation', 'System', 'Library'],
};

export function Sidebar() {
  const { role } = useStore();
  const hiddenSections = ROLE_HIDDEN_SECTIONS[role] || [];
  const visibleSections = SECTIONS.filter(s => !hiddenSections.includes(s.title));

  return (
    <aside className="w-56 shrink-0 h-full flex flex-col border-r" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="flex items-center gap-2 px-4 h-14 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>ReliefChain</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mumbai Monsoon Surge</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {visibleSections.map(section => (
          <div key={section.title} className="mb-4">
            <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {section.title}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 font-medium'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t text-[10px]" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
          <span style={{ color: 'var(--text-secondary)' }}>Connected</span>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>SIMULATED DATA</div>
      </div>
    </aside>
  );
}
