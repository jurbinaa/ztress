/**
 * BinauralSynth.ts — Sintetizador binaural procedural multicapa.
 *
 * Crea un paisaje sonoro completo para la meditación profunda combinando
 * cuatro capas distintas de audio, todas generadas en tiempo real sin
 * archivos de red:
 *
 *  1. TONOS BINAURALES: dos osciladores de onda sinusoidal pura separados
 *     por `beatFreq` Hz. Al enrutarse por canales separados (L/R) y
 *     combinarse en el cerebro, producen una "pulsación" ilusoria a la
 *     frecuencia de la diferencia (ej. 432 Hz en L y 440 Hz en R = 8 Hz
 *     percibidos internamente → ondas Alpha). Un LFO de 0.05 Hz modula
 *     su volumen para que suenen como olas en lugar de un tono continuo.
 *
 *  2. DRONE ARMÓNICO: tres osciladores de onda triangular afinados a la
 *     octava inferior, doble octava inferior y quinta del fundamental.
 *     Pasan por un filtro paso-bajo muy cálido (300 Hz) modulado por un
 *     LFO lento que crea un efecto de "respiración" del instrumento.
 *
 *  3. RUIDO ROSA: una capa de ruido rosa filtrado aporta la textura de
 *     "presencia" que hace que el sonido se sienta tridimensional.
 *
 *  4. MELODÍA GENERATIVA: un secuenciador algorítmico selecciona notas
 *     al azar de la escala pentatónica mayor y las toca con envolventes
 *     suaves (ataque rápido, decay largo). Un nodo de delay con feedback
 *     alto añade colas etéreas que se mezclan entre sí.
 *
 * Todas las capas se mezclan en un GainNode maestro con fade-in/out de
 * 2-3 segundos para evitar clicks audibles al arrancar o parar el audio.
 *
 * @param audioContext - El AudioContext activo del sistema.
 * @param baseFreq     - Frecuencia fundamental en Hz (ej. 432 para tonos alpha).
 * @param beatFreq     - Diferencia en Hz entre el tono izquierdo y el derecho,
 *                       que determina la frecuencia binaural resultante.
 * @returns Un objeto con `node` (para conectar al grafo), `start()` y `stop()`.
 */
import { createNoiseBuffer } from './NoiseGenerators';

export const createBinauralSynth = (
  audioContext: AudioContext,
  baseFreq: number,
  beatFreq: number
) => {
  // Nodo maestro que agrupa todo el grafo. Empieza en 0 para el fade-in.
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. TONOS BINAURALES (pulsantes, no continuos)
  // ─────────────────────────────────────────────────────────────────────────

  const tonesGain = audioContext.createGain();
  tonesGain.gain.value = 0.03; // Volumen base del grupo de tonos

  // LFO de 0.05 Hz (ciclo de 20 segundos) que modula el volumen de los tonos
  // creando una sensación de oleaje suave en lugar de un pitido constante
  const tonesLfo = audioContext.createOscillator();
  tonesLfo.type = 'sine';
  tonesLfo.frequency.value = 0.05;

  // El LFO oscila ±0.03 alrededor del valor base 0.03,
  // resultando en un rango de ganancia de [0.0 → 0.06]
  const tonesLfoGain = audioContext.createGain();
  tonesLfoGain.gain.value = 0.03;
  tonesLfo.connect(tonesLfoGain);
  tonesLfoGain.connect(tonesGain.gain);

  // Mezclador estéreo que separa los dos osciladores en L y R
  const merger = audioContext.createChannelMerger(2);
  const oscLeft = audioContext.createOscillator();
  const oscRight = audioContext.createOscillator();

  oscLeft.type = 'sine';
  oscRight.type = 'sine';
  oscLeft.frequency.value = baseFreq;
  oscRight.frequency.value = baseFreq + beatFreq; // Diferencia = frecuencia binaural

  oscLeft.connect(merger, 0, 0);  // Canal izquierdo
  oscRight.connect(merger, 0, 1); // Canal derecho
  merger.connect(tonesGain);
  tonesGain.connect(masterGain);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. DRONE ARMÓNICO (tres osciladores triangulares con filtro respirante)
  // ─────────────────────────────────────────────────────────────────────────

  const droneGain = audioContext.createGain();
  droneGain.gain.value = 0.1;

  // Filtro paso-bajo muy cerrado: solo pasan las frecuencias más cálidas y graves
  const droneFilter = audioContext.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 300;

  // LFO de 0.06 Hz que mueve el punto de corte del filtro → efecto "respiración"
  const filterLfo = audioContext.createOscillator();
  filterLfo.type = 'sine';
  filterLfo.frequency.value = 0.06;
  const filterLfoGain = audioContext.createGain();
  filterLfoGain.gain.value = 150; // Barrido de ±150 Hz alrededor de 300 Hz
  filterLfo.connect(filterLfoGain);
  filterLfoGain.connect(droneFilter.frequency);

  // LFO de 0.04 Hz para el volumen del drone → efecto "swell" de cuerda
  const droneVolLfo = audioContext.createOscillator();
  droneVolLfo.type = 'sine';
  droneVolLfo.frequency.value = 0.04;
  const droneVolLfoGain = audioContext.createGain();
  droneVolLfoGain.gain.value = 0.08;
  droneVolLfo.connect(droneVolLfoGain);
  droneVolLfoGain.connect(droneGain.gain);

  // Los tres osciladores del drone: octava baja, doble octava baja y quinta
  const droneOsc1 = audioContext.createOscillator();
  droneOsc1.type = 'triangle';
  droneOsc1.frequency.value = baseFreq / 2;   // Una octava por debajo

  const droneOsc2 = audioContext.createOscillator();
  droneOsc2.type = 'triangle';
  droneOsc2.frequency.value = baseFreq / 4;   // Dos octavas por debajo

  const droneOsc3 = audioContext.createOscillator();
  droneOsc3.type = 'triangle';
  droneOsc3.frequency.value = baseFreq * 1.5; // Quinta justa por encima (armónico 3)

  droneOsc1.connect(droneFilter);
  droneOsc2.connect(droneFilter);
  droneOsc3.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(masterGain);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. RUIDO ROSA FILTRADO (textura de "presencia")
  // ─────────────────────────────────────────────────────────────────────────

  const carrierSource = audioContext.createBufferSource();
  carrierSource.buffer = createNoiseBuffer(audioContext, 'pink', 5);
  carrierSource.loop = true;

  // Filtramos el ruido rosa para dejar solo las frecuencias más cálidas
  const carrierFilter = audioContext.createBiquadFilter();
  carrierFilter.type = 'lowpass';
  carrierFilter.frequency.value = 500;

  const carrierGain = audioContext.createGain();
  carrierGain.gain.value = 0.3;

  carrierSource.connect(carrierFilter);
  carrierFilter.connect(carrierGain);
  carrierGain.connect(masterGain);

  // ─────────────────────────────────────────────────────────────────────────
  // 4. MELODÍA GENERATIVA (pentatónica mayor con delay etéreo)
  // ─────────────────────────────────────────────────────────────────────────

  const melodyGain = audioContext.createGain();
  melodyGain.gain.value = 0.45;

  // Nodo de delay con feedback alto para crear colas que se superponen
  // suavemente, dando la sensación de espacio infinito
  const delayNode = audioContext.createDelay();
  delayNode.delayTime.value = 0.75; // 750 ms de delay

  const feedbackGain = audioContext.createGain();
  feedbackGain.gain.value = 0.5; // 50% de feedback → colas largas y etéreas

  // Grafo del delay: delay → feedback → delay (loop de retroalimentación)
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);

  melodyGain.connect(delayNode);
  melodyGain.connect(masterGain);
  delayNode.connect(masterGain);

  let isPlaying = false;
  let melodyTimeoutId: any;

  // Multiplicadores de frecuencia de la escala pentatónica mayor
  // Cada valor es una relación de frecuencia relativa al fundamental (baseFreq)
  const pentatonicScale = [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2];

  /**
   * Toca una nota individual usando un oscilador de corta vida.
   * La nota tiene un ataque muy rápido (100ms) y un decay largo (5s) para
   * imitar el comportamiento de un piano o campana de cuenco.
   *
   * @param multiplier - Ratio de frecuencia de la escala pentatónica.
   * @param octave     - Desplazamiento de octava (0.5 = una octava abajo, 2 = arriba).
   * @param delaySecs  - Cuántos segundos esperar antes de iniciar la nota.
   */
  const playNote = (multiplier: number, octave: number, delaySecs: number) => {
    const noteFreq = baseFreq * multiplier * octave;
    const noteOsc = audioContext.createOscillator();
    noteOsc.type = 'sine';
    noteOsc.frequency.value = noteFreq;

    // Envolvente ADSR simplificada: ataque + decay (sin sustain ni release)
    const noteEnv = audioContext.createGain();
    noteEnv.gain.value = 0;

    noteOsc.connect(noteEnv);
    noteEnv.connect(melodyGain);

    const now = audioContext.currentTime + delaySecs;

    noteEnv.gain.setValueAtTime(0, now);
    noteEnv.gain.linearRampToValueAtTime(0.25, now + 0.1);     // Ataque: 100ms
    noteEnv.gain.exponentialRampToValueAtTime(0.001, now + 5); // Decay: 5s

    noteOsc.start(now);
    noteOsc.stop(now + 5); // El oscilador se autodescarta al terminar
  };

  /**
   * Programa una secuencia aleatoria de 1 a 4 notas y luego se vuelve a
   * llamar a sí misma con un intervalo aleatorio de 2 a 5 segundos.
   * Este bucle de recursión asíncrona es lo que hace que la melodía sea
   * siempre distinta y nunca se repita.
   */
  const playNextMelodySequence = () => {
    if (!isPlaying) return;

    const numNotes = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < numNotes; i++) {
      const multiplier = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];

      // El 70% de las notas están en la octava normal; el resto, en octava
      // baja (30% de prob.) o alta (20% de prob.) para añadir profundidad
      const octave = Math.random() > 0.7 ? 0.5 : (Math.random() > 0.8 ? 2 : 1);

      // Acorde (todas a la vez) o arpegio (escalonadas 0.2-0.5s entre sí)
      const isChord = Math.random() > 0.5;
      const delaySecs = isChord ? 0 : (i * (0.2 + Math.random() * 0.3));

      playNote(multiplier, octave, delaySecs);
    }

    // Programamos la próxima secuencia entre 2 y 5 segundos más tarde
    const nextIntervalMs = 2000 + Math.random() * 3000;
    melodyTimeoutId = setTimeout(playNextMelodySequence, nextIntervalMs);
  };

  return {
    /** Nodo de salida. Conectar a `globalMasterGain` para escuchar audio. */
    node: masterGain,

    /**
     * Arranca todos los osciladores y el secuenciador generativo.
     * El fade-in de 3 segundos evita el click de inicio abrupto.
     */
    start: () => {
      isPlaying = true;
      oscLeft.start();
      oscRight.start();
      tonesLfo.start();
      droneOsc1.start();
      droneOsc2.start();
      droneOsc3.start();
      filterLfo.start();
      droneVolLfo.start();
      carrierSource.start();

      // La melodía empieza 1.5s después para que el drone ya esté audible
      setTimeout(playNextMelodySequence, 1500);

      // Fade-in suave desde silencio total hasta 0.5 de ganancia en 3s
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 3);
    },

    /**
     * Detiene toda la síntesis con un fade-out de 2 segundos.
     * Los osciladores se paran y desconectan 2.5s después para garantizar
     * que el fade haya terminado antes de liberar los recursos.
     */
    stop: () => {
      isPlaying = false;
      clearTimeout(melodyTimeoutId);

      // Fade-out suave para evitar el click de parada abrupta
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);

      setTimeout(() => {
        try {
          oscLeft.stop();
          oscRight.stop();
          tonesLfo.stop();
          droneOsc1.stop();
          droneOsc2.stop();
          droneOsc3.stop();
          filterLfo.stop();
          droneVolLfo.stop();
          carrierSource.stop();

          // Desconectamos los nodos para liberar memoria del grafo de audio
          oscLeft.disconnect();
          oscRight.disconnect();
          carrierSource.disconnect();
          merger.disconnect();
          droneFilter.disconnect();
          delayNode.disconnect();
        } catch (e) {
          // Ignoramos errores si algún nodo ya fue parado por el navegador
        }
      }, 2500);
    }
  };
};
