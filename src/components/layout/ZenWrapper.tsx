import React from 'react';
import { useZenStore, type ActiveTab, type ThemeColor } from '../../store/useZenStore';
import { Header } from './Header';
import { Footer } from './Footer';
import { RocholaCard } from '../modules/RocholaCard';
import { OraculoCard } from '../modules/OraculoCard';
import { TestCard } from '../modules/TestCard';
import { MeditationCard } from '../modules/MeditationCard';
import { motion, useAnimationFrame, useMotionValue, useTransform, useSpring } from 'framer-motion';

const THEME_COLORS: Record<ThemeColor, { base: string, blob1: string, blob2: string, blob3: string, blob4: string }> = {
  ocean: { base: '#0a0f18', blob1: '#1d2d44', blob2: '#3e5c76', blob3: '#748cab', blob4: '#0d1b2a' },
  lava: { base: '#1a0500', blob1: '#9c2a00', blob2: '#e85d04', blob3: '#ff8c00', blob4: '#5c1000' },
  forest: { base: '#05120b', blob1: '#255943', blob2: '#40916c', blob3: '#74c69d', blob4: '#143627' },
  amethyst: { base: '#1e0533', blob1: '#6441A5', blob2: '#ff007f', blob3: '#ff7b00', blob4: '#31105e' },
  sunset: { base: '#1a0710', blob1: '#8c1c46', blob2: '#c92a54', blob3: '#ff7b00', blob4: '#541530' }
};

export const ZenWrapper: React.FC = () => {
  const { activeTab, setActiveTab, themeColor, isRocholaPlaying, isBreathingActive } = useZenStore();

  const navigationItems = [
    { id: 'jukebox' as ActiveTab, label: 'Rochola', icon: 'music_note' },
    { id: 'oracle' as ActiveTab, label: 'Oráculo', icon: 'auto_awesome' },
    { id: 'test' as ActiveTab, label: 'Tests', icon: 'assignment' },
    { id: 'zen' as ActiveTab, label: 'Zen', icon: 'self_improvement' },
  ];

  const time = useMotionValue(0);
  
  useAnimationFrame((t) => {
    time.set(t);
  });

  const isAudioActive = isRocholaPlaying && !isBreathingActive;

  // Pulse intensity based on audio playing
  const audioScaleCenter = useTransform(time, (t: number) => {
    if (!isAudioActive) return 1;
    // Aggressive pulsing math simulating kick drums and bass
    const beat = Math.sin(t * 0.004) * 0.5 + Math.sin(t * 0.002) * 0.5;
    return 1 + (Math.max(0, beat) * 0.6); // Scales up to 1.6
  });

  const springScaleCenter = useSpring(audioScaleCenter, { stiffness: 60, damping: 12 });
  const pulseOpacity = useTransform(springScaleCenter, [1, 1.6], [0.4, 0.9]);
  
  // Lava lamp dramatic translations based on the audio value (x and y offsets)
  // When the beat hits (1.6), blobs push away from the center dramatically and squish
  const lavaUp = useTransform(springScaleCenter, [1, 1.6], [0, -120]); 
  const lavaDown = useTransform(springScaleCenter, [1, 1.6], [0, 120]);
  const lavaLeft = useTransform(springScaleCenter, [1, 1.6], [0, -80]);
  const lavaRight = useTransform(springScaleCenter, [1, 1.6], [0, 80]);
  const lavaScaleSquish1 = useTransform(springScaleCenter, [1, 1.6], [1, 1.25]);
  const lavaScaleSquish2 = useTransform(springScaleCenter, [1, 1.6], [1, 0.85]);

  const currentTheme = THEME_COLORS[themeColor];

  return (
    <div 
      className="relative min-h-screen w-full overflow-y-auto flex flex-col justify-between items-center p-4 md:p-8 z-0 transition-colors duration-1000"
      style={{ backgroundColor: currentTheme.base }}
    >
      {/* Background rich fluid mesh gradient that reacts to music */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-90">
        
        {/* Hardware-accelerated floating background blobs */}
        {/* Blob 1: Top Left - pushes Up and Left */}
        <motion.div className="absolute inset-0 z-0" style={{ y: lavaUp, x: lavaLeft, scale: lavaScaleSquish1 }}>
          <div 
            className="absolute w-[150vw] h-[120vw] md:w-[80vw] md:h-[60vw] blur-[40px] md:blur-[140px]" 
            style={{ 
              top: '-10%', left: '-10%', 
              background: `radial-gradient(ellipse at center, ${currentTheme.blob1} 0%, transparent 65%)`,
              animation: 'var(--animate-mesh-1)'
            }}
          />
        </motion.div>

        {/* Blob 2: Bottom Right - pushes Down and Right */}
        <motion.div className="absolute inset-0 z-0" style={{ y: lavaDown, x: lavaRight, scale: lavaScaleSquish2 }}>
          <div 
            className="absolute w-[120vw] h-[150vw] md:w-[60vw] md:h-[80vw] blur-[40px] md:blur-[140px]" 
            style={{ 
              bottom: '-10%', right: '-10%', 
              background: `radial-gradient(ellipse at center, ${currentTheme.blob2} 0%, transparent 65%)`,
              animation: 'var(--animate-mesh-2)'
            }}
          />
        </motion.div>

        {/* Blob 3: Top Right - pushes Up and Right */}
        <motion.div className="absolute inset-0 z-0" style={{ y: lavaUp, x: lavaRight, scale: lavaScaleSquish1 }}>
          <div 
            className="absolute w-[140vw] h-[110vw] md:w-[70vw] md:h-[50vw] blur-[30px] md:blur-[130px]" 
            style={{ 
              top: '20%', left: '30%', 
              background: `radial-gradient(ellipse at center, ${currentTheme.blob3} 0%, transparent 60%)`,
              animation: 'var(--animate-mesh-3)'
            }}
          />
        </motion.div>

        {/* Blob 4: Bottom Left - pushes Down and Left */}
        <motion.div className="absolute inset-0 z-0" style={{ y: lavaDown, x: lavaLeft, scale: lavaScaleSquish2 }}>
          <div 
            className="absolute w-[110vw] h-[140vw] md:w-[50vw] md:h-[70vw] blur-[30px] md:blur-[110px]" 
            style={{ 
              bottom: '10%', left: '-10%',
              background: `radial-gradient(ellipse at center, ${currentTheme.blob4} 0%, transparent 60%)`,
              animation: 'var(--animate-mesh-4)'
            }}
          />
        </motion.div>
        
        {/* Additional blobs for rich "oil in water" mixture */}
        <motion.div className="absolute inset-0 z-0 opacity-70" style={{ y: lavaUp, scale: lavaScaleSquish1 }}>
          <div 
            className="absolute w-[130vw] h-[150vw] md:w-[65vw] md:h-[85vw] blur-[40px] md:blur-[140px]" 
            style={{ 
              top: '10%', right: '10%', 
              background: `radial-gradient(ellipse at center, ${currentTheme.blob1} 0%, transparent 60%)`,
              animation: 'var(--animate-mesh-5)'
            }}
          />
        </motion.div>

        <motion.div className="absolute inset-0 z-0 opacity-70" style={{ y: lavaDown, scale: lavaScaleSquish2 }}>
          <div 
            className="absolute w-[150vw] h-[110vw] md:w-[75vw] md:h-[55vw] blur-[40px] md:blur-[140px]" 
            style={{ 
              bottom: '20%', left: '20%', 
              background: `radial-gradient(ellipse at center, ${currentTheme.blob2} 0%, transparent 60%)`,
              animation: 'var(--animate-mesh-6)'
            }}
          />
        </motion.div>

        {/* Central Audio Reactive Pulse Blob */}
        <motion.div 
          className="absolute w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full blur-[70px] md:blur-[100px]" 
          style={{ 
            top: '50%', left: '50%', 
            x: '-50%', y: '-50%', // Centers perfectly
            scale: springScaleCenter,
            opacity: pulseOpacity,
            background: `radial-gradient(circle, ${currentTheme.blob1} 0%, transparent 60%)` 
          }}
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-between gap-6 z-10 pb-16">
        <div className="flex flex-col gap-6 w-full">
          <Header />
          
          <main className="w-full flex-1 flex items-center justify-center">
            <div className="w-full glass-panel rounded-3xl p-6 md:p-8 min-h-[440px] flex items-center justify-center relative overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              {/* Ambient inner light */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none" />
              <div className="w-full z-10 relative">
                {/* Jukebox (Rochola) */}
                <div 
                  className={`w-full transition-all duration-500 ease-out ${
                    activeTab === 'jukebox' 
                      ? 'opacity-100 translate-y-0 pointer-events-auto' 
                      : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                  }`}
                >
                  <RocholaCard />
                </div>

                {/* Oracle */}
                <div 
                  className={`w-full transition-all duration-500 ease-out ${
                    activeTab === 'oracle' 
                      ? 'opacity-100 translate-y-0 pointer-events-auto' 
                      : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                  }`}
                >
                  <OraculoCard />
                </div>

                {/* Test */}
                <div 
                  className={`w-full transition-all duration-500 ease-out ${
                    activeTab === 'test' 
                      ? 'opacity-100 translate-y-0 pointer-events-auto' 
                      : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                  }`}
                >
                  <TestCard />
                </div>

                {/* Zen (Meditation) */}
                <div 
                  className={`w-full transition-all duration-500 ease-out ${
                    activeTab === 'zen' 
                      ? 'opacity-100 translate-y-0 pointer-events-auto' 
                      : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                  }`}
                >
                  <MeditationCard />
                </div>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>

      {/* Fixed Bottom Navigation Dock */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-30 select-none">
        <div className="glass-panel py-2 px-3 rounded-full flex justify-around items-center gap-1 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-0.5 py-2 px-5 rounded-full transition-all duration-300 active-scale cursor-pointer ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-on-surface-variant/60 hover:text-on-surface'
                }`}
              >
                {isActive && (
                  <motion.span 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/10 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span 
                  className={`material-symbols-outlined text-[24px] relative z-10 transition-transform duration-300 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400"
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-center relative z-10">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
export default ZenWrapper;
