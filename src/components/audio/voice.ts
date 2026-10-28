/**
 * voice.ts — Guía por voz con la Web Speech API (`speechSynthesis`).
 *
 * Todo ocurre en el dispositivo: no se envía texto a ningún servidor. La voz
 * depende de lo que traiga el sistema; se elige la voz en español que suene
 * más natural y se habla despacio y grave para que sea calmante.
 */
import { useEffect } from 'react';
import { useZenStore } from '../../store/useZenStore';

/** true si el navegador puede sintetizar voz. */
export const isVoiceSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

const RATE = 0.82;   // más lento que lo normal (1.0)
const PITCH = 0.9;   // ligeramente grave
const VOLUME = 0.9;

let cachedVoice: SpeechSynthesisVoice | null | undefined;

// Las voces cargan de forma asíncrona en algunos navegadores: reevaluar cuando cambien.
if (isVoiceSupported) {
  window.speechSynthesis.addEventListener('voiceschanged', () => { cachedVoice = undefined; });
}

/**
 * Elige la voz en español con mejor puntaje. Se prefiere español latino neutro,
 * voces locales (suenan mejor y funcionan offline) y las marcadas como naturales.
 */
const pickVoice = (): SpeechSynthesisVoice | null => {
  if (cachedVoice !== undefined) return cachedVoice;
  const spanish = window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith('es'));
  if (spanish.length === 0) return null; // aún no cargaron; el navegador usará su voz por defecto según `lang`

  const score = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.toLowerCase().replace('_', '-');
    let s = 0;
    if (/^es-(mx|us|419|co|ar|cl)/.test(lang)) s += 3;
    else if (lang === 'es-es') s += 1;
    if (v.localService) s += 2;
    if (/natural|neural|premium|enhanced|online/i.test(v.name)) s += 2;
    return s;
  };
  cachedVoice = spanish.reduce((best, v) => (score(v) > score(best) ? v : best));
  return cachedVoice;
};

/** Limpia texto pensado para la pantalla ("Zumbaaaa «Hmmmm»") para que se oiga natural. */
const cleanForSpeech = (text: string) =>
  text.replace(/["“”«»]/g, '').replace(/(\p{L})\1{2,}/gu, '$1$1');

/** Divide en frases: Chrome de escritorio corta enunciados largos y las pausas entre frases calman. */
const toSentences = (text: string) =>
  text.split(/(?<=[.!?…:])\s+/).map(s => s.trim()).filter(Boolean);

/** true si el sistema tiene al menos una voz instalada (en Linux suele no haber ninguna). */
export const hasAnyVoice = () => isVoiceSupported && window.speechSynthesis.getVoices().length > 0;

// Temporizador pendiente y referencias vivas: Chrome descarta un speak() que llega justo
// después de cancel() (pasa en React.StrictMode de desarrollo) y recoge utterances sin referencia.
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let liveUtterances: SpeechSynthesisUtterance[] = [];
const SPEAK_DELAY_MS = 120;

/** Detiene cualquier locución en curso, incluida la que aún no había empezado. */
export const stopSpeaking = () => {
  if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
  liveUtterances = [];
  if (isVoiceSupported) window.speechSynthesis.cancel();
};

/** Lee `text` en voz alta si el usuario activó la voz; reemplaza lo que estuviera sonando. */
export const speak = (text: string) => {
  if (!isVoiceSupported || !useZenStore.getState().isVoiceOn) return;
  stopSpeaking();
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    const synth = window.speechSynthesis;
    synth.resume(); // algunos navegadores quedan en pausa tras un cancel()
    const voice = pickVoice();
    liveUtterances = toSentences(cleanForSpeech(text)).map(sentence => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.voice = voice;
      utterance.lang = voice?.lang ?? 'es-MX';
      utterance.rate = RATE;
      utterance.pitch = PITCH;
      utterance.volume = VOLUME;
      return utterance;
    });
    liveUtterances.forEach(u => synth.speak(u));
  }, SPEAK_DELAY_MS);
};

/**
 * Lee `text` cada vez que cambia mientras la voz esté activa. Si es null/undefined
 * no dice nada. Se calla al desmontar el componente o al apagar la voz.
 */
export const useSpeak = (text: string | null | undefined) => {
  const isVoiceOn = useZenStore(s => s.isVoiceOn);
  useEffect(() => {
    if (!text || !isVoiceOn) return;
    speak(text);
    return stopSpeaking;
  }, [text, isVoiceOn]);
};
