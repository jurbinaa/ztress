/**
 * NatureSynth.ts — Sintetizador procedural de paisajes sonoros naturales.
 *
 * Genera cuatro ambientes de sonido natural usando exclusivamente ruido
 * de color y filtros del Web Audio API. No se descarga ningún archivo de
 * audio: todo se construye en tiempo real en el hilo de audio del navegador.
 *
 * Presets disponibles:
 *
 *  - 'brown' : Ruido marrón puro. Grave y envolvente, como truenos lejanos
 *               o el zumbido de un ventilador de bajo perfil.
 *
 *  - 'wind'  : Viento suave. Ruido marrón pasado por un filtro de banda
 *               estrecha (bandpass) con un LFO que barre la frecuencia
 *               central de forma sinusoidal, imitando las ráfagas irregulares.
 *
 *  - 'ocean' : Olas del océano. Ruido marrón filtrado con paso-bajo y un
 *               LFO muy lento (0.05 Hz = olas cada ~20s) que simultáneamente
 *               mueve el corte del filtro y modula el volumen, replicando
 *               el vaivén sonoro de las olas que suben y bajan.
 *
 *  - 'rain'  : Lluvia. Ruido rosa pasado por un filtro paso-alto (> 1 kHz)
 *               y luego paso-bajo (< 4 kHz), dejando solo el rango de "siseo"
 *               característico de las gotas de lluvia.
 *
 * Todos los presets tienen un fade-in y fade-out suave para evitar clicks.
 */
import { createNoiseBuffer } from './NoiseGenerators';

/** Identificadores de los presets de naturaleza disponibles. */
export type NaturePreset = 'wind' | 'rain' | 'ocean' | 'brown';

/**
 * Crea un sintetizador de sonido natural para el preset especificado.
 *
 * @param audioContext - El AudioContext activo.
 * @param preset       - El tipo de ambiente natural a sintetizar.
 * @returns Un objeto con `node` (salida del grafo), `start()` y `stop()`.
 */
export const createNatureSynth = (
  audioContext: AudioContext,
  preset: NaturePreset
) => {
  // Nodo de salida — empieza en silencio para el fade-in
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Fuente de ruido reutilizable. El buffer de 5s se repite en loop
  // para que el ambiente sea continuo sin cortes perceptibles.
  const source = audioContext.createBufferSource();
  source.loop = true;

  // Algunos presets crean un LFO; los guardamos para pararlos al hacer stop()
  let lfo: OscillatorNode | null = null;
  let lfoGain: GainNode | null = null;

  // Lista de nodos a desconectar al parar (para liberar memoria del grafo)
  const nodesToDisconnect: AudioNode[] = [masterGain, source];

  // ── Preset: Ruido Marrón Puro ─────────────────────────────────────────
  if (preset === 'brown') {
    source.buffer = createNoiseBuffer(audioContext, 'brown', 5);
    // Sin filtros adicionales: el ruido marrón ya es inherentemente grave
    source.connect(masterGain);
  }

  // ── Preset: Viento ────────────────────────────────────────────────────
  else if (preset === 'wind') {
    source.buffer = createNoiseBuffer(audioContext, 'brown', 5);

    // Filtro de banda centrado en 400 Hz con Q alto (resonante)
    // Aisla la "respiración" del viento del resto del espectro
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 400;
    bandpass.Q.value = 3.5;

    // LFO de 0.08 Hz que mueve la frecuencia central del filtro ±300 Hz
    // → ráfagas de viento irregulares que suben y bajan de tono
    lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;

    lfoGain = audioContext.createGain();
    lfoGain.gain.value = 300;

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    source.connect(bandpass);
    bandpass.connect(masterGain);

    nodesToDisconnect.push(bandpass, lfo, lfoGain);
  }

  // ── Preset: Océano ────────────────────────────────────────────────────
  else if (preset === 'ocean') {
    source.buffer = createNoiseBuffer(audioContext, 'brown', 5);

    // Paso-bajo a 400 Hz elimina el "siseo" del ruido y deja solo graves
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;

    // LFO muy lento (0.05 Hz = un ciclo completo cada 20 segundos)
    // imita el ritmo de las olas marinas reales
    lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05;

    lfoGain = audioContext.createGain();
    lfoGain.gain.value = 300; // Barrido: 100 Hz → 700 Hz (simula la "apertura" de la ola)

    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);

    // El mismo LFO también modula el volumen para reforzar la sensación
    // de que las olas se acercan y se alejan
    const volumeLfoGain = audioContext.createGain();
    volumeLfoGain.gain.value = 0.5;
    lfo.connect(volumeLfoGain);
    volumeLfoGain.connect(masterGain.gain);

    source.connect(lowpass);
    lowpass.connect(masterGain);

    nodesToDisconnect.push(lowpass, lfo, lfoGain, volumeLfoGain);
  }

  // ── Preset: Lluvia ────────────────────────────────────────────────────
  else if (preset === 'rain') {
    source.buffer = createNoiseBuffer(audioContext, 'pink', 5);

    // Paso-alto a 1 kHz elimina los graves: nos quedamos con el "siseo"
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1000;

    // Paso-bajo a 4 kHz elimina los agudos extremos: evitamos el "silbido"
    // El rango resultante (1–4 kHz) suena exactamente como lluvia sobre hojas
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 4000;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(masterGain);

    nodesToDisconnect.push(highpass, lowpass);
  }

  return {
    /** Nodo de salida. Conectar a `globalMasterGain` para escuchar audio. */
    node: masterGain,

    /**
     * Arranca el sintetizador de naturaleza con fade-in.
     * El ruido marrón arranca más quieto (0.3) ya que sus graves son intensos;
     * el resto de presets arrancan a 0.6 para tener más presencia.
     */
    start: () => {
      source.start();
      if (lfo) lfo.start();
      // Fade-in de 2 segundos
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(
        preset === 'brown' ? 0.3 : 0.6,
        audioContext.currentTime + 2
      );
    },

    /**
     * Detiene el sintetizador con fade-out de 1 segundo.
     * Los nodos se paran y desconectan 2s después para que el fade
     * haya terminado antes de liberar los recursos.
     */
    stop: () => {
      // Fade-out rápido (1s) para que la pausa se sienta natural
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
      setTimeout(() => {
        try {
          source.stop();
          if (lfo) lfo.stop();
          nodesToDisconnect.forEach(n => n.disconnect());
        } catch (e) {
          // Ignoramos errores si el contexto ya fue cerrado
        }
      }, 2000);
    }
  };
};
