export let globalAudioContext: AudioContext | null = null;
export let globalMasterGain: GainNode | null = null;

// Expose this to be called directly in click handlers
export const unlockAudioContext = () => {
  if (!globalAudioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioContext = new AudioCtx();
    globalMasterGain = globalAudioContext.createGain();
    globalMasterGain.connect(globalAudioContext.destination);

    // iOS Mute Switch Bypass: Configure media session
    if ('audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback';
      } catch (e) {
        console.warn('audioSession API not supported');
      }
    }

    // iOS Mute Switch Bypass: Play a silent HTML5 audio element
    const silentAudio = new Audio('data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    silentAudio.loop = true;
    silentAudio.volume = 0;
    silentAudio.play().catch(e => console.warn('Silent audio play failed:', e));
  }
  if (globalAudioContext.state === 'suspended') {
    globalAudioContext.resume().catch(console.error);
  }
};
