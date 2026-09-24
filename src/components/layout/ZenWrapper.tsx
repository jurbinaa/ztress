/**
 * ZenWrapper.tsx — Componente de layout principal de la aplicación.
 *
 * Es el "contenedor" que orquesta toda la experiencia visual y de navegación
 * de Ztress. Se encarga de:
 *
 *  1. TEMA VISUAL: aplica el color temático activo como atributo `data-theme`
 *     en el elemento `<html>`, lo que activa las custom properties de CSS
 *     correspondientes (--theme-primary, --theme-secondary, etc.).
 *
 *  2. FONDO ANIMADO: tres "blobs" con gradientes radiales animados con CSS
 *     puro crean el efecto de malla fluida de fondo. Usar CSS animations en
 *     lugar de JavaScript (requestAnimationFrame) elimina la carga en el hilo
 *     principal y permite que las animaciones corran en el compositor del
 *     navegador de forma nativa.
 *
 *  3. PANEL PRINCIPAL: un contenedor glassmorphism que alberga el módulo activo.
 *     Los módulos se muestran/ocultan con clases de CSS (opacity + translate)
 *     y se montan en el DOM solo cuando están activos (`activeTab === 'x' &&`)
 *     para ahorrar memoria en sesiones largas.
 *
 *  4. BARRA DE NAVEGACIÓN: un dock flotante fijo en la parte inferior con los
 *     cinco módulos. Framer Motion anima el indicador de pestaña activa con
 *     `layoutId` para conseguir la transición fluida entre pestañas.
 *
 *  5. BOTÓN DE PÁNICO y MOTOR DE AUDIO: se montan siempre, independientemente
 *     de la pestaña activa, para que estén disponibles en cualquier momento.
 */
import React, { useEffect, lazy, Suspense } from 'react';
import { useZenStore, type ActiveTab, useShallow } from '../../store/useZenStore';
import { Header } from './Header';
import { Footer } from './Footer';
import { PanicButton } from '../modules/PanicButton';
import { LazyMotion, domAnimation, m, MotionConfig } from 'framer-motion';
import { AmbienceEngine } from '../audio/AmbienceEngine';

// Lazy load heavy modules to reduce initial bundle size
// All modules use named exports, so we need to wrap them for React.lazy
const RocholaCard = lazy(() => import('../modules/RocholaCard').then(m => ({ default: m.RocholaCard })));
const OraculoCard = lazy(() => import('../modules/OraculoCard').then(m => ({ default: m.OraculoCard })));
const TestCard = lazy(() => import('../modules/TestCard').then(m => ({ default: m.TestCard })));
const MeditationCard = lazy(() => import('../modules/MeditationCard').then(m => ({ default: m.MeditationCard })));
const TherapyCard = lazy(() => import('../modules/TherapyCard').then(m => ({ default: m.TherapyCard })));

/**
 * Layout raíz de la aplicación. Gestiona el tema, el fondo animado,
 * la navegación por pestañas y los componentes globales siempre presentes.
 */
export const ZenWrapper: React.FC = () => {
  const { activeTab, setActiveTab, themeColor, isRocholaPlaying, isBreathingActive } = useZenStore(
    useShallow(state => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
      themeColor: state.themeColor,
      isRocholaPlaying: state.isRocholaPlaying,
      isBreathingActive: state.isBreathingActive,
    }))
  );

  /** Configuración de las pestañas de la barra de navegación inferior. */
  const navigationItems = [
    { id: 'jukebox' as ActiveTab, label: 'Audio',    icon: 'music_note' },
    { id: 'oracle'  as ActiveTab, label: 'Mensajes', icon: 'auto_awesome' },
    { id: 'test'    as ActiveTab, label: 'Evalúa',   icon: 'assignment' },
    { id: 'zen'     as ActiveTab, label: 'Práctica', icon: 'self_improvement' },
    { id: 'therapy' as ActiveTab, label: 'Sana',     icon: 'psychology' },
  ];

  // Aplica el tema de color al elemento raíz del DOM para que las CSS custom
  // properties sean accesibles desde cualquier parte del árbol de estilos
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeColor);
  }, [themeColor]);

  // El blob central de audio solo pulsa cuando hay música reproduciéndose
  // y el usuario NO está en una sesión de respiración
  const isAudioActive = isRocholaPlaying && !isBreathingActive;

  // Fallback de carga ligero para módulos lazy
  const ModuleFallback = () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-4 text-on-surface-variant">
        <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm font-medium">Cargando...</span>
      </div>
    </div>
  );

  return (
    <LazyMotion features={domAnimation}>
      {/* reducedMotion="user" respeta la preferencia de accesibilidad del SO */}
      <MotionConfig reducedMotion="user">
      <div
        className="relative min-h-screen w-full overflow-y-auto flex flex-col justify-between items-center p-4 md:p-8 z-0 transition-colors duration-1000 tabular-nums bg-background"
      >

        {/* ── Fondo: malla de gradientes animados con CSS puro ────────────────
            Usamos `mix-blend-screen` para que los blobs se mezclen entre sí
            de forma aditiva, creando variaciones de color ricas sin JS.
            `pointer-events-none` evita que intercepten clicks del usuario.
            `will-change-transform` mueve las animaciones al compositor GPU.
            Los blobs tienen border-radius orgánicos para sensación natural.  */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-90">

          {/* Blob 1 — esquina superior izquierda, color primario del tema */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute w-[150vw] h-[120vw] md:w-[80vw] md:h-[60vw] organic-rounded-2xl will-change-transform"
              style={{
                top: '-10%', left: '-10%',
                background: `radial-gradient(ellipse at center, var(--theme-primary) 0%, transparent 65%)`,
                animation: 'var(--animate-mesh-1)',
                opacity: 0.15
              }}
            />
          </div>

          {/* Blob 2 — esquina inferior derecha, color secundario del tema */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute w-[120vw] h-[150vw] md:w-[60vw] md:h-[80vw] organic-rounded-2xl will-change-transform"
              style={{
                bottom: '-10%', right: '-10%',
                background: `radial-gradient(ellipse at center, var(--theme-secondary) 0%, transparent 65%)`,
                animation: 'var(--animate-mesh-2)',
                opacity: 0.15
              }}
            />
          </div>

          {/* Blob 3 — centro-derecha, color terciario del tema */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute w-[140vw] h-[110vw] md:w-[70vw] md:h-[50vw] organic-rounded-2xl will-change-transform"
              style={{
                top: '20%', left: '30%',
                background: `radial-gradient(ellipse at center, var(--theme-tertiary) 0%, transparent 60%)`,
                animation: 'var(--animate-mesh-3)',
                opacity: 0.1
              }}
            />
          </div>

          {/* Blob central de pulso de audio — se activa solo cuando hay música */}
          <div
            className="absolute w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] organic-rounded will-change-transform"
            style={{
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, var(--theme-primary) 0%, transparent 60%)`,
              opacity: isAudioActive ? 0.3 : 0.1,
              // La animación de respiración solo corre cuando el audio está activo
              animation: isAudioActive ? 'var(--animate-zen-breath)' : 'none',
              transition: 'opacity 1s ease-in-out'
            }}
          />
        </div>

        {/* ── Contenedor principal ─────────────────────────────────────────── */}
        <div className="w-full max-w-3xl flex-1 flex flex-col justify-between gap-6 z-10 pb-16">
          <div className="flex flex-col gap-6 w-full">
            <Header />

            {/* Panel glassmorphism que contiene el módulo activo */}
            <main className="w-full flex-1 flex items-center justify-center">
              <div className="w-full glass-panel rounded-3xl p-6 md:p-8 min-h-[440px] flex items-center justify-center relative overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                {/* Luz ambiente interior del panel */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none" />
                <div className="w-full z-10 relative">

                  {/* ── Módulo: Jukebox (Rocholá) ─────────────────────────────
                      Se monta en el DOM solo cuando está activo para no cargar
                      el canvas del visualizador cuando no es necesario. */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'jukebox'
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'jukebox' && (
                      <Suspense fallback={<ModuleFallback />}>
                        <RocholaCard />
                      </Suspense>
                    )}
                  </div>

                  {/* ── Módulo: Oráculo (frases y proverbios) ───────────────── */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'oracle'
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'oracle' && (
                      <Suspense fallback={<ModuleFallback />}>
                        <OraculoCard />
                      </Suspense>
                    )}
                  </div>

                  {/* ── Módulo: Test psicológico ─────────────────────────────── */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'test'
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'test' && (
                      <Suspense fallback={<ModuleFallback />}>
                        <TestCard />
                      </Suspense>
                    )}
                  </div>

                  {/* ── Módulo: Práctica de meditación / respiración ─────────── */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'zen'
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'zen' && (
                      <Suspense fallback={<ModuleFallback />}>
                        <MeditationCard />
                      </Suspense>
                    )}
                  </div>

                  {/* ── Módulo: Terapias clínicas ────────────────────────────── */}
                  <div
                    className={`w-full transition-all duration-500 ease-out ${
                      activeTab === 'therapy'
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'absolute top-0 left-0 opacity-0 translate-y-4 pointer-events-none overflow-hidden h-0 w-0'
                    }`}
                  >
                    {activeTab === 'therapy' && (
                      <Suspense fallback={<ModuleFallback />}>
                        <TherapyCard />
                      </Suspense>
                    )}
                  </div>

                </div>
              </div>
            </main>
          </div>

          <Footer />
        </div>

        {/* ── Barra de navegación flotante ─────────────────────────────────
            Fija en la parte inferior con `layoutId` en el indicador activo
            para que Framer Motion interpole su posición entre pestañas. */}
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
                  {/* Indicador de pestaña activa con animación compartida por layoutId */}
                  {isActive && (
                    <m.span
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/10 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {/* Icono del módulo */}
                  <span
                    className={`material-symbols-outlined text-[20px] sm:text-[24px] relative z-10 transition-transform duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}
                    style={{
                      // Icono relleno cuando está activo, outline cuando no
                      fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400"
                    }}
                  >
                    {item.icon}
                  </span>
                  {/* Etiqueta de texto bajo el icono */}
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-center relative z-10">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Botón de emergencia anti-pánico — siempre visible */}
        <PanicButton />

        {/* Motor de audio procedural — headless, sin representación visual */}
        <AmbienceEngine />
      </div>
      </MotionConfig>
    </LazyMotion>
  );
};

export default ZenWrapper;
