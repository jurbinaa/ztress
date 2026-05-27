/**
 * AudioContextManager.ts — Singleton del contexto de audio global.
 *
 * Los navegadores modernos bloquean la creación automática de audio
 * hasta que el usuario interactúa con la página (política de autoplay).
 * Este módulo resuelve ese problema de forma elegante:
 *
 *   1. Expone `globalAudioContext` y `globalMasterGain` como referencias
 *      mutables que el resto de sintetizadores pueden importar directamente,
 *      sin pasar el contexto por props o contexto de React.
 *
 *   2. `unlockAudioContext()` debe llamarse SIEMPRE dentro de un handler
 *      de click del usuario (antes de arrancar cualquier síntesis).
 *      Crea el contexto si no existe, y lo reanuda si estaba suspendido.
 *
 *   3. Incluye un doble bypass para el interruptor de silencio físico de
 *      iOS (mute switch), que de otro modo bloquea el Web Audio API aunque
 *      el usuario haya dado permiso explícito.
 */

/**
 * Contexto de audio compartido por toda la aplicación.
 * Es null hasta que el usuario interactúa por primera vez con el audio.
 */
export let globalAudioContext: AudioContext | null = null;

/**
 * Nodo de ganancia maestro — todo el audio se enruta aquí antes de
 * llegar al dispositivo de salida. Controla el volumen global y el mute.
 */
export let globalMasterGain: GainNode | null = null;

/**
 * Inicializa el AudioContext si aún no existe, o lo reanuda si está
 * suspendido. Debe invocarse directamente en un manejador de eventos
 * de usuario (click, touchstart, etc.) para respetar las políticas de
 * autoplay del navegador.
 *
 * También activa dos mecanismos de bypass para iOS:
 *  - `navigator.audioSession.type = 'playback'` le indica al sistema
 *    operativo que este audio debe ignorar el switch de silencio.
 *  - Un elemento `<audio>` con volumen 0 y loop infinito "activa" la
 *    sesión de audio de iOS de forma que el Web Audio API pueda operar.
 */
export const unlockAudioContext = () => {
  if (!globalAudioContext) {
    // Soporte para el prefijo webkit en Safari / iOS antiguo
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioContext = new AudioCtx();

    // El gain maestro conecta todo el grafo de audio con la salida física
    globalMasterGain = globalAudioContext.createGain();
    globalMasterGain.connect(globalAudioContext.destination);

    // ── Bypass del interruptor de silencio de iOS (método 1) ──────────────
    // La API `audioSession` le indica a iOS que trate este audio como
    // "reproducción multimedia", lo que hace que ignore el mute switch.
    if ('audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback';
      } catch (e) {
        console.warn('audioSession API no soportada en este navegador.');
      }
    }

    // ── Bypass del interruptor de silencio de iOS (método 2) ──────────────
    // Un elemento HTML <audio> silencioso en loop "abre" la sesión de audio
    // de iOS. Una vez activa, el Web Audio API puede producir sonido aunque
    // el switch físico esté en mute.
    const silentAudio = new Audio('data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    silentAudio.loop = true;
    silentAudio.volume = 0;
    silentAudio.play().catch(e => console.warn('Audio silencioso bloqueado:', e));
  }

  // Si el contexto fue suspendido por el navegador (ej. pestaña oculta),
  // lo reanudamos. Esto puede ocurrir incluso después de la primera
  // interacción del usuario.
  if (globalAudioContext.state === 'suspended') {
    globalAudioContext.resume().catch(console.error);
  }
};
