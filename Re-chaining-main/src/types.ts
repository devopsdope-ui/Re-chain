// ===== Core Types =====

export type Role = 'Judge' | 'Control Room' | 'Hospital' | 'NGO' | 'Donor' | 'Auditor' | 'Public';

export type Severity = 'red' | 'yellow' | 'green';
export type IncidentStatus = 'active' | 'assigned' | 'transporting' | 'admitted' | 'resolved';
export type AmbulanceStatus = 'idle' | 'dispatched' | 'transporting' | 'returning' | 'broken';
export type AmbulanceType = 'basic' | 'advanced' | 'icu' | 'boat';
export type HospitalStatus = 'operational' | 'overloaded' | 'power_failure' | 'full';
export type RoadCondition = 'open' | 'flooded' | 'blocked' | 'slow';
export type DecisionStatus = 'suggested' | 'approved' | 'auto_applied' | 'overridden' | 'stale';
export type AnomalyStatus = 'new' | 'investigating' | 'resolved' | 'escalated';
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface GeoPoint { lat: number; lng: number; }

export interface Hospital {
  id: string;
  name: string;
  specialty: string[];
  capacity: { er: number; icu: number; ward: number };
  occupied: { er: number; icu: number; ward: number };
  blood: { 'A+': number; 'A-': number; 'B+': number; 'B-': number; 'O+': number; 'O-': number; 'AB+': number; 'AB-': number };
  status: HospitalStatus;
  position: GeoPoint;
  area: string;
}

export interface Ambulance {
  id: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  position: GeoPoint;
  assignedIncidentId: string | null;
  assignedHospitalId: string | null;
  fuel: number;
  homeHospital: string;
  capability: number;
}

export interface Incident {
  id: string;
  label: string;
  severity: Severity;
  area: string;
  position: GeoPoint;
  patientCount: number;
  redPatients: number;
  yellowPatients: number;
  greenPatients: number;
  bloodNeeded: (keyof Hospital['blood'])[];
  urgency: number;
  slaMinutes: number;
  createdAt: number;
  status: IncidentStatus;
  description: string;
  assignedAmbulanceId: string | null;
  assignedHospitalId: string | null;
  etaMinutes: number | null;
}

export interface Road {
  id: string;
  from: string;
  to: string;
  condition: RoadCondition;
  fromPos: GeoPoint;
  toPos: GeoPoint;
}

export interface SupplyItem {
  id: string;
  name: string;
  type: 'medical' | 'food' | 'water' | 'shelter' | 'fuel';
  quantity: number;
  unit: string;
  location: string;
  status: 'available' | 'in_transit' | 'delivered' | 'stuck';
  destination?: string;
}

export interface SupplyRequest {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  requester: string;
  area: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'allocated' | 'dispatched' | 'delivered';
  createdAt: number;
}

export interface AllocationDecision {
  id: string;
  timestamp: number;
  incidentId: string;
  incidentLabel: string;
  ambulanceId: string;
  hospitalId: string;
  selectedHospitalName: string;
  nearestHospitalId: string;
  nearestHospitalName: string;
  action: string;
  score: number;
  alternatives: HospitalAlternative[];
  constraints: string[];
  explanation: DecisionExplanation;
  status: DecisionStatus;
  overrideReason?: string;
  pinned?: boolean;
  engine: 'reliefchain' | 'baseline';
}

export interface HospitalAlternative {
  hospitalId: string;
  hospitalName: string;
  score: number;
  distance: number;
  etaMinutes: number;
  accepted: boolean;
  reasons: string[];
}

export interface DecisionExplanation {
  selectedReasons: string[];
  nearestRejectedReasons: string[];
  expectedSurvivors: number;
  baselineSurvivors: number;
}

export interface LedgerBlock {
  index: number;
  timestamp: number;
  previousHash: string;
  hash: string;
  merkleRoot: string;
  entries: LedgerEntry[];
  verified: boolean;
  tampered?: boolean;
}

export interface LedgerEntry {
  type: 'allocation' | 'dispatch' | 'pickup' | 'admission' | 'supply_transfer' | 'fund_pledge' | 'fund_release' | 'vendor_payment' | 'delivery_confirmation';
  description: string;
  amount?: number;
  entityId: string;
  metadata?: Record<string, string | number>;
}

export interface FundFlow {
  id: string;
  donor: string;
  amount: number;
  purpose: string;
  stage: 'pledged' | 'allocated' | 'released' | 'delivered' | 'verified';
  recipient: string;
  timestamp: number;
  deliveryAmount?: number;
  deliveryUnit?: string;
  deliveryQty?: number;
}

export interface Anomaly {
  id: string;
  type: 'duplicate_claim' | 'duplicate_beneficiary' | 'over_allocation' | 'unusual_pricing' | 'ghost_delivery';
  severity: AnomalySeverity;
  title: string;
  description: string;
  evidence: string[];
  linkedRecords: string[];
  status: AnomalyStatus;
  notes: string;
  detectedAt: number;
}

export interface SimEvent {
  id: number;
  time: number;
  title: string;
  description: string;
  type: string;
  triggered: boolean;
}

export interface WorldState {
  simTime: number;
  startTime: number;
  running: boolean;
  speed: number;
  hospitals: Hospital[];
  ambulances: Ambulance[];
  incidents: Incident[];
  roads: Road[];
  supplies: SupplyItem[];
  supplyRequests: SupplyRequest[];
  decisions: AllocationDecision[];
  events: SimEvent[];
  ledger: LedgerBlock[];
  funds: FundFlow[];
  anomalies: Anomaly[];
  stats: SimStats;
  alert: string | null;
  autopilotActive: boolean;
  autopilotStep: number;
}

export interface SimStats {
  estimatedSurvivors: number;
  baselineSurvivors: number;
  avgRedTreatmentTime: number;
  worstTreatmentTime: number;
  icuOverloads: number;
  unservedCritical: number;
  ambulanceUtilization: number;
  equityScore: number;
  pendingDecisions: number;
  activeAmbulances: number;
  activeIncidents: number;
  hospitalOverloads: number;
  activeSupplyRequests: number;
  bloodAvailability: number;
  icuAvailability: number;
}
