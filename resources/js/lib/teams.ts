import { Team, Participant } from '../types';

export const DEFAULT_TEAM_NAMES = [
  "Krusty Krab Racers",
  "Bikini Bottom Bolts",
  "Jellyfish Fields Turbo",
  "Chum Bucket Speedsters",
  "Rock Bottom Rockets",
  "Sandy's Treedome Racers",
  "Boating School Drifters",
  "Flying Dutchman Ghosts",
  "Goo Lagoon Gliders",
  "Salty Spitoon Speeders",
  "Kelp Forest Sprinters",
  "Weenie Hut Hotrods"
];

export const TEAM_COLORS = [
  { primary: '#FFE135', secondary: '#B89B00', text: '#000000', badge: 'bg-[#FFE135] text-black' },
  { primary: '#1CA3DE', secondary: '#0B6D9C', text: '#FFFFFF', badge: 'bg-[#1CA3DE] text-white' },
  { primary: '#E63946', secondary: '#9B1B26', text: '#FFFFFF', badge: 'bg-[#E63946] text-white' },
  { primary: '#2EC4B6', secondary: '#1A7A71', text: '#FFFFFF', badge: 'bg-[#2EC4B6] text-white' },
  { primary: '#FF9F1C', secondary: '#B86A00', text: '#FFFFFF', badge: 'bg-[#FF9F1C] text-white' },
  { primary: '#A06CD5', secondary: '#623B8A', text: '#FFFFFF', badge: 'bg-[#A06CD5] text-white' },
  { primary: '#8B5A2B', secondary: '#533315', text: '#FFFFFF', badge: 'bg-[#8B5A2B] text-white' },
  { primary: '#48CAE4', secondary: '#0077B6', text: '#FFFFFF', badge: 'bg-[#48CAE4] text-black' },
];

export const CAR_ICONS = ['🏎️', '🚗', '🏁', '🚙', '🏎️', '🚀', '⚡', '🛸'];

/**
 * Menghitung kuota seimbang sesuai Bagian 4.2 SPEC.md:
 * jumlahTim = ceil(jumlahPeserta / kapasitasMaksTim)
 * base = floor(jumlahPeserta / jumlahTim)
 * sisa = jumlahPeserta % jumlahTim
 * kuota tim ke-i = base + 1 jika i < sisa, selain itu base
 */
export function calculateTeamQuotas(
  totalParticipants: number,
  maxCapacityPerTeam = 10,
  customTeamCount?: number
): number[] {
  if (totalParticipants <= 0) return [];
  
  const teamCount = customTeamCount && customTeamCount > 0
    ? customTeamCount
    : Math.max(1, Math.ceil(totalParticipants / maxCapacityPerTeam));

  const base = Math.floor(totalParticipants / teamCount);
  const sisa = totalParticipants % teamCount;

  return Array.from({ length: teamCount }, (_, i) => base + (i < sisa ? 1 : 0));
}

/**
 * Membuat list Tim baru dengan kuota seimbang
 */
export function initializeTeams(
  totalParticipants: number,
  maxCapacityPerTeam = 10,
  customTeamCount?: number,
  existingTeamNames: string[] = []
): Team[] {
  const quotas = calculateTeamQuotas(totalParticipants, maxCapacityPerTeam, customTeamCount);

  return quotas.map((quota, idx) => {
    const defaultName = existingTeamNames[idx] || DEFAULT_TEAM_NAMES[idx % DEFAULT_TEAM_NAMES.length] || `Tim ${idx + 1}`;
    const color = TEAM_COLORS[idx % TEAM_COLORS.length].primary;
    const icon = CAR_ICONS[idx % CAR_ICONS.length];

    return {
      id: `team-${idx + 1}-${Date.now().toString(36)}`,
      name: defaultName,
      quota,
      members: [],
      color,
      icon,
    };
  });
}

/**
 * Tim aktif = tim pertama yang belum mencapai kuotanya
 */
export function getActiveTeam(teams: Team[]): Team | undefined {
  return teams.find((t) => t.members.length < t.quota);
}

/**
 * Tim yang sudah penuh / finish
 */
export function isAllTeamsFinished(teams: Team[]): boolean {
  if (teams.length === 0) return false;
  return teams.every((t) => t.members.length >= t.quota);
}

/**
 * Parse string list nama (satu per baris) menjadi Participant[]
 */
export function parseParticipantNames(text: string): Participant[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((name, index) => ({
      id: `p-${index + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name,
    }));
}

/**
 * Buat peserta dummy jika panitia hanya memasukkan jumlah peserta
 * Misal: 43 -> "Peserta 1", "Peserta 2", ...
 */
export function generateDefaultParticipants(count: number, prefix = 'Peserta'): Participant[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}-${Date.now().toString(36)}`,
    name: `${prefix} ${i + 1}`,
  }));
}
