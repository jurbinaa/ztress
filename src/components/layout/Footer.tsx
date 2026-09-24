import React from 'react';

/**
 * Componente Footer (Pie de página)
 * 
 * Este componente proporciona un cierre visual y emocional para la aplicación.
 * Incluye un indicador de privacidad ("Refugio Privado"), un mensaje tranquilizador
 * sobre la seguridad de los datos (ya que todo se procesa de forma local en el navegador).
 */
export const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col items-center gap-4 mt-8 pt-6 border-t border-white/10 select-none pb-24 md:pb-8 organic-text">
      {/* Insignia de Privacidad (Refugio Privado) */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 organic-rounded px-4 py-1.5 organic-transition">
        <span className="material-symbols-outlined text-[16px] text-primary">gpp_good</span>
        <span className="font-body text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider organic-text">
          Refugio Privado
        </span>
      </div>
      
      {/* Mensaje de calma y privacidad de datos */}
      <p className="font-body text-xs text-on-surface-variant/60 text-center max-w-[420px] leading-relaxed px-4 organic-text">
        Tu espacio seguro y personal. Aquí no hay rastros ni memoria, tu paz y tus datos se quedan contigo. Solo respira.
      </p>
      
      
    </footer>
  );
};
