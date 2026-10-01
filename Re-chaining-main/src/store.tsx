import { createContext, useContext, useReducer, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type {
  WorldState, Role, AllocationDecision, LedgerEntry, LedgerBlock,
  Hospital, Ambulance, Incident, Road, SimEvent, Anomaly, FundFlow, SimStats,
  SupplyItem, SupplyRequest
} from './types';
import {
  initHospitals, initAmbulances, initIncidents, initRoads,
  initSupplies, initSupplyRequests, initEvents
} from './sim/world';
import { allocate, haversine } from './sim/alloc';
import { createBlock, verifyChain, tamperBlock, initFunds } from './sim/ledger';
import { initAnomalies } from './sim/anomaly';

const SIM_DURATION = 15; // minutes

function buildInitialState(): WorldState {
  const hospitals = initHospitals();
  const ambulances = initAmbulances();
  const incidents = initIncidents();
  const roads = initRoads();
  const supplies = initSupplies();
  const supplyRequests = initSupplyRequests();
  const events = initEvents();
  const funds = initFunds();
  const anomalies = initAnomalies(funds);

  // Create genesis block + a few initial blocks
  const ledger: LedgerBlock[] = [];
  let prevBlock = createBlock(null, [{
    type: 'allocation',
    description: 'ReliefChain system initialized — Mumbai Monsoon Surge',
    entityId: 'SYSTEM',
  }], 0);
  ledger.push(prevBlock);

  prevBlock = createBlock(prevBlock, [
    { type: 'fund_pledge', description: 'Mumbai Business Council pledged ₹5 Cr', amount: 50000000, entityId: 'F1' },
    { type: 'fund_release', description: '₹5 Cr released to Emergency Pool', amount: 50000000, entityId: 'F1' },
  ], 1);
  ledger.push(prevBlock);

  prevBlock = createBlock(prevBlock, [
    { type: 'supply_transfer', description: '500 IV Fluids dispatched to KEM Hospital', entityId: 'SUP-001', metadata: { qty: 500 } },
    { type: 'dispatch', description: 'AMB-01 dispatched to INC-001', entityId: 'AMB-01' },
  ], 2);
  ledger.push(prevBlock);

  const stats = computeStats(hospitals, ambulances, incidents, [], 'reliefchain');

  return {
    simTime: 0,
    startTime: Date.now(),
    running: false,
    speed: 1,
    hospitals,
    ambulances,
    incidents,
    roads,
    supplies,
    supplyRequests,
    decisions: [],
    events,
    ledger,
    funds,
    anomalies,
    stats,
    alert: null,
    autopilotActive: false,
    autopilotStep: 0,
  };
}

function computeStats(
  hospitals: Hospital[],
  ambulances: Ambulance[],
  incidents: Incident[],
  decisions: AllocationDecision[],
  engine: 'reliefchain' | 'baseline'
): SimStats {
  const icuAvail = hospitals.reduce((s, h) => s + Math.max(0, h.capacity.icu - h.occupied.icu), 0);
  const icuTotal = hospitals.reduce((s, h) => s + h.capacity.icu, 0);
  const icuOverloads = hospitals.filter(h => h.occupied.icu >= h.capacity.icu).length;
  const hospitalOverloads = hospitals.filter(h => h.status === 'overloaded' || h.status === 'full' || h.status === 'power_failure').length;
  const bloodTotal = hospitals.reduce((s, h) => s + Object.values(h.blood).reduce((a, b) => a + b, 0), 0);
  const activeAmbs = ambulances.filter(a => a.status === 'dispatched' || a.status === 'transporting').length;
  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'assigned').length;
  const redPatients = incidents.reduce((s, i) => s + i.redPatients, 0);
  const yellowPatients = incidents.reduce((s, i) => s + i.yellowPatients, 0);

  const estSurvivors = decisions.length > 0
    ? decisions.reduce((s, d) => s + d.explanation.expectedSurvivors, 0)
    : Math.round(redPatients * 0.7 + yellowPatients * 0.4);

  const baselineSurvivors = Math.round(redPatients * 0.55 + yellowPatients * 0.35);

  // Equity: variance in hospital load
  const loads = hospitals.map(h => h.occupied.er / h.capacity.er);
  const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
  const variance = loads.reduce((s, l) => s + (l - avgLoad) ** 2, 0) / loads.length;
  const equityScore = engine === 'reliefchain'
    ? Math.round(Math.max(0, 100 - variance * 200))
    : Math.round(Math.max(0, 100 - variance * 350));

  return {
    estimatedSurvivors: estSurvivors,
    baselineSurvivors,
    avgRedTreatmentTime: engine === 'reliefchain' ? 12 : 18,
    worstTreatmentTime: engine === 'reliefchain' ? 22 : 35,
    icuOverloads,
    unservedCritical: Math.max(0, redPatients - decisions.filter(d => d.engine === engine).length * 10),
    ambulanceUtilization: Math.round((activeAmbs / ambulances.length) * 100),
    equityScore,
    pendingDecisions: decisions.filter(d => d.status === 'suggested').length,
    activeAmbulances: activeAmbs,
    activeIncidents,
    hospitalOverloads,
    activeSupplyRequests: 4,
    bloodAvailability: bloodTotal,
    icuAvailability: icuAvail,
  };
}

export type Action =
  | { type: 'TICK'; dt: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'STEP' }
  | { type: 'RESTART' }
  | { type: 'SEEK'; time: number }
  | { type: 'APPROVE_DECISION'; id: string }
  | { type: 'OVERRIDE_DECISION'; id: string; reason: string; newHospitalId: string }
  | { type: 'PIN_DECISION'; id: string }
  | { type: 'TRIGGER_EVENT'; eventId: number }
  | { type: 'ADD_LEDGER'; entries: LedgerEntry[] }
  | { type: 'TAMPER'; blockIndex: number }
  | { type: 'RESET_LEDGER' }
  | { type: 'VERIFY_LEDGER' }
  | { type: 'CHAOS'; action: string }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_ALERT'; alert: string | null }
  | { type: 'AUTOPILOT_START' }
  | { type: 'AUTOPILOT_STOP' }
  | { type: 'AUTOPILOT_NEXT' }
  | { type: 'RESOLVE_ANOMALY'; id: string; status: Anomaly['status']; notes: string }
  | { type: 'SET_THEME'; theme: 'dark' | 'light' };

interface StoreContext extends WorldState {
  role: Role;
  theme: 'dark' | 'light';
  dispatch: (action: Action) => void;
  ledgerVerification: { valid: boolean; corruptedBlock: number | null; reason: string } | null;
}

const Ctx = createContext<StoreContext | null>(null);

let ledgerVerificationResult: { valid: boolean; corruptedBlock: number | null; reason: string } | null = null;

function reducer(state: WorldState, action: Action): WorldState {
  switch (action.type) {
    case 'TICK': {
      if (!state.running) return state;
      const newTime = state.simTime + action.dt * state.speed;
      if (newTime >= SIM_DURATION) {
        return { ...state, simTime: SIM_DURATION, running: false };
      }

      let { hospitals, ambulances, incidents, roads, decisions, ledger, events, funds, anomalies, supplies, supplyRequests } = state;
      hospitals = hospitals.map(h => ({ ...h }));
      ambulances = ambulances.map(a => ({ ...a }));
      incidents = incidents.map(i => ({ ...i }));
      roads = roads.map(r => ({ ...r }));
      events = events.map(e => ({ ...e }));
      decisions = decisions.map(d => ({ ...d }));
      ledger = ledger.map(b => ({ ...b, entries: [...b.entries] }));

      // Check for events to trigger
      for (const event of events) {
        if (!event.triggered && newTime >= event.time) {
          event.triggered = true;
          const result = triggerEvent(event, { hospitals, ambulances, incidents, roads, funds, supplies, supplyRequests, anomalies });
          hospitals = result.hospitals;
          ambulances = result.ambulances;
          incidents = result.incidents;
          roads = result.roads;
          funds = result.funds;
          supplies = result.supplies;
          supplyRequests = result.supplyRequests;
          anomalies = result.anomalies;

          // Add ledger entry for event
          const lastBlock = ledger[ledger.length - 1];
          const newBlock = createBlock(lastBlock, [{
            type: 'allocation',
            description: `Event: ${event.title} — ${event.description}`,
            entityId: `EVT-${event.id}`,
          }], newTime);
          ledger.push(newBlock);

          // Re-allocate affected incidents
          const activeIncidents = incidents.filter(i => i.status === 'active');
          for (const inc of activeIncidents) {
            const decision = allocate(inc, ambulances, hospitals, roads, 'reliefchain', newTime);
            if (decision) {
              decisions.push(decision);
              inc.status = 'assigned';
              inc.assignedAmbulanceId = decision.ambulanceId;
              inc.assignedHospitalId = decision.hospitalId;
              inc.etaMinutes = decision.alternatives[0]?.etaMinutes ?? null;
              const amb = ambulances.find(a => a.id === decision.ambulanceId);
              if (amb) { amb.status = 'dispatched'; amb.assignedIncidentId = inc.id; amb.assignedHospitalId = decision.hospitalId; }
              const hosp = hospitals.find(h => h.id === decision.hospitalId);
              if (hosp) { hosp.occupied.er = Math.min(hosp.capacity.er, hosp.occupied.er + Math.ceil(inc.redPatients / 3)); }

              const lb = ledger[ledger.length - 1];
              ledger.push(createBlock(lb, [{
                type: 'dispatch',
                description: `${decision.ambulanceId} dispatched to ${inc.label} → ${decision.selectedHospitalName}`,
                entityId: decision.ambulanceId,
              }], newTime));
            }
          }
        }
      }

      // Update ambulance positions (move toward assigned hospital)
      for (const amb of ambulances) {
        if (amb.status === 'dispatched' && amb.assignedHospitalId) {
          const hosp = hospitals.find(h => h.id === amb.assignedHospitalId);
          if (hosp) {
            const dist = haversine(amb.position, hosp.position);
            if (dist < 0.3) {
              amb.status = 'returning';
              const inc = incidents.find(i => i.id === amb.assignedIncidentId);
              if (inc) { inc.status = 'admitted'; }
            } else {
              const stepLat = (hosp.position.lat - amb.position.lat) * 0.1 * action.dt * state.speed;
              const stepLng = (hosp.position.lng - amb.position.lng) * 0.1 * action.dt * state.speed;
              amb.position = { lat: amb.position.lat + stepLat, lng: amb.position.lng + stepLng };
            }
          }
        } else if (amb.status === 'returning') {
          const home = hospitals.find(h => h.id === amb.homeHospital);
          if (home) {
            const dist = haversine(amb.position, home.position);
            if (dist < 0.3) { amb.status = 'idle'; amb.assignedIncidentId = null; amb.assignedHospitalId = null; }
            else {
              amb.position = { lat: amb.position.lat + (home.position.lat - amb.position.lat) * 0.08 * action.dt * state.speed, lng: amb.position.lng + (home.position.lng - amb.position.lng) * 0.08 * action.dt * state.speed };
            }
          }
        }
      }

      const stats = computeStats(hospitals, ambulances, incidents, decisions, 'reliefchain');
      return { ...state, simTime: newTime, hospitals, ambulances, incidents, roads, decisions, ledger, events, funds, anomalies, supplies, supplyRequests, stats };
    }

    case 'PLAY':
      return { ...state, running: true };

    case 'PAUSE':
      return { ...state, running: false };

    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'STEP': {
      return reducer(state, { type: 'TICK', dt: 0.5 });
    }

    case 'RESTART':
      return buildInitialState();

    case 'SEEK':
      return { ...state, simTime: Math.max(0, Math.min(SIM_DURATION, action.time)) };

    case 'APPROVE_DECISION': {
      const decisions = state.decisions.map(d => d.id === action.id ? { ...d, status: 'approved' as const } : d);
      const decision = decisions.find(d => d.id === action.id);
      let ledger = state.ledger;
      if (decision) {
        const lastBlock = ledger[ledger.length - 1];
        ledger = [...ledger, createBlock(lastBlock, [{
          type: 'allocation',
          description: `Decision ${decision.id} approved — ${decision.action}`,
          entityId: decision.id,
        }], state.simTime)];
      }
      return { ...state, decisions, ledger };
    }

    case 'OVERRIDE_DECISION': {
      const decisions = state.decisions.map(d =>
        d.id === action.id ? { ...d, status: 'overridden' as const, overrideReason: action.reason, hospitalId: action.newHospitalId } : d
      );
      let ledger = state.ledger;
      const decision = decisions.find(d => d.id === action.id);
      if (decision) {
        const lastBlock = ledger[ledger.length - 1];
        ledger = [...ledger, createBlock(lastBlock, [{
          type: 'allocation',
          description: `Decision ${decision.id} OVERRIDDEN — Reason: ${action.reason}. Redirected to ${action.newHospitalId}`,
          entityId: decision.id,
        }], state.simTime)];
      }
      return { ...state, decisions, ledger };
    }

    case 'PIN_DECISION': {
      const decisions = state.decisions.map(d => d.id === action.id ? { ...d, pinned: !d.pinned } : d);
      return { ...state, decisions };
    }

    case 'TRIGGER_EVENT': {
      const events = state.events.map(e => e.id === action.eventId ? { ...e, triggered: true } : e);
      const event = events.find(e => e.id === action.eventId);
      if (!event) return state;
      const result = triggerEvent(event, state);
      let ledger = state.ledger;
      const lastBlock = ledger[ledger.length - 1];
      ledger = [...ledger, createBlock(lastBlock, [{
        type: 'allocation',
        description: `Event: ${event.title} — ${event.description}`,
        entityId: `EVT-${event.id}`,
      }], state.simTime)];

      // Re-allocate
      let { hospitals, ambulances, incidents, roads, funds, supplies, supplyRequests, anomalies } = result;
      let decisions = state.decisions.map(d => ({ ...d }));
      const activeIncidents = incidents.filter(i => i.status === 'active');
      for (const inc of activeIncidents) {
        const decision = allocate(inc, ambulances, hospitals, roads, 'reliefchain', state.simTime);
        if (decision) {
          decisions.push(decision);
          inc.status = 'assigned';
          inc.assignedAmbulanceId = decision.ambulanceId;
          inc.assignedHospitalId = decision.hospitalId;
          inc.etaMinutes = decision.alternatives[0]?.etaMinutes ?? null;
          const amb = ambulances.find(a => a.id === decision.ambulanceId);
          if (amb) { amb.status = 'dispatched'; amb.assignedIncidentId = inc.id; amb.assignedHospitalId = decision.hospitalId; }
          const hosp = hospitals.find(h => h.id === decision.hospitalId);
          if (hosp) { hosp.occupied.er = Math.min(hosp.capacity.er, hosp.occupied.er + Math.ceil(inc.redPatients / 3)); }
        }
      }

      const changedCount = decisions.length - state.decisions.length;
      const alert = changedCount > 0
        ? `SYSTEM RE-PLANNED — ${changedCount} decision${changedCount !== 1 ? 's' : ''} changed`
        : `${event.title} triggered`;

      const stats = computeStats(hospitals, ambulances, incidents, decisions, 'reliefchain');
      return { ...state, events, hospitals, ambulances, incidents, roads, funds, supplies, supplyRequests, anomalies, decisions, ledger, stats, alert };
    }

    case 'ADD_LEDGER': {
      const lastBlock = state.ledger[state.ledger.length - 1];
      const newBlock = createBlock(lastBlock, action.entries, state.simTime);
      return { ...state, ledger: [...state.ledger, newBlock] };
    }

    case 'TAMPER': {
      const tampered = tamperBlock(state.ledger, action.blockIndex);
      ledgerVerificationResult = { valid: false, corruptedBlock: action.blockIndex, reason: 'Hash mismatch detected' };
      return { ...state, ledger: tampered, alert: 'LEDGER TAMPERED — Verification will fail' };
    }

    case 'RESET_LEDGER': {
      // Rebuild ledger from scratch
      const fresh = buildInitialState();
      ledgerVerificationResult = { valid: true, corruptedBlock: null, reason: '' };
      return { ...state, ledger: fresh.ledger, alert: 'Ledger reset to valid state' };
    }

    case 'VERIFY_LEDGER': {
      const result = verifyChain(state.ledger);
      ledgerVerificationResult = result;
      return { ...state, alert: result.valid ? 'Chain verified — No tampering detected' : `VERIFICATION FAILED — Block ${result.corruptedBlock}` };
    }

    case 'CHAOS': {
      let { hospitals, ambulances, incidents, roads, funds, supplies, supplyRequests, anomalies } = state;
      hospitals = hospitals.map(h => ({ ...h }));
      ambulances = ambulances.map(a => ({ ...a }));
      incidents = incidents.map(i => ({ ...i }));
      roads = roads.map(r => ({ ...r }));
      let alert = '';

      switch (action.action) {
        case 'Flood Andheri Subway':
          roads = roads.map(r => r.from === 'Andheri' || r.to === 'Andheri' ? { ...r, condition: 'flooded' as const } : r);
          alert = 'Andheri Subway flooded — Routes recalculated';
          break;
        case 'Hospital Loses Power':
          hospitals[3].status = 'power_failure';
          alert = `${hospitals[3].name} lost power — Patients being redirected`;
          break;
        case 'Kill 5 Ambulances': {
          let killed = 0;
          ambulances = ambulances.map(a => {
            if (killed < 5 && a.status === 'idle') { killed++; return { ...a, status: 'broken' as const }; }
            return a;
          });
          alert = `${killed} ambulances taken offline — Fleet reduced`;
          break;
        }
        case 'Surge x2':
          incidents = incidents.map(i => ({ ...i, redPatients: i.redPatients * 2, yellowPatients: i.yellowPatients * 2, patientCount: i.patientCount * 2 }));
          alert = 'Patient surge 2x — All incidents now have doubled casualties';
          break;
        case 'Block Bridge':
          roads = roads.map(r => (r.from === 'Sion' && r.to === 'Dadar') || (r.from === 'Dadar' && r.to === 'Sion') ? { ...r, condition: 'blocked' as const } : r);
          alert = 'Sion-Dadar bridge blocked — Alternative routes activated';
          break;
        case 'Blood Shortage':
          hospitals = hospitals.map(h => ({ ...h, blood: { ...h.blood, 'O-': Math.max(0, h.blood['O-'] - 10) } }));
          alert = 'O-negative blood shortage — Blood compatibility rechecked';
          break;
        case 'close Sion Circle':
          roads = roads.map(r => r.from === 'Sion Circle' || r.to === 'Sion Circle' ? { ...r, condition: 'blocked' as const } : r);
          alert = 'Sion Circle closed — Routes recalculated';
          break;
        default:
          if (action.action.startsWith('close ')) {
            const area = action.action.replace('close ', '').trim();
            roads = roads.map(r => r.from === area || r.to === area ? { ...r, condition: 'blocked' as const } : r);
            alert = `${area} closed — Routes recalculated`;
          }
      }

      // Re-allocate
      let decisions = state.decisions.map(d => ({ ...d }));
      // Mark existing decisions as stale for active incidents
      decisions = decisions.map(d => {
        const inc = incidents.find(i => i.id === d.incidentId);
        if (inc && (inc.status === 'active' || inc.status === 'assigned')) {
          return { ...d, status: 'stale' as const };
        }
        return d;
      });

      const activeIncidents = incidents.filter(i => i.status === 'active');
      for (const inc of activeIncidents) {
        const decision = allocate(inc, ambulances, hospitals, roads, 'reliefchain', state.simTime);
        if (decision) {
          decisions.push(decision);
          inc.status = 'assigned';
          inc.assignedAmbulanceId = decision.ambulanceId;
          inc.assignedHospitalId = decision.hospitalId;
          inc.etaMinutes = decision.alternatives[0]?.etaMinutes ?? null;
          const amb = ambulances.find(a => a.id === decision.ambulanceId);
          if (amb) { amb.status = 'dispatched'; amb.assignedIncidentId = inc.id; amb.assignedHospitalId = decision.hospitalId; }
          const hosp = hospitals.find(h => h.id === decision.hospitalId);
          if (hosp) { hosp.occupied.er = Math.min(hosp.capacity.er, hosp.occupied.er + Math.ceil(inc.redPatients / 3)); }
        }
      }

      const changedCount = decisions.filter(d => d.status === 'suggested').length;
      const rerouted = decisions.filter(d => d.status === 'stale').length;
      alert = `SYSTEM RE-PLANNED — ${changedCount} decisions changed, ${rerouted} ambulances rerouted`;

      // Add ledger entry
      let ledger = state.ledger.map(b => ({ ...b, entries: [...b.entries] }));
      const lastBlock = ledger[ledger.length - 1];
      ledger.push(createBlock(lastBlock, [{
        type: 'allocation',
        description: `Chaos event: ${action.action}`,
        entityId: 'CHAOS',
      }], state.simTime));

      const stats = computeStats(hospitals, ambulances, incidents, decisions, 'reliefchain');
      return { ...state, hospitals, ambulances, incidents, roads, decisions, ledger, stats, alert };
    }

    case 'SET_ALERT':
      return { ...state, alert: action.alert };

    case 'AUTOPILOT_START':
      return { ...state, autopilotActive: true, autopilotStep: 0, running: true, speed: 2 };

    case 'AUTOPILOT_STOP':
      return { ...state, autopilotActive: false, running: false };

    case 'AUTOPILOT_NEXT': {
      const step = state.autopilotStep + 1;
      const autopilotEvents = [2, 8, 3, 4, 9, 5]; // event IDs in sequence
      if (step >= autopilotEvents.length) {
        return { ...state, autopilotActive: false, running: false, alert: 'Autopilot demo complete' };
      }
      const eventId = autopilotEvents[step];
      return reducer({ ...state, autopilotStep: step }, { type: 'TRIGGER_EVENT', eventId });
    }

    case 'RESOLVE_ANOMALY': {
      const anomalies = state.anomalies.map(a =>
        a.id === action.id ? { ...a, status: action.status, notes: action.notes } : a
      );
      return { ...state, anomalies };
    }

    default:
      return state;
  }
}

function triggerEvent(
  event: SimEvent,
  state: { hospitals: Hospital[]; ambulances: Ambulance[]; incidents: Incident[]; roads: Road[]; funds: FundFlow[]; supplies: SupplyItem[]; supplyRequests: SupplyRequest[]; anomalies: Anomaly[] }
): typeof state {
  const { hospitals, ambulances, incidents, roads, funds, supplies, supplyRequests, anomalies } = state;

  switch (event.type) {
    case 'flood':
      if (event.title.includes('Andheri')) {
        roads.forEach(r => { if (r.from === 'Andheri' || r.to === 'Andheri') r.condition = 'flooded'; });
      } else {
        roads.forEach(r => { if (r.condition === 'open' && Math.random() < 0.3) r.condition = 'flooded'; });
      }
      break;
    case 'collapse':
      // Already in initial incidents, but add more patients
      const dadarInc = incidents.find(i => i.area === 'Dadar');
      if (dadarInc) { dadarInc.redPatients += 5; dadarInc.patientCount += 10; }
      break;
    case 'capacity':
      const sionHosp = hospitals.find(h => h.area === 'Sion');
      if (sionHosp) { sionHosp.occupied.icu = sionHosp.capacity.icu; sionHosp.status = 'full'; }
      break;
    case 'blood':
      hospitals.forEach(h => { h.blood['O-'] = Math.max(0, h.blood['O-'] - 8); });
      break;
    case 'ambulance':
      const amb = ambulances.find(a => a.id === 'AMB-04');
      if (amb) { amb.status = 'broken'; amb.assignedIncidentId = null; }
      break;
    case 'casualty':
      const hindmataInc = incidents.find(i => i.area === 'Hindmata');
      if (hindmataInc) { hindmataInc.redPatients += 8; hindmataInc.yellowPatients += 12; hindmataInc.patientCount += 20; }
      break;
    case 'road':
      if (event.title.includes('Bridge')) {
        roads.forEach(r => { if ((r.from === 'Sion' && r.to === 'Dadar') || (r.from === 'Dadar' && r.to === 'Sion')) r.condition = 'blocked'; });
      } else if (event.title.includes('Reopens')) {
        roads.forEach(r => { if (r.from === 'Bandra' && r.to === 'Sion') r.condition = 'open'; });
      }
      break;
    case 'power':
      const cooper = hospitals.find(h => h.name.includes('Cooper'));
      if (cooper) cooper.status = 'power_failure';
      break;
    case 'surge':
      const inc = incidents.find(i => i.area === 'Hindmata');
      if (inc) { inc.redPatients += 5; inc.patientCount += 15; inc.urgency = Math.min(100, inc.urgency + 20); }
      break;
    case 'funds':
      funds.push({ id: `F${funds.length + 1}`, donor: 'Mumbai Business Council', amount: 20000000, purpose: 'General Relief', stage: 'pledged', recipient: 'Emergency Pool', timestamp: event.time });
      break;
    case 'supply':
      const stuck = supplies.find(s => s.name === 'Oxygen Cylinders');
      if (stuck) stuck.status = 'stuck';
      break;
    case 'anomaly':
      // Duplicate beneficiary — already in anomalies
      break;
  }
  return { hospitals, ambulances, incidents, roads, funds, supplies, supplyRequests, anomalies };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const [role, setRole] = useReducer((_: Role, r: Role) => r, 'Control Room' as Role);
  const [theme, setTheme] = useReducer((_: 'dark' | 'light', t: 'dark' | 'light') => t, 'dark' as 'dark' | 'light');
  const lastTickRef = useRef<number>(Date.now());

  // Simulation loop
  useEffect(() => {
    if (!state.running) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      dispatch({ type: 'TICK', dt: Math.min(dt, 0.5) });
    }, 200);
    return () => clearInterval(interval);
  }, [state.running, state.speed]);

  // Autopilot progression
  useEffect(() => {
    if (state.autopilotActive) {
      const timer = setTimeout(() => {
        dispatch({ type: 'AUTOPILOT_NEXT' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.autopilotActive, state.autopilotStep]);

  // Theme application
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const wrappedDispatch = useCallback((action: Action) => {
    if (action.type === 'SET_ROLE') setRole(action.role);
    else if (action.type === 'SET_THEME') setTheme(action.theme);
    else dispatch(action);
  }, [setRole, setTheme]);

  // Clear alert after 5 seconds
  useEffect(() => {
    if (state.alert) {
      const timer = setTimeout(() => dispatch({ type: 'SET_ALERT', alert: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [state.alert]);

  return (
    <Ctx.Provider value={{ ...state, role, theme, dispatch: wrappedDispatch, ledgerVerification: ledgerVerificationResult }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
