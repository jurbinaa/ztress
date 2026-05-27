import React, { useState, useRef } from 'react';
import { useZenStore } from '../../store/useZenStore';
import { TEST_INSTRUMENTS } from '../../data/testInstruments';
import type { TestInstrument } from '../../data/testInstruments';
import { m } from 'framer-motion';

export const TestCard: React.FC = () => {
  const { addMoodRecord, setActiveTab } = useZenStore();
  const [selectedTest, setSelectedTest] = useState<TestInstrument | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const answersRef = useRef<number[]>([]);
  const [resultScore, setResultScore] = useState<number | null>(null);

  const handleTestSelect = (test: TestInstrument) => {
    setSelectedTest(test);
    setCurrentQuestionIdx(0);
    answersRef.current = [];
    setResultScore(null);
  };

  const handleAnswer = (points: number) => {
    const newAnswers = [...answersRef.current, points];
    answersRef.current = newAnswers;
    
    if (currentQuestionIdx < selectedTest!.questions.length - 1) {
      setCurrentQuestionIdx(c => c + 1);
    } else {
      const score = newAnswers.reduce((a, b) => a + b, 0);
      setResultScore(score);
      addMoodRecord(score, selectedTest!.id);
    }
  };

  if (resultScore !== null && selectedTest) {
    const category = selectedTest.categories.find(c => resultScore >= c.minScore && resultScore <= c.maxScore) || selectedTest.categories[0];
    
    return (
      <m.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full p-4 text-center"
      >
        <div className={`size-20 rounded-full flex items-center justify-center mb-6 bg-background border ${category.color.split(' ')[1]}`}>
          <span className={`material-symbols-outlined text-[40px] ${category.color.split(' ')[0]}`}>
            {category.icon}
          </span>
        </div>
        
        <h2 className="font-display text-2xl text-on-surface mb-2">{category.title}</h2>
        <div className="font-display text-5xl mb-6 text-on-surface-variant font-light tabular-nums">
          {resultScore} <span className="text-xl">/ {selectedTest.maxScore}</span>
        </div>
        
        <p className="font-body text-sm text-on-surface-variant mb-8 max-w-md">
          {category.description}
        </p>

        <div className="w-full max-w-sm bg-white/5 rounded-3xl p-6 mb-8 text-left">
          <h3 className="font-body text-sm font-semibold text-on-surface mb-4 uppercase tracking-wider">Recomendaciones</h3>
          <ul className="space-y-3">
            {category.recommendations.map((rec) => (
              <li key={rec} className="flex gap-3 text-sm text-on-surface-variant">
                <span className={`material-symbols-outlined text-[18px] ${category.color.split(' ')[0]}`}>check_circle</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab(category.suggestedModule as any)}
            className="px-6 py-3 rounded-full bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors"
          >
            Ir a sugerencia
          </button>
          <button
            type="button"
            onClick={() => setSelectedTest(null)}
            className="px-6 py-3 rounded-full bg-white/5 text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            Volver a Tests
          </button>
        </div>
      </m.div>
    );
  }

  if (selectedTest) {
    const question = selectedTest.questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx) / selectedTest.questions.length) * 100;
    
    return (
      <div className="flex flex-col h-full relative p-4">
        <button type="button" onClick={() => setSelectedTest(null)} className="absolute top-0 right-0 p-2 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="w-full h-1 bg-white/10 rounded-full mt-2 mb-8 overflow-hidden">
          <m.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <span className="text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Pregunta {currentQuestionIdx + 1} de {selectedTest.questions.length}
          </span>
          <h3 className="font-display text-2xl text-on-surface mb-8 leading-tight">
            {question.question}
          </h3>

          <div className="flex flex-col gap-3">
            {question.options.map((opt, i) => (
              <m.button
                key={opt.text}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleAnswer(opt.points)}
                className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/[0.05] hover:border-white/[0.15] text-on-surface-variant hover:text-on-surface transition-all active-scale"
              >
                {opt.text}
              </m.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar p-2 -mx-2 min-h-[440px]">
      <div className="mb-6 px-2">
        <h2 className="font-display text-2xl text-on-surface mb-2">Evaluaciones</h2>
        <p className="font-body text-sm text-on-surface-variant">
          Instrumentos validados para entender mejor tu estado actual.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        {TEST_INSTRUMENTS.map((test, i) => (
          <m.button
            key={test.id}
            type="button"
            onClick={() => handleTestSelect(test)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full text-left p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-start gap-4 group"
          >
            <div className="size-12 rounded-full flex items-center justify-center bg-primary/20 shrink-0">
              <span className="material-symbols-outlined text-primary">{test.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-display text-lg text-on-surface">{test.name}</h3>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">timer</span> {test.estimatedMinutes}m
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant/80 mb-3">
                {test.description}
              </p>
              <p className="font-body text-[10px] text-on-surface-variant/50 border-t border-white/5 pt-2">
                {test.scienceNote}
              </p>
            </div>
          </m.button>
        ))}
      </div>
    </div>
  );
};
