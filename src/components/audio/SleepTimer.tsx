import React, { useEffect, useState } from 'react';
import { useZenStore } from '../../store/useZenStore';

const OPTIONS = [15, 30, 60];

/** Formatea milisegundos como m:ss. */
const formatLeft = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

/**
 * SleepTimer — Selector de temporizador de sueño.
 *
 * Al elegir una duración, el audio baja de volumen y se pausa solo al cumplirse.
 * El estado vive únicamente en memoria (store sin persistir).
 */
export const SleepTimer: React.FC = () => {
  const sleepTimerEndsAt = useZenStore(s => s.sleepTimerEndsAt);
  const setSleepTimer = useZenStore(s => s.setSleepTimer);
  const [now, setNow] = useState(() => Date.now());

  // Solo corre el reloj de pantalla mientras hay un temporizador activo
  useEffect(() => {
    if (!sleepTimerEndsAt) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0); // evita mostrar una hora vieja en el primer frame
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [sleepTimerEndsAt]);

  return (
    <div className="flex items-center gap-2 w-full bg-black/20 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/5">
      <span className="material-symbols-outlined text-on-surface-variant text-[20px] opacity-70">bedtime</span>
      {sleepTimerEndsAt ? (
        <>
          <span className="font-body text-sm text-on-surface tabular-nums flex-1">
            Se apaga en {formatLeft(sleepTimerEndsAt - now)}
          </span>
          <button
            type="button"
            onClick={() => setSleepTimer(null)}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-body text-xs text-on-surface-variant mr-auto">Apagar en</span>
          {OPTIONS.map(min => (
            <button
              key={min}
              type="button"
              onClick={() => setSleepTimer(min)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors active-scale"
            >
              {min} min
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
