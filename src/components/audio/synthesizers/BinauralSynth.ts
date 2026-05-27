import { createNoiseBuffer } from './NoiseGenerators';

export const createBinauralSynth = (
  audioContext: AudioContext,
  baseFreq: number,
  beatFreq: number
) => {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0; // Start muted for fade-in

  // --- 1. Subliminal Binaural Tones (Pulsing, not continuous) ---
  const tonesGain = audioContext.createGain();
  tonesGain.gain.value = 0.0; // We will modulate this with an LFO to avoid the constant "tnnnnnn"

  // Slow LFO to pulse the binaural beats like ocean waves (0.05 Hz = 20s cycle)
  const tonesLfo = audioContext.createOscillator();
  tonesLfo.type = 'sine';
  tonesLfo.frequency.value = 0.05; 
  
  // Create an amplitude modulator that maps the -1 to 1 LFO to 0.01 to 0.05 gain
  const tonesLfoGain = audioContext.createGain();
  tonesLfoGain.gain.value = 0.03; // Amplitude of the pulse
  
  // We need to bias the LFO so it stays positive. 
  // LFO goes -1 to 1. Multiplied by 0.03 = -0.03 to +0.03.
  // Base tonesGain value: 0.03. Total: 0.0 to 0.06
  tonesGain.gain.value = 0.03; 
  tonesLfo.connect(tonesLfoGain);
  tonesLfoGain.connect(tonesGain.gain);

  const merger = audioContext.createChannelMerger(2);
  const oscLeft = audioContext.createOscillator();
  const oscRight = audioContext.createOscillator();

  oscLeft.type = 'sine';
  oscRight.type = 'sine';
  oscLeft.frequency.value = baseFreq;
  oscRight.frequency.value = baseFreq + beatFreq;

  oscLeft.connect(merger, 0, 0); 
  oscRight.connect(merger, 0, 1); 
  merger.connect(tonesGain);
  tonesGain.connect(masterGain);

  // --- 2. Ambient Drone Pad (Pulsing and softer) ---
  const droneGain = audioContext.createGain();
  droneGain.gain.value = 0.1; // Base volume

  const droneFilter = audioContext.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 300; // Very warm and muffled

  // LFO for the drone filter (breathing effect)
  const filterLfo = audioContext.createOscillator();
  filterLfo.type = 'sine';
  filterLfo.frequency.value = 0.06; 
  const filterLfoGain = audioContext.createGain();
  filterLfoGain.gain.value = 150; 
  filterLfo.connect(filterLfoGain);
  filterLfoGain.connect(droneFilter.frequency);
  
  // LFO for the drone volume (swell effect)
  const droneVolLfo = audioContext.createOscillator();
  droneVolLfo.type = 'sine';
  droneVolLfo.frequency.value = 0.04;
  const droneVolLfoGain = audioContext.createGain();
  droneVolLfoGain.gain.value = 0.08;
  droneVolLfo.connect(droneVolLfoGain);
  droneVolLfoGain.connect(droneGain.gain);

  const droneOsc1 = audioContext.createOscillator();
  droneOsc1.type = 'triangle';
  droneOsc1.frequency.value = baseFreq / 2; 

  const droneOsc2 = audioContext.createOscillator();
  droneOsc2.type = 'triangle';
  droneOsc2.frequency.value = baseFreq / 4; 

  const droneOsc3 = audioContext.createOscillator();
  droneOsc3.type = 'triangle';
  droneOsc3.frequency.value = baseFreq * 1.5; 

  droneOsc1.connect(droneFilter);
  droneOsc2.connect(droneFilter);
  droneOsc3.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(masterGain);

  // --- 3. Pink Noise Wash ---
  const carrierSource = audioContext.createBufferSource();
  carrierSource.buffer = createNoiseBuffer(audioContext, 'pink', 5);
  carrierSource.loop = true;
  
  const carrierFilter = audioContext.createBiquadFilter();
  carrierFilter.type = 'lowpass';
  carrierFilter.frequency.value = 500; 

  const carrierGain = audioContext.createGain();
  carrierGain.gain.value = 0.3; 

  carrierSource.connect(carrierFilter);
  carrierFilter.connect(carrierGain);
  carrierGain.connect(masterGain);

  // --- 4. Generative Melody (Richer, Arpeggiated) ---
  const melodyGain = audioContext.createGain();
  melodyGain.gain.value = 0.45;
  
  // Lush echo (delay)
  const delayNode = audioContext.createDelay();
  delayNode.delayTime.value = 0.75; 
  const feedbackGain = audioContext.createGain();
  feedbackGain.gain.value = 0.5; // High feedback for dreamy trails
  
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);
  
  melodyGain.connect(delayNode);
  melodyGain.connect(masterGain);
  delayNode.connect(masterGain);

  let isPlaying = false;
  let melodyTimeoutId: any;

  // Major Pentatonic multipliers
  const pentatonicScale = [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2];

  const playNote = (multiplier: number, octave: number, delaySecs: number) => {
    const noteFreq = baseFreq * multiplier * octave;
    const noteOsc = audioContext.createOscillator();
    noteOsc.type = 'sine'; 
    noteOsc.frequency.value = noteFreq;

    const noteEnv = audioContext.createGain();
    noteEnv.gain.value = 0;

    noteOsc.connect(noteEnv);
    noteEnv.connect(melodyGain);

    const now = audioContext.currentTime + delaySecs;
    
    // Soft piano/bell attack
    noteEnv.gain.setValueAtTime(0, now);
    noteEnv.gain.linearRampToValueAtTime(0.25, now + 0.1); 
    noteEnv.gain.exponentialRampToValueAtTime(0.001, now + 5); 

    noteOsc.start(now);
    noteOsc.stop(now + 5);
  };

  const playNextMelodySequence = () => {
    if (!isPlaying) return;

    // Determine how many notes to play in this sequence (1 to 4 notes)
    const numNotes = Math.floor(Math.random() * 4) + 1;
    
    // Play an arpeggio/chord sequence
    for (let i = 0; i < numNotes; i++) {
        const multiplier = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
        // Mix octaves for depth
        const octave = Math.random() > 0.7 ? 0.5 : (Math.random() > 0.8 ? 2 : 1); 
        
        // Stagger notes by 0s (chord) or 0.3s (arpeggio)
        const isChord = Math.random() > 0.5;
        const delaySecs = isChord ? 0 : (i * (0.2 + Math.random() * 0.3));
        
        playNote(multiplier, octave, delaySecs);
    }

    // Schedule the next sequence (faster interval for more music)
    const nextIntervalMs = 2000 + Math.random() * 3000;
    melodyTimeoutId = setTimeout(playNextMelodySequence, nextIntervalMs);
  };


  return {
    node: masterGain,
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
      
      // Start the generative melody sequence
      setTimeout(playNextMelodySequence, 1500);
      
      // Gentle fade in
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 3);
    },
    stop: () => {
      isPlaying = false;
      clearTimeout(melodyTimeoutId);
      
      // Gentle fade out before stopping
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
          
          oscLeft.disconnect();
          oscRight.disconnect();
          carrierSource.disconnect();
          merger.disconnect();
          droneFilter.disconnect();
          delayNode.disconnect();
        } catch (e) {
          // Ignore if already stopped
        }
      }, 2500);
    }
  };
};
