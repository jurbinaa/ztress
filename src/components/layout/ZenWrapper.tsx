import React from 'react';
import { useZenStore, type ActiveTab } from '../../store/useZenStore';
import { Header } from './Header';
import { Footer } from './Footer';
import { RocholaCard } from '../modules/RocholaCard';
import { OraculoCard } from '../modules/OraculoCard';
import { TestCard } from '../modules/TestCard';
import { MeditationCard } from '../modules/MeditationCard';

export const ZenWrapper: React.FC = () => {
  const { activeTab, setActiveTab } = useZenStore();

  const navigationItems = [
    { id: 'jukebox' as ActiveTab, label: 'Rochola', icon: 'music_note' },
    { id: 'oracle' as ActiveTab, label: 'Oráculo', icon: 'auto_awesome' },
    { id: 'test' as ActiveTab, label: 'Tests', icon: 'assignment' },
    { id: 'zen' as ActiveTab, label: 'Zen', icon: 'self_improvement' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-background flex flex-col justify-between items-center p-4 md:p-8 z-0">
      {/* Background soft glowing blur blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(183,200,222,0.08)_0%,transparent_70%)] blur-[80px] animate-pulse" 
          style={{ animationDuration: '12s' }} 
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,rgba(200,196,219,0.08)_0%,transparent_70%)] blur-[80px] animate-pulse" 
          style={{ animationDuration: '16s' }} 
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-between gap-6 z-10 pb-16">
        <div className="flex flex-col gap-6 w-full">
          <Header />
          
          <main className="w-full flex-1 flex items-center justify-center">
            <div className="w-full glass-panel rounded-3xl p-6 md:p-8 min-h-[440px] flex items-center justify-center relative overflow-hidden border border-white/5">
              {/* Ambient inner light */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_100%)] pointer-events-none" />
              <div className="w-full z-10 relative">
                {/* Jukebox (Rochola) */}
                <div 
                  className={`w-full transition-opacity duration-300 ${
                    activeTab === 'jukebox' 
                      ? 'opacity-100 pointer-events-auto' 
                      : 'absolute top-0 left-0 opacity-0 pointer-events-none overflow-hidden h-0 w-0'
                  }`}
                >
                  <RocholaCard />
                </div>

                {/* Oracle */}
                <div 
                  className={`w-full transition-opacity duration-300 ${
                    activeTab === 'oracle' 
                      ? 'opacity-100 pointer-events-auto' 
                      : 'absolute top-0 left-0 opacity-0 pointer-events-none overflow-hidden h-0 w-0'
                  }`}
                >
                  <OraculoCard />
                </div>

                {/* Test */}
                <div 
                  className={`w-full transition-opacity duration-300 ${
                    activeTab === 'test' 
                      ? 'opacity-100 pointer-events-auto' 
                      : 'absolute top-0 left-0 opacity-0 pointer-events-none overflow-hidden h-0 w-0'
                  }`}
                >
                  <TestCard />
                </div>

                {/* Zen (Meditation) */}
                <div 
                  className={`w-full transition-opacity duration-300 ${
                    activeTab === 'zen' 
                      ? 'opacity-100 pointer-events-auto' 
                      : 'absolute top-0 left-0 opacity-0 pointer-events-none overflow-hidden h-0 w-0'
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
        <div className="glass-panel py-2 px-3 rounded-full flex justify-around items-center gap-1 border border-white/10 shadow-2xl">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-full transition-all duration-300 active-scale cursor-pointer ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-on-surface-variant/60 hover:text-on-surface'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-white/5 rounded-full border border-white/5 pointer-events-none" />
                )}
                <span 
                  className={`material-symbols-outlined text-[22px] transition-transform duration-500 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400"
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[9px] font-semibold tracking-wider uppercase text-center">
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
