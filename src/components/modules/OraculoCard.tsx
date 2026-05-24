import React, { useState } from 'react';
import { useZenStore } from '../../store/useZenStore';
import quotes from '../../data/quotes.json';
import { motion, AnimatePresence } from 'framer-motion';

const AFFIRMATIONS = [
  "Inhalo paz, exhalo tensión. Estoy a salvo aquí y ahora.",
  "Merezco descansar. Mi valor no depende de mi productividad.",
  "Confío en mi capacidad para superar los desafíos que se presenten hoy.",
  "Suelto la necesidad de controlarlo todo y confío en el ritmo natural de la vida.",
  "Doy un paso a la vez. Mi ritmo es perfecto.",
  "Acepto mis emociones sin juzgarlas. Es normal sentirse abrumado a veces.",
  "Tengo el poder de calmar mi mente en cualquier momento.",
  "Soy lo suficientemente fuerte para enfrentar esta tormenta, y pasará.",
  "Me trato a mí mismo con amabilidad y compasión hoy.",
  "Agradezco este momento de silencio para reconectar conmigo."
];

export const OraculoCard: React.FC = () => {
  const { oracleVariant, toggleOracleVariant } = useZenStore();
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'done'>('idle');

  const handleConsult = () => {
    if (status === 'searching') return;
    
    setStatus('searching');
    setResult(null);

    // Sensory delay for reflection and anti-stress pace (2.5s)
    setTimeout(() => {
      if (oracleVariant === 'proverbio') {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setResult(quotes[randomIndex]);
      } else {
        const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
        setResult(AFFIRMATIONS[randomIndex]);
      }
      setStatus('done');
    }, 2200);
  };

  return (
    <section className="w-full flex flex-col gap-6 items-center text-center">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="font-body text-xs text-primary uppercase tracking-widest font-semibold">
          Oráculo Zen
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold">
          Pregunta al Silencio
        </h2>
      </div>

      <p className="font-body text-sm text-on-surface-variant max-w-[420px] leading-relaxed">
        Piensa en una duda, conflicto o en aquello que te genera tensión. Presiona la esfera y permite que el silencio te guíe.
      </p>

      {/* Interactive Glowing Orb */}
      <div className="my-6 relative select-none">
        <button
          onClick={handleConsult}
          disabled={status === 'searching'}
          className="relative w-40 h-40 rounded-full bg-surface-container-lowest border border-white/10 flex items-center justify-center shadow-lg hover:border-primary/40 transition-all duration-500 overflow-hidden active-scale cursor-pointer group focus:outline-none"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          
          <AnimatePresence mode="wait">
            {status === 'searching' ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Slow breathing rotation */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 rounded-full border-2 border-t-primary/60 border-r-primary/10 border-b-primary/10 border-l-primary/10"
                />
                <span className="absolute text-[10px] uppercase tracking-widest font-bold font-body text-primary/80 animate-pulse">
                  Buscando...
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-1"
              >
                <span className="material-symbols-outlined text-[44px] text-primary group-hover:scale-110 transition-transform duration-500">
                  auto_awesome
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/50 group-hover:text-primary transition-colors">
                  Tocar Esfera
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Outer Ring Glow */}
          <div className="absolute -inset-2 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/15 transition-all duration-500 pointer-events-none" />
        </button>
      </div>

      {/* Answer Output area with slow text fade/blur reveal */}
      <div className="min-h-[100px] max-w-md flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.p
              key="idle"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="font-display text-on-surface-variant/50 italic text-base"
            >
              El silencio espera...
            </motion.p>
          )}

          {status === 'searching' && (
            <motion.p
              key="searching-text"
              initial={{ opacity: 0, filter: 'blur(2px)' }}
              animate={{ opacity: 0.6, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(2px)' }}
              transition={{ duration: 0.5 }}
              className="font-body text-xs text-on-surface-variant/40 tracking-wider animate-pulse"
            >
              Escuchando el murmullo de tus pensamientos...
            </motion.p>
          )}

          {status === 'done' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }} // Slow, elegant and calm
              className="flex flex-col items-center gap-4"
            >
              <p className="font-display text-lg md:text-xl text-on-surface leading-relaxed italic">
                "{result}"
              </p>
              
              <button
                onClick={handleConsult}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-on-surface-variant/80 hover:text-on-surface transition-all active-scale"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Consultar de nuevo</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* A/B Test Variant Switcher (Scaffolding visible for demonstration/testing) */}
      <div className="mt-8 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 text-xs">
        <span className="text-on-surface-variant/60 font-semibold">Variante A/B Activa:</span>
        <button
          onClick={toggleOracleVariant}
          className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all font-semibold uppercase tracking-wider text-[10px]"
        >
          {oracleVariant === 'proverbio' ? 'A: Proverbio Zen' : 'B: Afirmación Diaria'}
        </button>
      </div>
    </section>
  );
};
