import type {
  Hospital, Ambulance, Incident, Road, AllocationDecision,
  HospitalAlternative, DecisionExplanation, GeoPoint
} from '../types';

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function roadFactor(incident: Incident, hospital: Hospital, roads: Road[]): { blocked: boolean; flooded: boolean; factor: number } {
  let blocked = false;
  let flooded = false;
  let factor = 1.0;
  for (const r of roads) {
    const connectsIncident = r.from === incident.area || r.to === incident.area;
    const connectsHospital = r.from === hospital.area || r.to === hospital.area;
    if (connectsIncident || connectsHospital) {
      if (r.condition === 'blocked') { blocked = true; factor *= 1.5; }
      if (r.condition === 'flooded') { flooded = true; factor *= 1.3; }
      if (r.condition === 'slow') { factor *= 1.15; }
    }
  }
  return { blocked, flooded, factor };
}

function etaMinutes(distance: number, factor: number, ambulance: Ambulance): number {
  const baseSpeed = ambulance.type === 'boat' ? 20 : 35; // km/h
  return Math.max(1, Math.round((distance / baseSpeed) * 60 * factor));
}

export interface AllocationResult {
  decision: AllocationDecision | null;
  message: string;
}

export function scoreHospital(
  incident: Incident,
  hospital: Hospital,
  ambulance: Ambulance,
  roads: Road[]
): { score: number; distance: number; eta: number; reasons: string[] } {
  const dist = haversineKm(incident.position, hospital.position);
  const rf = roadFactor(incident, hospital, roads);
  const eta = etaMinutes(dist, rf.factor, ambulance);

  const icuAvail = hospital.capacity.icu - hospital.occupied.icu;
  const erAvail = hospital.capacity.er - hospital.occupied.er;
  const totalAvail = icuAvail + erAvail + (hospital.capacity.ward - hospital.occupied.ward);

  // Projected capacity: patients that will arrive in next 10 min (rough estimate)
  const projectedIncoming = Math.max(0, Math.round(incident.redPatients * 0.6));
  const projectedIcu = Math.max(0, icuAvail - projectedIncoming);

  let score = 100;
  const reasons: string[] = [];

  // Distance penalty (closer is better but not dominant)
  score -= dist * 3;

  // ETA penalty
  score -= eta * 2;

  // ICU availability (critical for red patients)
  if (incident.redPatients > 0) {
    if (projectedIcu >= incident.redPatients) { score += 40; reasons.push('ICU capacity available'); }
    else if (projectedIcu > 0) { score += 15; reasons.push('Partial ICU capacity'); }
    else { score -= 50; reasons.push('ICU projected full'); }
  }

  // ER availability
  if (erAvail > 5) { score += 20; reasons.push('ER beds available'); }
  else if (erAvail > 0) { score += 5; }
  else { score -= 30; reasons.push('ER full'); }

  // Specialty match
  if (incident.severity === 'red') {
    if (hospital.specialty.includes('trauma')) { score += 25; reasons.push('Trauma specialty'); }
    else { score -= 15; }
    if (incident.area === 'Hindmata' && hospital.specialty.includes('pediatric')) {
      score += 15; reasons.push('Pediatric capability');
    }
  }
  if (incident.area === 'Dadar' && hospital.specialty.includes('neuro')) {
    score += 10;
  }

  // Blood compatibility
  const bloodNeeded = incident.bloodNeeded;
  let bloodOk = true;
  for (const bt of bloodNeeded) {
    if (hospital.blood[bt] < 5) { bloodOk = false; }
  }
  if (bloodOk) { score += 20; reasons.push('Blood compatible'); }
  else { score -= 30; reasons.push('Blood stock insufficient'); }

  // Road conditions
  if (rf.blocked) { score -= 40; reasons.push('Bridge/road blocked'); }
  if (rf.flooded) { score -= 15; }
  if (!rf.blocked && !rf.flooded) { reasons.push('Road accessible'); }

  // Hospital status
  if (hospital.status === 'power_failure') { score -= 25; reasons.push('Power failure'); }
  if (hospital.status === 'overloaded' || hospital.status === 'full') { score -= 35; reasons.push('Hospital overloaded'); }

  // Ambulance capability
  if (ambulance.type === 'icu' && incident.redPatients > 5) { score += 10; }
  if (ambulance.type === 'boat' && rf.flooded) { score += 25; reasons.push('Boat ambulance for flooded zone'); }

  // Fairness: prefer hospitals that haven't received many patients recently
  const loadRatio = hospital.occupied.er / hospital.capacity.er;
  score -= loadRatio * 10;

  // Fuel
  if (ambulance.fuel < 20) { score -= 10; }

  return { score: Math.round(score), distance: dist, eta, reasons };
}

export function findNearestHospital(incident: Incident, hospitals: Hospital[]): Hospital {
  let nearest = hospitals[0];
  let minDist = Infinity;
  for (const h of hospitals) {
    if (h.status === 'full') continue;
    const d = haversineKm(incident.position, h.position);
    if (d < minDist) { minDist = d; nearest = h; }
  }
  return nearest;
}

export function allocate(
  incident: Incident,
  ambulances: Ambulance[],
  hospitals: Hospital[],
  roads: Road[],
  engine: 'reliefchain' | 'baseline',
  simTime: number
): AllocationDecision | null {
  // Find best available ambulance
  const availableAmbs = ambulances.filter(a => a.status === 'idle' && a.fuel > 10);
  if (availableAmbs.length === 0) return null;

  // Pick ambulance closest to incident (same for both engines)
  let bestAmb = availableAmbs[0];
  let minAmbDist = Infinity;
  for (const a of availableAmbs) {
    const d = haversineKm(a.position, incident.position);
    if (d < minAmbDist) { minAmbDist = d; bestAmb = a; }
  }

  const scoredHospitals: { hospital: Hospital; score: number; distance: number; eta: number; reasons: string[] }[] = [];
  for (const h of hospitals) {
    if (h.status === 'full') continue;
    if (engine === 'baseline') {
      const dist = haversineKm(incident.position, h.position);
      scoredHospitals.push({ hospital: h, score: -dist, distance: dist, eta: Math.max(1, Math.round(dist / 35 * 60)), reasons: ['Nearest available hospital'] });
    } else {
      const result = scoreHospital(incident, h, bestAmb, roads);
      scoredHospitals.push({ hospital: h, ...result });
    }
  }

  if (scoredHospitals.length === 0) return null;
  scoredHospitals.sort((a, b) => b.score - a.score);

  const selected = scoredHospitals[0];
  const nearest = findNearestHospital(incident, hospitals);

  // Build alternatives
  const alternatives: HospitalAlternative[] = scoredHospitals.slice(0, 5).map(s => ({
    hospitalId: s.hospital.id,
    hospitalName: s.hospital.name,
    score: s.score,
    distance: Math.round(s.distance * 10) / 10,
    etaMinutes: s.eta,
    accepted: s.hospital.id === selected.hospital.id,
    reasons: s.reasons,
  }));

  // Build explanation
  const nearestScored = scoredHospitals.find(s => s.hospital.id === nearest.id);
  const selectedReasons = selected.reasons.filter(r => !r.includes('projected full') || r.includes('ICU'));
  const nearestRejectedReasons: string[] = [];
  if (nearest.id !== selected.hospital.id && nearestScored) {
    for (const r of nearestScored.reasons) {
      if (r.includes('full') || r.includes('insufficient') || r.includes('blocked') || r.includes('overloaded') || r.includes('Power') || r.includes('failure')) {
        nearestRejectedReasons.push(r);
      }
    }
    if (nearestRejectedReasons.length === 0) {
      nearestRejectedReasons.push('Lower overall allocation score');
    }
  } else {
    nearestRejectedReasons.push('Nearest hospital was the best option');
  }

  // Expected survivors: score-based estimate
  const expectedSurvivors = Math.round(incident.redPatients * (selected.score > 80 ? 0.9 : selected.score > 50 ? 0.7 : 0.5) + incident.yellowPatients * 0.4);
  const baselineSurvivors = Math.round(incident.redPatients * 0.55 + incident.yellowPatients * 0.35);

  const explanation: DecisionExplanation = {
    selectedReasons: selected.reasons,
    nearestRejectedReasons,
    expectedSurvivors,
    baselineSurvivors,
  };

  const decisionId = `DEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  return {
    id: decisionId,
    timestamp: simTime,
    incidentId: incident.id,
    incidentLabel: incident.label,
    ambulanceId: bestAmb.id,
    hospitalId: selected.hospital.id,
    selectedHospitalName: selected.hospital.name,
    nearestHospitalId: nearest.id,
    nearestHospitalName: nearest.name,
    action: `Dispatch ${bestAmb.id} → ${selected.hospital.name}`,
    score: selected.score,
    alternatives,
    constraints: [
      `Red patients: ${incident.redPatients}`,
      `SLA: ${incident.slaMinutes} min`,
      `ETA: ${selected.eta} min`,
      `ICU avail: ${selected.hospital.capacity.icu - selected.hospital.occupied.icu}`,
      `Blood O-: ${selected.hospital.blood['O-']}`,
    ],
    explanation,
    status: engine === 'baseline' ? 'auto_applied' : 'suggested',
    engine,
  };
}

export function haversine(a: GeoPoint, b: GeoPoint): number {
  return haversineKm(a, b);
}

// Apply a decision to world state (mutates copies)
export function applyDecision(
  incident: Incident,
  ambulance: Ambulance,
  hospital: Hospital,
  decision: AllocationDecision,
  alternatives: { hospital: Hospital }[]
): { incident: Incident; ambulance: Ambulance; hospital: Hospital } {
  const newIncident = { ...incident, status: 'assigned' as const, assignedAmbulanceId: ambulance.id, assignedHospitalId: hospital.id, etaMinutes: decision.alternatives[0]?.etaMinutes ?? null };
  const newAmb = { ...ambulance, status: 'dispatched' as const, assignedIncidentId: incident.id, assignedHospitalId: hospital.id };
  const newHosp = { ...hospital };
  return { incident: newIncident, ambulance: newAmb, hospital: newHosp };
}
