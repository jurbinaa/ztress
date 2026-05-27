import React, { useEffect, useRef, useReducer } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useZenStore } from '../../../store/useZenStore';
import type { BreathingProtocol } from '../../../data/breathingProtocols';

interface BreathingSessionProps {
  /** Protocolo de respiración cargado para la sesión guiada */
  protocol: BreathingProtocol;
  /** Callback para cerrar la sesión actual y regresar al menú */
  onClose: () => void;
}

/**
 * Estado local de la sesión de respiración activa.
 */
type State = {
  /** Índice de la fase actual del ciclo respiratorio (ej. 0: Inhalar, 1: Retener, etc.) */
  phaseIndex: number;
  /** Segundos restantes en la fase actual */
  phaseTimeLeft: number;
  /** Segundos restantes para completar la sesión completa de respiración */
  sessionTime: number;
  /** Cantidad de ciclos completos respiratorios transcurridos */
  cycleCount: number;
  /** Indica si el usuario ya presionó el botón 'Comenzar' */
  isStarted: boolean;
  /** Indica si la sesión de respiración llegó a su fin (tiempo agotado) */
  isFinished: boolean;
};

/**
 * Acciones para el reductor de estado.
 */
type Action = 
  | { type: 'START' }
  | { type: 'TICK_SESSION' }
  | { type: 'TICK_PHASE', payload: { phases: any[] } };

/**
 * Reducer para controlar la lógica interna de temporización de la sesión de respiración.
 */
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'START':
      return { ...state, isStarted: true };
    case 'TICK_SESSION':
      // Si finaliza el tiempo de la sesión, activa el estado finalizado
      if (state.sessionTime <= 1) return { ...state, sessionTime: 0, isFinished: true };
      return { ...state, sessionTime: state.sessionTime - 1 };
    case 'TICK_PHASE': {
      // Si expira la fase actual, avanza a la siguiente
      if (state.phaseTimeLeft <= 1) {
        const nextIdx = (state.phaseIndex + 1) % action.payload.phases.length;
        return {
          ...state,
          phaseIndex: nextIdx,
          phaseTimeLeft: action.payload.phases[nextIdx].duration,
          // Incrementa el ciclo si regresamos a la primera fase (inhalación = 0)
          cycleCount: nextIdx === 0 ? state.cycleCount + 1 : state.cycleCount
        };
      }
      return { ...state, phaseTimeLeft: state.phaseTimeLeft - 1 };
    }
    default:
      return state;
  }
};

/**
 * Componente BreathingSession
 * 
 * Este componente guía de forma interactiva e inmersiva al usuario a través de un
 * ciclo respiratorio configurable (respiración cuadrada, 4-7-8, suspiro cíclico, etc.).
 * Utiliza un orbe visual dinámico en el centro de la pantalla que se expande y contrae
 * simulando los pulmones, con físicas suaves (resorte) provistas por Framer Motion.
 */
export const BreathingSession: React.FC<BreathingSessionProps> = ({ protocol, onClose }) => {
  // Notifica al store global que la respiración está activa (para silenciar/pausar otros audios de fondo)
  const { setIsBreathingActive } = useZenStore();
  
  // Inicialización de la máquina de estados con reducer
  const [state, dispatch] = useReducer(reducer, {
    phaseIndex: 0,
    phaseTimeLeft: protocol.phases[0].duration,
    sessionTime: protocol.recommendedDuration * 60, // Convierte minutos a segundos
    cycleCount: 0,
    isStarted: false,
    isFinished: false,
  });

  const { phaseIndex, phaseTimeLeft, sessionTime, cycleCount, isStarted, isFinished } = state;

  // Referencias mutables para almacenar los intervalos de los temporizadores
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Efecto de ciclo de vida para sincronizar el estado de respiración activa con el ZenStore
  useEffect(() => {
    setIsBreathingActive(true);
    return () => setIsBreathingActive(false); // Resetea el estado al desmontar el componente
  }, [setIsBreathingActive]);

  // Temporizador principal de la sesión (descuenta 1 segundo del total cada segundo)
  useEffect(() => {
    if (!isStarted || isFinished) return;
    
    sessionTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_SESSION' });
    }, 1000);
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, [isStarted, isFinished]);

  // Temporizador secundario para alternar las fases internas (TICK_PHASE cada segundo)
  useEffect(() => {
    if (!isStarted || isFinished) return;
    
    phaseTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_PHASE', payload: { phases: protocol.phases } });
    }, 1000);
    return () => { if (phaseTimerRef.current) clearInterval(phaseTimerRef.current); };
  }, [isStarted, isFinished, protocol.phases]);

  const currentPhase = protocol.phases[phaseIndex];
  
  /**
   * Obtiene el multiplicador de escala del orbe según la fase respiratoria activa.
   * Promueve la expansión en inhalación/retención y contracción en exhalación.
   */
  const getOrbScale = (type: string) => {
    if (type === 'inhale') return 1.4;
    if (type === 'hold') return 1.4;
    if (type === 'exhale') return 1.0;
    return 1.0; // Estado en pausa de aire vacío
  };
  
  /**
   * Obtiene la constante de transición física (spring) del orbe.
   * La exhalación requiere mayor atenuación física (damping) para emular la relajación natural.
   */
  const getOrbTransition = (type: string) => {
    if (type === 'exhale' || type === 'pause') {
      return { type: 'spring' as const, stiffness: 8, damping: 24, mass: 1.5 };
    }
    return { type: 'spring' as const, stiffness: 12, damping: 20, mass: 1.2 };
  };

  /**
   * Convierte segundos a formato de texto mm:ss.
   */
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining.toString().padStart(2, '0')}`;
  };

  // --- Vista 1: Pantalla de finalización exitosa ---
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

  // --- Vista 2: Pantalla Introductoria / Explicativa ---
  if (!isStarted) {
    return (
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center p-6 h-full relative"
      >
        {/* Botón de salida */}
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
        
        {/* Ícono descriptivo */}
        <span className={`material-symbols-outlined text-[48px] ${protocol.color.replace('from', 'text').split(' ')[0]} mb-4`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {protocol.icon}
        </span>
        
        {/* Título y objetivo clínico */}
        <h2 className="font-display text-2xl text-on-surface mb-2 text-center">{protocol.name}</h2>
        <p className="font-body text-sm text-on-surface-variant text-center mb-8 max-w-sm">
          {protocol.description}
        </p>
        
        {/* Tarjetas rápidas de información */}
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

        {/* Botón de inicio */}
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

  // --- Vista 3: Sesión en Curso (Pacer Activo) ---
  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full p-4 relative"
    >
      {/* Cancelación o retroceso */}
      <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 text-on-surface-variant/50 hover:text-on-surface transition-colors">
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Orbe Visual de Respiración Animado */}
      <div className="relative size-64 flex items-center justify-center my-12">
        {/* Halo resplandeciente en segundo plano */}
        <m.div
          animate={{ scale: getOrbScale(currentPhase.type), opacity: 0.15 }}
          transition={getOrbTransition(currentPhase.type)}
          className={`absolute size-48 rounded-full blur-3xl will-change-transform bg-gradient-to-br ${protocol.color}`}
        />
        {/* Orbe frontal */}
        <m.div
          animate={{ scale: getOrbScale(currentPhase.type) }}
          transition={getOrbTransition(currentPhase.type)}
          className={`size-40 rounded-full border border-white/10 flex flex-col items-center justify-center z-10 shadow-2xl backdrop-blur-md will-change-transform bg-gradient-to-br ${protocol.color}`}
        >
          {/* Segundos de la fase actual */}
          <span className="font-display text-5xl font-light text-white text-glow tabular-nums">
            {phaseTimeLeft}
          </span>
        </m.div>
      </div>

      {/* Instrucciones escritas de la fase */}
      <div className="h-20 flex flex-col items-center justify-center max-w-xs text-center">
        <AnimatePresence mode="wait">
          {/* Nombre de la fase activa (Inhala, exhala, retén...) */}
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
          {/* Detalle interactivo (Por la nariz, sopla suavemente...) */}
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

      {/* Estadísticas inferiores de sesión */}
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
