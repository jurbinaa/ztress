import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActiveTab = 'jukebox' | 'oracle' | 'test' | 'zen' | 'therapy';
export type OracleVariant = 'proverbio' | 'afirmacion';
export type ThemeColor = 'ocean' | 'lava' | 'forest' | 'amethyst' | 'sunset';

export interface MoodRecord {
  date: string;
  score: number;
  testType: string;
}

export interface ZenState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stationId: string | null;
  setStationId: (id: string | null) => void;
  
  // Tests & Mood
  moodHistory: MoodRecord[];
  addMoodRecord: (score: number, testType: string) => void;
  
  // Audio
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isRocholaPlaying: boolean;
  setIsRocholaPlaying: (playing: boolean) => void;
  
  // Practice
  isBreathingActive: boolean;
  setIsBreathingActive: (active: boolean) => void;
  
  // Preferences
  oracleVariant: OracleVariant;
  toggleOracleVariant: () => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

export const useZenStore = create<ZenState>()(
  persist(
    (set) => ({
      activeTab: 'oracle',
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      stationId: null,
      setStationId: (id) => set({ stationId: id }),
      
      moodHistory: [],
      addMoodRecord: (score, testType) =>
        set((state) => ({
          moodHistory: [
            ...state.moodHistory.slice(-29),
            { date: new Date().toISOString(), score, testType },
          ],
        })),
        
      isMuted: false,
      setIsMuted: (muted) => set({ isMuted: muted }),
      
      volume: 1,
      setVolume: (volume) => set({ volume }),
      
      isBreathingActive: false,
      setIsBreathingActive: (active) => set({ isBreathingActive: active }),
      
      oracleVariant: 'afirmacion', // default to affirmations now
      toggleOracleVariant: () =>
        set((state) => ({
          oracleVariant: state.oracleVariant === 'proverbio' ? 'afirmacion' : 'proverbio',
        })),
        
      themeColor: 'ocean',
      setThemeColor: (color) => set({ themeColor: color }),
      
      isRocholaPlaying: false,
      setIsRocholaPlaying: (playing) => set({ isRocholaPlaying: playing }),
    }),
    {
      name: 'ztress-store-v3', // name of the item in the storage (must be unique)
      partialize: (state) => ({ 
        // Only persist these fields
        moodHistory: state.moodHistory,
        themeColor: state.themeColor,
        isMuted: state.isMuted,
        volume: state.volume,
        oracleVariant: state.oracleVariant
      }),
    }
  )
);
