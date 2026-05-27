import React from 'react';
import { useZenStore } from '../../store/useZenStore';
import type { ThemeColor } from '../../store/useZenStore';

const THEMES: { id: ThemeColor; icon: string; name: string }[] = [
  { id: 'ocean', icon: 'water_drop', name: 'Océano' },
  { id: 'forest', icon: 'park', name: 'Bosque' },
  { id: 'amethyst', icon: 'auto_awesome', name: 'Amatista' },
  { id: 'sunset', icon: 'routine', name: 'Ocaso' },
  { id: 'lava', icon: 'local_fire_department', name: 'Lava' },
];

export const Header: React.FC = () => {
  const { themeColor, setThemeColor } = useZenStore();

  return (
    <header className="w-full flex justify-between items-center z-10 glass-panel px-6 py-4 rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.3)]">
          <span className="material-symbols-outlined text-on-primary text-[24px]">
            spa
          </span>
        </div>
        <div>
          <h1 className="font-display text-xl tracking-wide font-medium text-on-surface">Ztress</h1>
          <p className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-semibold">Santuario Mental</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 bg-background/50 p-1.5 rounded-full border border-white/5">
        {THEMES.map((theme) => (
          <button
            type="button"
            key={theme.id}
            onClick={() => setThemeColor(theme.id)}
            className={`size-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              themeColor === theme.id 
                ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.4)] scale-110' 
                : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
            title={`Tema ${theme.name}`}
            aria-label={`Cambiar al tema ${theme.name}`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: themeColor === theme.id ? "'FILL' 1" : "'FILL' 0" }}>
              {theme.icon}
            </span>
          </button>
        ))}
      </div>
    </header>
  );
};
