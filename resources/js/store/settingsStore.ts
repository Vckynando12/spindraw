import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TeamSettings } from '../types';
import { sound } from '../lib/sound';

interface GlobalSettingsState {
  teamSettings: TeamSettings;
  isSettingsOpen: boolean;
  
  openSettings: () => void;
  closeSettings: () => void;
  updateTeamSettings: (partial: Partial<TeamSettings>) => void;
  toggleSound: () => void;
}

export const useSettingsStore = create<GlobalSettingsState>()(
  persist(
    (set, get) => ({
      teamSettings: {
        eventName: 'Bikini Bottom Grand Prix 🏁',
        maxCapacityPerTeam: 10,
        spinDuration: 4,
        fastSpin: false,
        autoSpin: false,
        soundEnabled: true,
        confettiEnabled: true
      },
      isSettingsOpen: false,

      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),

      updateTeamSettings: (partial) => {
        if (partial.soundEnabled !== undefined) {
          sound.setEnabled(partial.soundEnabled);
        }
        set((state) => ({
          teamSettings: { ...state.teamSettings, ...partial }
        }));
      },

      toggleSound: () => {
        const next = !get().teamSettings.soundEnabled;
        sound.setEnabled(next);
        set((state) => ({
          teamSettings: { ...state.teamSettings, soundEnabled: next }
        }));
      }
    }),
    {
      name: 'spindraw-global-settings'
    }
  )
);
