import React, { useState } from 'react';
import { useZenStore } from '../../store/useZenStore';
import { hasAnyVoice, isVoiceSupported, speak } from './voice';

interface VoiceToggleProps {
  /** Clases extra para ubicar el botón según el contexto */
  className?: string;
}

/**
 * VoiceToggle — Interruptor de la guía por voz. Apagado por defecto.
 * No se muestra si el navegador no soporta síntesis de voz.
 */
export const VoiceToggle: React.FC<VoiceToggleProps> = ({ className = '' }) => {
  const isVoiceOn = useZenStore(s => s.isVoiceOn);
  const setIsVoiceOn = useZenStore(s => s.setIsVoiceOn);
  // Avisa si se encendió la voz pero el sistema no tiene ninguna instalada
  const [noVoices, setNoVoices] = useState(false);
  if (!isVoiceSupported) return null;

  const toggle = () => {
    const next = !isVoiceOn;
    setIsVoiceOn(next);
    // Al encender, una frase corta confirma cómo suena la voz
    if (next) {
      speak('Voz activada.');
      // Las voces pueden tardar en cargar: se revisa un instante después
      setTimeout(() => setNoVoices(!hasAnyVoice()), 800);
    } else {
      setNoVoices(false);
    }
  };

  return (
    <div className={`relative size-10 ${className}`}>
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isVoiceOn}
      aria-label={isVoiceOn ? 'Apagar guía por voz' : 'Activar guía por voz'}
      title={isVoiceOn ? 'Guía por voz: activada' : 'Guía por voz: apagada'}
      className={`size-full rounded-full flex items-center justify-center transition-[background-color,color] ${
        isVoiceOn ? 'bg-primary/20 text-primary' : 'bg-white/5 text-on-surface-variant/60 hover:text-on-surface hover:bg-white/10'
      }`}
    >
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isVoiceOn ? "'FILL' 1" : "'FILL' 0" }}>
        {isVoiceOn ? 'record_voice_over' : 'voice_over_off'}
      </span>
    </button>
    {isVoiceOn && noVoices && (
      <p role="status" className="absolute top-full right-0 mt-2 w-56 p-3 rounded-2xl glass-panel border border-white/10 text-xs text-on-surface-variant z-50">
        Este dispositivo no tiene voces instaladas, así que no sonará. En Linux instala speech-dispatcher y una voz en español.
      </p>
    )}
    </div>
  );
};
