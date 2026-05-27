/**
 * AmbienceEngine.tsx — Motor de audio ambiental global (headless).
 *
 * Este componente no renderiza nada visible en pantalla (devuelve null).
 * Su único propósito es orquestar el ciclo de vida del audio procedural
 * en respuesta a los cambios de estado del store de Zustand.
 *
 * ── Lógica de reproducción ───────────────────────────────────────────────
 *
 * El audio se reproduce cuando se cumplen AMBAS condiciones:
 *   1. `isRocholaPlaying` está en true (el usuario pulsó play).
 *   2. `isBreathingActive` está en false (no hay sesión de respiración activa).
 *
 * Cuando el usuario inicia una sesión de respiración, el motor pausa la
 * música automáticamente para no interferir con las instrucciones vocales.
 * Al terminar la sesión, el audio retoma donde lo dejó.
 *
 * ── Gestión de sintetizadores ───────────────────────────────────────────
 *
 * Cada estación de audio tiene un `type` ('binaural' o 'nature') y una
 * configuración de parámetros en `stations.json`. Al cambiar de estación,
 * el motor:
 *   1. Para el sintetizador anterior con fade-out.
 *   2. Crea una nueva instancia del sintetizador correspondiente.
 *   3. La conecta al GainNode maestro global y la arranca con fade-in.
 *
 * ── Control de volumen / mute ────────────────────────────────────────────
 *
 * En lugar de cambiar el volumen abruptamente (lo que causa clicks audibles),
 * se usa `linearRampToValueAtTime` con un ramp de 100ms, que es imperceptible
 * para el oído humano pero elimina completamente el artefacto.
 */
import React, { useEffect, useRef } from 'react';
import { useZenStore } from '../../store/useZenStore';
import STATIONS from '../../data/stations.json';
import { createBinauralSynth } from './synthesizers/BinauralSynth';
import { createNatureSynth } from './synthesizers/NatureSynth';
import { globalAudioContext, globalMasterGain, unlockAudioContext } from './AudioContextManager';

/**
 * Motor de audio ambiental. No tiene representación visual.
 * Se monta una única vez en ZenWrapper y vive durante toda la sesión.
 */
export const AmbienceEngine: React.FC = () => {
  const {
    stationId,
    isRocholaPlaying,
    isBreathingActive,
    isMuted,
    volume,
    setIsRocholaPlaying
  } = useZenStore();

  // Referencia al sintetizador activo en este momento.
  // Usamos ref en lugar de estado para no provocar re-renders innecesarios.
  const synthRef = useRef<{ start: () => void, stop: () => void, node: AudioNode } | null>(null);

  // ── Efecto principal: arrancar/parar el sintetizador ─────────────────
  useEffect(() => {
    const shouldPlay = isRocholaPlaying && !isBreathingActive;

    // Si no debemos reproducir, paramos lo que hubiera y salimos
    if (!shouldPlay || !stationId) {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
      return;
    }

    // Desbloqueamos el AudioContext (necesario por la política de autoplay)
    unlockAudioContext();

    // Si el navegador suspendió el contexto (ej. pestaña en segundo plano),
    // intentamos reanudarlo. Si falla, paramos la reproducción limpiamente.
    if (globalAudioContext && globalAudioContext.state === 'suspended') {
      globalAudioContext.resume().catch((e) => {
        console.error("No se pudo reanudar el AudioContext:", e);
        setIsRocholaPlaying(false);
      });
    }

    // Paramos el sintetizador anterior antes de crear uno nuevo
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }

    const station = STATIONS.find(s => s.id === stationId);
    if (!station || !globalAudioContext) return;

    // Instanciamos el sintetizador correcto según el tipo de estación
    if (station.type === 'binaural' && station.config) {
      synthRef.current = createBinauralSynth(
        globalAudioContext,
        station.config.baseFreq!,
        station.config.beatFreq!
      );
    } else if (station.type === 'nature' && station.config) {
      synthRef.current = createNatureSynth(
        globalAudioContext,
        station.config.preset! as import('./synthesizers/NatureSynth').NaturePreset
      );
    }

    // Conectamos el nodo de salida del sintetizador al gain maestro y lo arrancamos
    if (synthRef.current && globalMasterGain) {
      synthRef.current.node.connect(globalMasterGain);
      synthRef.current.start();
    }

    // Cleanup: parar el sintetizador si el componente se desmonta o cambia la estación
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
    };
  }, [stationId, isRocholaPlaying, isBreathingActive, setIsRocholaPlaying]);

  // ── Efecto de volumen / mute ──────────────────────────────────────────
  // Escuchamos los cambios de volumen y mute por separado para no recrear
  // el sintetizador completo cada vez que el usuario mueve el slider.
  useEffect(() => {
    if (globalMasterGain) {
      const targetGain = isMuted ? 0 : volume;
      // Rampa suave de 100ms para evitar el click al cambiar de volumen
      globalMasterGain.gain.setValueAtTime(
        globalMasterGain.gain.value,
        globalAudioContext!.currentTime
      );
      globalMasterGain.gain.linearRampToValueAtTime(
        targetGain,
        globalAudioContext!.currentTime + 0.1
      );
    }
  }, [isMuted, volume]);

  // Este componente es headless: no renderiza nada en el DOM
  return null;
};
