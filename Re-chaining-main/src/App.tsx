import { useState, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '@/store';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { CommandPalette } from '@/components/CommandPalette';
import { EvaluateModal } from '@/components/EvaluateModal';
import { HomePage } from '@/pages/Home';
import { LiveOpsPage } from '@/pages/LiveOps';
import { IncidentsPage } from '@/pages/Incidents';
import { FleetPage } from '@/pages/Fleet';
import { HospitalsPage } from '@/pages/Hospitals';
import { SuppliesPage } from '@/pages/Supplies';
import { DecisionsPage } from '@/pages/Decisions';
import { PolicyStudioPage } from '@/pages/PolicyStudio';
import { SandboxPage } from '@/pages/Sandbox';
import { ComparePage } from '@/pages/Compare';
import { ForecastPage } from '@/pages/Forecast';
import { FundsPage } from '@/pages/Funds';
import { LedgerPage } from '@/pages/Ledger';
import { ReceiptsPage } from '@/pages/Receipts';
import { AuditPage } from '@/pages/Audit';
import { ScenariosPage } from '@/pages/Scenarios';
import { ReplaysPage } from '@/pages/Replays';
import { CollectionsPage } from '@/pages/Collections';
import { StakeholdersPage } from '@/pages/Stakeholders';
import { IntegrationsPage } from '@/pages/Integrations';
import { ArchitecturePage } from '@/pages/Architecture';
import { SettingsPage } from '@/pages/Settings';

function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [evalOpen, setEvalOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const handleHighlight = useCallback((_path: string, elementId: string) => {
    setHighlightId(elementId);
    setTimeout(() => setHighlightId(null), 5000);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onOpenSearch={() => setSearchOpen(true)} onOpenEvaluate={() => setEvalOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage highlightId={highlightId} />} />
            <Route path="/live-ops" element={<LiveOpsPage highlightId={highlightId} />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/supplies" element={<SuppliesPage />} />
            <Route path="/decisions" element={<DecisionsPage highlightId={highlightId} />} />
            <Route path="/policy-studio" element={<PolicyStudioPage />} />
            <Route path="/sandbox" element={<SandboxPage />} />
            <Route path="/compare" element={<ComparePage highlightId={highlightId} />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/funds" element={<FundsPage highlightId={highlightId} />} />
            <Route path="/ledger" element={<LedgerPage highlightId={highlightId} />} />
            <Route path="/receipts" element={<ReceiptsPage />} />
            <Route path="/audit" element={<AuditPage highlightId={highlightId} />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/replays" element={<ReplaysPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/stakeholders" element={<StakeholdersPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/architecture" element={<ArchitecturePage highlightId={highlightId} />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <EvaluateModal open={evalOpen} onClose={() => setEvalOpen(false)} onHighlight={handleHighlight} />
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </StoreProvider>
  );
}

export default App;
