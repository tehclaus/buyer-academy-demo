import { CURRICULUM, MODULES } from '../data/curriculum';
import type { ProgressState } from '../types';
import { isDayCompleted, isDayUnlocked } from '../progressEngine';

interface DayNavProps {
  progress: ProgressState;
  viewedDay: number;
  onSelectDay: (day: number) => void;
}

export function DayNav({ progress, viewedDay, onSelectDay }: DayNavProps) {
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
                const isViewed = d.day === viewedDay;

                let stateLabel = 'заблокирован';
                if (completed) stateLabel = 'завершён';
                else if (isActive) stateLabel = 'текущий';

                return (
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
                      onClick={() => onSelectDay(d.day)}
                    >
                      <span className="day-nav__item-day">День {d.day}</span>
                      <span className="day-nav__item-title">{d.title}</span>
                      <span className="day-nav__item-state">
                        {completed ? '✓ Завершён' : unlocked ? stateLabel : '🔒 Заблокирован'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
