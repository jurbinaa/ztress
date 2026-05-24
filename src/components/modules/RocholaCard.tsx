import React, { useState, useEffect, useRef } from 'react';
import { useZenStore } from '../../store/useZenStore';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_STATIONS = [
  {
    artist: 'Marconi Union',
    title: 'Weightless (Calma Máxima)',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWZqdMr2RggRD',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZqdMr2RggRD?utm_source=generator&theme=0',
  },
  {
    artist: 'Lofi Girl',
    title: 'Ambient Beats (Concentración)',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&enablejsapi=1',
  },
];

export const RocholaCard: React.FC = () => {
  const { musicLink, setMusicLink, isBreathingActive } = useZenStore();
  const [inputUrl, setInputUrl] = useState(musicLink);
  const [currentEmbed, setCurrentEmbed] = useState<string>(() => {
    if (musicLink) {
      return parseUrlToEmbed(musicLink) || '';
    }
    return DEFAULT_STATIONS[0].embedUrl; // Default first station
  });
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    
    try {
      if (isBreathingActive) {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
      } else {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
      }
    } catch (e) {
      console.error('Error sending postMessage to iframe:', e);
    }
  }, [isBreathingActive]);

  function parseUrlToEmbed(url: string): string | null {
    if (!url) return null;
    
    // YouTube parsing
    const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = url.match(ytReg);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1`;
    }

    // Spotify parsing
    const spotReg = /open\.spotify\.com\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/;
    const spotMatch = url.match(spotReg);
    if (spotMatch && spotMatch[1] && spotMatch[2]) {
      return `https://open.spotify.com/embed/${spotMatch[1]}/${spotMatch[2]}?utm_source=generator&theme=0`;
    }

    return null;
  }

  const handleLoadLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseUrlToEmbed(inputUrl);

    if (parsed) {
      setMusicLink(inputUrl);
      setCurrentEmbed(parsed);
    } else {
      setError('Formato de enlace no reconocido. Por favor ingresa una URL válida de Spotify o YouTube.');
    }
  };

  const handleSelectStation = (station: typeof DEFAULT_STATIONS[0]) => {
    setError(null);
    setInputUrl(station.url);
    setMusicLink(station.url);
    setCurrentEmbed(station.embedUrl);
  };

  return (
    <section className="w-full flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="font-body text-xs text-primary uppercase tracking-widest font-semibold">
          Módulo de Sonido
        </span>
        <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold">
          Rochola Relajante
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col justify-between gap-4">
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            Personaliza tu atmósfera sonora. Pega una playlist de Spotify o un video de YouTube para acompañar tu sesión de meditación. Todo se procesa de manera privada y local en tu navegador.
          </p>
          
          {/* Form Link */}
          <form onSubmit={handleLoadLink} className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
                Enlace de Audio
              </label>
              <input
                type="text"
                placeholder="Pega enlace de Spotify o YouTube aquí..."
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
            {/* Iframe always mounted to preserve playhead progress */}
            {currentEmbed && (
              <iframe
                ref={iframeRef}
                src={currentEmbed}
                className={`w-full h-full border-0 absolute inset-0 rounded-3xl transition-opacity duration-300 ${
                  isBreathingActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Zen Audio Embed"
              />
            )}

            {/* Custom visual overlay when breathing session is active */}
            <div 
              className={`flex flex-col items-center justify-center gap-3 text-center px-4 transition-opacity duration-300 absolute inset-0 bg-surface-container-lowest/95 rounded-3xl ${
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

            {/* No audio loaded state */}
            {!currentEmbed && (
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[48px] text-primary/40 animate-pulse">
                  music_note
                </span>
                <span className="font-body text-xs text-on-surface-variant/60">
                  Ningún audio cargado
                </span>
              </div>
            )}
          </div>

          {/* Fixed Tracks */}
          <div className="flex flex-col gap-2">
            <span className="font-body text-[10px] text-on-surface-variant/60 uppercase tracking-wider font-bold">
              Sugerencias recomendadas
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_STATIONS.map((station, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectStation(station)}
                  className={`glass-panel hover:bg-white/5 rounded-2xl p-3 flex items-center gap-3 cursor-pointer text-left border ${
                    inputUrl === station.url
                      ? 'border-primary/40 bg-white/5'
                      : 'border-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {inputUrl === station.url ? 'volume_up' : 'play_arrow'}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body font-semibold text-xs leading-tight text-on-surface truncate">
                      {station.artist}
                    </span>
                    <span className="font-body text-[10px] text-on-surface-variant truncate">
                      {station.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
