import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useZenStore } from '../../../store/useZenStore';
import { unlockAudioContext } from '../../audio/AudioContextManager';
import { SleepTimer } from '../../audio/SleepTimer';
import { BREATHING_PROTOCOLS } from '../../../data/breathingProtocols';
import { GUIDED_PATHS } from '../../../data/guidedPaths';
import type { GuidedPath as GuidedPathData, PathStep } from '../../../data/guidedPaths';
import { BreathingSession } from '../meditation/BreathingSession';
import { EmotionDefusionSession } from '../therapy/EmotionDefusionSession';
import { MuscleRelaxSession } from '../therapy/MuscleRelaxSession';
import { GuidedImagerySession } from '../therapy/GuidedImagerySession';
import { GroundingSession } from '../therapy/GroundingSession';

interface GuidedPathProps {
  /** Vuelve al menú de prácticas */
  onExit: () => void;
}

interface SoundStepProps {
  step: Extract<PathStep, { kind: 'sound' }>;
  onNext: () => void;
}

/**
 * Paso de sonido: pone la estación y, si el camino lo pide, un temporizador de sueño.
 * La reproducción se inicia con un toque para cumplir la política de autoplay del navegador.
 */
const SoundStep: React.FC<SoundStepProps> = ({ step, onNext }) => {
  const stationId = useZenStore(s => s.stationId);
  const isPlaying = useZenStore(s => s.isRocholaPlaying);
  const setStationId = useZenStore(s => s.setStationId);
  const setIsRocholaPlaying = useZenStore(s => s.setIsRocholaPlaying);
  const setSleepTimer = useZenStore(s => s.setSleepTimer);

  const playing = isPlaying && stationId === step.stationId;

  const toggle = () => {
    unlockAudioContext();
    if (playing) {
      setIsRocholaPlaying(false);
      return;
    }
    setStationId(step.stationId);
    setIsRocholaPlaying(true);
    if (step.sleepMinutes) setSleepTimer(step.sleepMinutes);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 h-full">
      <h2 className="font-display text-2xl text-on-surface text-center">{step.title}</h2>
      <p className="font-body text-sm text-on-surface-variant text-center max-w-xs">{step.hint}</p>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pausar' : 'Reproducir'}
        className="size-24 rounded-full bg-primary/20 border border-white/10 flex items-center justify-center text-primary active-scale hover:bg-primary/30 transition-colors"
      >
        <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {playing ? 'pause' : 'play_arrow'}
        </span>
      </button>
      <div className="w-full max-w-sm">
        <SleepTimer />
      </div>
      <button
        type="button"
        onClick={onNext}
        className="px-8 py-3 rounded-full bg-white/5 text-on-surface-variant font-medium hover:bg-white/10 hover:text-on-surface transition-colors"
      >
        Terminar
      </button>
    </div>
  );
};

/**
 * GuidedPath — "Ayúdame ahora".
 *
 * Pregunta cómo se siente la persona y la lleva por una secuencia corta de pasos
 * (respiración → terapia/sonido) sin que tenga que elegir técnicas. No guarda nada:
 * el avance vive solo en estado local del componente.
 */
export const GuidedPath: React.FC<GuidedPathProps> = ({ onExit }) => {
  const [path, setPath] = useState<GuidedPathData | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const isDone = path !== null && stepIndex >= path.steps.length;
  const next = () => setStepIndex(i => i + 1);

  // ── Pantalla 1: ¿cómo estás? ──────────────────────────────────────────
  if (!path) {
    return (
      <div className="h-full flex flex-col overflow-y-auto custom-scrollbar p-2 -mx-2">
        <div className="flex items-start justify-between mb-6 px-2">
          <div>
            <h2 className="font-display text-2xl text-on-surface mb-2">¿Cómo estás ahora?</h2>
            <p className="font-body text-sm text-on-surface-variant">
              Elige lo que más se parezca y te guío paso a paso.
            </p>
          </div>
          <button type="button" onClick={onExit} aria-label="Cerrar" className="p-2 text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-3 pb-8">
          {GUIDED_PATHS.map((p, i) => (
            <m.button
              key={p.id}
              type="button"
              onClick={() => { setPath(p); setStepIndex(0); }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full text-left p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/[0.05] hover:border-white/[0.1] transition-[background-color,border-color,transform] flex items-center gap-4 active-scale"
            >
              <div className="size-12 rounded-full flex items-center justify-center bg-primary/15 text-primary shrink-0">
                <span className="material-symbols-outlined">{p.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-lg text-on-surface truncate">{p.label}</h3>
                  <span className="text-[10px] text-on-surface-variant font-medium shrink-0 ml-2">≈{p.approxMinutes} min</span>
                </div>
                <p className="font-body text-xs text-on-surface-variant/80">{p.description}</p>
              </div>
            </m.button>
          ))}
        </div>
      </div>
    );
  }

  // ── Pantalla final ────────────────────────────────────────────────────
  if (isDone) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 h-full"
      >
        <span className="material-symbols-outlined text-[64px] text-primary mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
          spa
        </span>
        <h2 className="font-display text-2xl text-on-surface mb-2">Listo</h2>
        <p className="font-body text-on-surface-variant text-center mb-8 max-w-xs">
          Quédate un momento aquí antes de volver a lo que hacías. Si sigues mal, puedes repetirlo.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="px-8 py-3 rounded-full bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors"
        >
          Cerrar
        </button>
      </m.div>
    );
  }

  // ── Pasos del camino ──────────────────────────────────────────────────
  const step = path.steps[stepIndex];
  const isLast = stepIndex === path.steps.length - 1;

  const renderStep = () => {
    switch (step.kind) {
      case 'breath': {
        const protocol = BREATHING_PROTOCOLS.find(p => p.id === step.protocolId);
        if (!protocol) return null;
        return (
          <BreathingSession
            protocol={protocol}
            minutes={step.minutes}
            autoStart
            closeLabel={isLast ? 'Terminar' : 'Siguiente'}
            onComplete={next}
            onClose={onExit}
          />
        );
      }
      case 'therapy':
        switch (step.id) {
          case 'defusion': return <EmotionDefusionSession onComplete={next} onStop={onExit} />;
          case 'pmr': return <MuscleRelaxSession onComplete={next} onStop={onExit} />;
          case 'imagery': return <GuidedImagerySession onComplete={next} onStop={onExit} />;
          case 'grounding': return <GroundingSession onComplete={next} onStop={onExit} />;
        }
        return null;
      case 'sound':
        return <SoundStep step={step} onNext={next} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Indicador de progreso del camino */}
      <div className="flex items-center justify-center gap-2 pt-1 pb-2" aria-label={`Paso ${stepIndex + 1} de ${path.steps.length}`}>
        {path.steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === stepIndex ? 'w-6 bg-primary' : i < stepIndex ? 'w-1.5 bg-primary/60' : 'w-1.5 bg-white/15'
            }`}
          />
        ))}
      </div>
      <div className="relative flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <m.div
            key={stepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {renderStep()}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
