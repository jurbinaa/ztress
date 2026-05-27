import React, { useEffect } from 'react';
import { useZenStore, type ActiveTab } from '../../store/useZenStore';
import { Header } from './Header';
import { Footer } from './Footer';
import { RocholaCard } from '../modules/RocholaCard';
import { OraculoCard } from '../modules/OraculoCard';
import { TestCard } from '../modules/TestCard';
import { MeditationCard } from '../modules/MeditationCard';
import { TherapyCard } from '../modules/TherapyCard';
import { PanicButton } from '../modules/PanicButton';
import { LazyMotion, domAnimation, m, MotionConfig } from 'framer-motion';
import { AmbienceEngine } from '../audio/AmbienceEngine';

export const ZenWrapper: React.FC = () => {
  const { activeTab, setActiveTab, themeColor, isRocholaPlaying, isBreathingActive } = useZenStore();

  const navigationItems = [
    { id: 'jukebox' as ActiveTab, label: 'Audio', icon: 'music_note' },
    { id: 'oracle' as ActiveTab, label: 'Mensajes', icon: 'auto_awesome' },
    { id: 'test' as ActiveTab, label: 'Evalúa', icon: 'assignment' },
    { id: 'zen' as ActiveTab, label: 'Práctica', icon: 'self_improvement' },
    { id: 'therapy' as ActiveTab, label: 'Sana', icon: 'psychology' },
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeColor);
  }, [themeColor]);

  const isAudioActive = isRocholaPlaying && !isBreathingActive;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
      <div 
        className="relative min-h-screen w-full overflow-y-auto flex flex-col justify-between items-center p-4 md:p-8 z-0 transition-colors duration-1000 tabular-nums bg-background"
      >
        {/* Background rich fluid mesh gradient using pure CSS animations for performance */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-90">
          
          {/* Blob 1 */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute w-[150vw] h-[120vw] md:w-[80vw] md:h-[60vw] rounded-[100%] will-change-transform" 
              style={{ 
                top: '-10%', left: '-10%', 
                background: `radial-gradient(ellipse at center, var(--theme-primary) 0%, transparent 65%)`,
                animation: 'var(--animate-mesh-1)',
                opacity: 0.15
              }}
            />
          </div>

          {/* Blob 2 */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute w-[120vw] h-[150vw] md:w-[60vw] md:h-[80vw] rounded-[100%] will-change-transform" 
              style={{ 
                bottom: '-10%', right: '-10%', 
                background: `radial-gradient(ellipse at center, var(--theme-secondary) 0%, transparent 65%)`,
                animation: 'var(--animate-mesh-2)',
                opacity: 0.15
              }}
            />
          </div>

          {/* Blob 3 */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute w-[140vw] h-[110vw] md:w-[70vw] md:h-[50vw] rounded-[100%] will-change-transform" 
              style={{ 
                top: '20%', left: '30%', 
                background: `radial-gradient(ellipse at center, var(--theme-tertiary) 0%, transparent 60%)`,
                animation: 'var(--animate-mesh-3)',
                opacity: 0.1
              }}
            />
          </div>
          
          {/* Central Audio Pulse Blob using CSS for 0 JS overhead */}
          <div 
            className="absolute w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full will-change-transform" 
            style={{ 
              top: '50%', left: '50%', 
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, var(--theme-primary) 0%, transparent 60%)`,
              opacity: isAudioActive ? 0.3 : 0.1,
              animation: isAudioActive ? 'var(--animate-zen-breath)' : 'none',
              transition: 'opacity 1s ease-in-out'
            }}
          />
        </div>

        {/* Main Container */}
        <div className="w-full max-w-3xl flex-1 flex flex-col justify-between gap-6 z-10 pb-16">
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
                    {activeTab === 'jukebox' && <RocholaCard />}
                  </div>

                  {/* Oracle */}
                  <div 
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'oracle' 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'oracle' && <OraculoCard />}
                  </div>

                  {/* Test */}
                  <div 
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'test' 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'test' && <TestCard />}
                  </div>

                  {/* Zen (Meditation) */}
                  <div 
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'zen' 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'zen' && <MeditationCard />}
                  </div>

                  {/* Therapy */}
                  <div 
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'therapy' 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'therapy' && <TherapyCard />}
                  </div>
                </div>
              </div>
            </main>
          </div>

          <Footer />
        </div>

        {/* Fixed Bottom Navigation Dock */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-30 select-none">
          <div className="glass-panel py-2 px-3 rounded-full flex justify-around items-center gap-1 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 h-12 min-w-[48px] px-2 sm:px-4 rounded-full transition-all duration-150 ease-out cursor-pointer active-scale ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-on-surface-variant/60 hover:text-on-surface'
                  }`}
                >
                  {isActive && (
                    <m.span 
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/10 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span 
                    className={`material-symbols-outlined text-[20px] sm:text-[24px] relative z-10 transition-transform duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400"
                    }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-center relative z-10">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <PanicButton />

        {/* Global Procedural Audio Engine */}
        <AmbienceEngine />
      </div>
      </MotionConfig>
    </LazyMotion>
  );
};
export default ZenWrapper;
