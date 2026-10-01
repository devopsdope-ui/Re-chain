import { Rng, SEED } from './rng';
import type {
  Hospital, Ambulance, Incident, Road, SupplyItem, SupplyRequest,
  SimEvent, GeoPoint
} from '../types';

// Mumbai area coordinates
export const MUMBAI_AREAS: Record<string, GeoPoint> = {
  'Andheri': { lat: 19.1197, lng: 72.8468 },
  'Sion': { lat: 19.0760, lng: 72.8530 },
  'Hindmata': { lat: 19.0730, lng: 72.8360 },
  'Milan Subway': { lat: 19.1030, lng: 72.8410 },
  'Sion Circle': { lat: 19.0758, lng: 72.8535 },
  'Bandra': { lat: 19.0690, lng: 72.8390 },
  'Dadar': { lat: 19.0850, lng: 72.8430 },
  'Kurla': { lat: 19.0720, lng: 72.8780 },
  'Juhu': { lat: 19.1070, lng: 72.8380 },
  'Worli': { lat: 19.0170, lng: 72.8230 },
};

const rng = new Rng(SEED);

function bloodStock(): Hospital['blood'] {
  return {
    'A+': rng.int(5, 20), 'A-': rng.int(2, 10),
    'B+': rng.int(5, 20), 'B-': rng.int(2, 10),
    'O+': rng.int(8, 30), 'O-': rng.int(3, 15),
    'AB+': rng.int(2, 8), 'AB-': rng.int(1, 5),
  };
}

export function initHospitals(): Hospital[] {
  const defs = [
    { id: 'H1', name: 'KEM Hospital', area: 'Sion', specialty: ['trauma', 'cardiac', 'pediatric'], cap: { er: 40, icu: 20, ward: 100 } },
    { id: 'H2', name: 'Lokmanya Tilak (Sion)', area: 'Sion', specialty: ['trauma', 'neuro'], cap: { er: 35, icu: 15, ward: 80 } },
    { id: 'H3', name: 'Holy Spirit Hospital', area: 'Andheri', specialty: ['cardiac', 'general'], cap: { er: 25, icu: 12, ward: 60 } },
    { id: 'H4', name: 'Cooper Hospital', area: 'Bandra', specialty: ['trauma', 'pediatric'], cap: { er: 30, icu: 14, ward: 70 } },
    { id: 'H5', name: 'Hinduja Hospital', area: 'Worli', specialty: ['neuro', 'cardiac', 'trauma'], cap: { er: 30, icu: 18, ward: 90 } },
    { id: 'H6', name: 'Breach Candy', area: 'Worli', specialty: ['general', 'cardiac'], cap: { er: 20, icu: 10, ward: 50 } },
    { id: 'H7', name: 'Nanavati Hospital', area: 'Juhu', specialty: ['trauma', 'general', 'pediatric'], cap: { er: 28, icu: 12, ward: 65 } },
    { id: 'H8', name: 'Fortis Mulund', area: 'Kurla', specialty: ['cardiac', 'neuro'], cap: { er: 22, icu: 10, ward: 55 } },
  ];
  return defs.map(d => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    capacity: d.cap,
    occupied: { er: rng.int(10, d.cap.er - 5), icu: rng.int(5, d.cap.icu - 2), ward: rng.int(30, d.cap.ward - 10) },
    blood: bloodStock(),
    status: 'operational',
    position: MUMBAI_AREAS[d.area],
    area: d.area,
  }));
}

export function initAmbulances(): Ambulance[] {
  const types: Ambulance['type'][] = ['basic', 'advanced', 'icu', 'boat'];
  const homes = ['H1', 'H2', 'H3', 'H4', 'H5', 'H7'];
  const ambulances: Ambulance[] = [];
  for (let i = 1; i <= 12; i++) {
    const type = types[i % types.length];
    const home = homes[i % homes.length];
    ambulances.push({
      id: `AMB-${String(i).padStart(2, '0')}`,
      type,
      status: 'idle',
      position: { lat: 19.05 + rng.next() * 0.08, lng: 72.82 + rng.next() * 0.06 },
      assignedIncidentId: null,
      assignedHospitalId: null,
      fuel: rng.int(60, 100),
      homeHospital: home,
      capability: type === 'icu' ? 3 : type === 'advanced' ? 2 : type === 'boat' ? 2 : 1,
    });
  }
  return ambulances;
}

export function initIncidents(): Incident[] {
  const defs = [
    { label: 'Building Collapse – Dadar', area: 'Dadar', sev: 'red' as const, red: 18, yellow: 12, green: 20, desc: '3-storey residential collapse, multiple trapped' },
    { label: 'Flooding – Hindmata Junction', area: 'Hindmata', sev: 'red' as const, red: 12, yellow: 25, green: 40, desc: 'Severe waterlogging, stranded residents' },
    { label: 'Andheri Subway Flood', area: 'Andheri', sev: 'yellow' as const, red: 5, yellow: 18, green: 30, desc: 'Subway under 4ft water, vehicles submerged' },
    { label: 'Milan Subway Overflow', area: 'Milan Subway', sev: 'yellow' as const, red: 3, yellow: 10, green: 15, desc: 'Traffic gridlock, medical emergencies' },
    { label: 'Sion Circle Waterlogging', area: 'Sion Circle', sev: 'yellow' as const, red: 4, yellow: 8, green: 20, desc: 'Major junction flooded, ambulance access difficult' },
  ];
  return defs.map((d, i) => {
    const pos = MUMBAI_AREAS[d.area];
    return {
      id: `INC-${String(i + 1).padStart(3, '0')}`,
      label: d.label,
      severity: d.sev,
      area: d.area,
      position: { lat: pos.lat + (rng.next() - 0.5) * 0.01, lng: pos.lng + (rng.next() - 0.5) * 0.01 },
      patientCount: d.red + d.yellow + d.green,
      redPatients: d.red,
      yellowPatients: d.yellow,
      greenPatients: d.green,
      bloodNeeded: d.sev === 'red' ? ['O-', 'B+'] : ['O+'],
      urgency: d.sev === 'red' ? rng.int(85, 100) : rng.int(40, 70),
      slaMinutes: d.sev === 'red' ? 15 : 30,
      createdAt: rng.int(0, 5),
      status: 'active' as const,
      description: d.desc,
      assignedAmbulanceId: null,
      assignedHospitalId: null,
      etaMinutes: null,
    };
  });
}

export function initRoads(): Road[] {
  const roadDefs = [
    { from: 'Andheri', to: 'Sion' },
    { from: 'Sion', to: 'Dadar' },
    { from: 'Dadar', to: 'Hindmata' },
    { from: 'Hindmata', to: 'Sion Circle' },
    { from: 'Sion Circle', to: 'Sion' },
    { from: 'Milan Subway', to: 'Andheri' },
    { from: 'Bandra', to: 'Sion' },
    { from: 'Andheri', to: 'Juhu' },
    { from: 'Worli', to: 'Dadar' },
    { from: 'Kurla', to: 'Sion' },
  ];
  return roadDefs.map((r, i) => ({
    id: `R${i + 1}`,
    from: r.from,
    to: r.to,
    condition: rng.bool(0.25) ? 'flooded' : rng.bool(0.1) ? 'slow' : 'open',
    fromPos: MUMBAI_AREAS[r.from],
    toPos: MUMBAI_AREAS[r.to],
  }));
}

export function initSupplies(): SupplyItem[] {
  const items = [
    { name: 'IV Fluids', type: 'medical' as const, qty: 500, unit: 'units' },
    { name: 'Bandages', type: 'medical' as const, qty: 2000, unit: 'rolls' },
    { name: 'Oxygen Cylinders', type: 'medical' as const, qty: 80, unit: 'cylinders' },
    { name: 'Tetanus Vials', type: 'medical' as const, qty: 300, unit: 'vials' },
    { name: 'Water Bottles', type: 'water' as const, qty: 5000, unit: 'bottles' },
    { name: 'Food Packets', type: 'food' as const, qty: 3000, unit: 'packets' },
    { name: 'Tarpaulin Sheets', type: 'shelter' as const, qty: 200, unit: 'sheets' },
    { name: 'Diesel', type: 'fuel' as const, qty: 500, unit: 'liters' },
  ];
  return items.map((it, i) => ({
    id: `SUP-${String(i + 1).padStart(3, '0')}`,
    name: it.name,
    type: it.type,
    quantity: it.qty,
    unit: it.unit,
    location: ['H1', 'H3', 'H5', 'Warehouse-Kurla'][i % 4],
    status: i === 7 ? 'stuck' : 'available',
  }));
}

export function initSupplyRequests(): SupplyRequest[] {
  const reqs = [
    { item: 'Oxygen Cylinders', qty: 20, unit: 'cylinders', requester: 'KEM Hospital', area: 'Sion', priority: 'urgent' as const },
    { item: 'IV Fluids', qty: 100, unit: 'units', requester: 'Cooper Hospital', area: 'Bandra', priority: 'high' as const },
    { item: 'Water Bottles', qty: 500, unit: 'bottles', requester: 'Relief Camp Dadar', area: 'Dadar', priority: 'normal' as const },
    { item: 'Food Packets', qty: 300, unit: 'packets', requester: 'Relief Camp Hindmata', area: 'Hindmata', priority: 'high' as const },
  ];
  return reqs.map((r, i) => ({
    id: `REQ-${String(i + 1).padStart(3, '0')}`,
    item: r.item,
    quantity: r.qty,
    unit: r.unit,
    requester: r.requester,
    area: r.area,
    priority: r.priority,
    status: 'pending' as const,
    createdAt: rng.int(0, 10),
  }));
}

export function initEvents(): SimEvent[] {
  return [
    { id: 1, time: 1, title: 'Initial Flooding', description: 'Heavy rainfall causes widespread flooding across low-lying areas of Mumbai', type: 'flood', triggered: false },
    { id: 2, time: 2, title: 'Building Collapse – Dadar', description: '3-storey residential building collapses near Dadar, 18 critical patients', type: 'collapse', triggered: false },
    { id: 3, time: 4, title: 'Andheri Subway Floods', description: 'Andheri subway under 4ft water, vehicles submerged', type: 'flood', triggered: false },
    { id: 4, time: 5, title: 'Hospital ICU Reaches Capacity', description: 'Lokmanya Tilak ICU fully occupied, diverting critical patients', type: 'capacity', triggered: false },
    { id: 5, time: 6, title: 'O-Negative Shortage', description: 'City-wide O-negative blood inventory drops critically low', type: 'blood', triggered: false },
    { id: 6, time: 7, title: 'Ambulance Breakdown', description: 'AMB-04 engine failure near Sion Circle', type: 'ambulance', triggered: false },
    { id: 7, time: 8, title: 'Flooded-Zone Casualty Cluster', description: '20+ casualties reported in Hindmata flooded zone', type: 'casualty', triggered: false },
    { id: 8, time: 9, title: 'Bridge Closure', description: 'Sion-Dadar bridge closed due to structural concerns', type: 'road', triggered: false },
    { id: 9, time: 10, title: 'Hospital Power Failure', description: 'Cooper Hospital loses grid power, running on backup generator', type: 'power', triggered: false },
    { id: 10, time: 11, title: 'Pediatric Surge', description: '15 children among new casualties at Hindmata, need pediatric ICU', type: 'surge', triggered: false },
    { id: 11, time: 12, title: 'Donor Funds Arrive', description: '₹2 crore pledged by Mumbai Business Council for relief operations', type: 'funds', triggered: false },
    { id: 12, time: 13, title: 'Supply Truck Stuck', description: 'Supply truck carrying oxygen cylinders stranded at Kurla junction', type: 'supply', triggered: false },
    { id: 13, time: 14, title: 'Duplicate Beneficiary Anomaly', description: 'Same Aadhaar number registered at two relief camps', type: 'anomaly', triggered: false },
    { id: 14, time: 15, title: 'Road Reopens', description: 'Bandra-Sion road cleared by municipal crews', type: 'road', triggered: false },
  ];
}
