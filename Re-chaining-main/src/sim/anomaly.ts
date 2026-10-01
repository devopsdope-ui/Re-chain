import type { Anomaly, FundFlow } from '../types';

export function initAnomalies(funds: FundFlow[]): Anomaly[] {
  return [
    {
      id: 'AN-001',
      type: 'duplicate_beneficiary',
      severity: 'high',
      title: 'Duplicate Beneficiary Registration',
      description: 'Aadhaar number XXXX-XXXX-1234 registered at both Dadar and Hindmata relief camps within 5 minutes',
      evidence: [
        'Camp Dadar: Registration #R-0451 at t=8min',
        'Camp Hindmata: Registration #R-0489 at t=13min',
        'Same Aadhaar hash: a1b2c3d4',
        'Same biometric template match: 97.3%',
      ],
      linkedRecords: ['R-0451', 'R-0489', 'LED-0042'],
      status: 'investigating',
      notes: 'Field team dispatched to verify identity. Possible family member with same biometric similarity.',
      detectedAt: 14,
    },
    {
      id: 'AN-002',
      type: 'over_allocation',
      severity: 'medium',
      title: 'Over-allocation of Oxygen Cylinders',
      description: 'KEM Hospital received 40 oxygen cylinders but only reported 25 in use',
      evidence: [
        'Supply dispatch: 40 cylinders (LED-0035)',
        'Hospital inventory check: 25 in use',
        'Discrepancy: 15 cylinders unaccounted',
      ],
      linkedRecords: ['REQ-001', 'LED-0035', 'SUP-003'],
      status: 'new',
      notes: '',
      detectedAt: 13,
    },
    {
      id: 'AN-003',
      type: 'ghost_delivery',
      severity: 'critical',
      title: 'Ghost Delivery Detected',
      description: 'Delivery confirmation for food packets to Relief Camp Worli, but camp reports no receipt',
      evidence: [
        'Delivery confirmation: 500 food packets (LED-0038)',
        'GPS of delivery truck: Last seen near Worli at t=11',
        'Camp Worli log: No delivery received',
        'Driver phone unreachable',
      ],
      linkedRecords: ['LED-0038', 'REQ-006', 'DRV-009'],
      status: 'escalated',
      notes: 'Escalated to law enforcement. Possible diversion of relief supplies.',
      detectedAt: 12,
    },
    {
      id: 'AN-004',
      type: 'unusual_pricing',
      severity: 'medium',
      title: 'Unusual Vendor Pricing',
      description: 'Vendor MedSupply Co. charged 3x market rate for IV fluids',
      evidence: [
        'Invoice: ₹450/unit (Market avg: ₹150/unit)',
        'Quantity: 100 units',
        'Overcharge: ₹30,000',
        'Vendor not on approved list',
      ],
      linkedRecords: ['LED-0040', 'VND-003'],
      status: 'new',
      notes: '',
      detectedAt: 13,
    },
  ];
}

export function detectAnomalies(funds: FundFlow[]): Anomaly[] {
  // Runtime detection would go here; for now we use seeded anomalies
  return [];
}
