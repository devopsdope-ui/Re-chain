import type { LedgerBlock, LedgerEntry, FundFlow } from '../types';

function sha256(input: string): string {
  // Lightweight deterministic hash (not cryptographic, but good enough for demo)
  let hash = 0;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
    h2 ^= c;
    h2 = Math.imul(h2, 0x01000193);
  }
  const part1 = (hash >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  // Pad to simulate 64-char hash
  return (part1 + part2 + 'a'.repeat(48)).slice(0, 64);
}

export function computeMerkleRoot(entries: LedgerEntry[]): string {
  if (entries.length === 0) return sha256('empty');
  const hashes = entries.map(e => sha256(JSON.stringify(e)));
  while (hashes.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        next.push(sha256(hashes[i] + hashes[i + 1]));
      } else {
        next.push(sha256(hashes[i]));
      }
    }
    hashes.length = 0;
    hashes.push(...next);
  }
  return hashes[0];
}

export function createBlock(prevBlock: LedgerBlock | null, entries: LedgerEntry[], timestamp: number): LedgerBlock {
  const index = prevBlock ? prevBlock.index + 1 : 0;
  const previousHash = prevBlock ? prevBlock.hash : '0'.repeat(64);
  const merkleRoot = computeMerkleRoot(entries);
  const hash = sha256(`${index}${timestamp}${previousHash}${merkleRoot}${entries.length}`);
  return { index, timestamp, previousHash, hash, merkleRoot, entries, verified: true };
}

export function verifyChain(blocks: LedgerBlock[]): { valid: boolean; corruptedBlock: number | null; reason: string } {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const expectedPrev = i === 0 ? '0'.repeat(64) : blocks[i - 1].hash;
    if (block.previousHash !== expectedPrev) {
      return { valid: false, corruptedBlock: block.index, reason: `Hash mismatch: block ${block.index} previousHash does not match block ${i - 1} hash` };
    }
    const expectedMerkle = computeMerkleRoot(block.entries);
    if (block.merkleRoot !== expectedMerkle) {
      return { valid: false, corruptedBlock: block.index, reason: `Merkle root mismatch in block ${block.index}` };
    }
    const expectedHash = sha256(`${block.index}${block.timestamp}${block.previousHash}${block.merkleRoot}${block.entries.length}`);
    if (block.hash !== expectedHash) {
      return { valid: false, corruptedBlock: block.index, reason: `Hash mismatch detected in block ${block.index}` };
    }
  }
  return { valid: true, corruptedBlock: null, reason: '' };
}

export function tamperBlock(blocks: LedgerBlock[], blockIndex: number): LedgerBlock[] {
  const newBlocks = blocks.map(b => ({ ...b, entries: [...b.entries] }));
  if (blockIndex < 0 || blockIndex >= newBlocks.length) return newBlocks;
  const block = newBlocks[blockIndex];
  if (block.entries.length > 0) {
    const entry = block.entries[0];
    block.entries[0] = {
      ...entry,
      description: entry.description + ' [TAMPERED]',
      amount: entry.amount ? entry.amount * 10 : 999,
    };
    block.tampered = true;
  }
  return newBlocks;
}

export function initFunds(): FundFlow[] {
  return [
    { id: 'F1', donor: 'Mumbai Business Council', amount: 50000000, purpose: 'General Relief', stage: 'verified', recipient: 'Emergency Pool', timestamp: 0, deliveryAmount: 50000000, deliveryUnit: '₹', deliveryQty: 1 },
    { id: 'F2', donor: 'Tata Trusts', amount: 30000000, purpose: 'Medical Supplies', stage: 'delivered', recipient: 'KEM Hospital', timestamp: 2, deliveryAmount: 5000000, deliveryUnit: '₹', deliveryQty: 1 },
    { id: 'F3', donor: 'Reliance Foundation', amount: 25000000, purpose: 'Shelter & Food', stage: 'released', recipient: 'NGO-Pratham', timestamp: 4 },
    { id: 'F4', donor: 'HDFC ERGO', amount: 10000000, purpose: 'Ambulance Fuel', stage: 'allocated', recipient: 'Fleet Ops', timestamp: 6 },
    { id: 'F5', donor: 'Individual Donors (412)', amount: 8500000, purpose: 'Blood Bank Support', stage: 'pledged', recipient: 'Emergency Pool', timestamp: 8 },
    { id: 'F6', donor: 'Maharashtra Govt', amount: 40000000, purpose: 'Infrastructure Repair', stage: 'allocated', recipient: 'Public Works', timestamp: 10 },
    { id: 'F7', donor: 'BCCI Relief Fund', amount: 15000000, purpose: 'Medical Equipment', stage: 'pledged', recipient: 'Emergency Pool', timestamp: 12 },
  ];
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}
