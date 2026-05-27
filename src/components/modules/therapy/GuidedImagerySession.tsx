import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  onStop: () => void;
}

const IMAGES = [
  { id: 'forest', name: 'Bosque Profundo', icon: 'park', description: 'Imagina un bosque denso y antiguo. Siente la brisa fresca, el olor a pino y tierra húmeda.' },
  { id: 'beach', name: 'Playa Tranquila', icon: 'beach_access', description: 'Visualiza una playa al atardecer. Escucha las olas suaves y siente la arena tibia en tus pies.' },
  { id: 'mountain', name: 'Cima de la Montaña', icon: 'landscape', description: 'Estás en la cima del mundo. El aire es puro y crujiente. Observa el vasto horizonte.' }
];

export const GuidedImagerySession: React.FC<Props> = ({ onComplete, onStop }) => {
  const [selectedImage, setSelectedImage] = useState<typeof IMAGES[0] | null>(null);
  const [step, setStep] = useState(0);

  const steps = selectedImage ? [
    "Cierra los ojos suavemente. Toma tres respiraciones profundas.",
    selectedImage.description,
    "Observa los colores a tu alrededor. ¿Qué tonos predominan en este lugar?",
    "Concéntrate en los sonidos. ¿Qué puedes escuchar en la distancia? ¿Y cerca de ti?",
    "Imagina el clima. ¿Sientes una brisa? ¿El sol en tu piel?",
    "Permítete descansar en este lugar todo el tiempo que necesites."
  ] : [];

  if (!selectedImage) {
    return (
      <div className="flex flex-col h-full relative p-4">
        <button type="button" onClick={onStop} className="absolute top-0 right-0 p-2 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="mb-6 mt-4">
          <h2 className="font-display text-2xl text-on-surface mb-2">Visualización Guiada</h2>
          <p className="font-body text-sm text-on-surface-variant">Elige un lugar seguro al cual viajar mentalmente.</p>
        </div>
        <div className="flex flex-col gap-3">
          {IMAGES.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedImage(img)}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/[0.05] flex items-center gap-4 text-left group transition-all"
            >
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">{img.icon}</span>
              </div>
              <div>
                <h3 className="font-display text-lg text-on-surface">{img.name}</h3>
                <p className="font-body text-xs text-on-surface-variant line-clamp-1">{img.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 relative text-center">
      <button type="button" onClick={onStop} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface">
        <span className="material-symbols-outlined">close</span>
      </button>

      <span className="material-symbols-outlined text-[64px] text-primary/50 mb-8" style={{ fontVariationSettings: "'FILL' 1" }}>
        {selectedImage.icon}
      </span>

      <div className="h-32 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <m.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1 }}
            className="font-display text-xl text-on-surface leading-relaxed max-w-sm"
          >
            {steps[step]}
          </m.p>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex gap-4">
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="px-6 py-3 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="px-6 py-3 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
};
