import React, { useState } from 'react';
import { useZenStore } from '../../store/useZenStore';
import proverbs from '../../data/proverbs.json';
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
  const [result, setResult] = useState<{ text: string; ref: string } | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'done'>('idle');

  const handleConsult = () => {
    if (status === 'searching') return;
    
    setStatus('searching');
    setResult(null);

    // Sensory delay for reflection and anti-stress pace (2.5s)
    setTimeout(() => {
      if (oracleVariant === 'proverbio') {
        const randomIndex = Math.floor(Math.random() * proverbs.length);
        setResult(proverbs[randomIndex]);
      } else {
        const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
        setResult({ text: AFFIRMATIONS[randomIndex], ref: 'Afirmación Zen' });
      }
      setStatus('done');
    }, 2200);
  };

  return (
    <section className="w-full flex flex-col gap-6 items-center text-center">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="font-body text-xs text-primary uppercase tracking-widest font-semibold">
          Sabiduría Interior
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold">
          El Oráculo
        </h2>
      </div>

      <p className="font-body text-sm text-on-surface-variant max-w-[420px] leading-relaxed">
        Sostén una intención en tu mente. Toca la esfera y permite que el silencio te entregue la respuesta que necesitas hoy.
      </p>

      {/* Interactive Glowing Orb */}
      <div className="my-6 relative select-none flex items-center justify-center">
        {/* Organic Breathing Aura for Idle State */}
        {status === 'idle' && (
          <AnimatePresence>
            <motion.div
              animate={{ 
                transform: ["scale(0.95)", "scale(1.15)", "scale(0.95)"], 
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute w-40 h-40 rounded-full bg-primary/20 blur-xl pointer-events-none"
            />
            <motion.div
              animate={{ 
                transform: ["scale(0.98)", "scale(1.08)", "scale(0.98)"], 
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5 
              }}
              className="absolute w-40 h-40 rounded-full border border-primary/30 pointer-events-none blur-[1px]"
            />
          </AnimatePresence>
        )}

        <motion.button
          onClick={handleConsult}
          disabled={status === 'searching'}
          whileTap={{ scale: 0.96 }}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          className="relative z-10 w-40 h-40 rounded-full bg-surface-container-lowest border border-white/10 flex items-center justify-center shadow-lg hover:shadow-[0_0_40px_rgba(var(--color-primary),0.15)] hover:border-primary/30 transition-all duration-300 overflow-hidden cursor-pointer group outline-none focus:outline-none"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-10 group-hover:opacity-20 transition-opacity duration-300 ease-out" />
          
          <AnimatePresence mode="wait">
            {status === 'searching' ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Smooth searching rotation (Hardware accelerated) */}
                <motion.div
                  animate={{ transform: ["rotate(0deg)", "rotate(360deg)"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 rounded-full border-2 border-t-primary/60 border-r-primary/10 border-b-primary/10 border-l-primary/10"
                />
                <span className="absolute text-[10px] uppercase tracking-widest font-bold font-body text-primary/80 animate-pulse">
                  Buscando...
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, transform: "scale(0.9)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.95)", filter: 'blur(2px)' }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center gap-1"
              >
                <motion.span 
                  animate={{ transform: ["scale(1)", "scale(1.05)", "scale(1)"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="material-symbols-outlined text-[44px] text-primary group-hover:text-primary-variant transition-colors duration-300"
                >
                  auto_awesome
                </motion.span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/50 group-hover:text-primary transition-colors duration-300">
                  Tocar Esfera
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Ambient outer glow */}
        <div className="absolute w-40 h-40 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/15 transition-all duration-500 ease-out pointer-events-none" />
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
                "{result.text}"
              </p>
              <span className="text-[11px] font-body font-semibold uppercase tracking-widest text-primary/60">
                — {result.ref}
              </span>
              
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
