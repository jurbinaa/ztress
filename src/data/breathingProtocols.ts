/**
 * Representa una fase individual dentro de un ciclo de respiración.
 */
export interface BreathingPhase {
  /** Tipo de fase respiratoria: inhalar, retener aire, exhalar o mantener los pulmones vacíos */
  type: 'inhale' | 'hold' | 'exhale' | 'pause';
  /** Duración exacta de la fase expresada en segundos */
  duration: number;
  /** Etiqueta de instrucción corta orientada a la UI (ej: "Inhala suavemente...") */
  label: string;
  /** Instrucción detallada de cómo ejecutar físicamente la fase */
  instruction: string;
}

/**
 * Categorías clínicas/terapéuticas de los protocolos de respiración.
 */
export type BreathingCategory = 'relaxation' | 'emergency' | 'focus' | 'sleep' | 'daily';

/**
 * Niveles de dificultad para clasificar los ejercicios de respiración según la capacidad pulmonar y experiencia del usuario.
 */
export type BreathingDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Interfaz principal que define la estructura completa de un protocolo de respiración.
 */
export interface BreathingProtocol {
  /** Identificador único del protocolo */
  id: string;
  /** Nombre completo formal del ejercicio */
  name: string;
  /** Nombre corto y conciso optimizado para componentes y pestañas */
  nameShort: string;
  /** Categoría a la que pertenece la práctica */
  category: BreathingCategory;
  /** Etiqueta descriptiva para visualización en la UI */
  categoryLabel: string;
  /** Nombre del ícono de Google Material Symbols representativo */
  categoryIcon: string;
  /** Explicación detallada del funcionamiento y sensaciones del ejercicio */
  description: string;
  /** Resumen científico simplificado que justifica fisiológicamente los beneficios del ejercicio */
  scienceBrief: string;
  /** Secuencia ordenada de fases que componen un ciclo respiratorio completo */
  phases: BreathingPhase[];
  /** Frecuencia respiratoria expresada en respiraciones por minuto (Respiraciones / Minuto) */
  bpm: number;
  /** Casos de uso ideales recomendados */
  bestFor: string[];
  /** Nivel de dificultad asignado */
  difficulty: BreathingDifficulty;
  /** Etiqueta en texto legible para el nivel de dificultad */
  difficultyLabel: string;
  /** Nombre del ícono primario de Material Symbols */
  icon: string;
  /** Duración recomendada de la práctica completa expresada en minutos */
  recommendedDuration: number;
  /** Clases CSS de gradiente de Tailwind para colorear el orbe interactivo (ej. "from-[#color]/50 to-[#color]/80") */
  color: string;
}

/**
 * Configuración visual y semántica para las categorías terapéuticas.
 */
export const CATEGORY_CONFIG: Record<BreathingCategory, { label: string; icon: string; color: string }> = {
  relaxation: { label: 'Relajación', icon: 'self_improvement', color: 'text-indigo-400' },
  emergency: { label: 'Emergencia', icon: 'emergency', color: 'text-red-400' },
  focus: { label: 'Concentración', icon: 'psychology', color: 'text-amber-400' },
  sleep: { label: 'Sueño', icon: 'bedtime', color: 'text-blue-400' },
  daily: { label: 'Diario', icon: 'spa', color: 'text-emerald-400' }
};

/**
 * Configuración visual y de estilo para las insignias (badges) de dificultad.
 */
export const DIFFICULTY_CONFIG: Record<BreathingDifficulty, { label: string; color: string }> = {
  beginner: { label: 'Principiante', color: 'text-green-400 bg-green-500/10' },
  intermediate: { label: 'Intermedio', color: 'text-yellow-400 bg-yellow-500/10' },
  advanced: { label: 'Avanzado', color: 'text-red-400 bg-red-500/10' }
};

/**
 * Catálogo detallado de los 12 protocolos de respiración científica.
 * Incluye técnicas de pranayama tradicional, respiraciones coherentes occidentales, y reseteos rápidos del nervio vago.
 */
export const BREATHING_PROTOCOLS: BreathingProtocol[] = [
  {
    id: 'coherent',
    name: 'Respiración Coherente',
    nameShort: 'Coherente',
    category: 'daily',
    categoryLabel: 'Práctica Diaria',
    categoryIcon: 'spa',
    description: 'Encuentra tu ritmo natural. Esta técnica simple pero poderosa sincroniza tu corazón y tu respiración para crear un estado de calma profunda.',
    scienceBrief: 'Maximiza la arritmia sinusal respiratoria para un tono vagal óptimo y equilibrio del sistema nervioso autónomo.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala suavemente...', instruction: 'Toma aire lentamente por la nariz, expandiendo el vientre.' },
      { type: 'exhale', duration: 6, label: 'Exhala sin esfuerzo...', instruction: 'Deja salir el aire por la nariz o boca suavemente, soltando tensiones.' }
    ],
    bpm: 6.0,
    bestFor: ['Calma general', 'Equilibrio diario', 'Salud cardiovascular'],
    difficulty: 'beginner',
    difficultyLabel: 'Principiante',
    icon: 'water_drop',
    recommendedDuration: 5,
    color: 'from-[#A3BE8C]/50 to-[#A3BE8C]/80'
  },
  {
    id: '46',
    name: 'Respiración 4-6',
    nameShort: '4-6',
    category: 'relaxation',
    categoryLabel: 'Relajación Profunda',
    categoryIcon: 'self_improvement',
    description: 'Exhalación ligeramente más larga que la inhalación. Simple, efectiva y accesible para activar el nervio vago sin retención de aire.',
    scienceBrief: 'La relación 1:1.5 (inhalación:exhalación) incrementa la variabilidad de la frecuencia cardíaca y tono vagal sin la complejidad de retener el aire.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala suave...', instruction: 'Toma aire por la nariz, llenando el vientre.' },
      { type: 'exhale', duration: 6, label: 'Exhala largo...', instruction: 'Suelta el aire por la boca o nariz, alargando la salida.' }
    ],
    bpm: 6.0,
    bestFor: ['Ansiedad leve', 'Principiantes', 'Transiciones día-noche', 'Antes de comer'],
    difficulty: 'beginner',
    difficultyLabel: 'Principiante',
    icon: 'air',
    recommendedDuration: 5,
    color: 'from-[#A3BE8C]/50 to-[#A3BE8C]/80'
  },
  {
    id: '478',
    name: 'Relajación 4-7-8',
    nameShort: '4-7-8',
    category: 'relaxation',
    categoryLabel: 'Relajación Profunda',
    categoryIcon: 'self_improvement',
    description: 'Un tranquilizante natural para el sistema nervioso. Ideal cuando sientes agitación o antes de momentos que requieren tranquilidad.',
    scienceBrief: 'La exhalación prolongada estimula profundamente el sistema parasimpático y reduce los niveles de cortisol en sangre.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala por la nariz...', instruction: 'Lleva el aire hacia el vientre de forma silenciosa.' },
      { type: 'hold', duration: 7, label: 'Mantén el aire...', instruction: 'Conserva el aire sin hacer fuerza, relaja los hombros.' },
      { type: 'exhale', duration: 8, label: 'Exhala por la boca...', instruction: 'Sopla suavemente vaciando los pulmones por completo.' }
    ],
    bpm: 3.16,
    bestFor: ['Ansiedad', 'Antes de dormir', 'Tensión acumulada'],
    difficulty: 'intermediate',
    difficultyLabel: 'Intermedio',
    icon: 'waves',
    recommendedDuration: 3,
    color: 'from-[#8FBCBB]/50 to-[#8FBCBB]/80'
  },
  {
    id: 'box',
    name: 'Respiración de Caja',
    nameShort: 'Cuadrada',
    category: 'focus',
    categoryLabel: 'Concentración',
    categoryIcon: 'psychology',
    description: 'Devuelve la claridad a tu mente. Una técnica utilizada por deportistas y profesionales de alto rendimiento para recuperar el enfoque bajo presión.',
    scienceBrief: 'Crea un balance simétrico entre la activación simpática y la respuesta de relajación parasimpática.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala profundo...', instruction: 'Llena tus pulmones a un ritmo constante.' },
      { type: 'hold', duration: 4, label: 'Mantén lleno...', instruction: 'Conserva el aire con suavidad.' },
      { type: 'exhale', duration: 4, label: 'Exhala todo...', instruction: 'Libera el aire al mismo ritmo constante.' },
      { type: 'pause', duration: 4, label: 'Mantén vacío...', instruction: 'Espera en quietud antes de volver a empezar.' }
    ],
    bpm: 3.75,
    bestFor: ['Claridad mental', 'Antes de reuniones', 'Pérdida de foco'],
    difficulty: 'beginner',
    difficultyLabel: 'Principiante',
    icon: 'crop_square',
    recommendedDuration: 4,
    color: 'from-[#EBCB8B]/50 to-[#EBCB8B]/80'
  },
  {
    id: 'measured',
    name: 'Respiración Anti-Pánico',
    nameShort: '4-1-7',
    category: 'emergency',
    categoryLabel: 'Intervención Rápida',
    categoryIcon: 'emergency',
    description: 'Estás a salvo. Cuando sientas que el pánico te invade o tu respiración se acelera demasiado, este patrón te ayudará a recuperar el control suavemente.',
    scienceBrief: 'Contrarresta la hiperventilación y rompe el ciclo de retroalimentación de pánico al forzar una exhalación controlada.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala suavemente...', instruction: 'Toma aire sin forzar, no necesitas llenarte por completo.' },
      { type: 'hold', duration: 1, label: 'Pausa breve...', instruction: 'Una micro-pausa de transición.' },
      { type: 'exhale', duration: 7, label: 'Exhala muy lento...', instruction: 'Suelta el aire poco a poco, como si soplaras por una pajita.' }
    ],
    bpm: 5.0,
    bestFor: ['Ataques de pánico', 'Hiperventilación', 'Angustia aguda'],
    difficulty: 'beginner',
    difficultyLabel: 'Principiante',
    icon: 'healing',
    recommendedDuration: 5,
    color: 'from-[#BF616A]/50 to-[#BF616A]/80'
  },
  {
    id: 'triangular',
    name: 'Respiración Triangular',
    nameShort: 'Triangular',
    category: 'daily',
    categoryLabel: 'Práctica Diaria',
    categoryIcon: 'spa',
    description: 'Un fluir suave sin retener el aire lleno. Perfecta si sientes que retener la respiración te causa un poco de ansiedad.',
    scienceBrief: 'Reduce la ansiedad por retención (claustrofobia respiratoria) mientras mantiene el beneficio del descanso vagal en vacío.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala suave...', instruction: 'Toma aire de forma fluida y continua.' },
      { type: 'exhale', duration: 4, label: 'Exhala suave...', instruction: 'Suelta el aire al mismo ritmo, sin esfuerzo.' },
      { type: 'pause', duration: 4, label: 'Mantén en vacío...', instruction: 'Descansa sin aire, sintiendo la quietud de tu cuerpo.' }
    ],
    bpm: 5.0,
    bestFor: ['Ansiedad leve', 'Mantenimiento diario', 'Principiantes absolutos'],
    difficulty: 'beginner',
    difficultyLabel: 'Principiante',
    icon: 'change_history',
    recommendedDuration: 3,
    color: 'from-[#B48EAD]/50 to-[#B48EAD]/80'
  },
  {
    id: 'cyclic-sighing',
    name: 'Suspiro Cíclico',
    nameShort: 'Suspiro Cíclico',
    category: 'emergency',
    categoryLabel: 'Intervención Rápida',
    categoryIcon: 'emergency',
    description: 'La forma más rápida de calmar tu sistema nervioso según la ciencia. Como un suspiro de alivio profundo que resetea tu estado emocional al instante.',
    scienceBrief: 'La doble inhalación recluta alvéolos pulmonares colapsados y optimiza la descarga de dióxido de carbono en la exhalación subsecuente.',
    phases: [
      { type: 'inhale', duration: 3, label: 'Inhala profundo...', instruction: 'Toma una gran bocanada de aire por la nariz.' },
      { type: 'hold', duration: 1, label: 'Un poquito más...', instruction: 'Inhala un pequeño extra (sorbo de aire) rápido por la nariz.' },
      { type: 'exhale', duration: 6, label: 'Suelta todo...', instruction: 'Exhala por la boca con un suspiro largo y relajado.' }
    ],
    bpm: 6.0,
    bestFor: ['Picos de estrés', 'Cambio rápido de humor', 'Sobrecarga inmediata'],
    difficulty: 'beginner',
    difficultyLabel: 'Principiante',
    icon: 'air',
    recommendedDuration: 5,
    color: 'from-[#D08770]/50 to-[#D08770]/80'
  },
  {
    id: 'nadi-shodhana',
    name: 'Respiración Alterna (Nadi Shodhana)',
    nameShort: 'Alterna',
    category: 'daily',
    categoryLabel: 'Equilibrio Mental',
    categoryIcon: 'spa',
    description: 'Equilibra los hemisferios de tu cerebro. Usa tu pulgar y dedo anular para alternar la respiración entre tus fosas nasales.',
    scienceBrief: 'Promueve la coherencia interhemisférica cerebral, estabiliza la presión arterial y optimiza la asimilación del oxígeno.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala (Fosa Izquierda)...', instruction: 'Tapa tu fosa derecha e inhala por la izquierda.' },
      { type: 'exhale', duration: 8, label: 'Exhala (Fosa Derecha)...', instruction: 'Tapa la izquierda, destapa la derecha y exhala el doble de tiempo.' },
      { type: 'inhale', duration: 4, label: 'Inhala (Fosa Derecha)...', instruction: 'Mantén la izquierda tapada e inhala por la derecha.' },
      { type: 'exhale', duration: 8, label: 'Exhala (Fosa Izquierda)...', instruction: 'Tapa la derecha, destapa la izquierda y exhala largo.' }
    ],
    bpm: 2.5,
    bestFor: ['Claridad mental', 'Equilibrio emocional', 'Antes de meditar'],
    difficulty: 'advanced',
    difficultyLabel: 'Avanzado',
    icon: 'sync_alt',
    recommendedDuration: 10,
    color: 'from-[#B48EAD]/50 to-[#B48EAD]/80'
  },
  {
    id: 'five-five',
    name: 'Respiración 5-5',
    nameShort: '5-5',
    category: 'daily',
    categoryLabel: 'Práctica Diaria',
    categoryIcon: 'spa',
    description: 'La base de todas las respiraciones calmantes. Una introducción perfecta para sintonizar con el ritmo natural de tu cuerpo sin complicaciones.',
    scienceBrief: 'Un ritmo estable a 6 respiraciones por minuto induce un estado de coherencia cardiaca básica.',
    phases: [
      { type: 'inhale', duration: 5, label: 'Inhala constante...', instruction: 'Toma aire llenando gradualmente abdomen y pecho.' },
      { type: 'exhale', duration: 5, label: 'Exhala constante...', instruction: 'Libera el aire al mismo ritmo, sintiendo cómo te relajas.' }
    ],
    bpm: 6.0,
    bestFor: ['Principiantes', 'Iniciando el día', 'Mantenimiento'],
    difficulty: 'beginner',
    difficultyLabel: 'Principiante',
    icon: 'balance',
    recommendedDuration: 5,
    color: 'from-[#81A1C1]/50 to-[#81A1C1]/80'
  },
  {
    id: 'bhramari',
    name: 'Respiración Zumbido (Bhramari)',
    nameShort: 'Zumbido',
    category: 'relaxation',
    categoryLabel: 'Relajación Profunda',
    categoryIcon: 'self_improvement',
    description: 'Usa tu propia voz para masajear tu sistema nervioso. Al exhalar, produce un suave sonido de "Hmmmm" como una abeja.',
    scienceBrief: 'La vibración laringofaríngea estimula el nervio vago y aumenta la producción de óxido nítrico nasal hasta 15 veces.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala profundo...', instruction: 'Toma aire por la nariz.' },
      { type: 'exhale', duration: 15, label: 'Zumbaaaa "Hmmmm"...', instruction: 'Exhala produciendo un zumbido constante con los labios cerrados. Siente la vibración.' }
    ],
    bpm: 3.15,
    bestFor: ['Bloqueo mental', 'Congestión', 'Aislamiento sensorial'],
    difficulty: 'intermediate',
    difficultyLabel: 'Intermedio',
    icon: 'record_voice_over',
    recommendedDuration: 5,
    color: 'from-[#D08770]/50 to-[#D08770]/80'
  },
  {
    id: 'ratio-21',
    name: 'Relajación 2:1',
    nameShort: 'Ratio 2:1',
    category: 'relaxation',
    categoryLabel: 'Relajación Profunda',
    categoryIcon: 'self_improvement',
    description: 'La clave de la relajación está en hacer que tu exhalación sea exactamente el doble de larga que tu inhalación.',
    scienceBrief: 'Esta proporción maximiza la respuesta del sistema nervioso parasimpático de forma sostenida y predecible.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala suave...', instruction: 'Toma aire contando mentalmente hasta 4.' },
      { type: 'exhale', duration: 8, label: 'Exhala muy largo...', instruction: 'Suelta el aire despacio, alargándolo el doble del tiempo.' }
    ],
    bpm: 5.0,
    bestFor: ['Tensión física', 'Insomnio leve', 'Desconexión'],
    difficulty: 'intermediate',
    difficultyLabel: 'Intermedio',
    icon: 'linear_scale',
    recommendedDuration: 5,
    color: 'from-[#B48EAD]/50 to-[#B48EAD]/80'
  },
  {
    id: 'energizing',
    name: 'Respiración Energizante',
    nameShort: 'Energizante',
    category: 'focus',
    categoryLabel: 'Concentración',
    categoryIcon: 'psychology',
    description: 'Despierta tu cuerpo y mente de forma natural. Ideal para esos momentos de bajón a media tarde cuando necesitas un impulso de energía sin cafeína.',
    scienceBrief: 'Induce una activación simpática controlada, elevando ligeramente la frecuencia cardíaca y aumentando el estado de alerta general.',
    phases: [
      { type: 'inhale', duration: 2, label: 'Inhala con energía...', instruction: 'Toma aire rápidamente expandiendo el pecho.' },
      { type: 'hold', duration: 1, label: 'Retén...', instruction: 'Siente la energía.' },
      { type: 'exhale', duration: 2, label: 'Exhala rápido...', instruction: 'Suelta el aire con decisión.' }
    ],
    bpm: 12.0,
    bestFor: ['Bajones de energía', 'Antes de trabajar', 'Letargo'],
    difficulty: 'intermediate',
    difficultyLabel: 'Intermedio',
    icon: 'bolt',
    recommendedDuration: 2,
    color: 'from-[#EBCB8B]/50 to-[#EBCB8B]/80'
  },
  {
    id: 'deep-sleep',
    name: 'Sueño Profundo',
    nameShort: 'Para Dormir',
    category: 'sleep',
    categoryLabel: 'Preparación al Sueño',
    categoryIcon: 'bedtime',
    description: 'Prepara tu cuerpo para un descanso reparador. Esta técnica ralentiza tus ondas cerebrales y le indica a tu organismo que es hora de dormir.',
    scienceBrief: 'La cadencia muy lenta (menos de 3 respiraciones por minuto) mimetiza el patrón respiratorio de la fase NREM del sueño profundo.',
    phases: [
      { type: 'inhale', duration: 4, label: 'Inhala calmado...', instruction: 'Toma aire llenando tu vientre, sintiendo el peso de tu cuerpo en la cama.' },
      { type: 'hold', duration: 7, label: 'Mantén la calma...', instruction: 'Deja que la quietud te envuelva sin esforzarte.' },
      { type: 'exhale', duration: 8, label: 'Exhala todo...', instruction: 'Suelta todas las tensiones del día en una exhalación larga.' },
      { type: 'pause', duration: 2, label: 'Descansa...', instruction: 'Disfruta de la quietud profunda antes de continuar.' }
    ],
    bpm: 2.86,
    bestFor: ['Insomnio', 'Despertares nocturnos', 'Mente acelerada de noche'],
    difficulty: 'intermediate',
    difficultyLabel: 'Intermedio',
    icon: 'nightlight',
    recommendedDuration: 10,
    color: 'from-[#81A1C1]/50 to-[#81A1C1]/80'
  }
];
