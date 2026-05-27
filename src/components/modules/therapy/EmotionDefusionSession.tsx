import React, { useReducer } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  onStop: () => void;
}

const EMOTIONS = [
  'Ansiedad', 'Tristeza', 'Enojo', 'Miedo',
  'Frustración', 'Culpa', 'Vergüenza', 'Soledad'
];

const SENSATIONS = [
  'Presión en el pecho', 'Nudo en el estómago',
  'Tensión muscular', 'Respiración agitada',
  'Calor/Rubor', 'Temblores',
  'Cansancio pesado', 'Palpitaciones'
];

type State = {
  phase: number;
  emotion: string;
  intensityBefore: number;
  sensation: string;
  intensityAfter: number;
};

export const EmotionDefusionSession: React.FC<Props> = ({ onComplete, onStop }) => {
  const [state, dispatch] = useReducer(
    (s: State, a: Partial<State>) => ({ ...s, ...a }),
    { phase: 1, emotion: '', intensityBefore: 50, sensation: '', intensityAfter: 50 }
  );

  const { phase, emotion, intensityBefore, sensation, intensityAfter } = state;
  const setEmotion = (emotion: string) => dispatch({ emotion });
  const setIntensityBefore = (intensityBefore: number) => dispatch({ intensityBefore });
  const setSensation = (sensation: string) => dispatch({ sensation });
  const setIntensityAfter = (intensityAfter: number) => dispatch({ intensityAfter });
  const nextPhase = () => dispatch({ phase: phase + 1 });

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4 z-50 relative">
        <h3 className="font-display text-xl text-on-surface">Defusión Emocional</h3>
        <button
          type="button"
          onClick={onStop}
          className="size-10 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <div className="flex gap-2 mb-8 justify-center">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === phase ? 'w-8 bg-primary' : step < phase ? 'w-4 bg-primary/40' : 'w-4 bg-surface-variant'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {phase === 1 && (
            <m.div
              key="phase-1"
              initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
              className="h-full w-full flex flex-col items-center justify-start pt-2 text-center px-2"
            >
              <h4 className="font-display text-xl text-on-surface mb-2">¿Qué emoción predomina?</h4>
              <p className="font-body text-sm text-on-surface-variant mb-6">
                Nombra lo que sientes sin juzgarlo.
              </p>
              
              <div className="flex flex-wrap gap-2 w-full justify-center max-w-sm mb-6">
                {EMOTIONS.map((e) => (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setEmotion(e)}
                    className={`py-2 px-3 rounded-xl font-body text-sm font-medium transition-all ${
                      emotion === e
                        ? 'bg-primary text-on-primary scale-105'
                        : 'glass-panel text-on-surface hover:bg-white/5'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              
              <button
                type="button"
                onClick={nextPhase}
                disabled={!emotion}
                className="btn-primary w-full max-w-sm"
              >
                Continuar
              </button>
            </m.div>
          )}

          {phase === 2 && (
            <m.div
              key="phase-2"
              initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
              className="h-full w-full flex flex-col items-center justify-start pt-2 text-center px-2"
            >
              <h4 className="font-display text-xl text-on-surface mb-2">¿Qué tan intensa es?</h4>
              <p className="font-body text-sm text-on-surface-variant mb-8">
                En una escala del 0 al 100, ¿cuánta energía tiene ahora?
              </p>
              
              <div className="w-full max-w-sm mb-10">
                <div className="flex justify-between text-xs text-on-surface-variant mb-4">
                  <span>Leve (0)</span>
                  <span className="font-display text-2xl text-primary">{intensityBefore}%</span>
                  <span>Muy Intensa (100)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensityBefore}
                  onChange={(e) => setIntensityBefore(parseInt(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Intensidad de la emoción antes de la defusión"
                />
              </div>

              <button type="button" onClick={nextPhase} className="btn-primary w-full max-w-sm">
                Continuar
              </button>
            </m.div>
          )}

          {phase === 3 && (
            <m.div
              key="phase-3"
              initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
              className="h-full w-full flex flex-col items-center justify-start pt-2 text-center px-2"
            >
              <h4 className="font-display text-xl text-on-surface mb-2">¿Dónde lo sientes?</h4>
              <p className="font-body text-sm text-on-surface-variant mb-6">
                Las emociones tienen un reflejo físico.
              </p>

              <div className="flex flex-wrap gap-2 w-full justify-center max-w-sm mb-6">
                {SENSATIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSensation(s)}
                    className={`py-2 px-3 rounded-xl font-body text-sm font-medium transition-all ${
                      sensation === s
                        ? 'bg-primary text-on-primary scale-105'
                        : 'glass-panel text-on-surface hover:bg-white/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={nextPhase}
                disabled={!sensation}
                className="btn-primary w-full max-w-sm"
              >
                Continuar
              </button>
            </m.div>
          )}

          {phase === 4 && (
            <m.div
              key="phase-4"
              initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
              className="h-full w-full flex flex-col items-center justify-start pt-2 text-center px-2"
            >
              <h4 className="font-display text-xl text-on-surface mb-4">Toma Distancia</h4>
              
              <div className="glass-panel rounded-2xl p-5 mb-6 max-w-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <p className="font-body text-sm text-on-surface-variant mb-3">
                  Repite mentalmente y respira profundamente 3 veces:
                </p>
                <p className="font-display text-lg text-primary leading-relaxed">
                  "Estoy notando que tengo el sentimiento de {emotion.toLowerCase()}, y siento {sensation.toLowerCase()} en mi cuerpo."
                </p>
              </div>

              <p className="font-body text-xs text-on-surface-variant mb-6 max-w-sm">
                Tú no eres la emoción. Eres el espacio donde la emoción está ocurriendo temporalmente.
              </p>

              <button type="button" onClick={nextPhase} className="btn-primary w-full max-w-sm">
                Continuar
              </button>
            </m.div>
          )}

          {phase === 5 && (
            <m.div
              key="phase-5"
              initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
              className="h-full w-full flex flex-col items-center justify-start pt-2 text-center px-2"
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-2 block">spa</span>
              <h4 className="font-display text-xl text-on-surface mb-2">Re-evaluación</h4>
              <p className="font-body text-sm text-on-surface-variant mb-8">
                Tras observar tu emoción desde esta distancia, ¿cuál es la intensidad ahora?
              </p>
              
              <div className="w-full max-w-sm mb-10">
                <div className="flex justify-between text-xs text-on-surface-variant mb-4">
                  <span>Leve (0)</span>
                  <span className="font-display text-2xl text-primary">{intensityAfter}%</span>
                  <span>Muy Intensa (100)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensityAfter}
                  onChange={(e) => setIntensityAfter(parseInt(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Intensidad de la emoción después de la defusión"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  onComplete();
                }}
                className="btn-primary w-full max-w-sm"
              >
                Finalizar Ejercicio
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
