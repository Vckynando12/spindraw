import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Participant, PrizeDraw, PrizeSettings } from '../types';
import { shuffle } from '../lib/random';

interface PrizeState {
  participants: Participant[];
  winnersHistory: PrizeDraw[];
  removedWinners: Participant[];
  settings: PrizeSettings;
  activeTab: 'names' | 'winners';
  isSpinning: boolean;
  latestWinnersDialog: {
    isOpen: boolean;
    winners: Participant[];
    prizeName?: string;
  } | null;

  // Actions
  setActiveTab: (tab: 'names' | 'winners') => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipantsFromText: (text: string) => void;
  clearParticipants: () => void;
  shuffleParticipantsList: () => void;
  sortParticipantsAlphabetically: () => void;

  updateSettings: (partial: Partial<PrizeSettings>) => void;
  
  recordWinnersDraw: (winners: Participant[], prizeName?: string) => void;
  restoreWinner: (participantId: string) => void;
  clearHistory: () => void;

  setIsSpinning: (spinning: boolean) => void;
  setLatestWinnersDialog: (dialog: { isOpen: boolean; winners: Participant[]; prizeName?: string } | null) => void;
}

const DEFAULT_NAMES = [
  'SpongeBob SquarePants',
  'Patrick Star',
  'Squidward Tentacles',
  'Mr. Eugene Krabs',
  'Sandy Cheeks',
  'Gary the Snail',
  'Sheldon J. Plankton',
  'Karen Plankton',
  'Pearl Krabs',
  'Mrs. Puff',
  'Larry the Lobster',
  'Barnacle Boy',
  'Mermaid Man',
  'Flying Dutchman',
  'Old Man Jenkins',
  'Bubble Buddy',
  'Fred (My Leg!)',
  'Tom (Chocolate Guy)',
  'Harold',
  'Perch Perkins',
  'Squilliam Fancyson',
  'King Neptune',
  'Princess Mindy',
  'Dennis the Bounty Hunter',
  'Man Ray'
];

export const usePrizeStore = create<PrizeState>()(
  persist(
    (set, get) => ({
      participants: DEFAULT_NAMES.map((name, i) => ({
        id: `prize-p-${i + 1}-${Date.now().toString(36)}`,
        name
      })),
      winnersHistory: [],
      removedWinners: [],
      settings: {
        removeWinnersAfterDraw: true,
        winnersCountPerSpin: 10,
        prizeName: 'Grand Prix Trophy & Doorprize 🏆',
        spinDuration: 5,
        soundEnabled: true,
        confettiEnabled: true
      },
      activeTab: 'names',
      isSpinning: false,
      latestWinnersDialog: null,

      setActiveTab: (activeTab) => set({ activeTab }),

      setParticipants: (participants) => set({ participants }),

      addParticipantsFromText: (text) => {
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        const newItems: Participant[] = lines.map((name, idx) => ({
          id: `p-${idx + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          name
        }));

        set({ participants: newItems });
      },

      clearParticipants: () => set({ participants: [] }),

      shuffleParticipantsList: () => {
        set((state) => ({
          participants: shuffle(state.participants)
        }));
      },

      sortParticipantsAlphabetically: () => {
        set((state) => ({
          participants: [...state.participants].sort((a, b) => a.name.localeCompare(b.name, 'id'))
        }));
      },

      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial }
        }));
      },

      recordWinnersDraw: (winners, prizeName) => {
        const drawRecord: PrizeDraw = {
          id: `draw-${Date.now().toString(36)}`,
          prizeName: prizeName || get().settings.prizeName,
          winners,
          drawnAt: new Date().toISOString()
        };

        const { removeWinnersAfterDraw } = get().settings;

        set((state) => {
          let updatedParticipants = [...state.participants];
          let updatedRemoved = [...state.removedWinners];

          if (removeWinnersAfterDraw) {
            const winnerIds = new Set(winners.map((w) => w.id));
            const newlyRemoved = updatedParticipants.filter((p) => winnerIds.has(p.id));
            updatedParticipants = updatedParticipants.filter((p) => !winnerIds.has(p.id));
            updatedRemoved = [...newlyRemoved, ...updatedRemoved];
          }

          return {
            winnersHistory: [drawRecord, ...state.winnersHistory],
            participants: updatedParticipants,
            removedWinners: updatedRemoved,
            latestWinnersDialog: {
              isOpen: true,
              winners,
              prizeName: drawRecord.prizeName
            }
          };
        });
      },

      restoreWinner: (participantId) => {
        set((state) => {
          const winnerToRestore = state.removedWinners.find((w) => w.id === participantId);
          if (!winnerToRestore) return state;

          return {
            removedWinners: state.removedWinners.filter((w) => w.id !== participantId),
            participants: [...state.participants, winnerToRestore]
          };
        });
      },

      clearHistory: () => set({ winnersHistory: [], removedWinners: [] }),

      setIsSpinning: (isSpinning) => set({ isSpinning }),

      setLatestWinnersDialog: (dialog) => set({ latestWinnersDialog: dialog })
    }),
    {
      name: 'spindraw-prize-storage'
    }
  )
);
