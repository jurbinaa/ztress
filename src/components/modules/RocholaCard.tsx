import React, { useState } from 'react';
import { useZenStore } from '../../store/useZenStore';
import { useShallow } from 'zustand/react/shallow';
import { m } from 'framer-motion';
import STATIONS from '../../data/stations.json';
import { unlockAudioContext } from '../audio/AudioContextManager';

// ─── Visualizador de Frecuencias Orgánico (Optimizado: CSS Animation + Canvas-lite) ───────────────

interface BarProps {
  /** Índice de la barra dentro del visualizador */
  index: number;
  /** Cantidad total de barras en el visualizador */
  total: number;
  /** Indica si la música está sonando y el visualizador debe oscilar */
  isActive: boolean;
}

/**
 * VisualizerBarOptimized - Usa CSS animations en lugar de Framer Motion springs
 * para evitar 40+ instancias de useSpring/useTransform que bloquean el main thread.
 * Cada barra tiene un delay único basado en su índice para movimiento orgánico.
 */
const VisualizerBar: React.FC<BarProps> = React.memo(({ index, total, isActive }) => {
  if (!isActive) {
    return (
      <div
        className="w-[3px] h-[44px] rounded-full"
        style={{
          transform: 'scaleY(0.1)',
          transformOrigin: 'bottom',
          backgroundColor: 'hsla(210, 25%, 60%, 0.2)',
        }}
      />
    );
  }

  // Pre-calculamos valores únicos por barra para evitar cálculos en render
  const center = total / 2;
  const distFromCenter = Math.abs(index - center) / center;
  const taper = 1 - Math.pow(distFromCenter, 2.5);
  const hue = 210 + distFromCenter * 15;
  const saturation = 25 + (1 - distFromCenter) * 20;
  
  // Delay único por barra para efecto de onda orgánica (0-4s)
  const animationDelay = `${(index * 0.1) % 4}s`;
  // Duración variable para movimiento no repetitivo (3-6s)
  const animationDuration = `${3 + (index % 3) * 1.5}s`;

  return (
    <div
      className="w-[3px] h-[44px] rounded-full"
      style={{
        transform: 'scaleY(0.1)',
        transformOrigin: 'bottom',
        backgroundColor: `hsla(${hue}, ${saturation}%, 60%, 0.3)`,
        animation: `bar-wave-${Math.floor(index / 8)} ${animationDuration} ease-in-out infinite alternate`,
        animationDelay,
        opacity: 0.3 + taper * 0.7,
      }}
    />
  );
});

VisualizerBar.displayName = 'VisualizerBar';

// ─── Componente Principal (RocholaCard) ──────────────────────────────────────

/**
 * RocholaCard proporciona la interfaz de usuario para sintonizar las frecuencias binaurales y ruidos.
 * Contiene una lista de estaciones disponibles y un reproductor interactivo con controles de volumen
 * y un visualizador reactivo a la reproducción de audio.
 */
export const RocholaCard: React.FC = () => {
  // Acceso al estado global de ZenStore con shallow selector para evitar re-renders innecesarios
  const { 
    stationId, 
    setStationId, 
    isBreathingActive, 
    isRocholaPlaying, 
    setIsRocholaPlaying, 
    volume, 
    setVolume 
  } = useZenStore(
    useShallow(state => ({
      stationId: state.stationId,
      setStationId: state.setStationId,
      isBreathingActive: state.isBreathingActive,
      isRocholaPlaying: state.isRocholaPlaying,
      setIsRocholaPlaying: state.setIsRocholaPlaying,
      volume: state.volume,
      setVolume: state.setVolume,
    }))
  );
  
  const [error, setError] = useState<string | null>(null);
  
  // Identifica los datos de la estación seleccionada
  const currentStation = STATIONS.find(s => s.id === stationId) || null;
  
  // El visualizador está activo solo si hay reproducción de audio y no hay respiración/pánico activa
  const visualizerActive = isRocholaPlaying && !isBreathingActive;

  /**
   * Sintoniza una estación de audio seleccionada por el usuario.
   * Libera el AudioContext en navegadores móviles (requisito de seguridad web).
   */
  const handleSelectStation = (station: typeof STATIONS[0]) => {
    unlockAudioContext();
    setError(null);
    setStationId(station.id);
    setIsRocholaPlaying(true);
  };

  /**
   * Alterna la reproducción entre pausa y reproducción.
   * Libera el AudioContext si es necesario.
   */
  const togglePlay = () => {
    unlockAudioContext();
    setIsRocholaPlaying(!isRocholaPlaying);
  };

  return (
    <section className="w-full flex flex-col gap-6 text-left">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold">
          Audio
        </h2>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Selecciona una frecuencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lado Izquierdo: Rejilla de Estaciones de Frecuencia */}
        <div className="flex flex-col gap-3">
          {error && (
            <div
              className="flex items-center gap-1.5 text-xs text-error bg-error/10 px-4 py-2 rounded-lg animate-slide-down"
            >
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>{error}</span>
            </div>
          )}
          
          {/* Listado con scroll vertical para las estaciones cargadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-max max-h-[350px] overflow-y-auto pr-2">
            {STATIONS.map((station) => (
              <button
                type="button"
                key={station.id}
                onClick={() => handleSelectStation(station)}
                className={`glass-panel hover:bg-white/5 rounded-2xl p-3 flex items-center gap-3 cursor-pointer text-left border active-scale transition-all ${
                  stationId === station.id
                    ? 'border-primary/40 bg-white/5'
                    : 'border-white/5'
                }`}
              >
                <m.span
                  className="material-symbols-outlined text-primary text-[20px]"
                  style={{
                    animation: stationId === station.id && isRocholaPlaying 
                      ? 'icon-pulse 1.5s ease-in-out infinite' 
                      : 'none',
                    transformOrigin: 'center',
                  }}
                >
                  {stationId === station.id && isRocholaPlaying ? 'graphic_eq' : 'play_arrow'}
                </m.span>
                <div className="flex flex-col min-w-0">
                  <span className="font-body font-semibold text-xs leading-tight text-on-surface truncate">
                    {station.title}
                  </span>
                  <span className="font-body text-[10px] text-on-surface-variant truncate">
                    {station.artist}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lado Derecho: Contenedor del Reproductor Premium */}
        <div className="flex flex-col gap-4 h-full">
          <div className="w-full h-full min-h-[420px] rounded-[32px] bg-surface-container-lowest/40 border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Interfaz de reproducción activa */}
            {stationId && currentStation && (
              <div className="absolute inset-0 flex flex-col w-full h-full select-none z-10 bg-surface-container-lowest rounded-[32px] overflow-hidden">
                {/* Iluminación Ambiental Reactiva - CSS Animation */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-[32px]"
                  style={{
                    background: isRocholaPlaying 
                      ? 'radial-gradient(circle, rgba(183,200,222,0.35) 0%, rgba(140,180,240,0.08) 50%, rgba(13,19,30,0) 70%)'
                      : 'radial-gradient(circle, rgba(183,200,222,0.03) 0%, rgba(13,19,30,0) 70%)',
                    opacity: isRocholaPlaying ? 1 : 0.2,
                    transition: 'opacity 1s ease-in-out, background 1s ease-in-out',
                  }}
                />
                {/* Círculo Giratorio de Resonancia en Segundo Plano - CSS Animation */}
                <div
                  className="absolute pointer-events-none rounded-full mix-blend-screen"
                  style={{
                    width: '200%', height: '200%', top: '-50%', left: '-50%',
                    background: 'radial-gradient(circle, transparent 30%, rgba(183,200,222,0.05) 50%, transparent 70%)',
                    opacity: isRocholaPlaying ? 1 : 0,
                    animation: isRocholaPlaying ? 'rotate-40s linear infinite' : 'none',
                    transition: 'opacity 0.5s ease-out',
                  }}
                />

                {/* Sección Superior: Información del audio sintonizado */}
                <div className="relative z-20 flex flex-col gap-1 w-full px-8 pt-8">
                  <span className="font-body text-[11px] text-on-surface-variant/70 uppercase tracking-[0.2em] font-bold">
                    {currentStation.artist}
                  </span>
                  <span
                    className="font-display text-2xl font-semibold text-on-surface line-clamp-2"
                    style={{
                      opacity: isRocholaPlaying ? 1 : 0.6,
                      transition: 'opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                  >
                    {currentStation.title}
                  </span>
                </div>

                {/* Sección Central: Botón de Reproducción & Espectrografía */}
                <div className="relative z-10 flex-1 flex items-center justify-center w-full">
                  {/* Visualizador Orgánico de 40 barras */}
                  <div className="absolute bottom-0 left-0 w-full h-40 flex items-end justify-center gap-1 opacity-50 px-4">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <VisualizerBar key={i} index={i} total={40} isActive={visualizerActive} />
                    ))}
                  </div>

                  {/* Botón Central de Play/Pause */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="relative z-20 size-24 rounded-full flex items-center justify-center text-on-primary cursor-pointer active-scale transition-all duration-300"
                  >
                    {/* Aro de dispersión visual / Cristal de fondo */}
                    <div 
                      className="absolute inset-0 rounded-full bg-primary/20 backdrop-blur-md border border-white/10"
                      style={{
                        animation: isRocholaPlaying ? 'pulse-ring 3s ease-in-out infinite' : 'none',
                        opacity: isRocholaPlaying ? 0.5 : 0.5,
                      }}
                    />
                    
                    {/* Botón Sólido Interno */}
                    <div className="absolute inset-2 rounded-full bg-primary flex items-center justify-center shadow-xl">
                      <span className="material-symbols-outlined text-[36px]">
                        {isRocholaPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Sección Inferior: Control de Volumen */}
                <div className="relative z-20 w-full px-8 pb-8 pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-4 w-full bg-black/20 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/5">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] opacity-70">
                      {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-transform"
                      aria-label="Volumen"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Estado Vacío (Sin Sintonizar) */}
            {(!stationId || !currentStation) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 text-center px-6">
                <div className="size-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-primary/40">
                    headphones
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-body text-sm font-semibold text-on-surface">Sin sintonizar</span>
                  <span className="font-body text-xs text-on-surface-variant/60">Selecciona una frecuencia a la izquierda para comenzar</span>
                </div>
              </div>
            )}
            
            {/* Overlay de Interrupción por Respiración Activa */}
            <div
              className={`flex flex-col items-center justify-center gap-4 text-center px-4 transition-opacity duration-500 absolute inset-0 bg-surface-container-lowest/95 backdrop-blur-md rounded-[32px] z-30 ${
                isBreathingActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">
                wind_power
              </span>
              <div className="flex flex-col gap-2">
                <span className="font-body text-sm font-semibold text-on-surface">
                  Sesión de Respiración Activa
                </span>
                <span className="font-body text-xs text-on-surface-variant/80">
                  La reproducción está pausada
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
