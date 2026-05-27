import React, { useEffect, useRef, useReducer, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';

/**
 * Fases de la respiración de rescate anti-pánico.
 * Se basa en una variante de exhalación prolongada (Inhalar 4s, Retener 1s, Exhalar 7s).
 * La exhalación prolongada es crucial porque activa directamente el sistema nervioso parasimpático
 * y estimula el nervio vago para reducir de forma rápida la frecuencia cardíaca y la respuesta de lucha o huida.
 */
const PANIC_PHASES = [
  { type: 'inhale' as const, duration: 4, label: 'Inhala por la nariz...', color: 'rgba(163, 190, 140, 0.55)' },
  { type: 'hold' as const, duration: 1, label: 'Mantén un instante...', color: 'rgba(143, 188, 187, 0.6)' },
  { type: 'exhale' as const, duration: 7, label: 'Exhala muy lentamente...', color: 'rgba(180, 142, 173, 0.45)' },
];

/**
 * Mensajes de calma clínicamente orientados para desescalar estados de hiperventilación y pánico.
 * Rotan periódicamente para dar enfoque cognitivo externo al usuario.
 */
const CALM_MESSAGES = [
  "Estás a salvo. Tu cuerpo está reaccionando, pero esto pasará.",
  "Cada exhalación suelta un poco más de tensión. Lo estás haciendo bien.",
  "No tienes que hacer nada más. Solo respira conmigo.",
  "Esto es temporal. Tu cuerpo sabe cómo volver a la calma.",
  "Inhala paz, exhala lo que ya no necesitas.",
];

/**
 * Representa el estado del temporizador y la sesión de respiración anti-pánico.
 */
type State = {
  /** Indica si la sesión de emergencia en pantalla completa está activa */
  isActive: boolean;
  /** Índice de la fase de respiración actual en PANIC_PHASES (0, 1, 2) */
  phaseIndex: number;
  /** Segundos restantes de la fase actual */
  phaseTimeLeft: number;
  /** Segundos totales restantes de la sesión de emergencia (inicia en 300 segundos = 5 minutos) */
  sessionTime: number;
  /** Índice del mensaje reconfortante visible en CALM_MESSAGES */
  messageIndex: number;
  /** Cantidad de ciclos completos (Inhala-Mantiene-Exhala) transcurridos */
  cycleCount: number;
};

/**
 * Acciones para el reductor de estado.
 */
type Action = 
  | { type: 'START' }
  | { type: 'CLOSE' }
  | { type: 'TICK_PHASE' }
  | { type: 'TICK_SESSION' }
  | { type: 'TICK_MESSAGE' };

/**
 * Reducer para gestionar las transiciones y actualizaciones del estado de pánico.
 * Centraliza la lógica de los tres temporizadores (sesión, fase y mensajes) para evitar inconsistencias de tiempo.
 */
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'START':
      return { ...state, isActive: true };
    case 'CLOSE':
      // Resetea el estado completo al valor por defecto
      return { 
        ...state, 
        isActive: false, 
        phaseIndex: 0, 
        phaseTimeLeft: PANIC_PHASES[0].duration, 
        sessionTime: 300, 
        messageIndex: 0, 
        cycleCount: 0 
      };
    case 'TICK_SESSION':
      // Si el tiempo de sesión se agota, cierra la interfaz automáticamente
      if (state.sessionTime <= 1) {
        return { 
          ...state, 
          isActive: false, 
          phaseIndex: 0, 
          phaseTimeLeft: PANIC_PHASES[0].duration, 
          sessionTime: 300, 
          messageIndex: 0, 
          cycleCount: 0 
        };
      }
      return { ...state, sessionTime: state.sessionTime - 1 };
    case 'TICK_PHASE': {
      // Si finaliza la fase actual (llega a 0), avanza a la siguiente fase
      if (state.phaseTimeLeft <= 1) {
        const nextIdx = (state.phaseIndex + 1) % PANIC_PHASES.length;
        return {
          ...state,
          phaseIndex: nextIdx,
          phaseTimeLeft: PANIC_PHASES[nextIdx].duration,
          // Incrementa el conteo de ciclos cuando vuelve a iniciar la fase de inhalación (0)
          cycleCount: nextIdx === 0 ? state.cycleCount + 1 : state.cycleCount
        };
      }
      return { ...state, phaseTimeLeft: state.phaseTimeLeft - 1 };
    }
    case 'TICK_MESSAGE':
      // Avanza cíclicamente al siguiente mensaje de calma
      return { ...state, messageIndex: (state.messageIndex + 1) % CALM_MESSAGES.length };
    default:
      return state;
  }
};

/**
 * Componente PanicButton
 * 
 * Renderiza un botón flotante de emergencia en la esquina inferior derecha.
 * Al hacer clic, despliega un overlay de pantalla completa con un respirador mecánico orgánico de rescate.
 * Ideal para situaciones de crisis de ansiedad, ataques de pánico o estrés desbordante.
 */
export const PanicButton: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, {
    isActive: false,
    phaseIndex: 0,
    phaseTimeLeft: PANIC_PHASES[0].duration,
    sessionTime: 300, // 5 minutos de tiempo total máximo
    messageIndex: 0,
    cycleCount: 0
  });

  const { isActive, phaseIndex, phaseTimeLeft, sessionTime, messageIndex, cycleCount } = state;

  // Referencias para controlar los intervalos del motor de tiempos de forma segura
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Limpia todos los temporizadores activos en memoria para prevenir memory leaks.
   */
  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    if (messageTimerRef.current) clearInterval(messageTimerRef.current);
  }, []);

  /**
   * Detiene la sesión y limpia intervalos antes de disparar el reset en el reducer.
   */
  const handleClose = useCallback(() => {
    cleanup();
    dispatch({ type: 'CLOSE' });
  }, [cleanup]);

  // Temporizador de duración de sesión (TICK_SESSION cada 1s)
  useEffect(() => {
    if (!isActive) return;
    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_SESSION' });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  // Temporizador del ciclo del pacer respiratorio (TICK_PHASE cada 1s)
  useEffect(() => {
    if (!isActive) return;
    phaseTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_PHASE' });
    }, 1000);
    return () => { if (phaseTimerRef.current) clearInterval(phaseTimerRef.current); };
  }, [isActive]);

  // Rotador periódico de mensajes reconfortantes (cada 12 segundos)
  useEffect(() => {
    if (!isActive) return;
    messageTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_MESSAGE' });
    }, 12000);
    return () => { if (messageTimerRef.current) clearInterval(messageTimerRef.current); };
  }, [isActive]);

  // Limpieza total cuando el componente se desmonta
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const currentPhase = PANIC_PHASES[phaseIndex];
  
  // Parámetros de escala del orbe en base a la fase activa (se expande al inhalar y mantener, se reduce al exhalar)
  const orbScale = currentPhase.type === 'inhale' ? 1.4 : currentPhase.type === 'hold' ? 1.4 : 1.0;
  
  // Configuración de la física del resorte (spring) según la fase (más lento y suave al exhalar)
  const orbTransition = currentPhase.type === 'exhale'
    ? { type: 'spring' as const, stiffness: 8, damping: 24, mass: 1.5 }
    : { type: 'spring' as const, stiffness: 12, damping: 20, mass: 1.2 };

  /**
   * Convierte segundos a formato estándar mm:ss.
   */
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Botón Flotante de Pánico (Esquina inferior derecha) */}
      <button
        type="button"
        onClick={() => dispatch({ type: 'START' })}
        className="fixed bottom-24 right-4 z-40 size-14 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/20 backdrop-blur-xl flex items-center justify-center transition-all duration-200 active-scale shadow-[0_0_30px_rgba(239,68,68,0.15)] group"
        aria-label="Botón de emergencia anti-pánico"
        title="Necesito calmarme ahora"
      >
        <span className="material-symbols-outlined text-red-300 text-[28px] group-hover:text-red-200 transition-colors" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
          emergency
        </span>
        {/* Aro animado de advertencia y respiración simulada */}
        <span className="absolute inset-0 rounded-full border-2 border-red-400/20 animate-ping opacity-30 pointer-events-none" />
      </button>

      {/* Overlay de Pantalla Completa: Sesión de Respiración Anti-Pánico */}
      <AnimatePresence>
        {isActive && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
            style={{ background: 'radial-gradient(ellipse at center, rgba(11,16,21,0.97) 0%, rgba(5,8,10,0.99) 100%)' }}
          >
            {/* Botón de Cierre (esquina superior derecha) */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-6 right-6 size-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface transition-all active-scale"
              aria-label="Cerrar sesión de emergencia"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Mensajes de Calma de rotación automática */}
            <div className="max-w-sm text-center mb-10 h-16 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <m.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6 }}
                  className="font-body text-sm text-on-surface-variant/80 leading-relaxed font-light"
                >
                  {CALM_MESSAGES[messageIndex]}
                </m.p>
              </AnimatePresence>
            </div>

            {/* Orbe Central de Respiración Guiada */}
            <div className="relative size-56 flex items-center justify-center">
              {/* Halo ambiental con desenfoque extremo para iluminar el fondo */}
              <m.div
                animate={{ scale: orbScale, opacity: 0.25 }}
                transition={orbTransition}
                className="absolute size-44 rounded-full blur-3xl will-change-transform"
                style={{ backgroundColor: currentPhase.color }}
              />
              {/* Orbe sólido frontal con el contador numérico */}
              <m.div
                animate={{ scale: orbScale }}
                transition={orbTransition}
                className="size-40 rounded-full border border-white/10 flex flex-col items-center justify-center z-10 shadow-2xl backdrop-blur-sm will-change-transform"
                style={{ backgroundColor: currentPhase.color }}
              >
                <span className="font-display text-4xl font-light text-white text-glow tabular-nums">
                  {phaseTimeLeft}
                </span>
                <span className="font-body text-[9px] uppercase tracking-widest font-bold text-white/50 mt-1">
                  seg
                </span>
              </m.div>
            </div>

            {/* Instrucción escrita de la fase */}
            <div className="h-14 flex items-center justify-center mt-8 max-w-xs">
              <AnimatePresence mode="wait">
                <m.p
                  key={currentPhase.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="font-display text-lg text-on-surface font-medium tracking-wide text-center"
                >
                  {currentPhase.label}
                </m.p>
              </AnimatePresence>
            </div>

            {/* Información y estadísticas de la sesión */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="font-body text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                Respiración Anti-Pánico 4-1-7
              </span>
              <span className="font-body text-xs text-on-surface-variant/30 tabular-nums">
                {formatTime(sessionTime)} · Ciclo {cycleCount + 1}
              </span>
            </div>

            {/* Botón de Cierre Voluntario */}
            <button
              type="button"
              onClick={handleClose}
              className="mt-8 flex items-center justify-center gap-2 h-12 px-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-all duration-150 ease-out active-scale"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Me siento mejor</span>
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};
