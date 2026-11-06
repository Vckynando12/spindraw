import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Participant, Team, DrawHistoryEntry } from '../types';
import { initializeTeams, generateDefaultParticipants, getActiveTeam } from '../lib/teams';
import { secureRandomInt } from '../lib/random';

interface TeamState {
  categories: Category[];
  activeCategoryId: string;
  isSpinning: boolean;
  selectedParticipantForCelebration: { participant: Participant; teamName: string } | null;
  
  // Actions
  setActiveCategory: (id: string) => void;
  addCategory: (label: string, totalCount?: number, maxCapacity?: number, customTeamCount?: number) => void;
  removeCategory: (id: string) => void;
  updateCategoryLabel: (id: string, label: string) => void;
  
  setCategoryParticipants: (
    categoryId: string,
    participants: Participant[],
    maxCapacity?: number,
    customTeamCount?: number
  ) => void;

  setParticipantsByCount: (
    categoryId: string,
    count: number,
    maxCapacity?: number,
    customTeamCount?: number
  ) => void;

  assignParticipantToActiveTeam: (categoryId: string, participant: Participant) => boolean;
  assignParticipantToRandomTeam: (categoryId: string, participant: Participant) => { teamId: string; teamName: string } | null;
  assignAllParticipantsRandomly: (categoryId: string) => void;
  undoLastAssignment: (categoryId: string) => boolean;
  resetCategoryDraw: (categoryId: string) => void;
  
  updateTeamName: (categoryId: string, teamId: string, newName: string) => void;
  recalculateTeams: (categoryId: string, maxCapacity: number, customTeamCount?: number) => void;
  
  setIsSpinning: (spinning: boolean) => void;
  setCelebration: (data: { participant: Participant; teamName: string } | null) => void;
}

// Data awal bawaan (sebagai contoh awalan, pengguna bebas mengubah kapan saja)
const createInitialCategories = (): Category[] => {
  const cat1Participants = generateDefaultParticipants(40, 'L2-Peserta');
  const cat2Participants = generateDefaultParticipants(43, 'L3-Peserta');
  const cat3Participants = generateDefaultParticipants(20, 'P2-Peserta');

  return [
    {
      id: 'cat-1',
      label: 'Laki-laki usia 2 tahun',
      totalTarget: 40,
      maxCapacityPerTeam: 10,
      remaining: [...cat1Participants],
      teams: initializeTeams(40, 10),
      history: []
    },
    {
      id: 'cat-2',
      label: 'Laki-laki usia 3 tahun',
      totalTarget: 43,
      maxCapacityPerTeam: 10,
      remaining: [...cat2Participants],
      teams: initializeTeams(43, 10),
      history: []
    },
    {
      id: 'cat-3',
      label: 'Perempuan usia 2 tahun',
      totalTarget: 20,
      maxCapacityPerTeam: 10,
      remaining: [...cat3Participants],
      teams: initializeTeams(20, 10),
      history: []
    }
  ];
};

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      categories: createInitialCategories(),
      activeCategoryId: 'cat-2',
      isSpinning: false,
      selectedParticipantForCelebration: null,

      setActiveCategory: (id) => set({ activeCategoryId: id }),

      addCategory: (label, totalCount = 30, maxCapacity = 10, customTeamCount) => {
        const id = `cat-${Date.now().toString(36)}`;
        const participants = generateDefaultParticipants(totalCount, 'Peserta');
        const teams = initializeTeams(totalCount, maxCapacity, customTeamCount);
        
        const newCat: Category = {
          id,
          label,
          totalTarget: totalCount,
          maxCapacityPerTeam: maxCapacity,
          customTeamCount,
          remaining: participants,
          teams,
          history: []
        };

        set((state) => ({
          categories: [...state.categories, newCat],
          activeCategoryId: id
        }));
      },

      removeCategory: (id) => {
        set((state) => {
          const filtered = state.categories.filter((c) => c.id !== id);
          if (filtered.length === 0) return state;
          const nextActiveId = state.activeCategoryId === id ? filtered[0].id : state.activeCategoryId;
          return {
            categories: filtered,
            activeCategoryId: nextActiveId
          };
        });
      },

      updateCategoryLabel: (id, label) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, label } : c))
        }));
      },

      setCategoryParticipants: (categoryId, participants, maxCapacity = 10, customTeamCount) => {
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const teams = initializeTeams(participants.length, maxCapacity, customTeamCount);
            return {
              ...c,
              totalTarget: participants.length,
              maxCapacityPerTeam: maxCapacity,
              customTeamCount,
              remaining: [...participants],
              teams,
              history: []
            };
          })
        }));
      },

      setParticipantsByCount: (categoryId, count, maxCapacity = 10, customTeamCount) => {
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const participants = generateDefaultParticipants(count, 'Peserta');
            const teams = initializeTeams(count, maxCapacity, customTeamCount);
            return {
              ...c,
              totalTarget: count,
              maxCapacityPerTeam: maxCapacity,
              customTeamCount,
              remaining: participants,
              teams,
              history: []
            };
          })
        }));
      },

      assignParticipantToActiveTeam: (categoryId, participant) => {
        const state = get();
        const cat = state.categories.find((c) => c.id === categoryId);
        if (!cat) return false;

        const activeTeam = getActiveTeam(cat.teams);
        if (!activeTeam) return false;

        const participantExists = cat.remaining.some((p) => p.id === participant.id);
        if (!participantExists) return false;

        const historyEntry: DrawHistoryEntry = {
          participantId: participant.id,
          participantName: participant.name,
          teamId: activeTeam.id,
          teamName: activeTeam.name,
          timestamp: Date.now()
        };

        const updatedRemaining = cat.remaining.filter((p) => p.id !== participant.id);
        const updatedTeams = cat.teams.map((t) => {
          if (t.id === activeTeam.id) {
            return {
              ...t,
              members: [...t.members, participant]
            };
          }
          return t;
        });

        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              remaining: updatedRemaining,
              teams: updatedTeams,
              history: [...c.history, historyEntry]
            };
          })
        }));

        return true;
      },

      /**
       * Masukkan satu peserta ke salah satu tim yang masih memiliki slot kuota secara acak
       */
      assignParticipantToRandomTeam: (categoryId, participant) => {
        const state = get();
        const cat = state.categories.find((c) => c.id === categoryId);
        if (!cat) return null;

        const availableTeams = cat.teams.filter((t) => t.members.length < t.quota);
        if (availableTeams.length === 0) return null;

        const chosenTeam = availableTeams[secureRandomInt(0, availableTeams.length - 1)];

        const historyEntry: DrawHistoryEntry = {
          participantId: participant.id,
          participantName: participant.name,
          teamId: chosenTeam.id,
          teamName: chosenTeam.name,
          timestamp: Date.now()
        };

        const updatedRemaining = cat.remaining.filter((p) => p.id !== participant.id);
        const updatedTeams = cat.teams.map((t) => {
          if (t.id === chosenTeam.id) {
            return {
              ...t,
              members: [...t.members, participant]
            };
          }
          return t;
        });

        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              remaining: updatedRemaining,
              teams: updatedTeams,
              history: [...c.history, historyEntry]
            };
          })
        }));

        return { teamId: chosenTeam.id, teamName: chosenTeam.name };
      },

      /**
       * Acak semua peserta yang tersisa dan distribusikan langsung ke tim-tim
       * sesuai kuota masing-masing (ala pickerwheel.com — 1x spin, langsung selesai).
       */
      assignAllParticipantsRandomly: (categoryId) => {
        const state = get();
        const cat = state.categories.find((c) => c.id === categoryId);
        if (!cat || cat.remaining.length === 0) return;

        // Fisher-Yates shuffle menggunakan crypto.getRandomValues
        const shuffled = [...cat.remaining];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = secureRandomInt(0, i);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Distribusikan ke tim satu per satu sesuai urutan kuota
        const updatedTeams = cat.teams.map((t) => ({ ...t, members: [...t.members] }));
        const newHistory: DrawHistoryEntry[] = [...cat.history];

        let participantPointer = 0;
        for (const team of updatedTeams) {
          while (team.members.length < team.quota && participantPointer < shuffled.length) {
            const p = shuffled[participantPointer++];
            team.members.push(p);
            newHistory.push({
              participantId: p.id,
              participantName: p.name,
              teamId: team.id,
              teamName: team.name,
              timestamp: Date.now()
            });
          }
        }

        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              remaining: [],
              teams: updatedTeams,
              history: newHistory
            };
          })
        }));
      },

      undoLastAssignment: (categoryId) => {
        const state = get();
        const cat = state.categories.find((c) => c.id === categoryId);
        if (!cat || cat.history.length === 0) return false;

        const lastHistory = cat.history[cat.history.length - 1];
        const lastParticipant: Participant = {
          id: lastHistory.participantId,
          name: lastHistory.participantName
        };

        const updatedTeams = cat.teams.map((t) => {
          if (t.id === lastHistory.teamId) {
            return {
              ...t,
              members: t.members.filter((m) => m.id !== lastHistory.participantId)
            };
          }
          return t;
        });

        const updatedRemaining = [lastParticipant, ...cat.remaining];
        const updatedHistory = cat.history.slice(0, -1);

        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              remaining: updatedRemaining,
              teams: updatedTeams,
              history: updatedHistory
            };
          })
        }));

        return true;
      },

      resetCategoryDraw: (categoryId) => {
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const allMembers: Participant[] = [];
            c.teams.forEach((t) => allMembers.push(...t.members));
            const allRemaining = [...c.remaining, ...allMembers];
            const resetTeams = c.teams.map((t) => ({ ...t, members: [] }));

            return {
              ...c,
              remaining: allRemaining,
              teams: resetTeams,
              history: []
            };
          })
        }));
      },

      updateTeamName: (categoryId, teamId, newName) => {
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              teams: c.teams.map((t) => (t.id === teamId ? { ...t, name: newName } : t))
            };
          })
        }));
      },

      recalculateTeams: (categoryId, maxCapacity, customTeamCount) => {
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const existingNames = c.teams.map((t) => t.name);
            const total = c.totalTarget;
            const effectiveCapacity = maxCapacity || c.maxCapacityPerTeam || 10;
            const newTeams = initializeTeams(total, effectiveCapacity, customTeamCount, existingNames);

            const allMembers: Participant[] = [];
            c.teams.forEach((t) => allMembers.push(...t.members));
            const allRemaining = [...c.remaining, ...allMembers];

            return {
              ...c,
              maxCapacityPerTeam: effectiveCapacity,
              customTeamCount,
              remaining: allRemaining,
              teams: newTeams,
              history: []
            };
          })
        }));
      },

      setIsSpinning: (isSpinning) => set({ isSpinning }),
      setCelebration: (data) => set({ selectedParticipantForCelebration: data })
    }),
    {
      name: 'spindraw-teams-storage'
    }
  )
);
