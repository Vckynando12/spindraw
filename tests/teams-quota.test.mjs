import test from 'node:test';
import assert from 'node:assert/strict';

// Logika sesuai Bagian 4.2 SPEC.md
function calculateTeamQuotas(totalParticipants, maxCapacityPerTeam = 10, customTeamCount) {
  if (totalParticipants <= 0) return [];
  const teamCount = customTeamCount && customTeamCount > 0
    ? customTeamCount
    : Math.max(1, Math.ceil(totalParticipants / maxCapacityPerTeam));

  const base = Math.floor(totalParticipants / teamCount);
  const sisa = totalParticipants % teamCount;

  return Array.from({ length: teamCount }, (_, i) => base + (i < sisa ? 1 : 0));
}

test('Perhitungan kuota seimbang untuk 40 peserta (Laki-laki 2 tahun)', () => {
  const quotas = calculateTeamQuotas(40, 10);
  assert.deepEqual(quotas, [10, 10, 10, 10]);
  assert.equal(quotas.reduce((a, b) => a + b, 0), 40);
  assert.ok(quotas.every((q) => q <= 10));
});

test('Perhitungan kuota seimbang untuk 43 peserta (Laki-laki 3 tahun)', () => {
  const quotas = calculateTeamQuotas(43, 10);
  // Sesuai SPEC.md: 43 peserta -> 5 tim -> 9, 9, 9, 8, 8
  assert.deepEqual(quotas, [9, 9, 9, 8, 8]);
  assert.equal(quotas.reduce((a, b) => a + b, 0), 43);
  assert.ok(quotas.every((q) => q <= 10));
});

test('Perhitungan kuota seimbang untuk 20 peserta (Perempuan 2 tahun)', () => {
  const quotas = calculateTeamQuotas(20, 10);
  assert.deepEqual(quotas, [10, 10]);
  assert.equal(quotas.reduce((a, b) => a + b, 0), 20);
  assert.ok(quotas.every((q) => q <= 10));
});

test('Perhitungan kuota bila total 0', () => {
  assert.deepEqual(calculateTeamQuotas(0, 10), []);
});
