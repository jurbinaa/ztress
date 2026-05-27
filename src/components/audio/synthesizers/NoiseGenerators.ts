export const createNoiseBuffer = (
  audioContext: AudioContext,
  type: 'white' | 'pink' | 'brown',
  durationSeconds: number = 2
): AudioBuffer => {
  const bufferSize = audioContext.sampleRate * durationSeconds;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  let lastOut = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;

    if (type === 'white') {
      data[i] = white;
    } else if (type === 'pink') {
      // Paul Kellet's refined method
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else if (type === 'brown') {
      // Running integration
      const brown = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brown;
      data[i] = brown * 3.5; // Gain compensation
    }
  }

  return buffer;
};
