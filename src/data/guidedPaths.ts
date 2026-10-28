/**
 * guidedPaths.ts — Caminos guiados de "Ayúdame ahora".
 *
 * Cada camino encadena pasos existentes (respiración, terapia, sonido) según
 * cómo dice sentirse la persona, para que no tenga que elegir entre ~15 técnicas.
 */

export type TherapyStepId = 'defusion' | 'pmr' | 'imagery' | 'grounding';

export type PathStep =
  /** Respiración guiada con un protocolo de `breathingProtocols.ts` */
  | { kind: 'breath'; protocolId: string; minutes: number }
  /** Sesión de la pestaña "Sana" */
  | { kind: 'therapy'; id: TherapyStepId }
  /** Sonido de `stations.json`; si trae `sleepMinutes` arranca el temporizador de sueño */
  | { kind: 'sound'; stationId: string; title: string; hint: string; sleepMinutes?: number };

export interface GuidedPath {
  id: string;
  label: string;
  description: string;
  icon: string;
  /** Duración aproximada total, solo informativa */
  approxMinutes: number;
  steps: PathStep[];
}

export const GUIDED_PATHS: GuidedPath[] = [
  {
    id: 'anxious',
    label: 'Ansioso o en pánico',
    description: 'Bajar la activación primero, luego volver al presente.',
    icon: 'crisis_alert',
    approxMinutes: 7,
    steps: [
      { kind: 'breath', protocolId: 'cyclic-sighing', minutes: 3 },
      { kind: 'therapy', id: 'grounding' },
    ],
  },
  {
    id: 'tense',
    label: 'Tenso o agotado',
    description: 'Respirar para aflojar y soltar la tensión del cuerpo.',
    icon: 'battery_alert',
    approxMinutes: 10,
    steps: [
      { kind: 'breath', protocolId: 'coherent', minutes: 3 },
      { kind: 'therapy', id: 'pmr' },
    ],
  },
  {
    id: 'scattered',
    label: 'Mente acelerada',
    description: 'Centrar la atención y tomar distancia de los pensamientos.',
    icon: 'cyclone',
    approxMinutes: 8,
    steps: [
      { kind: 'breath', protocolId: 'box', minutes: 3 },
      { kind: 'therapy', id: 'defusion' },
    ],
  },
  {
    id: 'sleep',
    label: 'No puedo dormir',
    description: 'Respiración lenta y sonido que se apaga solo.',
    icon: 'bedtime',
    approxMinutes: 35,
    steps: [
      { kind: 'breath', protocolId: 'deep-sleep', minutes: 5 },
      {
        kind: 'sound',
        stationId: 'delta',
        title: 'Déjate llevar',
        hint: 'El sonido bajará de volumen y se apagará solo.',
        sleepMinutes: 30,
      },
    ],
  },
];
