import React, { useState } from 'react';
import { MeditationMenu } from './meditation/MeditationMenu';
import { BreathingSession } from './meditation/BreathingSession';
import { GuidedPath } from './path/GuidedPath';
import type { BreathingProtocol } from '../../data/breathingProtocols';
import { AnimatePresence, m } from 'framer-motion';

/**
 * Componente MeditationCard
 * 
 * Actúa como el controlador principal o "cascarón" (shell) del módulo de meditación y respiración.
 * Maneja la transición animada lateral (con AnimatePresence de Framer Motion) entre el
 * menú de selección de protocolos respiratorios (`MeditationMenu`) y la sesión guiada interactiva (`BreathingSession`).
 */
export const MeditationCard: React.FC = () => {
  // Estado local que almacena el protocolo respiratorio en curso. Si es null, muestra el menú.
  const [selectedProtocol, setSelectedProtocol] = useState<BreathingProtocol | null>(null);

  // Si es true, se muestra el camino guiado "Ayúdame ahora" en lugar del menú.
  const [isPathOpen, setIsPathOpen] = useState(false);

  return (
    <div className="h-full w-full relative overflow-hidden min-h-[440px]">
      <AnimatePresence mode="wait">
        {isPathOpen ? (
          /* Vista del camino guiado */
          <m.div
            key="path"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full absolute inset-0"
          >
            <GuidedPath onExit={() => setIsPathOpen(false)} />
          </m.div>
        ) : !selectedProtocol ? (
          /* Vista del menú de protocolos */
          <m.div
            key="menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full absolute inset-0"
          >
            <MeditationMenu onSelect={setSelectedProtocol} onStartPath={() => setIsPathOpen(true)} />
          </m.div>
        ) : (
          /* Vista de la sesión activa de respiración guiada */
          <m.div
            key="session"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full absolute inset-0"
          >
            <BreathingSession protocol={selectedProtocol} onClose={() => setSelectedProtocol(null)} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
