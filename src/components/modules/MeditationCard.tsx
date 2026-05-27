import React, { useState } from 'react';
import { MeditationMenu } from './meditation/MeditationMenu';
import { BreathingSession } from './meditation/BreathingSession';
import type { BreathingProtocol } from '../../data/breathingProtocols';
import { AnimatePresence, m } from 'framer-motion';

export const MeditationCard: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<BreathingProtocol | null>(null);

  return (
    <div className="h-full w-full relative overflow-hidden min-h-[440px]">
      <AnimatePresence mode="wait">
        {!selectedProtocol ? (
          <m.div
            key="menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full absolute inset-0"
          >
            <MeditationMenu onSelect={setSelectedProtocol} />
          </m.div>
        ) : (
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
