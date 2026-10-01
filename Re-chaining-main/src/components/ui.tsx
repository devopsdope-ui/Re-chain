import type { ReactNode } from 'react';

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] ${className}`}
      style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, color = 'text-blue-400' }: { label: string; value: ReactNode; sub?: string; icon?: ReactNode; color?: string }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {icon && <span className={color}>{icon}</span>}
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' }) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    green: 'bg-green-500/15 text-green-400 border-green-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant = 'default', size = 'md', className = '', disabled }: {
  children: ReactNode; onClick?: () => void; variant?: 'default' | 'primary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; className?: string; disabled?: boolean;
}) {
  const variants: Record<string, string> = {
    default: 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:border-blue-500/50',
    primary: 'bg-blue-600 text-white hover:bg-blue-500 border-blue-600',
    danger: 'bg-red-600 text-white hover:bg-red-500 border-red-600',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border-transparent',
  };
  const sizes: Record<string, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-sm',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-all ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: 'blue' | 'red' | 'green' | 'yellow' }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
  };
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${colors[color]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ title, message, icon }: { title: string; message: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-3 opacity-30">{icon}</div>}
      <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{children}</h2>
      {action}
    </div>
  );
}
