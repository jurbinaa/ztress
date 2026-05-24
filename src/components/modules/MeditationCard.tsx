import React, { useState, useEffect, useRef } from 'react';
import { useZenStore } from '../../store/useZenStore';
import { motion, AnimatePresence } from 'framer-motion';

// Breathing config
const BREATHING_PHASES = [
  { phase: 'inhale', duration: 4, label: 'Inhala por la nariz...', color: 'from-primary/30 to-primary/60' },
  { phase: 'hold', duration: 7, label: 'Mantén el aire...', color: 'from-primary/60 to-tertiary/60' },
  { phase: 'exhale', duration: 8, label: 'Exhala lentamente por la boca...', color: 'from-tertiary/60 to-primary/30' },
];

// Body scan steps config
const BODY_SCAN_STEPS = [
  { text: "Relaja tus pies y tus dedos. Siente el peso descansando suavemente sobre el suelo...", duration: 30 },
  { text: "Sube por tus pantorrillas y rodillas. Suelta cualquier rigidez en tus piernas...", duration: 30 },
  { text: "Lleva tu atención al abdomen y al pecho. Siente cómo se elevan y caen de forma natural...", duration: 30 },
  { text: "Suelta la tensión acumulada en tus hombros, espalda, brazos y manos...", duration: 30 },
  { text: "Relaja tu cuello y la mandíbula. Deja que tus ojos y frente se suavicen por completo...", duration: 30 },
  { text: "Disfruta de esta sensación de descanso integral. Tu cuerpo está en paz aquí y ahora...", duration: 30 }
];

export const MeditationCard: React.FC = () => {
  const { isMuted, setIsBreathingActive } = useZenStore();
  const [activeSession, setActiveSession] = useState<'menu' | 'breathe' | 'meditate' | 'bodyscan'>('menu');
  
  // Audio state
  const [binauralActive, setBinauralActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // General timer state
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Breathing state
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);

  // Body scan state
  const [scanStepIndex, setScanStepIndex] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBinauralSound();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync breathing/meditation session state to the store
  useEffect(() => {
    setIsBreathingActive(activeSession !== 'menu');
    return () => {
      setIsBreathingActive(false);
    };
  }, [activeSession, setIsBreathingActive]);

  // Sync binaural sound with isRunning and binauralActive
  useEffect(() => {
    if (activeSession === 'meditate' && isRunning && binauralActive && !isMuted) {
      startBinauralSound();
    } else {
      stopBinauralSound();
    }
  }, [isRunning, binauralActive, activeSession, isMuted]);

  // Main Timer loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          
          const nextVal = prev - 1;
          
          // Handle specific step/phase changes
          if (activeSession === 'bodyscan') {
            handleBodyScanTick(nextVal);
          }

          return nextVal;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, activeSession, scanStepIndex]);

  // Breathing cycle separate phase timer
  const [breathPhaseTimeLeft, setBreathPhaseTimeLeft] = useState(0);
  useEffect(() => {
    let breathTimer: ReturnType<typeof setInterval>;
    if (activeSession === 'breathe' && isRunning) {
      breathTimer = setInterval(() => {
        setBreathPhaseTimeLeft((prev) => {
          if (prev <= 1) {
            const nextIdx = (breathPhaseIndex + 1) % BREATHING_PHASES.length;
            setBreathPhaseIndex(nextIdx);
            return BREATHING_PHASES[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(breathTimer);
  }, [activeSession, isRunning, breathPhaseIndex]);

  const handleBodyScanTick = (currentTimeLeft: number) => {
    const elapsed = totalDuration - currentTimeLeft;
    let accumulated = 0;
    for (let i = 0; i < BODY_SCAN_STEPS.length; i++) {
      accumulated += BODY_SCAN_STEPS[i].duration;
      if (elapsed < accumulated) {
        if (scanStepIndex !== i) {
          setScanStepIndex(i);
        }
        break;
      }
    }
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    stopBinauralSound();
    playChime();
    
    // Return to menu after a short delay
    setTimeout(() => {
      setActiveSession('menu');
    }, 2000);
  };

  // Audio generation
  const startBinauralSound = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2); // Soothing fade-in

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(100, ctx.currentTime); // 100Hz Deep Drone
      
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(104, ctx.currentTime); // 104Hz Deep Drone -> 4Hz Theta beat

      if (pannerL && pannerR) {
        pannerL.pan.setValueAtTime(-1, ctx.currentTime);
        pannerR.pan.setValueAtTime(1, ctx.currentTime);
        oscL.connect(pannerL);
        pannerL.connect(gain);
        oscR.connect(pannerR);
        pannerR.connect(gain);
      } else {
        oscL.connect(gain);
        oscR.connect(gain);
      }

      gain.connect(ctx.destination);
      oscL.start();
      oscR.start();

      osc1Ref.current = oscL;
      osc2Ref.current = oscR;
      gainNodeRef.current = gain;
    } catch (e) {
      console.error('AudioContext not supported', e);
    }
  };

  const stopBinauralSound = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const g = gainNodeRef.current;
      const ctx = audioCtxRef.current;
      try {
        g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      } catch (err) {}
    }

    setTimeout(() => {
      try {
        if (osc1Ref.current) {
          osc1Ref.current.stop();
          osc1Ref.current.disconnect();
        }
        if (osc2Ref.current) {
          osc2Ref.current.stop();
          osc2Ref.current.disconnect();
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch (e) {}
      osc1Ref.current = null;
      osc2Ref.current = null;
      gainNodeRef.current = null;
      audioCtxRef.current = null;
    }, 550);
  };

  const playChime = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Solfeggio frequency

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3);
    } catch (e) {}
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining.toString().padStart(2, '0')}`;
  };

  const startBreatheSession = () => {
    setActiveSession('breathe');
    setIsRunning(true);
    setBreathPhaseIndex(0);
    setBreathPhaseTimeLeft(BREATHING_PHASES[0].duration);
    setTimeLeft(120); // 2 minutes breathing session
    setTotalDuration(120);
  };

  const startMeditateSession = () => {
    setActiveSession('meditate');
    setIsRunning(true);
    setTimeLeft(300); // 5 minutes default
    setTotalDuration(300);
    setBinauralActive(true);
  };

  const startBodyScanSession = () => {
    setActiveSession('bodyscan');
    setIsRunning(true);
    setScanStepIndex(0);
    setTimeLeft(180); // 3 minutes total
    setTotalDuration(180);
  };

  const stopSession = () => {
    setIsRunning(false);
    stopBinauralSound();
    setActiveSession('menu');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Calculations for displays
  const currentBreathePhase = BREATHING_PHASES[breathPhaseIndex];
  
  const getBreatheScale = () => {
    if (!isRunning) return 1;
    if (currentBreathePhase.phase === 'inhale') return 1.4;
    if (currentBreathePhase.phase === 'hold') return 1.4;
    return 1.0;
  };

  const getBreatheDuration = () => {
    if (!isRunning) return 0.5;
    return currentBreathePhase.duration;
  };

  const progressPercentage = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;

  return (
    <section className="w-full flex flex-col gap-6 text-left">
      <AnimatePresence mode="wait">
        {activeSession === 'menu' ? (
          /* Selection Menu */
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <span className="font-body text-xs text-primary uppercase tracking-widest font-semibold">
                Santuario Interior
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold">
                Meditación
              </h2>
            </div>
            
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Un momento para volver a ti. Elige tu camino hacia la quietud.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {/* Card 1: Breathe */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between gap-4 border border-white/5 group hover:bg-white/5 transition-colors">
                <div className="flex flex-col gap-1.5 text-center items-center">
                  <span className="material-symbols-outlined text-[32px] text-primary">wind_power</span>
                  <h3 className="font-display text-base font-semibold text-on-surface mt-2">Respiración</h3>
                  <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed min-h-[60px]">
                    Armoniza tu ritmo cardíaco y disuelve la tensión a través de inhalaciones y exhalaciones conscientes.
                  </p>
                </div>
                <button
                  onClick={startBreatheSession}
                  className="bg-white/5 hover:bg-white/10 text-primary border border-primary/20 font-body text-xs font-semibold uppercase tracking-wider py-3 rounded-full text-center transition-colors cursor-pointer active-scale w-full mt-2"
                >
                  Inicia
                </button>
              </div>

              {/* Card 2: Meditate */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between gap-4 border border-white/5 group hover:bg-white/5 transition-colors">
                <div className="flex flex-col gap-1.5 text-center items-center">
                  <span className="material-symbols-outlined text-[32px] text-primary">self_improvement</span>
                  <h3 className="font-display text-base font-semibold text-on-surface mt-2">Silencio</h3>
                  <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed min-h-[60px]">
                    Un espacio libre de distracciones, acompañado de sutiles frecuencias theta para una inmersión profunda.
                  </p>
                </div>
                <button
                  onClick={startMeditateSession}
                  className="bg-white/5 hover:bg-white/10 text-primary border border-primary/20 font-body text-xs font-semibold uppercase tracking-wider py-3 rounded-full text-center transition-colors cursor-pointer active-scale w-full mt-2"
                >
                  Inicia
                </button>
              </div>

              {/* Card 3: Body Scan */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between gap-4 border border-white/5 group hover:bg-white/5 transition-colors">
                <div className="flex flex-col gap-1.5 text-center items-center">
                  <span className="material-symbols-outlined text-[32px] text-primary">accessibility_new</span>
                  <h3 className="font-display text-base font-semibold text-on-surface mt-2">Presencia</h3>
                  <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed min-h-[60px]">
                    Un recorrido suave por tu cuerpo para liberar las tensiones y abrazar el momento presente.
                  </p>
                </div>
                <button
                  onClick={startBodyScanSession}
                  className="bg-white/5 hover:bg-white/10 text-primary border border-primary/20 font-body text-xs font-semibold uppercase tracking-wider py-3 rounded-full text-center transition-colors cursor-pointer active-scale w-full mt-2"
                >
                  Inicia
                </button>
              </div>
            </div>
          </motion.div>
        ) : activeSession === 'breathe' ? (
          /* Breathe Active Session */
          <motion.div
            key="active-breathe"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center text-center gap-6 w-full py-4"
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] text-primary uppercase tracking-widest font-bold">
                Sesión de Respiración (4-7-8)
              </span>
              <h3 className="font-display text-xl font-medium text-on-surface">Calma Profunda</h3>
            </div>

            {/* Breathing Circle Container */}
            <div className="relative w-56 h-56 flex items-center justify-center my-6">
              {/* Outer soft shadow aura */}
              <motion.div
                animate={{ scale: getBreatheScale() }}
                transition={{ duration: getBreatheDuration(), ease: 'easeInOut' }}
                className={`absolute w-36 h-36 rounded-full bg-gradient-to-tr ${currentBreathePhase.color} blur-2xl opacity-30`}
              />

              {/* Pulsing Orb */}
              <motion.div
                animate={{ scale: getBreatheScale() }}
                transition={{ duration: getBreatheDuration(), ease: 'easeInOut' }}
                className={`w-36 h-36 rounded-full bg-gradient-to-tr ${currentBreathePhase.color} border border-white/10 flex flex-col items-center justify-center z-10 shadow-2xl relative`}
              >
                <span className="font-display text-3xl font-light text-white text-glow">
                  {breathPhaseTimeLeft}
                </span>
                <span className="font-body text-[9px] uppercase tracking-widest font-bold text-white/55 mt-1">
                  seg
                </span>
              </motion.div>
            </div>

            {/* Instruction Phrase */}
            <div className="h-12 flex items-center justify-center px-4 max-w-sm">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentBreathePhase.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="font-body text-sm text-on-surface-variant font-medium tracking-wide"
                >
                  {currentBreathePhase.label}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="text-[10px] font-body text-on-surface-variant/40 mt-1">
              Sesión finaliza en {formatTime(timeLeft)}
            </div>

            {/* Controls */}
            <button
              onClick={stopSession}
              className="mt-2 flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface active-scale"
            >
              <span className="material-symbols-outlined text-[16px]">stop</span>
              <span>Detener</span>
            </button>
          </motion.div>
        ) : activeSession === 'meditate' ? (
          /* Meditate Active Session */
          <motion.div
            key="active-meditate"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center text-center gap-6 w-full py-4"
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] text-primary uppercase tracking-widest font-bold">
                Meditación Guiada Silenciosa
              </span>
              <h3 className="font-display text-xl font-medium text-on-surface">Ondas Theta Activadas</h3>
            </div>

            {/* Progress Circular Countdown */}
            <div className="relative w-52 h-52 flex items-center justify-center my-4">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle
                  cx="104"
                  cy="104"
                  r="92"
                  className="stroke-white/5 fill-transparent"
                  strokeWidth="5"
                />
                <motion.circle
                  cx="104"
                  cy="104"
                  r="92"
                  className="stroke-primary fill-transparent"
                  strokeWidth="5"
                  strokeDasharray="578"
                  animate={{
                    strokeDashoffset: 578 - (578 * progressPercentage) / 100,
                  }}
                  transition={{ duration: 1, ease: 'linear' }}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[28px] animate-spin" style={{ animationDuration: '40s' }}>
                  settings_backup_restore
                </span>
                <span className="font-display text-3xl font-light text-white text-glow mt-1">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Binaural Toggle switch */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 w-full max-w-xs text-left">
              <button
                onClick={() => setBinauralActive(!binauralActive)}
                className={`relative w-8 h-4 rounded-full bg-white/15 flex items-center p-0.5 transition-all ${
                  binauralActive ? 'bg-primary/20' : ''
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-on-surface-variant transition-transform duration-200 ${
                    binauralActive ? 'translate-x-4 bg-primary' : ''
                  }`}
                />
              </button>
              <div className="flex flex-col">
                <span className="font-body text-xs font-bold text-on-surface">Ondas Binaurales (4Hz)</span>
                <span className="font-body text-[9px] text-on-surface-variant/60 leading-tight">
                  {isMuted ? 'Audio global silenciado' : 'Usa auriculares para percibir el batido'}
                </span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary font-body text-xs font-semibold uppercase tracking-wider active-scale"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isRunning ? 'pause' : 'play_arrow'}
                </span>
                <span>{isRunning ? 'Pausar' : 'Comenzar'}</span>
              </button>
              
              <button
                onClick={stopSession}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface active-scale"
              >
                <span className="material-symbols-outlined text-[16px]">stop</span>
                <span>Detener</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Body Scan Active Session */
          <motion.div
            key="active-bodyscan"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center text-center gap-6 w-full py-4"
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] text-primary uppercase tracking-widest font-bold">
                Sesión de Escáner Corporal
              </span>
              <h3 className="font-display text-xl font-medium text-on-surface">Relajación Progresiva</h3>
            </div>

            {/* Pulsing focus point */}
            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-32 h-32 rounded-full bg-primary/20 blur-xl"
              />
              <div className="w-24 h-24 rounded-full bg-surface-container border border-white/10 flex flex-col items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-primary text-[28px] animate-pulse">
                  accessibility_new
                </span>
                <span className="font-display text-sm text-on-surface-variant font-medium mt-1">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Instruction container with slow text crossfade and blur masking */}
            <div className="min-h-[110px] max-w-sm flex items-center justify-center px-4">
              <AnimatePresence mode="wait">
                <motion.p
                  key={scanStepIndex}
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 1.0, ease: 'easeInOut' }}
                  className="font-body text-sm md:text-base text-on-surface leading-relaxed italic"
                >
                  {BODY_SCAN_STEPS[scanStepIndex].text}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary font-body text-xs font-semibold uppercase tracking-wider active-scale"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isRunning ? 'pause' : 'play_arrow'}
                </span>
                <span>{isRunning ? 'Pausar' : 'Comenzar'}</span>
              </button>
              
              <button
                onClick={stopSession}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface active-scale"
              >
                <span className="material-symbols-outlined text-[16px]">stop</span>
                <span>Detener</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
