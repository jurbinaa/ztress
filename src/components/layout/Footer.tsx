import React from 'react';

/**
 * Componente Footer (Pie de página)
 * 
 * Este componente proporciona un cierre visual y emocional para la aplicación.
 * Incluye un indicador de privacidad ("Refugio Privado"), un mensaje tranquilizador
 * sobre la seguridad de los datos (ya que todo se procesa de forma local en el navegador),
 * y los créditos correspondientes a Ulaloud y la firma A.T.S.
 */
export const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col items-center gap-4 mt-8 pt-6 border-t border-white/10 select-none pb-24 md:pb-8">
      {/* Insignia de Privacidad (Refugio Privado) */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
        <span className="material-symbols-outlined text-[16px] text-primary">gpp_good</span>
        <span className="font-body text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
          Refugio Privado
        </span>
      </div>
      
      {/* Mensaje de calma y privacidad de datos */}
      <p className="font-body text-xs text-on-surface-variant/60 text-center max-w-[420px] leading-relaxed px-4">
        Tu espacio seguro y personal. Aquí no hay rastros ni memoria, tu paz y tus datos se quedan contigo. Solo respira.
      </p>
      
      {/* Créditos y firma del proyecto */}
      <div className="flex flex-col items-center gap-0.5 mt-1">
        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant/30 font-body">
          <span>powered by</span>
          <button 
            type="button"
            className="font-medium text-on-surface-variant/50 hover:text-primary transition-all duration-300 flex items-center gap-0.5 group relative"
          >
            <span className="relative z-10">Ulaloud</span>
            <span className="material-symbols-outlined text-[10px] opacity-0 -translate-y-[1px] group-hover:opacity-100 group-hover:translate-x-[2px] transition-all duration-300">
              north_east
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
          </button>
        </div>
        {/* Firma/Iniciales de dedicación */}
        <span className="text-[10px] italic text-on-surface-variant/25 font-body tracking-wider">
          A.T.S
        </span>
      </div>
    </footer>
  );
};
