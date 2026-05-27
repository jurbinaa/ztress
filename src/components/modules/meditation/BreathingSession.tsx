import React, { useEffect, useRef, useReducer } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useZenStore } from '../../../store/useZenStore';
import type { BreathingProtocol } from '../../../data/breathingProtocols';

interface BreathingSessionProps {
  protocol: BreathingProtocol;
  onClose: () => void;
}

type State = {
  phaseIndex: number;
  phaseTimeLeft: number;
  sessionTime: number;
  cycleCount: number;
  isStarted: boolean;
  isFinished: boolean;
};

type Action = 
  | { type: 'START' }
  | { type: 'TICK_SESSION' }
  | { type: 'TICK_PHASE', payload: { phases: any[] } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'START':
      return { ...state, isStarted: true };
    case 'TICK_SESSION':
      if (state.sessionTime <= 1) return { ...state, sessionTime: 0, isFinished: true };
      return { ...state, sessionTime: state.sessionTime - 1 };
    case 'TICK_PHASE': {
      if (state.phaseTimeLeft <= 1) {
        const nextIdx = (state.phaseIndex + 1) % action.payload.phases.length;
        return {
          ...state,
          phaseIndex: nextIdx,
          phaseTimeLeft: action.payload.phases[nextIdx].duration,
          cycleCount: nextIdx === 0 ? state.cycleCount + 1 : state.cycleCount
        };
      }
      return { ...state, phaseTimeLeft: state.phaseTimeLeft - 1 };
    }
    default:
      return state;
  }
};

export const BreathingSession: React.FC<BreathingSessionProps> = ({ protocol, onClose }) => {
  const { setIsBreathingActive } = useZenStore();
  
  const [state, dispatch] = useReducer(reducer, {
    phaseIndex: 0,
    phaseTimeLeft: protocol.phases[0].duration,
    sessionTime: protocol.recommendedDuration * 60,
    cycleCount: 0,
    isStarted: false,
    isFinished: false,
  });

  const { phaseIndex, phaseTimeLeft, sessionTime, cycleCount, isStarted, isFinished } = state;

  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsBreathingActive(true);
    return () => setIsBreathingActive(false);
  }, [setIsBreathingActive]);

  useEffect(() => {
    if (!isStarted || isFinished) return;
    
    sessionTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_SESSION' });
    }, 1000);
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, [isStarted, isFinished]);

  useEffect(() => {
    if (!isStarted || isFinished) return;
    
    phaseTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_PHASE', payload: { phases: protocol.phases } });
    }, 1000);
    return () => { if (phaseTimerRef.current) clearInterval(phaseTimerRef.current); };
  }, [isStarted, isFinished, protocol.phases]);

  const currentPhase = protocol.phases[phaseIndex];
  
  // Animation logic
  const getOrbScale = (type: string) => {
    if (type === 'inhale') return 1.4;
    if (type === 'hold') return 1.4;
    if (type === 'exhale') return 1.0;
    return 1.0;
  };
  
  const getOrbTransition = (type: string) => {
    if (type === 'exhale' || type === 'pause') {
      return { type: 'spring' as const, stiffness: 8, damping: 24, mass: 1.5 };
    }
    return { type: 'spring' as const, stiffness: 12, damping: 20, mass: 1.2 };
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <m.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center p-8 h-full"
      >
        <span className="material-symbols-outlined text-[64px] text-primary mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <h2 className="font-display text-2xl text-on-surface mb-2">Sesión Completada</h2>
        <p className="font-body text-on-surface-variant text-center mb-8">
          Has completado {cycleCount} ciclos de {protocol.nameShort}. Tu sistema nervioso te lo agradece.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-3 rounded-full bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors"
        >
          Volver
        </button>
      </m.div>
    );
  }

  if (!isStarted) {
    return (
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center p-6 h-full relative"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <span className={`material-symbols-outlined text-[48px] ${protocol.color.replace('from', 'text').split(' ')[0]} mb-4`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {protocol.icon}
        </span>
        <h2 className="font-display text-2xl text-on-surface mb-2 text-center">{protocol.name}</h2>
        <p className="font-body text-sm text-on-surface-variant text-center mb-8 max-w-sm">
          {protocol.description}
        </p>
        
        <div className="flex gap-4 mb-8">
          <div className="flex flex-col items-center bg-white/5 p-3 rounded-2xl min-w-[80px]">
            <span className="material-symbols-outlined text-on-surface-variant mb-1">timer</span>
            <span className="font-body text-sm text-on-surface">{protocol.recommendedDuration} min</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 p-3 rounded-2xl min-w-[80px]">
            <span className="material-symbols-outlined text-on-surface-variant mb-1">vital_signs</span>
            <span className="font-body text-sm text-on-surface">{protocol.bpm} bpm</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: 'START' })}
          className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors active-scale"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          Comenzar
        </button>
      </m.div>
    );
  }

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full p-4 relative"
    >
      <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 text-on-surface-variant/50 hover:text-on-surface transition-colors">
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Breathing orb */}
      <div className="relative size-64 flex items-center justify-center my-12">
        <m.div
          animate={{ scale: getOrbScale(currentPhase.type), opacity: 0.15 }}
          transition={getOrbTransition(currentPhase.type)}
          className={`absolute size-48 rounded-full blur-3xl will-change-transform bg-gradient-to-br ${protocol.color}`}
        />
        <m.div
          animate={{ scale: getOrbScale(currentPhase.type) }}
          transition={getOrbTransition(currentPhase.type)}
          className={`size-40 rounded-full border border-white/10 flex flex-col items-center justify-center z-10 shadow-2xl backdrop-blur-md will-change-transform bg-gradient-to-br ${protocol.color}`}
        >
          <span className="font-display text-5xl font-light text-white text-glow tabular-nums">
            {phaseTimeLeft}
          </span>
        </m.div>
      </div>

      <div className="h-20 flex flex-col items-center justify-center max-w-xs text-center">
        <AnimatePresence mode="wait">
          <m.p
            key={currentPhase.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="font-display text-2xl text-on-surface font-medium tracking-wide mb-2"
          >
            {currentPhase.label}
          </m.p>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <m.p
            key={currentPhase.instruction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-body text-sm text-on-surface-variant/80"
          >
            {currentPhase.instruction}
          </m.p>
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-8 flex flex-col items-center gap-1">
        <span className="font-body text-sm text-on-surface-variant tabular-nums">
          {formatTime(sessionTime)} restantes
        </span>
        <span className="font-body text-xs text-on-surface-variant/50">
          Ciclo {cycleCount + 1}
        </span>
      </div>
    </m.div>
  );
};
