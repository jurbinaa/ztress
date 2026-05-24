import React, { useState } from 'react';
import { useZenStore, type ThemeColor } from '../../store/useZenStore';
import { AnimatePresence, motion } from 'framer-motion';

const THEMES: { id: ThemeColor; color: string; name: string }[] = [
  { id: 'ocean', color: '#3e5c76', name: 'Océano' },
  { id: 'lava', color: '#e85d04', name: 'Lava' },
  { id: 'forest', color: '#40916c', name: 'Bosque' },
  { id: 'amethyst', color: '#b100e8', name: 'Amatista' },
  { id: 'sunset', color: '#c92a54', name: 'Ocaso' },
];

export const Header: React.FC = () => {
  const { isMuted, setIsMuted, themeColor, setThemeColor } = useZenStore();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="w-full flex justify-between items-center z-10 select-none pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px] animate-pulse">spa</span>
          <span className="font-display text-xl text-on-surface font-semibold tracking-wide">Zero Stress</span>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeColor(t.id)}
                className={`w-5 h-5 rounded-full transition-all duration-300 cursor-pointer ${
                  themeColor === t.id 
                    ? 'scale-125 ring-2 ring-white/60 shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                    : 'opacity-50 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: t.color }}
                title={t.name}
                aria-label={`Tema ${t.name}`}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 hidden sm:block mx-1"></div>
          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-primary transition-colors"
            title={isMuted ? 'Activar Sonido' : 'Silenciar'}
            aria-label={isMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            <span className="material-symbols-outlined">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
          
          <button
            onClick={() => setIsAboutOpen(true)}
            className="font-body text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            About
          </button>
        </div>
      </header>

      {/* About Modal overlay with glassmorphism */}
      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            {/* Modal Body - starts from scale(0.95) per Emil Design Eng principles */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 z-10 text-on-surface overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/[0.15] backdrop-blur-2xl"
            >
              {/* Decorative radial blur gradient inside modal */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-[60px] pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">spa</span>
                  <h3 className="font-display text-2xl font-semibold">Sobre Zero Stress</h3>
                </div>
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="p-1 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="Cerrar modal"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4 font-body text-sm leading-relaxed text-on-surface-variant">
                <p>
                  <strong className="text-on-surface">Zero Stress</strong> es un templo digital para tu mente. Un espacio diseñado para soltar el peso del día a día, sin prisa y sin condiciones.
                </p>
                <p>
                  Aquí encontrarás calma al instante. Respira, escucha, reflexiona. Deja que la serenidad te envuelva.
                </p>
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <span className="material-symbols-outlined text-sm">security</span>
                    <span>Compromiso de Privacidad</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li><strong>Sin cuentas:</strong> No necesitas registrarte ni iniciar sesión.</li>
                    <li><strong>Sin cookies:</strong> Cero rastreadores de publicidad o análisis.</li>
                    <li><strong>100% Local:</strong> Tus datos de tests y preferencias nunca salen de tu dispositivo.</li>
                  </ul>
                </div>
                
                <p className="text-xs text-on-surface-variant/60 text-center mt-6">
                  Respira profundo. Estás a salvo aquí.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
