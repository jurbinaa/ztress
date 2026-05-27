/**
 * Header.tsx — Cabecera de la aplicación con selector de tema.
 *
 * Muestra la identidad de marca (logotipo + nombre) a la izquierda y un
 * grupo de botones de selector de tema a la derecha.
 *
 * El cambio de tema es instantáneo en el store, pero la transición visual
 * del fondo tarda 1 segundo (definida en ZenWrapper con `transition-colors
 * duration-1000`) para que el cambio se sienta suave y orgánico.
 *
 * Cada botón de tema muestra un ícono de Material Symbols representativo
 * del ambiente (ola, árbol, cristal, etc.) y recibe estilos activos cuando
 * su `id` coincide con el `themeColor` actual del store.
 */
import React from 'react';
import { useZenStore } from '../../store/useZenStore';
import type { ThemeColor } from '../../store/useZenStore';

/**
 * Configuración estática de los temas disponibles.
 * `id` debe coincidir con las claves del sistema de temas en CSS.
 */
const THEMES: { id: ThemeColor; icon: string; name: string }[] = [
  { id: 'ocean',    icon: 'water_drop',           name: 'Océano' },
  { id: 'forest',   icon: 'park',                 name: 'Bosque' },
  { id: 'amethyst', icon: 'auto_awesome',         name: 'Amatista' },
  { id: 'sunset',   icon: 'routine',              name: 'Ocaso' },
  { id: 'lava',     icon: 'local_fire_department', name: 'Lava' },
];

/**
 * Barra de cabecera con identidad visual y selector de paleta de color.
 */
export const Header: React.FC = () => {
  const { themeColor, setThemeColor } = useZenStore();

  return (
    <header className="w-full flex justify-between items-center z-10 glass-panel px-6 py-4 rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">

      {/* ── Identidad de marca ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Círculo con icono de spa — logotipo de la aplicación */}
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

      {/* ── Selector de tema de color ──────────────────────────────────── */}
      <div className="flex items-center gap-1.5 bg-background/50 p-1.5 rounded-full border border-white/5">
        {THEMES.map((theme) => (
          <button
            type="button"
            key={theme.id}
            onClick={() => setThemeColor(theme.id)}
            className={`size-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              themeColor === theme.id
                // Tema activo: fondo sólido con brillo y escala ligeramente aumentada
                ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.4)] scale-110'
                // Tema inactivo: sin fondo, hover suave
                : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
            title={`Tema ${theme.name}`}
            aria-label={`Cambiar al tema ${theme.name}`}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              // Icono relleno en el tema activo, outline en el resto
              style={{ fontVariationSettings: themeColor === theme.id ? "'FILL' 1" : "'FILL' 0" }}
            >
              {theme.icon}
            </span>
          </button>
        ))}
      </div>
    </header>
  );
};
