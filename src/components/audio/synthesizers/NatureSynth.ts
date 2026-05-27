import { createNoiseBuffer } from './NoiseGenerators';

export type NaturePreset = 'wind' | 'rain' | 'ocean' | 'brown';

export const createNatureSynth = (
  audioContext: AudioContext,
  preset: NaturePreset
) => {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  const source = audioContext.createBufferSource();
  source.loop = true;

  let lfo: OscillatorNode | null = null;
  let lfoGain: GainNode | null = null;
  const nodesToDisconnect: AudioNode[] = [masterGain, source];

  if (preset === 'brown') {
    source.buffer = createNoiseBuffer(audioContext, 'brown', 5);
    source.connect(masterGain);
  } 
  else if (preset === 'wind') {
    source.buffer = createNoiseBuffer(audioContext, 'brown', 5);
    
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 400;
    bandpass.Q.value = 3.5;

    lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // 0.08 Hz sweep

    lfoGain = audioContext.createGain();
    lfoGain.gain.value = 300; // Sweep +-300 Hz

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    source.connect(bandpass);
    bandpass.connect(masterGain);
    
    nodesToDisconnect.push(bandpass, lfo, lfoGain);
  }
  else if (preset === 'ocean') {
    source.buffer = createNoiseBuffer(audioContext, 'brown', 5);
    
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;

    lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05; // Very slow waves

    lfoGain = audioContext.createGain();
    lfoGain.gain.value = 300; // Sweep cutoff 100-700 Hz

    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);

    // Also modulate volume slightly
    const volumeLfoGain = audioContext.createGain();
    volumeLfoGain.gain.value = 0.5;
    lfo.connect(volumeLfoGain);
    volumeLfoGain.connect(masterGain.gain);

    source.connect(lowpass);
    lowpass.connect(masterGain);

    nodesToDisconnect.push(lowpass, lfo, lfoGain, volumeLfoGain);
  }
  else if (preset === 'rain') {
    source.buffer = createNoiseBuffer(audioContext, 'pink', 5);
    
    // Highpass to remove bass and keep the "hiss" of rain
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1000;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 4000;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(masterGain);

    nodesToDisconnect.push(highpass, lowpass);
  }

  return {
    node: masterGain,
    start: () => {
      source.start();
      if (lfo) lfo.start();
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(preset === 'brown' ? 0.3 : 0.6, audioContext.currentTime + 2);
    },
    stop: () => {
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
      setTimeout(() => {
        try {
          source.stop();
          if (lfo) lfo.stop();
          nodesToDisconnect.forEach(n => n.disconnect());
        } catch (e) {
          // ignore
        }
      }, 2000);
    }
  };
};
