import { useState } from 'react';
import { prepareAttempt } from '../quizSampling';
import type { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  /** Called with the learner's answers and the exact (shuffled) question set they were shown, so the caller can score correctly. */
  onSubmit: (answers: number[], shuffledQuestions: QuizQuestion[]) => void;
  ariaLabel?: string;
}

export function Quiz({ questions, onSubmit, ariaLabel = 'Тест по материалам дня' }: QuizProps) {
  // Randomized once per mount (i.e. once per attempt — parents remount this
  // component via `key` between attempts so order reshuffles every time).
  const [shuffledQuestions] = useState<QuizQuestion[]>(() => prepareAttempt(questions));
  const [answers, setAnswers] = useState<Array<number | null>>(() => shuffledQuestions.map(() => null));

  const allAnswered = answers.every((a) => a !== null);
  const answeredCount = answers.filter((a) => a !== null).length;

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    onSubmit(answers as number[], shuffledQuestions);
  };

  return (
    <div className="quiz" aria-label={ariaLabel}>
      <ol className="quiz__list">
        {shuffledQuestions.map((q, qIndex) => (
          <li key={q.id} className="quiz__question">
            <fieldset>
              <legend className="quiz__question-text">
                {qIndex + 1}. {q.question}
              </legend>
              <div className="quiz__options">
                {q.options.map((option, optIndex) => {
                  const inputId = `${q.id}-opt${optIndex}`;
                  return (
                    <label key={inputId} htmlFor={inputId} className="quiz__option">
                      <input
                        type="radio"
                        id={inputId}
                        name={q.id}
                        checked={answers[qIndex] === optIndex}
                        onChange={() => handleSelect(qIndex, optIndex)}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-primary" disabled={!allAnswered} onClick={handleSubmit}>
        Отправить ответы
      </button>
      {!allAnswered && (
        <p className="quiz__hint" role="status">
          Отвечено {answeredCount} из {shuffledQuestions.length}. Ответьте на все вопросы, чтобы отправить тест.
        </p>
      )}
    </div>
  );
}
