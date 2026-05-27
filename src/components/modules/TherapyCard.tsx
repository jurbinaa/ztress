import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { EmotionDefusionSession } from './therapy/EmotionDefusionSession';
import { MuscleRelaxSession } from './therapy/MuscleRelaxSession';
import { GuidedImagerySession } from './therapy/GuidedImagerySession';
import { GroundingSession } from './therapy/GroundingSession';

/**
 * Representa los módulos de terapia disponibles o la pantalla de menú.
 */
type TherapyModule = 'menu' | 'defusion' | 'pmr' | 'imagery' | 'grounding';

/**
 * Listado estático de los módulos terapéuticos disponibles con sus descripciones, íconos y estilos.
 * Son terapias validadas clínicamente bajo enfoques cognitivos y corporales.
 */
const THERAPY_MODULES = [
  { id: 'defusion', name: 'Defusión Emocional', icon: 'psychology', description: 'Toma distancia de pensamientos y emociones intensas sin escribir, usando la técnica ACT.', color: 'text-indigo-400 bg-indigo-500/10' },
  { id: 'pmr', name: 'Relajación Muscular', icon: 'accessibility_new', description: 'Relajación Muscular Progresiva (PMR). Libera la tensión acumulada en el cuerpo paso a paso.', color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'imagery', name: 'Visualización Guiada', icon: 'landscape', description: 'Viaja a un lugar mental seguro y tranquilo para reducir la activación del sistema nervioso.', color: 'text-sky-400 bg-sky-500/10' },
  { id: 'grounding', name: 'Anclaje 5-4-3-2-1', icon: 'front_hand', description: 'Técnica interactiva rápida para salir de la cabeza y reconectar con el momento presente.', color: 'text-rose-400 bg-rose-500/10' }
];

/**
 * Componente TherapyCard
 * 
 * Este componente actúa como el cascarón/enrutador principal para la sección de "Terapias Clínicas".
 * Permite seleccionar una de las cuatro terapias estructuradas y renderizarla utilizando transiciones
 * horizontales de Framer Motion. Maneja el retorno al menú al completar o detener cualquier sesión.
 */
export const TherapyCard: React.FC = () => {
  // Módulo terapéutico activo actualmente. Por defecto es 'menu'.
  const [activeModule, setActiveModule] = useState<TherapyModule>('menu');

  /**
   * Callback ejecutado al completar con éxito una terapia. Devuelve al usuario al menú principal.
   */
  const handleComplete = () => setActiveModule('menu');

  /**
   * Callback ejecutado al salir voluntariamente de una terapia. Devuelve al usuario al menú principal.
   */
  const handleStop = () => setActiveModule('menu');

  return (
    <div className="h-full w-full relative overflow-y-auto overflow-x-hidden custom-scrollbar min-h-[440px] pb-4">
      <AnimatePresence mode="wait">
        {/* --- Menú de Selección de Terapias --- */}
        {activeModule === 'menu' && (
          <m.div
            key="menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            <div className="mb-6 px-2">
              <h2 className="font-display text-2xl text-on-surface mb-2">Terapias Clínicas</h2>
              <p className="font-body text-sm text-on-surface-variant">
                Herramientas basadas en evidencia para procesar emociones y soltar la tensión.
              </p>
            </div>

            <div className="flex flex-col gap-3 pb-8">
              {THERAPY_MODULES.map((mod, i) => (
                <m.button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id as TherapyModule)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full text-left p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-start gap-4 group active-scale"
                >
                  <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${mod.color}`}>
                    <span className="material-symbols-outlined">{mod.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-on-surface mb-1">{mod.name}</h3>
                    <p className="font-body text-xs text-on-surface-variant/80">
                      {mod.description}
                    </p>
                  </div>
                </m.button>
              ))}
            </div>
          </m.div>
        )}

        {/* --- 1. Sesión de Defusión Emocional ACT --- */}
        {activeModule === 'defusion' && (
          <m.div
            key="defusion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <EmotionDefusionSession onComplete={handleStop} onStop={handleStop} />
          </m.div>
        )}

        {/* --- 2. Sesión de Relajación Muscular Progresiva (PMR) --- */}
        {activeModule === 'pmr' && (
          <m.div
            key="pmr"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <MuscleRelaxSession onComplete={handleComplete} onStop={handleStop} />
          </m.div>
        )}

        {/* --- 3. Sesión de Visualización Guiada --- */}
        {activeModule === 'imagery' && (
          <m.div
            key="imagery"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <GuidedImagerySession onComplete={handleComplete} onStop={handleStop} />
          </m.div>
        )}

        {/* --- 4. Sesión de Anclaje Sensorial (Grounding 5-4-3-2-1) --- */}
        {activeModule === 'grounding' && (
          <m.div
            key="grounding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full"
          >
            <GroundingSession onComplete={handleStop} onStop={handleStop} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
