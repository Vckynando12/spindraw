export type Participant = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  quota: number;             // hasil perhitungan seimbang
  members: Participant[];
  color?: string;
  icon?: string;
};

export type DrawHistoryEntry = {
  participantId: string;
  participantName: string;
  teamId: string;
  teamName: string;
  timestamp: number;
};

export type Category = {
  id: string;
  label: string;             // "Laki-laki usia 3 tahun"
  totalTarget: number;       // total peserta
  maxCapacityPerTeam: number; // kapasitas maks per tim (dinamis, default 10)
  customTeamCount?: number;   // jumlah tim kustom jika ditentukan panitia
  remaining: Participant[];  // yang belum dapat tim
  teams: Team[];
  history: DrawHistoryEntry[]; // untuk undo
};


export type PrizeDraw = {
  id: string;
  prizeName?: string;
  winners: Participant[];
  drawnAt: string;           // ISO format
};

export type PrizeSettings = {
  removeWinnersAfterDraw: boolean; // default: true
  winnersCountPerSpin: number;     // default: 10
  prizeName: string;
  spinDuration: number;            // seconds, default 5
  soundEnabled: boolean;
  confettiEnabled: boolean;
};

export type TeamSettings = {
  maxCapacityPerTeam: number;      // default: 10
  spinDuration: number;            // seconds, default 4
  fastSpin: boolean;               // skip/shorten animation
  autoSpin: boolean;               // auto spin every 2s
  soundEnabled: boolean;
  confettiEnabled: boolean;
  eventName: string;               // default: "Bikini Bottom Grand Prix"
};
