import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store';
import { Search, Play, Pause, SkipForward, RotateCcw, Bell, Sun, Moon, ChevronDown, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Role } from '@/types';

const ROLES: Role[] = ['Judge', 'Control Room', 'Hospital', 'NGO', 'Donor', 'Auditor', 'Public'];
const SPEEDS = [1, 2, 4, 10, 20];

export function TopBar({ onOpenSearch, onOpenEvaluate }: { onOpenSearch: () => void; onOpenEvaluate: () => void }) {
  const { simTime, running, speed, dispatch, role, theme, alert } = useStore();
  const [showRoles, setShowRoles] = useState(false);
  const [showSpeeds, setShowSpeeds] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const formatTime = (t: number) => {
    const mins = Math.floor(t);
    const secs = Math.floor((t - mins) * 60);
    return `T+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      onOpenSearch();
    }
    if (e.key === ' ' && !(e.target as HTMLElement)?.matches('input, textarea, select')) {
      e.preventDefault();
      dispatch({ type: running ? 'PAUSE' : 'PLAY' });
    }
  }, [running, dispatch, onOpenSearch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm w-64 transition-colors hover:border-blue-500/50"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border)' }}>⌘K</kbd>
        </button>
      </div>

      {/* Center: Simulation controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md border" style={{ borderColor: 'var(--border)' }}>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${running ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
            {running ? 'SIMULATING' : 'PAUSED'}
          </span>
          <div className="flex items-center gap-1 ml-1">
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: running ? 'PAUSE' : 'PLAY' })}>
              {running ? <Pause size={14} /> : <Play size={14} />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'STEP' })}>
              <SkipForward size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'RESTART' })}>
              <RotateCcw size={14} />
            </Button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSpeeds(!showSpeeds)}
              className="text-xs px-2 py-0.5 rounded hover:bg-[var(--bg-tertiary)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {speed}x
            </button>
            {showSpeeds && (
              <div className="absolute top-full right-0 mt-1 py-1 rounded-md border z-50 shadow-lg" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                {SPEEDS.map(s => (
                  <button
                    key={s}
                    onClick={() => { dispatch({ type: 'SET_SPEED', speed: s }); setShowSpeeds(false); }}
                    className={`block w-full px-3 py-1 text-xs text-left hover:bg-[var(--bg-tertiary)] ${s === speed ? 'text-blue-400' : ''}`}
                    style={{ color: s === speed ? undefined : 'var(--text-secondary)' }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-1 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            <Clock size={12} />
            {formatTime(simTime)}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        {alert && (
          <div className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-fadeIn max-w-xs truncate">
            {alert}
          </div>
        )}

        <Button variant="primary" size="sm" onClick={onOpenEvaluate}>
          <Zap size={14} /> Evaluate
        </Button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] relative"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell size={16} />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-400" />
          </button>
          {notifOpen && (
            <div className="absolute top-full right-0 mt-1 w-72 rounded-md border shadow-lg z-50 p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Notifications</div>
              <div className="space-y-2">
                <div className="text-xs p-2 rounded bg-red-500/5 border border-red-500/10">
                  <div className="font-medium text-red-400">Red Alert: Dadar Collapse</div>
                  <div style={{ color: 'var(--text-muted)' }}>18 critical patients need immediate allocation</div>
                </div>
                <div className="text-xs p-2 rounded bg-yellow-500/5 border border-yellow-500/10">
                  <div className="font-medium text-yellow-400">ICU Capacity: Sion Hospital</div>
                  <div style={{ color: 'var(--text-muted)' }}>ICU beds projected to fill within 10 min</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => dispatch({ type: 'SET_THEME', theme: theme === 'dark' ? 'light' : 'dark' })}
          className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowRoles(!showRoles)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
              {role[0]}
            </span>
            <span className="hidden sm:inline">{role}</span>
            <ChevronDown size={12} />
          </button>
          {showRoles && (
            <div className="absolute top-full right-0 mt-1 py-1 rounded-md border shadow-lg z-50 min-w-[140px]" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => { dispatch({ type: 'SET_ROLE', role: r }); setShowRoles(false); }}
                  className={`block w-full px-3 py-1.5 text-xs text-left hover:bg-[var(--bg-tertiary)] ${r === role ? 'text-blue-400 font-medium' : ''}`}
                  style={{ color: r === role ? undefined : 'var(--text-secondary)' }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
