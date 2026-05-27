import React, { useEffect, useRef, useReducer } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  onStop: () => void;
}

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

type State = {
  groupIndex: number;
  isTensing: boolean;
  timeLeft: number;
  completed: boolean;
};

type Action = 
  | { type: 'START' }
  | { type: 'TICK' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'START':
      return { ...state, groupIndex: 0, isTensing: true, timeLeft: 7 };
    case 'TICK':
      if (state.groupIndex === -1 || state.completed) return state;
      
      if (state.timeLeft <= 1) {
        if (state.isTensing) {
          return { ...state, isTensing: false, timeLeft: 15 };
        } else {
          if (state.groupIndex >= MUSCLE_GROUPS.length - 1) {
            return { ...state, timeLeft: 0, completed: true };
          }
          return { ...state, groupIndex: state.groupIndex + 1, isTensing: true, timeLeft: 7 };
        }
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    default:
      return state;
  }
};

export const MuscleRelaxSession: React.FC<Props> = ({ onComplete, onStop }) => {
  const [state, dispatch] = useReducer(reducer, {
    groupIndex: -1,
    isTensing: false,
    timeLeft: 0,
    completed: false
  });
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.completed) {
      onComplete();
    }
  }, [state.completed, onComplete]);

  useEffect(() => {
    if (state.groupIndex === -1 || state.completed) return;

    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.groupIndex, state.completed]);

  if (state.groupIndex === -1) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
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

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 relative text-center">
      <button type="button" onClick={onStop} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface">
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest mb-8">
        Grupo {state.groupIndex + 1} de {MUSCLE_GROUPS.length}: {currentGroup.name}
      </div>

      <div className="relative size-48 flex items-center justify-center mb-8">
        <m.div
          animate={{
            scale: state.isTensing ? 1.2 : 1,
            backgroundColor: state.isTensing ? 'rgba(239,68,68,0.2)' : 'rgba(163,190,140,0.2)'
          }}
          transition={{ duration: 1 }}
          className="absolute inset-0 rounded-full blur-2xl"
        />
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
