import { CURRICULUM, MODULES } from '../data/curriculum';
import {
  isCheckpointCompleted,
  isDayCompleted,
  isDayUnlocked,
  type ActiveItem,
} from '../progressEngine';
import { CERTIFICATION_DAY, isCheckpointAnchorDay } from '../types';
import type { ProgressState } from '../types';

interface DayNavProps {
  progress: ProgressState;
  viewedTarget: ActiveItem;
  onSelect: (target: ActiveItem) => void;
}

function isSameTarget(a: ActiveItem, b: ActiveItem): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'day' && b.type === 'day') return a.day === b.day;
  if (a.type === 'checkpoint' && b.type === 'checkpoint') return a.anchorDay === b.anchorDay;
  return true;
}

export function DayNav({ progress, viewedTarget, onSelect }: DayNavProps) {
  return (
    <nav className="day-nav" aria-label="Навигация по дням программы">
      {MODULES.map((module) => {
        const days = CURRICULUM.filter((d) => d.moduleId === module.id);
        return (
          <div className="day-nav__module" key={module.id}>
            <h2 className="day-nav__module-title">
              Модуль {module.id}. {module.title}
            </h2>
            <ul className="day-nav__list">
              {days.map((d) => {
                const unlocked = isDayUnlocked(progress, d.day);
                const completed = isDayCompleted(progress, d.day);
                const isActive = d.day === progress.unlockedDay;
                const dayTarget: ActiveItem = { type: 'day', day: d.day };
                const isViewed = isSameTarget(viewedTarget, dayTarget);

                let stateLabel = 'заблокирован';
                if (completed) stateLabel = 'завершён';
                else if (isActive) stateLabel = 'текущий';

                const dayItem = (
                  <li key={d.day}>
                    <button
                      type="button"
                      className={[
                        'day-nav__item',
                        completed && 'day-nav__item--completed',
                        isActive && !completed && 'day-nav__item--active',
                        isViewed && 'day-nav__item--viewed',
                        !unlocked && 'day-nav__item--locked',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={!unlocked}
                      aria-current={isViewed ? 'true' : undefined}
                      onClick={() => onSelect(dayTarget)}
                    >
                      <span className="day-nav__item-day">День {d.day}</span>
                      <span className="day-nav__item-title">{d.title}</span>
                      <span className="day-nav__item-state">
                        {completed ? '✓ Завершён' : unlocked ? stateLabel : '🔒 Заблокирован'}
                      </span>
                    </button>
                  </li>
                );

                if (!isCheckpointAnchorDay(d.day)) {
                  return dayItem;
                }

                const checkpointCompleted = isCheckpointCompleted(progress, d.day);
                const checkpointUnlocked = completed;
                const checkpointTarget: ActiveItem = { type: 'checkpoint', anchorDay: d.day };
                const isCheckpointViewed = isSameTarget(viewedTarget, checkpointTarget);

                return [
                  dayItem,
                  <li key={`checkpoint-${d.day}`}>
                      <button
                        type="button"
                        className={[
                          'day-nav__item',
                          'day-nav__item--checkpoint',
                          checkpointCompleted && 'day-nav__item--completed',
                          isCheckpointViewed && 'day-nav__item--viewed',
                          !checkpointUnlocked && 'day-nav__item--locked',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        disabled={!checkpointUnlocked}
                        aria-current={isCheckpointViewed ? 'true' : undefined}
                        onClick={() => onSelect(checkpointTarget)}
                      >
                        <span className="day-nav__item-day">Контрольная неделя</span>
                        <span className="day-nav__item-title">Дни {d.day - 4}–{d.day}</span>
                        <span className="day-nav__item-state">
                          {checkpointCompleted ? '✓ Пройдена' : checkpointUnlocked ? 'Требуется' : '🔒 Заблокирована'}
                        </span>
                      </button>
                    </li>,
                ];
              })}
            </ul>
          </div>
        );
      })}

      <div className="day-nav__module">
        <h2 className="day-nav__module-title">Итог программы</h2>
        <ul className="day-nav__list">
          {(() => {
            const certUnlocked = isDayCompleted(progress, CERTIFICATION_DAY);
            const certCompleted = progress.certification.completed;
            const certTarget: ActiveItem = { type: 'certification' };
            const isCertViewed = isSameTarget(viewedTarget, certTarget);
            return (
              <li>
                <button
                  type="button"
                  className={[
                    'day-nav__item',
                    'day-nav__item--checkpoint',
                    certCompleted && 'day-nav__item--completed',
                    isCertViewed && 'day-nav__item--viewed',
                    !certUnlocked && 'day-nav__item--locked',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!certUnlocked}
                  aria-current={isCertViewed ? 'true' : undefined}
                  onClick={() => onSelect(certTarget)}
                >
                  <span className="day-nav__item-day">Финальная сертификация</span>
                  <span className="day-nav__item-title">Теория (40 вопросов) + практический кейс</span>
                  <span className="day-nav__item-state">
                    {certCompleted ? '✓ Пройдена' : certUnlocked ? 'Требуется' : '🔒 Заблокирована'}
                  </span>
                </button>
              </li>
            );
          })()}
        </ul>
      </div>
    </nav>
  );
}
