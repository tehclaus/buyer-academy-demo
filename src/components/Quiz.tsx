import { useState } from 'react';
import type { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  onSubmit: (answers: number[]) => void;
}

export function Quiz({ questions, onSubmit }: QuizProps) {
  const [answers, setAnswers] = useState<Array<number | null>>(() => questions.map(() => null));

  const allAnswered = answers.every((a) => a !== null);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    onSubmit(answers as number[]);
  };

  return (
    <div className="quiz" aria-label="Тест по материалам дня">
      <ol className="quiz__list">
        {questions.map((q, qIndex) => (
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
          Ответьте на все {questions.length} вопросов, чтобы отправить тест.
        </p>
      )}
    </div>
  );
}
