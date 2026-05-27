import React from 'react';
import { BREATHING_PROTOCOLS, CATEGORY_CONFIG, DIFFICULTY_CONFIG } from '../../../data/breathingProtocols';
import type { BreathingProtocol } from '../../../data/breathingProtocols';
import { m } from 'framer-motion';

interface MeditationMenuProps {
  /** Callback gatillado cuando el usuario selecciona un protocolo de respiración */
  onSelect: (protocol: BreathingProtocol) => void;
}

/**
 * Componente MeditationMenu
 * 
 * Muestra el menú de selección de prácticas respiratorias científicas.
 * Renderiza tarjetas interactivas para cada uno de los protocolos disponibles,
 * mostrando badges de dificultad, categoría e íconos temáticos.
 * Utiliza Framer Motion para animar la entrada secuencial (staggered) de las tarjetas.
 */
export const MeditationMenu: React.FC<MeditationMenuProps> = ({ onSelect }) => {
  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar p-2 -mx-2">
      {/* Encabezado del menú */}
      <div className="mb-6 px-2">
        <h2 className="font-display text-2xl text-on-surface mb-2">Prácticas de Respiración</h2>
        <p className="font-body text-sm text-on-surface-variant">
          Diferentes ritmos para regular tu sistema nervioso según lo que necesites en este momento.
        </p>
      </div>

      {/* Grid vertical de protocolos de respiración */}
      <div className="flex flex-col gap-3 pb-8">
        {BREATHING_PROTOCOLS.map((protocol, i) => {
          // Extrae configuraciones visuales según categoría y dificultad
          const category = CATEGORY_CONFIG[protocol.category];
          const difficulty = DIFFICULTY_CONFIG[protocol.difficulty];
          
          return (
            <m.button
              key={protocol.id}
              onClick={() => onSelect(protocol)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} // Animación secuencial en cascada (stagger)
              className="w-full text-left p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-center gap-4 group"
            >
              {/* Círculo del ícono decorativo con gradiente */}
              <div className={`size-12 rounded-full flex items-center justify-center bg-gradient-to-br ${protocol.color} shadow-lg shrink-0`}>
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {protocol.icon}
                </span>
              </div>
              
              {/* Información detallada del protocolo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-lg text-on-surface truncate">{protocol.nameShort}</h3>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">timer</span>
                    <span className="text-[10px] text-on-surface-variant font-medium">{protocol.recommendedDuration}m</span>
                  </div>
                </div>
                
                {/* Etiquetas de dificultad y categoría terapéutica */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${difficulty.color}`}>
                    {difficulty.label}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full bg-white/5 ${category.color} font-medium flex items-center gap-1`}>
                    <span className="material-symbols-outlined text-[10px]">{category.icon}</span>
                    {category.label}
                  </span>
                </div>
                
                {/* Breve descripción del beneficio fisiológico */}
                <p className="font-body text-xs text-on-surface-variant/80 line-clamp-1">
                  {protocol.description}
                </p>
              </div>
            </m.button>
          );
        })}
      </div>
    </div>
  );
};
