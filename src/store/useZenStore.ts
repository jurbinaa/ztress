/**
 * useZenStore.ts — Estado global de la aplicación con Zustand.
 *
 * Este store centraliza todo el estado compartido entre los distintos módulos
 * de Ztress: la pestaña activa, la estación de audio seleccionada, el historial
 * de estado de ánimo, los controles de audio y las preferencias de usuario.
 *
 * Se usa el middleware `persist` de Zustand para guardar en localStorage
 * únicamente los campos que necesitan sobrevivir entre sesiones (historial de
 * ánimo, tema visual, volumen, silencio y variante del oráculo). El resto del
 * estado es efímero y se reinicia en cada visita, lo que protege la privacidad
 * del usuario.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Identificadores de las cinco pestañas principales de la app. */
export type ActiveTab = 'jukebox' | 'oracle' | 'test' | 'zen' | 'therapy';

/** Variante del módulo Oráculo: proverbios del libro de Job o afirmaciones de mindfulness. */
export type OracleVariant = 'proverbio' | 'afirmacion';

/** Tema de color global de la interfaz. Afecta la paleta de toda la app vía CSS custom properties. */
export type ThemeColor = 'ocean' | 'lava' | 'forest' | 'amethyst' | 'sunset';

/**
 * Registro individual del historial de estado de ánimo.
 * Se almacena la fecha ISO, la puntuación obtenida y el id del test utilizado.
 */
export interface MoodRecord {
  date: string;
  score: number;
  testType: string;
}

/**
 * Forma completa del estado global de la aplicación.
 * Incluye tanto los valores de estado como las acciones para modificarlos.
 */
export interface ZenState {
  // ── Navegación ─────────────────────────────────────────────────────────
  /** Pestaña activa que determina qué módulo se muestra en pantalla. */
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  /** ID de la estación de audio actualmente sintonizada (null = ninguna). */
  stationId: string | null;
  setStationId: (id: string | null) => void;

  // ── Tests & Estado de ánimo ────────────────────────────────────────────
  /**
   * Últimos 30 registros de evaluación psicológica.
   * El store recorta automáticamente el array para no superar ese límite.
   */
  moodHistory: MoodRecord[];
  addMoodRecord: (score: number, testType: string) => void;

  // ── Audio ──────────────────────────────────────────────────────────────
  /** Si es true, el audio global está en silencio (mute). */
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;

  /** Volumen global del audio (0.0 – 1.0). */
  volume: number;
  setVolume: (volume: number) => void;

  /** Indica si la Rocholá (jukebox procedural) está reproduciendo. */
  isRocholaPlaying: boolean;
  setIsRocholaPlaying: (playing: boolean) => void;

  // ── Práctica de respiración ────────────────────────────────────────────
  /**
   * Se activa cuando el usuario está en una sesión de respiración guiada.
   * Mientras está activo, la reproducción de la Rocholá se pausa
   * automáticamente para no interferir con la práctica.
   */
  isBreathingActive: boolean;
  setIsBreathingActive: (active: boolean) => void;

  // ── Preferencias ──────────────────────────────────────────────────────
  /** Variante seleccionada para el módulo Oráculo (afirmaciones o proverbios). */
  oracleVariant: OracleVariant;
  /** Alterna entre 'afirmacion' y 'proverbio'. */
  toggleOracleVariant: () => void;

  /** Color temático activo de la interfaz. */
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

/**
 * Hook principal del store. Internamente usa Zustand con persistencia
 * selectiva en localStorage (clave: 'ztress-store-v3').
 *
 * @example
 * const { activeTab, setActiveTab } = useZenStore();
 */
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
            // Conservamos solo los últimos 29 registros + el nuevo = máx. 30
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

      // Por defecto, el oráculo arranca en modo afirmaciones
      oracleVariant: 'afirmacion',
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
      // Clave única en localStorage para este store
      name: 'ztress-store-v3',
      // Solo persisten los campos necesarios para mantener la experiencia entre sesiones.
      // El resto (pestaña activa, estación, estado de sesiones) no se persiste a propósito.
      partialize: (state) => ({
        moodHistory: state.moodHistory,
        themeColor: state.themeColor,
        isMuted: state.isMuted,
        volume: state.volume,
        oracleVariant: state.oracleVariant
      }),
    }
  )
);
