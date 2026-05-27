import React, { useEffect, useRef, useReducer } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface Props {
  /** Callback gatillado al completar todo el recorrido de grupos musculares con éxito */
  onComplete: () => void;
  /** Callback gatillado al cancelar o salir del ejercicio voluntariamente */
  onStop: () => void;
}

/**
 * Los 14 grupos musculares de la técnica PMR de Edmund Jacobson.
 * Cada grupo contiene el nombre y la instrucción física exacta de tensión.
 */
const MUSCLE_GROUPS = [
  { name: 'Manos', instruction: 'Cierra los puños con fuerza' },
  { name: 'Antebrazos', instruction: 'Flexiona las muñecas hacia arriba' },
  { name: 'Bíceps', instruction: 'Dobla los codos y flexiona los brazos' },
  { name: 'Hombros', instruction: 'Sube los hombros hacia las orejas' },
  { name: 'Frente', instruction: 'Levanta las cejas lo más alto que puedas' },
  { name: 'Ojos', instruction: 'Cierra los ojos con fuerza' },
  { name: 'Mandíbula', instruction: 'Aprieta los dientes suavemente' },
  { name: 'Cuello', instruction: 'Inclina la cabeza hacia atrás suavemente' },
  { name: 'Pecho', instruction: 'Inhala profundo y mantén el aire' },
  { name: 'Abdomen', instruction: 'Contrae los músculos del abdomen' },
  { name: 'Espalda alta', instruction: 'Junta los omóplatos hacia atrás' },
  { name: 'Espalda baja', instruction: 'Arquea ligeramente la espalda' },
  { name: 'Muslos', instruction: 'Presiona las piernas juntas' },
  { name: 'Pantorrillas/Pies', instruction: 'Apunta los dedos de los pies hacia ti' }
];

/**
 * Estado del temporizador y progreso de la relajación progresiva.
 */
type State = {
  /** Índice del grupo muscular en curso (de 0 a 13). -1 indica que el ejercicio no ha comenzado. */
  groupIndex: number;
  /** Indica si la sub-fase actual es de tensión (7s) o de relajación (15s) */
  isTensing: boolean;
  /** Segundos restantes en el sub-paso actual */
  timeLeft: number;
  /** Indica si ya se completaron los 14 grupos musculares */
  completed: boolean;
};

/**
 * Acciones para el reductor de la relajación muscular.
 */
type Action = 
  | { type: 'START' }
  | { type: 'TICK' };

/**
 * Reducer que controla la máquina de estados de PMR.
 * Alterna de forma secuencial e inteligente:
 * Comienzo -> Grupo muscular X tensando (7s) -> Grupo muscular X relajando (15s) -> Grupo X+1 tensando...
 */
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'START':
      // Inicializa el primer grupo en modo tensión con un conteo de 7 segundos
      return { ...state, groupIndex: 0, isTensing: true, timeLeft: 7 };
    case 'TICK':
      if (state.groupIndex === -1 || state.completed) return state;
      
      // Si el temporizador actual llega a 0
      if (state.timeLeft <= 1) {
        if (state.isTensing) {
          // Si estaba tensando, pasa a relajar el mismo grupo por 15 segundos
          return { ...state, isTensing: false, timeLeft: 15 };
        } else {
          // Si estaba relajando, comprueba si es el último grupo muscular
          if (state.groupIndex >= MUSCLE_GROUPS.length - 1) {
            return { ...state, timeLeft: 0, completed: true };
          }
          // Avanza al siguiente grupo muscular y entra de nuevo en fase de tensión (7s)
          return { ...state, groupIndex: state.groupIndex + 1, isTensing: true, timeLeft: 7 };
        }
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    default:
      return state;
  }
};

/**
 * Componente MuscleRelaxSession
 * 
 * Implementa la técnica clínica de Relajación Muscular Progresiva (PMR) de Edmund Jacobson.
 * La PMR se basa en el principio fisiológico de que la relajación mental es el resultado directo
 * de la relajación física voluntaria. Tensa alternadamente grupos musculares por 7 segundos y los
 * libera de golpe por 15 segundos para entrenar al cerebro a identificar y soltar la tensión somática.
 */
export const MuscleRelaxSession: React.FC<Props> = ({ onComplete, onStop }) => {
  const [state, dispatch] = useReducer(reducer, {
    groupIndex: -1,
    isTensing: false,
    timeLeft: 0,
    completed: false
  });
  
  // Referencia mutable para limpiar el temporizador al desmontar
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gatilla la finalización del módulo al completarse todos los pasos
  useEffect(() => {
    if (state.completed) {
      onComplete();
    }
  }, [state.completed, onComplete]);

  // Intervalo del cronómetro (TICK cada 1s)
  useEffect(() => {
    if (state.groupIndex === -1 || state.completed) return;

    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.groupIndex, state.completed]);

  // --- Vista 1: Pantalla Introductoria / Explicativa ---
  if (state.groupIndex === -1) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        {/* Botón de salida */}
        <button type="button" onClick={onStop} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="material-symbols-outlined text-[48px] text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
          accessibility_new
        </span>
        <h2 className="font-display text-2xl text-on-surface mb-2">Relajación Muscular</h2>
        <p className="font-body text-sm text-on-surface-variant mb-8 max-w-sm">
          Aprende a diferenciar entre tensión y relajación recorriendo 14 grupos musculares.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'START' })}
          className="px-8 py-4 rounded-full bg-primary/20 text-primary font-medium hover:bg-primary/30 active-scale"
        >
          Comenzar
        </button>
      </div>
    );
  }

  const currentGroup = MUSCLE_GROUPS[state.groupIndex] || MUSCLE_GROUPS[MUSCLE_GROUPS.length - 1];

  // --- Vista 2: Ejercicio Activo (Tensar/Relajar) ---
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 relative text-center">
      {/* Botón de salida */}
      <button type="button" onClick={onStop} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface">
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Indicador de número de grupo muscular y nombre */}
      <div className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest mb-8">
        Grupo {state.groupIndex + 1} de {MUSCLE_GROUPS.length}: {currentGroup.name}
      </div>

      {/* Orbe visual dinámico (rojo para tensión, verde para relajación) */}
      <div className="relative size-48 flex items-center justify-center mb-8">
        {/* Halo resplandeciente difuso reactivo */}
        <m.div
          animate={{
            scale: state.isTensing ? 1.2 : 1,
            backgroundColor: state.isTensing ? 'rgba(239,68,68,0.2)' : 'rgba(163,190,140,0.2)'
          }}
          transition={{ duration: 1 }}
          className="absolute inset-0 rounded-full blur-2xl animate-pulse"
        />
        {/* Círculo central con contador textual de segundos */}
        <m.div
          animate={{
            borderColor: state.isTensing ? 'rgba(239,68,68,0.5)' : 'rgba(163,190,140,0.5)',
            boxShadow: state.isTensing ? '0 0 40px rgba(239,68,68,0.3)' : '0 0 20px rgba(163,190,140,0.1)'
          }}
          transition={{ duration: 1 }}
          className="size-40 rounded-full border-2 flex items-center justify-center backdrop-blur-sm z-10"
        >
          <span className="font-display text-5xl font-light text-on-surface tabular-nums">
            {state.timeLeft}
          </span>
        </m.div>
      </div>

      {/* Instrucciones de acción de la fase animada */}
      <AnimatePresence mode="wait">
        <m.div
          key={state.isTensing ? 'tense' : 'relax'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-24"
        >
          <h3 className={`font-display text-2xl mb-2 ${state.isTensing ? 'text-red-400' : 'text-green-400'}`}>
            {state.isTensing ? 'Tensa' : 'Relaja'}
          </h3>
          <p className="font-body text-on-surface-variant">
            {state.isTensing ? currentGroup.instruction : 'Suelta toda la tensión de golpe y nota la diferencia.'}
          </p>
        </m.div>
      </AnimatePresence>
    </div>
  );
};
