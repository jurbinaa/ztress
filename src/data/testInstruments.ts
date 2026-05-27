export interface TestOption {
  text: string;
  points: number;
}

export interface TestQuestion {
  question: string;
  options: TestOption[];
}

export interface TestResultCategory {
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  color: string;
  icon: string;
  recommendations: string[];
  suggestedModule: string;
}

export interface TestInstrument {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  questionCount: number;
  estimatedMinutes: number;
  questions: TestQuestion[];
  maxScore: number;
  categories: TestResultCategory[];
  scienceNote: string;
}

export const TEST_INSTRUMENTS: TestInstrument[] = [
  {
    id: 'pss-10',
    name: 'Escala de Estrés Percibido (PSS-10)',
    shortName: 'Estrés',
    description: 'Descubre cómo estás procesando las situaciones de tu vida. Este instrumento te ayuda a entender tu nivel de sobrecarga actual para poder tomar medidas.',
    icon: 'monitor_heart',
    questionCount: 10,
    estimatedMinutes: 3,
    maxScore: 40,
    scienceNote: 'Basado en la Perceived Stress Scale de S. Cohen, el instrumento psicológico más utilizado globalmente para medir la percepción del estrés.',
    questions: [
      {
        question: '¿Con qué frecuencia te has sentido molesto/a por algo que ocurrió inesperadamente?',
        options: [
          { text: 'Nunca', points: 0 }, { text: 'Casi nunca', points: 1 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 3 }, { text: 'Muy frecuentemente', points: 4 }
        ]
      },
      {
        question: '¿Con qué frecuencia has sentido que no podías controlar las cosas importantes de tu vida?',
        options: [
          { text: 'Nunca', points: 0 }, { text: 'Casi nunca', points: 1 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 3 }, { text: 'Muy frecuentemente', points: 4 }
        ]
      },
      {
        question: '¿Con qué frecuencia te has sentido nervioso/a o estresado/a?',
        options: [
          { text: 'Nunca', points: 0 }, { text: 'Casi nunca', points: 1 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 3 }, { text: 'Muy frecuentemente', points: 4 }
        ]
      },
      {
        question: '¿Con qué frecuencia has sentido confianza en tu capacidad para manejar tus problemas?',
        options: [
          { text: 'Nunca', points: 4 }, { text: 'Casi nunca', points: 3 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 1 }, { text: 'Muy frecuentemente', points: 0 }
        ]
      },
      {
        question: '¿Con qué frecuencia has sentido que las cosas te iban bien?',
        options: [
          { text: 'Nunca', points: 4 }, { text: 'Casi nunca', points: 3 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 1 }, { text: 'Muy frecuentemente', points: 0 }
        ]
      },
      {
        question: '¿Con qué frecuencia has sentido que no podías lidiar con todo lo que tenías que hacer?',
        options: [
          { text: 'Nunca', points: 0 }, { text: 'Casi nunca', points: 1 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 3 }, { text: 'Muy frecuentemente', points: 4 }
        ]
      },
      {
        question: '¿Con qué frecuencia has podido controlar las dificultades de tu vida?',
        options: [
          { text: 'Nunca', points: 4 }, { text: 'Casi nunca', points: 3 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 1 }, { text: 'Muy frecuentemente', points: 0 }
        ]
      },
      {
        question: '¿Con qué frecuencia has sentido que tenías todo bajo control?',
        options: [
          { text: 'Nunca', points: 4 }, { text: 'Casi nunca', points: 3 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 1 }, { text: 'Muy frecuentemente', points: 0 }
        ]
      },
      {
        question: '¿Con qué frecuencia te has enfadado por cosas que estaban fuera de tu control?',
        options: [
          { text: 'Nunca', points: 0 }, { text: 'Casi nunca', points: 1 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 3 }, { text: 'Muy frecuentemente', points: 4 }
        ]
      },
      {
        question: '¿Con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?',
        options: [
          { text: 'Nunca', points: 0 }, { text: 'Casi nunca', points: 1 }, { text: 'A veces', points: 2 }, { text: 'Frecuentemente', points: 3 }, { text: 'Muy frecuentemente', points: 4 }
        ]
      }
    ],
    categories: [
      {
        minScore: 0, maxScore: 13, title: 'Estrés Bajo', severity: 'low',
        description: 'Tus niveles son saludables. Muestras resiliencia frente a los desafíos. Sigue cultivando estos hábitos que te benefician.',
        color: 'text-green-400 border-green-500/20 bg-green-500/10',
        icon: 'check_circle',
        recommendations: ['Mantén tu práctica de respiración coherente diaria', 'Sigue disfrutando de la naturaleza y paisajes sonoros', 'Registra las cosas buenas en el diario de gratitud'],
        suggestedModule: 'therapy'
      },
      {
        minScore: 14, maxScore: 26, title: 'Estrés Moderado', severity: 'moderate',
        description: 'Sientes la carga de las demandas diarias. Hay tensión, pero aún mantienes recursos para manejarla. Es momento de introducir pequeñas pausas restaurativas.',
        color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
        icon: 'warning',
        recommendations: ['Haz una sesión de respiración 4-7-8 al mediodía', 'Usa la Visualización Guiada para desconectar', 'Escucha sonidos del bosque mientras trabajas'],
        suggestedModule: 'zen'
      },
      {
        minScore: 27, maxScore: 40, title: 'Estrés Alto', severity: 'high',
        description: 'Notamos señales de sobrecarga importante. Esto no define quién eres — es una clara señal de que tu cuerpo y mente necesitan atención y descanso prioritario.',
        color: 'text-red-400 border-red-500/20 bg-red-500/10',
        icon: 'emergency',
        recommendations: ['Prueba la Relajación Muscular Progresiva hoy mismo', 'Usa el Botón de Pánico o respiración 4-1-7 en picos de estrés', 'Haz un Registro de Pensamientos (CBT)'],
        suggestedModule: 'therapy'
      }
    ]
  },
  {
    id: 'gad-7',
    name: 'Evaluación de Ansiedad (GAD-7)',
    shortName: 'Ansiedad',
    description: 'Entiende cómo la preocupación y la tensión física están afectando tus días. Validar lo que sientes es el primer paso para sanar.',
    icon: 'water_drop',
    questionCount: 7,
    estimatedMinutes: 2,
    maxScore: 21,
    scienceNote: 'Basado en el Generalized Anxiety Disorder 7, un instrumento clínico validado para el cribado inicial de la ansiedad generalizada.',
    questions: [
      {
        question: 'Durante las últimas 2 semanas, ¿con qué frecuencia te ha molestado sentirte nervioso/a, ansioso/a o con los nervios de punta?',
        options: [{ text: 'Nunca', points: 0 }, { text: 'Varios días', points: 1 }, { text: 'Más de la mitad', points: 2 }, { text: 'Casi todos los días', points: 3 }]
      },
      {
        question: '¿Con qué frecuencia te ha molestado no poder dejar de preocuparte o no poder controlar la preocupación?',
        options: [{ text: 'Nunca', points: 0 }, { text: 'Varios días', points: 1 }, { text: 'Más de la mitad', points: 2 }, { text: 'Casi todos los días', points: 3 }]
      },
      {
        question: '¿Con qué frecuencia te ha molestado preocuparte demasiado por diferentes cosas?',
        options: [{ text: 'Nunca', points: 0 }, { text: 'Varios días', points: 1 }, { text: 'Más de la mitad', points: 2 }, { text: 'Casi todos los días', points: 3 }]
      },
      {
        question: '¿Con qué frecuencia te ha molestado la dificultad para relajarte?',
        options: [{ text: 'Nunca', points: 0 }, { text: 'Varios días', points: 1 }, { text: 'Más de la mitad', points: 2 }, { text: 'Casi todos los días', points: 3 }]
      },
      {
        question: '¿Con qué frecuencia te ha molestado estar tan inquieto/a que es difícil quedarte quieto/a?',
        options: [{ text: 'Nunca', points: 0 }, { text: 'Varios días', points: 1 }, { text: 'Más de la mitad', points: 2 }, { text: 'Casi todos los días', points: 3 }]
      },
      {
        question: '¿Con qué frecuencia te ha molestado irritarte o enfadarte con facilidad?',
        options: [{ text: 'Nunca', points: 0 }, { text: 'Varios días', points: 1 }, { text: 'Más de la mitad', points: 2 }, { text: 'Casi todos los días', points: 3 }]
      },
      {
        question: '¿Con qué frecuencia te ha molestado sentir miedo, como si algo terrible pudiera pasar?',
        options: [{ text: 'Nunca', points: 0 }, { text: 'Varios días', points: 1 }, { text: 'Más de la mitad', points: 2 }, { text: 'Casi todos los días', points: 3 }]
      }
    ],
    categories: [
      {
        minScore: 0, maxScore: 4, title: 'Ansiedad Mínima', severity: 'low',
        description: 'Tus niveles de preocupación son los normales de la vida diaria y no interfieren significativamente con tu bienestar.',
        color: 'text-green-400 border-green-500/20 bg-green-500/10',
        icon: 'check_circle',
        recommendations: ['Mantén prácticas preventivas como el diario de gratitud', 'Sigue respirando conscientemente unos minutos al día', 'Disfruta de las citas del oráculo zen'],
        suggestedModule: 'oracle'
      },
      {
        minScore: 5, maxScore: 9, title: 'Ansiedad Leve', severity: 'low',
        description: 'La tensión y la preocupación están más presentes de lo habitual. Es un excelente momento para usar herramientas preventivas antes de que aumente.',
        color: 'text-lime-400 border-lime-500/20 bg-lime-500/10',
        icon: 'info',
        recommendations: ['Practica la respiración triangular para reducir tensión leve', 'Prueba el escáner corporal antes de dormir', 'Escucha frecuencias binaurales calmantes'],
        suggestedModule: 'breathe'
      },
      {
        minScore: 10, maxScore: 14, title: 'Ansiedad Moderada', severity: 'moderate',
        description: 'Sientes ansiedad constante que probablemente dificulta tu concentración o relajación diaria. Tu sistema nervioso está en modo de alerta prolongado.',
        color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
        icon: 'warning',
        recommendations: ['Inicia un Registro de Pensamientos (CBT) cuando sientas preocupación', 'Realiza la Relajación Muscular Progresiva a diario', 'Usa la respiración 4-7-8 al sentir nervios'],
        suggestedModule: 'therapy'
      },
      {
        minScore: 15, maxScore: 21, title: 'Ansiedad Severa', severity: 'severe',
        description: 'La ansiedad está teniendo un impacto doloroso y abrumador en ti. Lo que sientes es válido y muy real. Prioriza tu seguridad y confort inmediato.',
        color: 'text-red-400 border-red-500/20 bg-red-500/10',
        icon: 'emergency',
        recommendations: ['Usa el Suspiro Cíclico para bajar picos de ansiedad', 'Utiliza la Visualización Guiada para darle un respiro a tu mente', 'Considera buscar el apoyo de un profesional de salud mental'],
        suggestedModule: 'therapy'
      }
    ]
  },
  {
    id: 'bat-12',
    name: 'Agotamiento Laboral (Burnout)',
    shortName: 'Burnout',
    description: 'Evalúa el impacto del trabajo u obligaciones en tu energía vital. Si sientes que ya no rindes igual, no es tu culpa; es agotamiento.',
    icon: 'battery_0_bar',
    questionCount: 12,
    estimatedMinutes: 4,
    maxScore: 48,
    scienceNote: 'Adaptación breve del Burnout Assessment Tool (BAT) que evalúa las cuatro dimensiones principales del síndrome de desgaste profesional.',
    questions: [
      { question: 'A nivel laboral/académico, ¿con qué frecuencia te sientes emocionalmente agotado/a?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: 'Al final de tu jornada, ¿sientes tu energía totalmente drenada y vacía?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Te levantas sintiéndote exhausto/a ante la idea de tener que enfrentarte a otro día de responsabilidades?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Has perdido el entusiasmo o interés que solías tener por tus tareas u objetivos?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Sientes que trabajas en modo "piloto automático" o te sientes distante e indiferente de lo que haces?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Te has vuelto más cínico/a o crítico/a respecto a tus responsabilidades o con las personas involucradas?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Te cuesta mantener la concentración o tu mente divaga mientras intentas hacer tu trabajo?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Cometes errores por falta de atención o tienes dificultad para recordar cosas sencillas recientemente?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Sientes que necesitas mucho más tiempo y esfuerzo para completar tareas que antes hacías fácilmente?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: 'En tu entorno diario, ¿te irritas o reaccionas exageradamente ante inconvenientes menores?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Sientes que tienes ganas de llorar o te sientes abrumado/a sin una razón aparente clara?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] },
      { question: '¿Sientes que no puedes tolerar ruidos, interrupciones o demandas adicionales de otras personas?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'A menudo', points: 3 }, { text: 'Siempre', points: 4 }] }
    ],
    categories: [
      {
        minScore: 0, maxScore: 15, title: 'Riesgo Bajo de Burnout', severity: 'low',
        description: 'Mantienes un buen equilibrio de energía emocional y cognitiva. Tu compromiso actual parece sostenible.',
        color: 'text-green-400 border-green-500/20 bg-green-500/10',
        icon: 'battery_charging_full',
        recommendations: ['Protege tus tiempos de desconexión', 'Usa las frecuencias de la Rochola para transiciones trabajo-descanso', 'Mantén la hidratación y pausas activas'],
        suggestedModule: 'jukebox'
      },
      {
        minScore: 16, maxScore: 31, title: 'Agotamiento en Desarrollo', severity: 'moderate',
        description: 'Tus reservas se están drenando más rápido de lo que se llenan. Hay fatiga cognitiva y emocional clara. Es momento de poner límites firmes.',
        color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
        icon: 'battery_5_bar',
        recommendations: ['Crea un ritual de desconexión usando la respiración 5-5', 'Usa la Relajación Muscular Progresiva (PMR) al terminar tu jornada', 'Descansa sin pantallas al menos 1 hora antes de dormir'],
        suggestedModule: 'therapy'
      },
      {
        minScore: 32, maxScore: 48, title: 'Burnout Severo', severity: 'severe',
        description: 'Estás operando en números rojos. El nivel de desgaste requiere que tomes un respiro inmediato. El cuerpo se está forzando más allá de sus límites operativos seguros.',
        color: 'text-red-400 border-red-500/20 bg-red-500/10',
        icon: 'battery_alert',
        recommendations: ['Prioriza el sueño y descanso pasivo sobre cualquier otra cosa', 'Prueba el Suspiro Cíclico para resetear el sistema nervioso', 'Toma tiempo libre o delega urgentemente responsabilidades'],
        suggestedModule: 'zen'
      }
    ]
  },
  {
    id: 'body-scan',
    name: 'Mapa de Tensión Física',
    shortName: 'Tensión',
    description: 'El cuerpo guarda la cuenta de nuestro estrés. Escanearlo ayuda a encontrar dónde se esconde y permite soltarlo conscientemente.',
    icon: 'accessibility_new',
    questionCount: 10,
    estimatedMinutes: 2,
    maxScore: 30,
    scienceNote: 'Basado en principios de somatización. Reconocer dónde se acumula la tensión física es el paso previo a la regulación autonómica vagal.',
    questions: [
      { question: 'Cabeza y frente', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Mandíbula y cara', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Cuello y nuca', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Hombros', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Espalda alta y omóplatos', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Espalda baja (lumbar)', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Pecho', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Abdomen (estómago tenso)', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Manos y antebrazos', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'Piernas y pies', options: [{ text: 'Relajado', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] }
    ],
    categories: [
      {
        minScore: 0, maxScore: 7, title: 'Cuerpo Relajado', severity: 'low',
        description: 'Tus músculos están en un buen estado base. Estás permitiendo que tu cuerpo suelte el peso adecuadamente.',
        color: 'text-green-400 border-green-500/20 bg-green-500/10',
        icon: 'spa',
        recommendations: ['Mantén tu movilidad actual', 'Haz el Escáner Corporal para mantener esta conexión mente-cuerpo'],
        suggestedModule: 'zen'
      },
      {
        minScore: 8, maxScore: 15, title: 'Tensión Leve', severity: 'low',
        description: 'Empiezas a acumular rigidez en ciertas zonas protectoras (como hombros o mandíbula). El estrés se está reflejando de forma leve en tu postura.',
        color: 'text-lime-400 border-lime-500/20 bg-lime-500/10',
        icon: 'healing',
        recommendations: ['Realiza estiramientos suaves', 'Haz una sesión corta de Relajación Muscular Progresiva (PMR)'],
        suggestedModule: 'therapy'
      },
      {
        minScore: 16, maxScore: 22, title: 'Tensión Moderada', severity: 'moderate',
        description: 'Tu cuerpo se está tensando como mecanismo de defensa crónico, preparándose para una "amenaza" constante. Esta carga drena tu energía diaria.',
        color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
        icon: 'warning',
        recommendations: ['Prueba la respiración Ratio 2:1 para soltar tensión involuntaria', 'Usa la Relajación Muscular Progresiva completa', 'Toma un baño caliente'],
        suggestedModule: 'therapy'
      },
      {
        minScore: 23, maxScore: 30, title: 'Acorazamiento Fuerte', severity: 'high',
        description: 'Tu cuerpo está en un estado de protección o "acorazamiento" muscular severo. Esta tensión crónica aumenta tu percepción de dolor y fatiga, limitando tu bienestar físico.',
        color: 'text-red-400 border-red-500/20 bg-red-500/10',
        icon: 'airline_seat_flat',
        recommendations: ['Usa el Body Scan lentamente para observar, no para forzar relajación', 'Combina Relajación Muscular Progresiva con Respiración Coherente', 'Considera estiramientos o terapia física'],
        suggestedModule: 'zen'
      }
    ]
  },
  {
    id: 'sleep-check',
    name: 'Calidad del Sueño',
    shortName: 'Sueño',
    description: 'El sueño profundo es donde el cerebro repara el daño celular y procesa las emociones. Evalúa cómo está siendo tu descanso.',
    icon: 'bedtime',
    questionCount: 5,
    estimatedMinutes: 1,
    maxScore: 15,
    scienceNote: 'Basado en los componentes principales del Índice de Calidad de Sueño de Pittsburgh (PSQI), enfocándose en latencia, duración y disfunción diurna.',
    questions: [
      { question: '¿Cuánto tiempo sueles tardar en quedarte dormido/a?', options: [{ text: 'Menos de 15 min', points: 0 }, { text: '16 a 30 min', points: 1 }, { text: '31 a 60 min', points: 2 }, { text: 'Más de 1 hora', points: 3 }] },
      { question: '¿Con qué frecuencia te despiertas en medio de la noche o muy de madrugada?', options: [{ text: 'Nunca', points: 0 }, { text: 'Rara vez', points: 1 }, { text: 'A veces', points: 2 }, { text: 'Casi cada noche', points: 3 }] },
      { question: 'Al despertar por la mañana, ¿cómo de descansado/a y restaurado/a te sientes?', options: [{ text: 'Muy descansado', points: 0 }, { text: 'Aceptable', points: 1 }, { text: 'Cansado', points: 2 }, { text: 'Exhausto', points: 3 }] },
      { question: '¿Sientes somnolencia o falta de energía extrema durante tus actividades del día?', options: [{ text: 'No', points: 0 }, { text: 'Leve', points: 1 }, { text: 'Moderada', points: 2 }, { text: 'Intensa', points: 3 }] },
      { question: 'En general, ¿cómo calificarías la calidad de tu sueño últimamente?', options: [{ text: 'Muy buena', points: 0 }, { text: 'Buena', points: 1 }, { text: 'Mala', points: 2 }, { text: 'Muy mala', points: 3 }] }
    ],
    categories: [
      {
        minScore: 0, maxScore: 4, title: 'Buen Sueño', severity: 'low',
        description: 'Tus patrones de sueño son reparadores. Estás permitiendo a tu cerebro realizar su mantenimiento nocturno adecuadamente.',
        color: 'text-green-400 border-green-500/20 bg-green-500/10',
        icon: 'bedtime',
        recommendations: ['Mantén tu higiene de sueño actual', 'Usa sonidos de la Rochola si deseas profundizar aún más'],
        suggestedModule: 'jukebox'
      },
      {
        minScore: 5, maxScore: 8, title: 'Sueño Aceptable', severity: 'low',
        description: 'Duermes decentemente, aunque la profundidad o la latencia podrían mejorar para sentirte más restaurado.',
        color: 'text-lime-400 border-lime-500/20 bg-lime-500/10',
        icon: 'nightlight',
        recommendations: ['Prueba la respiración 4-7-8 antes de dormir', 'Evita pantallas 45 mins antes de acostarte'],
        suggestedModule: 'zen'
      },
      {
        minScore: 9, maxScore: 12, title: 'Sueño Deficiente', severity: 'moderate',
        description: 'Tu sueño se está interrumpiendo o no está siendo restaurador. El estrés diurno podría estar saboteando tus fases de sueño profundo (NREM).',
        color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
        icon: 'warning',
        recommendations: ['Realiza el protocolo Sueño Profundo antes de ir a la cama', 'No uses la cama para trabajar o preocuparte', 'Aplica un escáner corporal en la cama'],
        suggestedModule: 'zen'
      },
      {
        minScore: 13, maxScore: 15, title: 'Sueño Problemático', severity: 'high',
        description: 'Estás sufriendo carencias severas de sueño reparador. Esto amplifica la ansiedad al día siguiente y agota tu capacidad de regular tus emociones.',
        color: 'text-red-400 border-red-500/20 bg-red-500/10',
        icon: 'emergency',
        recommendations: ['Prueba usar ruido marrón (Rochola) en bajo volumen toda la noche', 'Si despiertas, levántate, no des vueltas en la cama', 'Realiza la visualización guiada para apagar pensamientos en bucle'],
        suggestedModule: 'therapy'
      }
    ]
  }
];
