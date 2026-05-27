import React, { useState } from 'react';
import { useZenStore } from '../../store/useZenStore';
import { m, AnimatePresence, useSpring, useTransform, useAnimationFrame, useMotionValue } from 'framer-motion';
import STATIONS from '../../data/stations.json';
import { unlockAudioContext } from '../audio/AudioContextManager';

// ─── Organic Frequency Visualizer (Framer Motion Native) ───────────────


interface BarProps {
  index: number;
  total: number;
  isActive: boolean;
  time: import('framer-motion').MotionValue<number>;
}

const VisualizerBar: React.FC<BarProps> = React.memo(({ index, total, isActive, time }) => {
  const scaleY = useTransform(time, (t: number) => {
    if (!isActive) return 0.1;
    const phase1 = Math.sin(t * 0.003 + index * 0.2);
    const phase2 = Math.sin(t * 0.005 - index * 0.3);
    const phase3 = Math.sin(t * 0.002 + index * 0.8);
    const val = (phase1 * 0.4 + phase2 * 0.3 + phase3 * 0.3 + 1) / 2;
    const center = total / 2;
    const distFromCenter = Math.abs(index - center) / center;
    const taper = 1 - Math.pow(distFromCenter, 2.5);
    return 0.1 + (val * taper * 1.3);
  });

  const springScale = useSpring(scaleY, { stiffness: 180, damping: 18, mass: 0.6 });
  const center = total / 2;
  const distFromCenter = Math.abs(index - center) / center;
  const hue = 210 + distFromCenter * 15;
  const saturation = 25 + (1 - distFromCenter) * 20;

  const bgColor = useTransform(springScale, (s: number) => {
     const lightness = 60 + s * 15;
     const opacity = 0.2 + s * 0.6;
     return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  });

  return (
    <m.div
      style={{
        transform: useTransform(springScale, s => `scaleY(${s})`),
        backgroundColor: bgColor,
        width: '3px',
        height: '44px',
        borderRadius: '9999px',
        transformOrigin: 'bottom',
      }}
    />
  );
});

VisualizerBar.displayName = 'VisualizerBar';

// ─── Main Component ──────────────────────────────────────────────────────────

export const RocholaCard: React.FC = () => {
  const { stationId, setStationId, isBreathingActive, isRocholaPlaying, setIsRocholaPlaying, volume, setVolume } = useZenStore();
  const [error, setError] = useState<string | null>(null);
  
  const currentStation = STATIONS.find(s => s.id === stationId) || null;
  const visualizerActive = isRocholaPlaying && !isBreathingActive;
  const time = useMotionValue(0);

  useAnimationFrame((t) => {
    time.set(t);
  });

  const glowIntensity = useTransform(time, (t: number) => {
    if (!visualizerActive) return 0;
    return Math.sin(t * 0.002) * 0.5 + 0.5;
  });
  const springGlow = useSpring(glowIntensity, { stiffness: 40, damping: 12 });
  const glowBg = useTransform(
    springGlow,
    [0, 0.5, 1],
    [
      'radial-gradient(circle, rgba(183,200,222,0.03) 0%, rgba(13,19,30,0) 70%)',
      'radial-gradient(circle, rgba(183,200,222,0.18) 0%, rgba(13,19,30,0) 70%)',
      'radial-gradient(circle, rgba(183,200,222,0.35) 0%, rgba(140,180,240,0.08) 50%, rgba(13,19,30,0) 70%)',
    ]
  );
  const glowOpacity = useTransform(springGlow, [0, 1], [0.2, 1]);

  const handleSelectStation = (station: typeof STATIONS[0]) => {
    unlockAudioContext();
    setError(null);
    setStationId(station.id);
    setIsRocholaPlaying(true);
  };

  const togglePlay = () => {
    unlockAudioContext();
    setIsRocholaPlaying(!isRocholaPlaying);
  };

  return (
    <section className="w-full flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold">
          Audio
        </h2>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Selecciona una frecuencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Stations Grid */}
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {error && (
              <m.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5 text-xs text-error bg-error/10 px-4 py-2 rounded-lg"
              >
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>{error}</span>
              </m.div>
            )}
          </AnimatePresence>
          
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
                  animate={stationId === station.id && isRocholaPlaying ? {
                    scale: [1, 1.15, 1],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
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

        {/* Right: Player Container */}
        <div className="flex flex-col gap-4 h-full">
          <div className="w-full h-full min-h-[420px] rounded-[32px] bg-surface-container-lowest/40 border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Custom pure audio interface */}
            {stationId && currentStation && (
              <div className="absolute inset-0 flex flex-col w-full h-full select-none z-10 bg-surface-container-lowest rounded-[32px] overflow-hidden">
                {/* Dynamic Background Glow */}
                <m.div
                  className="absolute inset-0 pointer-events-none rounded-[32px]"
                  style={{ background: glowBg, opacity: glowOpacity }}
                />
                <m.div
                  className="absolute pointer-events-none rounded-full mix-blend-screen"
                  style={{
                    width: '200%', height: '200%', top: '-50%', left: '-50%',
                    background: 'radial-gradient(circle, transparent 30%, rgba(183,200,222,0.05) 50%, transparent 70%)',
                    opacity: glowOpacity,
                  }}
                  animate={visualizerActive ? { rotate: 360 } : { rotate: 0 }}
                  transition={visualizerActive ? { duration: 40, repeat: Infinity, ease: 'linear' } : { duration: 0.5, ease: 'easeOut' }}
                />

                {/* Top Section: Track Info */}
                <div className="relative z-20 flex flex-col gap-1 w-full px-8 pt-8">
                  <span className="font-body text-[11px] text-on-surface-variant/70 uppercase tracking-[0.2em] font-bold">
                    {currentStation.artist}
                  </span>
                  <m.span
                    className="font-display text-2xl font-semibold text-on-surface line-clamp-2"
                    animate={{ opacity: isRocholaPlaying ? 1 : 0.6 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {currentStation.title}
                  </m.span>
                </div>

                {/* Middle Section: Big Play Button & Visualizer Background */}
                <div className="relative z-10 flex-1 flex items-center justify-center w-full">
                  {/* Organic Visualizer in background */}
                  <div className="absolute bottom-0 left-0 w-full h-40 flex items-end justify-center gap-1 opacity-50 px-4">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <VisualizerBar key={i} index={i} total={40} isActive={visualizerActive} time={time} />
                    ))}
                  </div>

                  {/* Play Button */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="relative z-20 size-24 rounded-full flex items-center justify-center text-on-primary cursor-pointer active-scale transition-all duration-300"
                  >
                    {/* Glass backdrop ring */}
                    <m.div 
                      className="absolute inset-0 rounded-full bg-primary/20 backdrop-blur-md border border-white/10"
                      animate={isRocholaPlaying ? {
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0.8, 0.5],
                      } : { scale: 1, opacity: 0.5 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Inner Solid Button */}
                    <div className="absolute inset-2 rounded-full bg-primary flex items-center justify-center shadow-xl">
                      <span className="material-symbols-outlined text-[36px]">
                        {isRocholaPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Bottom Section: Volume Control */}
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

            {/* Empty state */}
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
            
            {/* Breathing session overlay */}
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
