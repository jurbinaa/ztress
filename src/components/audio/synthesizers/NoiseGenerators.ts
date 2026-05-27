/**
 * NoiseGenerators.ts — Generador procedural de ruido de colores.
 *
 * El ruido de color es la materia prima de todos los ambientes sonoros de
 * Ztress. En lugar de cargar archivos de audio (que pesan megabytes y
 * requieren peticiones de red), generamos el ruido directamente en memoria
 * usando matemáticas puras, garantizando privacidad total y carga instantánea.
 *
 * Tipos de ruido disponibles:
 *
 *  - WHITE (blanco): energía igual en todas las frecuencias. Suena a "estática"
 *    de televisión. Base neutra para otros procesamientos.
 *
 *  - PINK (rosa): la energía decrece con la frecuencia (3 dB/octava).
 *    Es el ruido que más se parece a la naturaleza: lluvia, cascadas, brisa.
 *    Generado con el método refinado de Paul Kellet (7 filtros de paso bajo).
 *
 *  - BROWN (marrón / ruido browniano): la energía decrece aún más rápido
 *    (6 dB/octava). Suena profundo y grave, como olas del océano o truenos
 *    lejanos. Se genera por integración acumulativa del ruido blanco.
 */

/**
 * Genera un AudioBuffer lleno de ruido del color especificado.
 *
 * El buffer tiene un solo canal (mono) y se diseña para reproducirse en
 * loop. Una duración de 5 segundos es suficiente para que el ciclo de
 * loop no sea perceptible al oído humano.
 *
 * @param audioContext - El AudioContext activo donde se creará el buffer.
 * @param type         - Tipo de ruido: 'white', 'pink' o 'brown'.
 * @param durationSeconds - Duración del buffer en segundos (por defecto: 2s).
 * @returns Un AudioBuffer listo para conectar a un BufferSourceNode.
 */
export const createNoiseBuffer = (
  audioContext: AudioContext,
  type: 'white' | 'pink' | 'brown',
  durationSeconds: number = 2
): AudioBuffer => {
  const bufferSize = audioContext.sampleRate * durationSeconds;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  // Variables del filtro IIR para el ruido rosa (método de Paul Kellet)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  // Valor previo para la integración del ruido marrón
  let lastOut = 0;

  for (let i = 0; i < bufferSize; i++) {
    // Base: ruido blanco en el rango [-1, 1]
    const white = Math.random() * 2 - 1;

    if (type === 'white') {
      // El ruido blanco no necesita procesado adicional
      data[i] = white;

    } else if (type === 'pink') {
      // ── Ruido Rosa (Paul Kellet's refined algorithm) ────────────────────
      // Se aplica una cadena de 7 filtros de paso bajo con diferentes
      // frecuencias de corte. La combinación resultante aproxima la curva
      // de densidad espectral 1/f característica del ruido rosa.
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;

    } else if (type === 'brown') {
      // ── Ruido Marrón (integración acumulativa) ──────────────────────────
      // Sumamos cada muestra de ruido blanco al valor anterior con un
      // pequeño coeficiente, creando una trayectoria tipo "paseo aleatorio"
      // de baja frecuencia (brownian motion). El factor 1.02 normaliza la
      // ganancia para evitar saturación. El *3.5 final compensa la ganancia
      // perdida al dividir.
      const brown = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brown;
      data[i] = brown * 3.5;
    }
  }

  return buffer;
};
