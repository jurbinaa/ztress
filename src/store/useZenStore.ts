import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActiveTab = 'jukebox' | 'oracle' | 'test' | 'zen';
export type OracleVariant = 'proverbio' | 'afirmacion';

interface MoodRecord {
  date: string;
  score: number; // Final score/points
  testType: 'stress' | 'burnout';
}

interface ZenState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  musicLink: string;
  setMusicLink: (link: string) => void;
  moodHistory: MoodRecord[];
  addMoodRecord: (score: number, testType: 'stress' | 'burnout') => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isBreathingActive: boolean;
  setIsBreathingActive: (active: boolean) => void;
  
  // A/B Testing Scaffolding
  oracleVariant: OracleVariant;
  toggleOracleVariant: () => void;
  breatheCtaVariant: 'comenzar' | 'respirar';
  toggleBreatheCtaVariant: () => void;
}

export const useZenStore = create<ZenState>()(
  persist(
    (set) => ({
      activeTab: 'oracle',
      setActiveTab: (tab) => set({ activeTab: tab }),
      musicLink: '',
      setMusicLink: (link) => set({ musicLink: link }),
      moodHistory: [],
      addMoodRecord: (score, testType) =>
        set((state) => ({
          moodHistory: [
            ...state.moodHistory.slice(-29), // Keep last 30 records
            { date: new Date().toLocaleDateString(), score, testType },
          ],
        })),
      isMuted: false,
      setIsMuted: (muted) => set({ isMuted: muted }),
      isBreathingActive: false,
      setIsBreathingActive: (active) => set({ isBreathingActive: active }),
      
      // A/B testing default variants and toggles
      oracleVariant: 'proverbio',
      toggleOracleVariant: () =>
        set((state) => ({
          oracleVariant: state.oracleVariant === 'proverbio' ? 'afirmacion' : 'proverbio',
        })),
      breatheCtaVariant: 'respirar',
      toggleBreatheCtaVariant: () =>
        set((state) => ({
          breatheCtaVariant: state.breatheCtaVariant === 'respirar' ? 'comenzar' : 'respirar',
        })),
    }),
    {
      name: 'zen-hub-storage-v2', // saves to localStorage
    }
  )
);
