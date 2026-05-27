import React, { useEffect, useRef } from 'react';
import { useZenStore } from '../../store/useZenStore';
import STATIONS from '../../data/stations.json';
import { createBinauralSynth } from './synthesizers/BinauralSynth';
import { createNatureSynth } from './synthesizers/NatureSynth';

import { globalAudioContext, globalMasterGain, unlockAudioContext } from './AudioContextManager';

export const AmbienceEngine: React.FC = () => {
  const { stationId, isRocholaPlaying, isBreathingActive, isMuted, volume, setIsRocholaPlaying } = useZenStore();
  const synthRef = useRef<{ start: () => void, stop: () => void, node: AudioNode } | null>(null);

  // Core Playback Logic
  useEffect(() => {
    const shouldPlay = isRocholaPlaying && !isBreathingActive;

    if (!shouldPlay || !stationId) {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
      return;
    }

    // Initialize AudioContext lazily
    unlockAudioContext();
    
    // Ensure context is running (fixes browser autoplay policies)
    if (globalAudioContext && globalAudioContext.state === 'suspended') {
      globalAudioContext.resume().catch((e) => {
        console.error("AudioContext resume failed:", e);
        setIsRocholaPlaying(false);
      });
    }

    // Clean up previous synth
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }

    const station = STATIONS.find(s => s.id === stationId);
    if (!station || !globalAudioContext) return;

    // Spin up new synth
    if (station.type === 'binaural' && station.config) {
      synthRef.current = createBinauralSynth(
        globalAudioContext, 
        station.config.baseFreq!, 
        station.config.beatFreq!
      );
    } else if (station.type === 'nature' && station.config) {
      synthRef.current = createNatureSynth(
        globalAudioContext,
        station.config.preset! as import('./synthesizers/NatureSynth').NaturePreset
      );
    }

    // Connect and start
    if (synthRef.current && globalMasterGain) {
      synthRef.current.node.connect(globalMasterGain);
      synthRef.current.start();
    }

    // Cleanup on unmount or URL change
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
    };
  }, [stationId, isRocholaPlaying, isBreathingActive, setIsRocholaPlaying]);

  // Global Mute Logic
  useEffect(() => {
    if (globalMasterGain) {
      // Smooth fade to mute/unmute to prevent popping
      const targetGain = isMuted ? 0 : volume;
      globalMasterGain.gain.setValueAtTime(globalMasterGain.gain.value, globalAudioContext!.currentTime);
      globalMasterGain.gain.linearRampToValueAtTime(
        targetGain, 
        globalAudioContext!.currentTime + 0.1
      );
    }
  }, [isMuted, volume]);

  return null; // Headless engine
};
