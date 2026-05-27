import React, { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useZenStore } from '../../store/useZenStore';
import quotesData from '../../data/quotes.json';
import proverbiosData from '../../data/proverbs.json';

/**
 * Representa la estructura de un mensaje del oráculo.
 */
interface Message {
  /** El texto principal del mensaje o la cita */
  text: string;
  /** Categoría del mensaje (usado en afirmaciones de mindfulness) */
  category?: string;
  /** Origen del proverbio */
  origin?: string;
  /** Referencia del pasaje (usado en proverbios antiguos) */
  ref?: string;
}

/**
 * Componente OraculoCard
 * 
 * Este componente actúa como un "oráculo" de reflexión y mindfulness.
 * Muestra frases de sabiduría o afirmaciones positivas de forma aleatoria,
 * permitiendo alternar entre afirmaciones de Mindfulness y Proverbios Zen/Antiguos.
 * Utiliza Framer Motion para lograr transiciones suaves y difuminados al cambiar de frase.
 */
export const OraculoCard: React.FC = () => {
  // Estado global para controlar la variante seleccionada (afirmación o proverbio)
  const { oracleVariant, toggleOracleVariant } = useZenStore();
  
  // Estado local para almacenar el mensaje actual y controlar la animación
  const [currentMsg, setCurrentMsg] = useState<Message | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * Genera de forma aleatoria un nuevo mensaje basado en la variante seleccionada.
   * Introduce un delay de 400ms para permitir que finalice la animación de salida (exit)
   * antes de colocar el nuevo mensaje y gatillar la animación de entrada.
   */
  const generateMessage = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const data = oracleVariant === 'afirmacion' ? quotesData : proverbiosData;
      const randomItem = data[Math.floor(Math.random() * data.length)] as Message;
      setCurrentMsg(randomItem);
      setIsAnimating(false);
    }, 400); // Duración sincronizada con la animación de salida
  }, [oracleVariant]);

  // Regenera el mensaje automáticamente al montar el componente o cambiar la variante
  useEffect(() => {
    generateMessage();
  }, [generateMessage]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 relative w-full max-w-lg mx-auto">
      
      {/* Botón Superior: Cambiar variante del oráculo */}
      <div className="absolute top-0 right-0 left-0 flex justify-center mt-2 z-10">
        <button 
          type="button"
          onClick={toggleOracleVariant}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-colors active-scale"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">
            {oracleVariant === 'afirmacion' ? 'format_quote' : 'auto_stories'}
          </span>
          <span className="text-xs font-medium text-on-surface-variant tracking-wide">
            {oracleVariant === 'afirmacion' ? 'Mindfulness' : 'Proverbios Zen'}
          </span>
          <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">
            swap_horiz
          </span>
        </button>
      </div>

      {/* Contenedor del Mensaje con transiciones animadas */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[200px]">
        <AnimatePresence mode="wait">
          {!isAnimating && currentMsg && (
            <m.div
              key={currentMsg.text}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="text-center w-full px-4"
            >
              {/* Ícono de Comillas de Adorno */}
              <span className="material-symbols-outlined text-primary/30 text-5xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                format_quote
              </span>
              
              {/* Texto de la Cita */}
              <h3 className="font-display text-2xl md:text-3xl lg:text-4xl text-on-surface leading-tight font-light mb-8 text-glow select-text">
                "{currentMsg.text}"
              </h3>
              
              {/* Badge de Categoría u Origen */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[14px]">
                  label
                </span>
                <span className="font-body text-xs text-primary font-medium tracking-wide uppercase">
                  {oracleVariant === 'afirmacion' ? currentMsg.category : (currentMsg.ref || currentMsg.origin)}
                </span>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botón de Refresco para generar una nueva frase */}
      <button
        type="button"
        onClick={generateMessage}
        disabled={isAnimating}
        className="mt-8 size-14 rounded-full bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-all active-scale disabled:opacity-50 disabled:scale-100"
        aria-label="Generar nuevo mensaje"
      >
        <span className={`material-symbols-outlined text-[28px] ${isAnimating ? 'animate-spin' : ''}`}>
          refresh
        </span>
      </button>
    </div>
  );
};
