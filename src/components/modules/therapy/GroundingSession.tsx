import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  onStop: () => void;
}

const STAGES = [
  {
    count: 5,
    title: 'Cosas que puedes VER',
    icon: 'visibility',
    description: 'Encuentra 5 objetos a tu alrededor. Nota sus colores, sombras y formas. Toca el botón por cada uno que encuentres.'
  },
  {
    count: 4,
    title: 'Cosas que puedes TOCAR',
    icon: 'touch_app',
    description: 'Encuentra 4 texturas. Puede ser tu ropa, la silla, o la temperatura del aire en tu piel.'
  },
  {
    count: 3,
    title: 'Cosas que puedes ESCUCHAR',
    icon: 'hearing',
    description: 'Concéntrate. Encuentra 3 sonidos diferentes a tu alrededor. Trata de percibir los más lejanos o sutiles.'
  },
  {
    count: 2,
    title: 'Cosas que puedes OLER',
    icon: 'local_florist',
    description: 'Busca 2 aromas. Si no hay nada obvio cerca, huele tu propia piel o ropa.'
  },
  {
    count: 1,
    title: 'Cosa que puedes SABOREAR',
    icon: 'restaurant',
    description: 'Nota 1 sabor. Puede ser el sabor persistente de una bebida, o simplemente nota cómo se siente tu boca por dentro.'
  }
];

export const GroundingSession: React.FC<Props> = ({ onComplete, onStop }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStage = STAGES[stageIndex];
  const isFinished = stageIndex >= STAGES.length;

  const handleTap = () => {
    if (progress + 1 >= currentStage.count) {
      if (stageIndex + 1 < STAGES.length) {
        setStageIndex(prev => prev + 1);
        setProgress(0);
      } else {
        setStageIndex(STAGES.length); // Finished
      }
    } else {
      setProgress(p => p + 1);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4 z-50 relative">
        <h3 className="font-display text-xl text-on-surface">Anclaje 5-4-3-2-1</h3>
        <button
          type="button"
          onClick={onStop}
          className="size-10 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <div className="flex gap-2 mb-8 justify-center">
        {STAGES.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === stageIndex ? 'w-8 bg-primary' : idx < stageIndex ? 'w-4 bg-primary/40' : 'w-4 bg-surface-variant'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <m.div
              key={stageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full flex flex-col items-center justify-center text-center px-4"
            >
              <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">{currentStage.icon}</span>
              </div>
              
              <h4 className="font-display text-3xl text-on-surface mb-2">
                <span className="text-primary mr-2">{currentStage.count}</span>
                {currentStage.title}
              </h4>
              
              <p className="font-body text-base text-on-surface-variant mb-12 max-w-sm">
                {currentStage.description}
              </p>

              <button
                type="button"
                onClick={handleTap}
                className="group relative size-40 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              >
                {/* Background Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-surface-variant" />
                
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="78"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-primary transition-all duration-300"
                    strokeDasharray={2 * Math.PI * 78}
                    strokeDashoffset={2 * Math.PI * 78 * (1 - progress / currentStage.count)}
                  />
                </svg>

                {/* Inner Circle */}
                <div className="absolute inset-4 rounded-full glass-panel flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <span className="font-display text-4xl text-primary">
                    {progress} / {currentStage.count}
                  </span>
                </div>
              </button>
              
              <p className="font-body text-xs text-on-surface-variant mt-8 uppercase tracking-widest">
                Toca el círculo
              </p>
            </m.div>
          ) : (
            <m.div
              key="finished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full w-full flex flex-col items-center justify-center text-center px-4"
            >
              <div className="size-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">check</span>
              </div>
              <h4 className="font-display text-2xl text-on-surface mb-4">De vuelta al presente</h4>
              <p className="font-body text-on-surface-variant mb-8 max-w-sm">
                Has logrado desengancharte de tus pensamientos y anclar tu sistema nervioso a tu entorno actual.
              </p>
              <button
                type="button"
                onClick={onComplete}
                className="btn-primary w-full max-w-sm"
              >
                Finalizar
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
