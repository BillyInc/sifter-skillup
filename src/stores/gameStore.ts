import { create } from 'zustand';
import { API } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const POSITION_KEY = 'sifter_last_position';

export interface LastPosition {
  trackId: string;
  trackName: string;
  level: 'junior' | 'intermediate' | 'senior';
  labId: string;
  labTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonIndex: number;
  labIndex: number;
  simulatorState?: {
    type: string;
    phase: 'learning-loop' | 'certification-attempt' | 'aggregate' | 'remediation';
    attemptNumber: number;
  };
  savedAt: string;
}

interface GameState {
  lastPosition: LastPosition | null;
  loadedFromStorage: boolean;

  // Computed
  hasPosition: boolean;

  // Actions
  loadPosition: () => Promise<void>;
  savePosition: (position: Omit<LastPosition, 'savedAt'>) => Promise<void>;
  clearPosition: () => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  lastPosition: null,
  loadedFromStorage: false,
  hasPosition: false,

  loadPosition: async () => {
    try {
      const raw = await AsyncStorage.getItem(POSITION_KEY);
      if (raw) {
        const position = JSON.parse(raw) as LastPosition;
        set({ lastPosition: position, loadedFromStorage: true, hasPosition: true });
      } else {
        set({ loadedFromStorage: true });
      }
    } catch {
      set({ loadedFromStorage: true });
    }
  },

  savePosition: async (position) => {
    const full: LastPosition = { ...position, savedAt: new Date().toISOString() };
    set({ lastPosition: full, hasPosition: true });
    await AsyncStorage.setItem(POSITION_KEY, JSON.stringify(full));
    API.saveLastPosition(full).catch(() => {});
  },

  clearPosition: async () => {
    set({ lastPosition: null, hasPosition: false });
    await AsyncStorage.removeItem(POSITION_KEY);
    API.clearLastPosition().catch(() => {});
  },
}));
