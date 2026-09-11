import { useMemo, useState } from 'react';
import { getDayPlan } from '../data/curriculum';
import { getCertificationPool, type QuizResult } from '../progressEngine';
import { sampleQuestions } from '../quizSampling';
import { CERTIFICATION_QUESTION_COUNT, PASS_THRESHOLD_PERCENT } from '../types';
import type { PracticalCaseAnswer, PracticalCaseResult, ProgressState, QuizQuestion } from '../types';
import { PracticalCase } from './PracticalCase';
import { Quiz } from './Quiz';

interface CertificationViewProps {
  progress: ProgressState;
  onSubmitTheory: (questions: QuizQuestion[], answers: number[]) => QuizResult;
  onSubmitPractical: (answer: PracticalCaseAnswer) => PracticalCaseResult;
}

export function CertificationView({ progress, onSubmitTheory, onSubmitPractical }: CertificationViewProps) {
  const cert = progress.certification;
  const [lastTheoryResult, setLastTheoryResult] = useState<QuizResult | null>(null);
  const theoryAttemptNumber = cert.theoryAttempts.length;

  const pool = useMemo(() => getCertificationPool(), []);
  // Re-sampled on every render; only the value read at mount time (tied to
  // the `key={theoryAttemptNumber}` below) actually matters, so a fresh
  // random sample is picked for each new attempt without extra memoization.
  const attemptQuestions = sampleQuestions(pool, CERTIFICATION_QUESTION_COUNT);

  const bestTheoryScore = [...cert.theoryAttempts].reverse().find((a) => a.passed)?.scorePercent;

  const handleTheorySubmit = (answers: number[], shuffledQuestions: QuizQuestion[]) => {
    const result = onSubmitTheory(shuffledQuestions, answers);
    setLastTheoryResult(result);
  };

  return (
    <article className="day-view">
      <header className="day-view__header">
        <span className={`status-pill ${cert.completed ? 'status-pill--success' : 'status-pill--neutral'}`}>
          {cert.completed ? '✓ Сертификация пройдена' : 'Финальная сертификация'}
        </span>
        <h2 className="day-view__title">Финальная сертификация</h2>
        <p className="day-view__objective">
          Чтобы завершить программу, нужно набрать {PASS_THRESHOLD_PERCENT}% и выше в тесте из{' '}
          {CERTIFICATION_QUESTION_COUNT} вопросов по всему курсу, а затем успешно решить практический кейс по
          вымышленной кампании.
        </p>
      </header>

      {cert.completed && (
        <div className="banner banner--success" role="status">
          <p>🎉 Поздравляем! Программа обучения полностью завершена — теория и практический кейс пройдены.</p>
        </div>
      )}

      <section aria-labelledby="cert-theory-heading">
        <div className="section-heading">
          <h3 id="cert-theory-heading">Теоретическая часть ({CERTIFICATION_QUESTION_COUNT} вопросов)</h3>
        </div>

        {cert.theoryPassed ? (
          <p className="day-view__quiz-status">Теория пройдена. Лучший результат: {bestTheoryScore}%.</p>
        ) : (
          <>
            {lastTheoryResult && !lastTheoryResult.passed && (
              <div className="banner banner--warning" role="alert">
                <p>
                  Результат: <strong>{lastTheoryResult.scorePercent}%</strong> ({lastTheoryResult.correctCount} из{' '}
                  {lastTheoryResult.totalQuestions}). Нужно {PASS_THRESHOLD_PERCENT}% и выше.
                </p>
                {lastTheoryResult.weakDays.length > 0 && (
                  <div>
                    <p>Слабые темы — рекомендуем повторить:</p>
                    <ul>
                      {lastTheoryResult.weakDays.map((day) => (
                        <li key={day}>
                          День {day}: {getDayPlan(day)?.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p>Новая попытка сформирует новый набор вопросов из всего курса.</p>
              </div>
            )}
            <Quiz
              questions={attemptQuestions}
              onSubmit={handleTheorySubmit}
              ariaLabel="Тест финальной сертификации"
              key={theoryAttemptNumber}
            />
          </>
        )}
      </section>

      {cert.theoryPassed && (
        <section aria-labelledby="cert-practical-heading">
          <div className="section-heading">
            <h3 id="cert-practical-heading">Практический кейс</h3>
          </div>
          <PracticalCase passed={cert.practicalPassed} onSubmit={onSubmitPractical} />
        </section>
      )}
    </article>
  );
}
