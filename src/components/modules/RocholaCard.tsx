import React, { useState, useEffect, useRef } from 'react';
import { useZenStore } from '../../store/useZenStore';
import { motion, AnimatePresence, useSpring, useTransform, useAnimationFrame, useMotionValue } from 'framer-motion';

const DEFAULT_STATIONS = [
  {
    artist: 'Marconi Union',
    title: 'Weightless (Calma Máxima)',
    url: 'https://www.youtube.com/watch?v=UfcAVejsrU0',
    embedUrl: 'https://www.youtube.com/embed/UfcAVejsrU0?autoplay=1&enablejsapi=1',
  },
  {
    artist: 'Lofi Girl',
    title: 'Ambient Beats (Concentración)',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&enablejsapi=1',
  },
];

// ─── Organic Frequency Visualizer (Framer Motion Native) ───────────────
// Uses GPU-accelerated math functions instead of Web Audio API to guarantee
// smooth 60fps performance without being blocked by browser permissions.

const BAR_COUNT = 24;

interface BarProps {
  index: number;
  total: number;
  isActive: boolean;
  time: any; // MotionValue<number>
}

const VisualizerBar: React.FC<BarProps> = React.memo(({ index, total, isActive, time }) => {
  // Compute scale based on time using multiple out-of-phase sine waves
  const scaleY = useTransform(time, (t: number) => {
    if (!isActive) return 0.1;

    // Organic movement using multiple sine waves
    const phase1 = Math.sin(t * 0.003 + index * 0.2);
    const phase2 = Math.sin(t * 0.005 - index * 0.3);
    const phase3 = Math.sin(t * 0.002 + index * 0.8);
    
    let val = (phase1 * 0.4 + phase2 * 0.3 + phase3 * 0.3 + 1) / 2;
    
    // Taper the ends (make center bars higher)
    const center = total / 2;
    const distFromCenter = Math.abs(index - center) / center;
    const taper = 1 - Math.pow(distFromCenter, 2.5);
    
    // final scale (0.1 to 1.4)
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
    <motion.div
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
  const { musicLink, setMusicLink, isBreathingActive, isRocholaPlaying, setIsRocholaPlaying } = useZenStore();
  const [inputUrl, setInputUrl] = useState(musicLink);
  const [currentEmbed] = useState<string>(() => {
    const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = musicLink ? musicLink.match(ytReg) : null;
    const vidId = match ? match[1] : DEFAULT_STATIONS[0].url.match(ytReg)?.[1];
    return `https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1`;
  });
  const [error, setError] = useState<string | null>(null);
  const wasPlayingRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [trackInfo, setTrackInfo] = useState<{ title: string; artist: string }>({
    title: DEFAULT_STATIONS[0].title,
    artist: DEFAULT_STATIONS[0].artist,
  });

  const visualizerActive = isRocholaPlaying && !isBreathingActive;
  const time = useMotionValue(0);

  useAnimationFrame((t) => {
    time.set(t);
  });

  // Spring-driven glow intensity based on time
  const glowIntensity = useTransform(time, (t: number) => {
    if (!visualizerActive) return 0;
    return Math.sin(t * 0.002) * 0.5 + 0.5;
  });

  const springGlow = useSpring(glowIntensity, { stiffness: 40, damping: 12 });

  // Glow background driven by spring
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

  // Dynamically fetch track metadata from YouTube using noembed
  useEffect(() => {
    const activeUrl = musicLink || DEFAULT_STATIONS[0].url;

    const defaultStation = DEFAULT_STATIONS.find(s => s.url === activeUrl);
    if (defaultStation) {
      setTrackInfo({ title: defaultStation.title, artist: defaultStation.artist });
      return;
    }

    setTrackInfo({ title: 'Cargando audio...', artist: 'YouTube' });

    fetch(`https://noembed.com/embed?url=${encodeURIComponent(activeUrl)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          setTrackInfo({
            title: data.title,
            artist: data.author_name || 'YouTube',
          });
        } else {
          setTrackInfo({ title: 'Audio de YouTube', artist: 'Canal de YouTube' });
        }
      })
      .catch(() => {
        setTrackInfo({ title: 'Audio de YouTube', artist: 'Canal de YouTube' });
      });
  }, [musicLink]);

  const prevBreathingRef = useRef(isBreathingActive);

  // Synchronize playing state with breathing session
  useEffect(() => {
    if (!iframeRef.current) return;
    if (prevBreathingRef.current === isBreathingActive) return;

    try {
      if (isBreathingActive) {
        wasPlayingRef.current = isRocholaPlaying;
        if (isRocholaPlaying) {
          iframeRef.current.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
            '*'
          );
          setIsRocholaPlaying(false);
        }
      } else {
        if (wasPlayingRef.current) {
          iframeRef.current.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
            '*'
          );
          setIsRocholaPlaying(true);
        }
      }
    } catch (e) {
      console.error('Error sending play/pause command:', e);
    }
    
    prevBreathingRef.current = isBreathingActive;
  }, [isBreathingActive, isRocholaPlaying, setIsRocholaPlaying]);

  function extractVideoId(url: string): string | null {
    if (!url) return null;
    const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = url.match(ytReg);
    return ytMatch ? ytMatch[1] : null;
  }

  const handleLoadLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const videoId = extractVideoId(inputUrl);

    if (videoId) {
      setMusicLink(inputUrl);
      setIsRocholaPlaying(true);
      
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'loadVideoById', args: [videoId, 0] }),
          '*'
        );
      }
    } else {
      setError('Formato de enlace no reconocido. Por favor ingresa una URL de YouTube válida.');
    }
  };

  const handleSelectStation = (station: typeof DEFAULT_STATIONS[0]) => {
    setError(null);
    setInputUrl(station.url);
    setMusicLink(station.url);
    setIsRocholaPlaying(true);
    
    const videoId = extractVideoId(station.url);
    if (videoId && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'loadVideoById', args: [videoId, 0] }),
        '*'
      );
    }
  };

  const togglePlay = () => {
    if (!iframeRef.current) return;

    try {
      if (isRocholaPlaying) {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
        setIsRocholaPlaying(false);
      } else {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
        setIsRocholaPlaying(true);
      }
    } catch (e) {
      console.error('Error sending play/pause command:', e);
    }
  };



  return (
    <section className="w-full flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="font-body text-xs text-primary uppercase tracking-widest font-semibold">
          Ondas de Serenidad
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold">
          Rochola
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col justify-between gap-4">
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            Encuentra tu frecuencia de paz. Pega un enlace de YouTube y deja que el sonido te guíe hacia un estado de quietud profunda.
          </p>

          {/* Form Link */}
          <form onSubmit={handleLoadLink} className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
                Enlace de Audio
              </label>
              <input
                type="text"
                placeholder="Pega enlace de YouTube aquí..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="glass-input px-5 py-3.5 rounded-full font-body text-sm w-full placeholder:text-on-surface-variant/40"
              />
            </div>

            <button
              type="submit"
              className="bg-primary text-on-primary font-body text-xs px-6 py-3.5 rounded-full hover:bg-primary/90 transition-colors uppercase tracking-wider font-semibold cursor-pointer w-full text-center active-scale"
            >
              Cargar Ambiente
            </button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-xs text-error mt-1"
                >
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Player and Recommendations */}
        <div className="flex flex-col gap-4 justify-between">
          {/* Player Container */}
          <div className="w-full aspect-video rounded-3xl bg-surface-container-lowest/40 border border-white/5 flex items-center justify-center relative overflow-hidden min-h-[170px]">
            {/* Custom pure audio interface */}
            {currentEmbed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full select-none z-10 bg-surface-container-lowest rounded-3xl overflow-hidden">
                {/* Animated radial glow driven by audio intensity */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-3xl"
                  style={{
                    background: glowBg,
                    opacity: glowOpacity,
                  }}
                />

                {/* Subtle secondary ambient ring */}
                <motion.div
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    width: '200%',
                    height: '200%',
                    top: '-50%',
                    left: '-50%',
                    background: 'radial-gradient(circle, transparent 30%, rgba(183,200,222,0.04) 50%, transparent 70%)',
                    opacity: glowOpacity,
                  }}
                  animate={visualizerActive ? { rotate: 360 } : { rotate: 0 }}
                  transition={visualizerActive ? {
                    duration: 30,
                    repeat: Infinity,
                    ease: 'linear',
                  } : { duration: 0.5, ease: 'easeOut' }}
                />

                {/* Content wrapper */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-4 w-full h-full px-6 py-4">

                  {/* ─── Frequency Visualizer ─── */}
                  <div className="flex items-end justify-center gap-[2px] h-14 w-full max-w-[280px]">
                    {Array.from({ length: BAR_COUNT }).map((_, i) => (
                      <VisualizerBar
                        key={i}
                        index={i}
                        total={BAR_COUNT}
                        isActive={visualizerActive}
                        time={time}
                      />
                    ))}
                  </div>

                  {/* Track Info */}
                  <div className="flex flex-col gap-1.5 max-w-[85%] text-center">
                    <motion.span
                      className="font-body text-sm font-semibold text-on-surface line-clamp-1 text-glow"
                      animate={{ opacity: isRocholaPlaying ? 1 : 0.6 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {trackInfo.title}
                    </motion.span>
                    <span className="font-body text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
                      {trackInfo.artist}
                    </span>
                  </div>

                  {/* Play / Pause */}
                  <motion.button
                    type="button"
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-on-primary cursor-pointer mt-1"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    style={{
                      boxShadow: isRocholaPlaying
                        ? '0 0 24px rgba(183,200,222,0.3), 0 4px 16px rgba(0,0,0,0.4)'
                        : '0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isRocholaPlaying ? 'pause' : 'play'}
                        className="material-symbols-outlined text-[26px]"
                        initial={{ scale: 0.5, opacity: 0, filter: 'blur(4px)' }}
                        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                        exit={{ scale: 0.5, opacity: 0, filter: 'blur(4px)' }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      >
                        {isRocholaPlaying ? 'pause' : 'play_arrow'}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Iframe: full size behind cover for YouTube API compliance */}
            {currentEmbed && (
              <iframe
                ref={iframeRef}
                src={currentEmbed}
                className="w-full h-full border-0 absolute inset-0 rounded-3xl pointer-events-none z-0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title="Zen Audio Embed"
                onLoad={(e) => {
                  if (isRocholaPlaying) {
                    const target = e.target as HTMLIFrameElement;
                    target.contentWindow?.postMessage(
                      JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
                      '*'
                    );
                  }
                }}
              />
            )}

            {/* Breathing session overlay */}
            <div
              className={`flex flex-col items-center justify-center gap-3 text-center px-4 transition-opacity duration-300 absolute inset-0 bg-surface-container-lowest/95 rounded-3xl z-20 ${
                isBreathingActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <span className="material-symbols-outlined text-[44px] text-primary animate-pulse">
                wind_power
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-body text-xs font-semibold text-on-surface">
                  Música en pausa
                </span>
                <span className="font-body text-[10px] text-on-surface-variant/60 leading-normal max-w-[200px]">
                  Disfruta de tu sesión de meditación y relajación.
                </span>
              </div>
            </div>

            {/* Empty state */}
            {!currentEmbed && (
              <div className="flex flex-col items-center gap-2 z-10">
                <span className="material-symbols-outlined text-[48px] text-primary/40 animate-pulse">
                  music_note
                </span>
                <span className="font-body text-xs text-on-surface-variant/60">
                  Ningún audio cargado
                </span>
              </div>
            )}
          </div>

          {/* Suggested Stations */}
          <div className="flex flex-col gap-2">
            <span className="font-body text-[10px] text-on-surface-variant/60 uppercase tracking-wider font-bold">
              Sugerencias recomendadas
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_STATIONS.map((station, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleSelectStation(station)}
                  className={`glass-panel hover:bg-white/5 rounded-2xl p-3 flex items-center gap-3 cursor-pointer text-left border ${
                    inputUrl === station.url
                      ? 'border-primary/40 bg-white/5'
                      : 'border-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <motion.span
                    className="material-symbols-outlined text-primary text-[20px]"
                    animate={inputUrl === station.url && isRocholaPlaying ? {
                      scale: [1, 1.15, 1],
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {inputUrl === station.url && isRocholaPlaying ? 'graphic_eq' : inputUrl === station.url ? 'volume_up' : 'play_arrow'}
                  </motion.span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body font-semibold text-xs leading-tight text-on-surface truncate">
                      {station.artist}
                    </span>
                    <span className="font-body text-[10px] text-on-surface-variant truncate">
                      {station.title}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
