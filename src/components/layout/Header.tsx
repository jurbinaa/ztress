import React, { useState } from 'react';
import { useZenStore } from '../../store/useZenStore';
import { AnimatePresence, motion } from 'framer-motion';

export const Header: React.FC = () => {
  const { isMuted, setIsMuted } = useZenStore();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="w-full flex justify-between items-center z-10 select-none pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px] animate-pulse">spa</span>
          <span className="font-display text-xl text-on-surface font-semibold tracking-wide">Zero Stress</span>
        </div>
        
        <div className="flex items-center gap-4">
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 z-10 text-on-surface overflow-hidden shadow-2xl border border-white/10"
            >
              {/* Decorative radial blur gradient inside modal */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              
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
                  <strong className="text-on-surface">Zero Stress</strong> es un refugio digital concebido bajo la filosofía de <em className="text-primary not-italic">"fricción cero"</em> y <em className="text-primary not-italic">"privacidad total"</em>.
                </p>
                <p>
                  Diseñado para personas que necesitan un momento de calma instantánea, este espacio ofrece herramientas sencillas de relajación, respiración consciente, meditación binaural y reflexiones breves.
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
