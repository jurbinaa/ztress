import React, { useState } from 'react';
import stressQuestions from '../../data/stressTest.json';
import { useZenStore } from '../../store/useZenStore';
import { motion, AnimatePresence } from 'framer-motion';

const BURNOUT_QUESTIONS = [
  {
    question: "¿Con qué frecuencia te sientes emocionalmente agotado por tus responsabilidades diarias?",
    options: [
      { text: "Nunca", points: 0 },
      { text: "Rara vez", points: 1 },
      { text: "A veces", points: 2 },
      { text: "Frecuentemente", points: 3 },
      { text: "Casi siempre", points: 4 }
    ]
  },
  {
    question: "¿Sientes que te has vuelto más apático, cínico o distante con las personas a tu alrededor?",
    options: [
      { text: "Nunca", points: 0 },
      { text: "Rara vez", points: 1 },
      { text: "A veces", points: 2 },
      { text: "Frecuentemente", points: 3 },
      { text: "Casi siempre", points: 4 }
    ]
  },
  {
    question: "¿Sientes falta de energía o cansancio extremo al levantarte por las mañanas?",
    options: [
      { text: "Nunca", points: 0 },
      { text: "Rara vez", points: 1 },
      { text: "A veces", points: 2 },
      { text: "Frecuentemente", points: 3 },
      { text: "Casi siempre", points: 4 }
    ]
  },
  {
    question: "¿Te cuesta concentrarte o sientes que tu productividad y motivación han caído significativamente?",
    options: [
      { text: "Nunca", points: 0 },
      { text: "Rara vez", points: 1 },
      { text: "A veces", points: 2 },
      { text: "Frecuentemente", points: 3 },
      { text: "Casi siempre", points: 4 }
    ]
  },
  {
    question: "¿Sientes frustración, ineficacia o falta de sentido en tus logros o tareas diarias?",
    options: [
      { text: "Nunca", points: 0 },
      { text: "Rara vez", points: 1 },
      { text: "A veces", points: 2 },
      { text: "Frecuentemente", points: 3 },
      { text: "Casi siempre", points: 4 }
    ]
  }
];

export const TestCard: React.FC = () => {
  const { moodHistory, addMoodRecord } = useZenStore();
  const [selectedTest, setSelectedTest] = useState<'stress' | 'burnout' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1: Intro screen
  const [answers, setAnswers] = useState<number[]>([]);

  const questions = selectedTest === 'stress' ? stressQuestions : BURNOUT_QUESTIONS;

  const handleStart = (type: 'stress' | 'burnout') => {
    setSelectedTest(type);
    setCurrentIndex(0);
    setAnswers([]);
  };

  const handleSelectOption = (points: number) => {
    const updatedAnswers = [...answers, points];
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score
      const totalScore = updatedAnswers.reduce((a, b) => a + b, 0);
      if (selectedTest) {
        addMoodRecord(totalScore, selectedTest);
      }
      setCurrentIndex(questions.length); // Results screen
    }
  };

  const restartTest = () => {
    setSelectedTest(null);
    setCurrentIndex(-1);
    setAnswers([]);
  };

  const currentQuestion = questions[currentIndex];

  const getStressVerdict = (score: number) => {
    if (score <= 6) {
      return {
        title: 'Estrés Bajo (Estado Calmo)',
        description: 'Tus niveles de estrés son saludables en este momento. Mantente cuidando tus espacios de ocio y disfrute.',
        tips: ['Sigue practicando hábitos de descanso activo.', 'Haz un ejercicio de respiración rápido para mantenerte centrado.', 'Disfruta de tu música preferida en la Rochola.'],
        color: 'text-green-400 border-green-500/10 bg-green-500/5'
      };
    } else if (score <= 13) {
      return {
        title: 'Estrés Moderado (Alerta Temprana)',
        description: 'Tienes algo de tensión acumulada en tus hombros y mente. Es momento de hacer pausas conscientes hoy.',
        tips: ['Toma 3 minutos de Respiración 4-7-8.', 'Bebe un vaso de agua lejos del ordenador.', 'Pon sonidos de lluvia en la Rochola.'],
        color: 'text-yellow-400 border-yellow-500/10 bg-yellow-500/5'
      };
    } else {
      return {
        title: 'Estrés Alto (Necesitas Detenerte)',
        description: 'Tus niveles de alerta y tensión son elevados. Te recomendamos tomar un respiro inmediato y estirar tu cuerpo.',
        tips: ['Prueba un Escáner Corporal para soltar la tensión física.', 'Usa la Respiración de Caja para estabilizar tu ritmo.', 'Minimiza notificaciones y descansa tus ojos.'],
        color: 'text-red-400 border-red-500/10 bg-red-500/5'
      };
    }
  };

  const getBurnoutVerdict = (score: number) => {
    if (score <= 6) {
      return {
        title: 'Burnout Bajo (Energía Equilibrada)',
        description: 'Tu relación con el trabajo y tus tareas diarias es balanceada. Sigues manteniendo recargas adecuadas de energía.',
        tips: ['Mantén tus límites claros entre trabajo y descanso.', 'Dedica tiempo a tus hobbies favoritos.', 'Haz pausas de desconexión breves.'],
        color: 'text-green-400 border-green-500/10 bg-green-500/5'
      };
    } else if (score <= 13) {
      return {
        title: 'Desgaste Moderado (Riesgo Activo)',
        description: 'Tu batería social y mental se está agotando. Sientes cansancio acumulado que el descanso normal no parece aliviar.',
        tips: ['Dedica al menos un día al descanso sin expectativas.', 'Aprende a decir no a tareas no esenciales.', 'Busca espacios de meditación silenciosos.'],
        color: 'text-yellow-400 border-yellow-500/10 bg-yellow-500/5'
      };
    } else {
      return {
        title: 'Burnout Alto (Desgaste Severo)',
        description: 'Has llegado a un estado de agotamiento profundo y cinismo protector. Es urgente reevaluar tus cargas de trabajo.',
        tips: ['Pide ayuda a tu círculo de confianza o profesionales.', 'Establece límites drásticos de comunicación fuera de horario.', 'Prioriza tu bienestar físico y el descanso diario absoluto.'],
        color: 'text-red-400 border-red-500/10 bg-red-500/5'
      };
    }
  };

  const finalScore = answers.reduce((a, b) => a + b, 0);
  const verdict = selectedTest === 'stress' ? getStressVerdict(finalScore) : getBurnoutVerdict(finalScore);

  // Filter history to current test type
  const currentHistory = moodHistory.filter((h) => h.testType === selectedTest);

  return (
    <section className="w-full flex flex-col gap-6 text-left">
      <AnimatePresence mode="wait">
        {currentIndex === -1 ? (
          /* Selection / Intro Screen */
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <span className="font-body text-xs text-primary uppercase tracking-widest font-semibold">
                Evaluación Local
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-on-surface font-semibold">
                Test de Carga Mental
              </h2>
            </div>
            
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Mide tu nivel de sobrecarga actual a través de cuestionarios breves y anónimos de 1 minuto. Cero almacenamiento en la nube; tus resultados se quedan 100% en tu navegador.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {/* Test 1 Card */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between gap-4 border border-white/5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-base font-semibold text-on-surface">1. ¿Mi estrés hoy?</h3>
                  <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed">
                    Escala abreviada de estrés percibido. Mide tu respuesta cognitiva y física al estrés cotidiano en los últimos días.
                  </p>
                </div>
                <button
                  onClick={() => handleStart('stress')}
                  className="bg-white/5 hover:bg-white/10 text-primary border border-primary/20 font-body text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full text-center transition-colors cursor-pointer active-scale"
                >
                  Iniciar Test
                </button>
              </div>

              {/* Test 2 Card */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between gap-4 border border-white/5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-base font-semibold text-on-surface">2. ¿Burnout Check?</h3>
                  <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed">
                    Mide el desgaste emocional, despersonalización y desmotivación causados por sobrecargas prolongadas.
                  </p>
                </div>
                <button
                  onClick={() => handleStart('burnout')}
                  className="bg-white/5 hover:bg-white/10 text-primary border border-primary/20 font-body text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full text-center transition-colors cursor-pointer active-scale"
                >
                  Iniciar Test
                </button>
              </div>
            </div>
          </motion.div>
        ) : currentIndex >= 0 && currentIndex < questions.length ? (
          /* Question View */
          <motion.div
            key={`${selectedTest}-${currentIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-4"
          >
            {/* Progress bar */}
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5 mb-2">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <span className="font-body text-[10px] text-primary uppercase tracking-widest font-semibold">
              Pregunta {currentIndex + 1} de {questions.length} • {selectedTest === 'stress' ? 'Estrés' : 'Burnout'}
            </span>
            <h3 className="font-display text-lg md:text-xl font-medium text-on-surface leading-snug">
              {currentQuestion.question}
            </h3>

            <div className="flex flex-col gap-2 mt-2">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt.points)}
                  className="w-full text-left p-4 rounded-2xl glass-card hover:bg-white/5 border border-white/5 hover:border-white/10 text-on-surface-variant hover:text-on-surface transition-all duration-200 active-scale"
                >
                  <span className="font-body text-xs font-medium">{opt.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Results view */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex flex-col gap-0.5">
                <span className="font-body text-[10px] text-primary uppercase tracking-widest font-bold">
                  Resultado de Evaluación
                </span>
                <h3 className="font-display text-xl font-semibold text-on-surface">
                  {selectedTest === 'stress' ? 'Nivel de Estrés' : 'Índice de Burnout'}
                </h3>
              </div>
              <button
                onClick={restartTest}
                className="flex items-center justify-center p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer active-scale"
                title="Volver a evaluaciones"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className={`p-5 rounded-2xl border ${verdict.color} space-y-2`}>
              <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold">
                <span>Dictamen</span>
                <span>Puntaje: {finalScore} / {questions.length * 4}</span>
              </div>
              <h4 className="font-display text-lg font-bold">{verdict.title}</h4>
              <p className="font-body text-sm leading-relaxed text-on-surface/90 font-light">
                {verdict.description}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="font-body text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
                Recomendaciones prácticas
              </h5>
              <ul className="space-y-2.5">
                {verdict.tips.map((tip, i) => (
                  <li key={i} className="font-body text-xs text-on-surface-variant flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Historical feedback */}
            {currentHistory.length > 1 && (
              <div className="mt-2 p-3.5 rounded-2xl border border-white/5 bg-white/3 flex items-center justify-between text-xs text-on-surface-variant/70">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">bar_chart</span>
                  <span>Historial: {currentHistory.length} evaluaciones guardadas localmente.</span>
                </div>
                <span className="text-[10px] text-on-surface-variant/50">
                  Previo: {currentHistory[currentHistory.length - 2]?.score || 0} pts
                </span>
              </div>
            )}

            <button
              onClick={restartTest}
              className="mt-2 bg-primary text-on-primary font-body text-xs px-6 py-3.5 rounded-full hover:bg-primary/90 transition-colors uppercase tracking-wider font-semibold cursor-pointer w-full text-center active-scale"
            >
              Finalizar y Regresar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
