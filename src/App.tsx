import { useState, type ReactNode } from 'react';
import { CertificationView } from './components/CertificationView';
import { CheckpointView } from './components/CheckpointView';
import { DayNav } from './components/DayNav';
import { DayView } from './components/DayView';
import { Header } from './components/Header';
import { StatusSummary } from './components/StatusSummary';
import { getDayPlan, getModuleForDay } from './data/curriculum';
import { useProgress } from './hooks/useProgress';
import { computeStatusSummary, getActiveItem, type ActiveItem } from './progressEngine';
import './App.css';

const DEMO_ANCHOR_DAY = 8;

function App() {
  const {
    state,
    markVideoWatched,
    submitDayQuiz,
    submitCheckpoint,
    submitCertificationTheory,
    submitPracticalCase,
    loadDemoState,
    resetProgress,
  } = useProgress();
  const [viewedTarget, setViewedTarget] = useState<ActiveItem>(() => getActiveItem(state));

  const handleLoadDemo = () => {
    loadDemoState();
    setViewedTarget({ type: 'day', day: DEMO_ANCHOR_DAY });
  };

  const handleReset = () => {
    resetProgress();
    setViewedTarget({ type: 'day', day: 1 });
  };

  const summary = computeStatusSummary(state);

  let content: ReactNode = null;
  if (viewedTarget.type === 'day') {
    const dayPlan = getDayPlan(viewedTarget.day);
    const moduleTitle = getModuleForDay(viewedTarget.day)?.title ?? '';
    if (dayPlan) {
      content = (
        <DayView
          key={dayPlan.day}
          dayPlan={dayPlan}
          moduleTitle={moduleTitle}
          progress={state}
          onToggleVideo={(videoId, watched) => markVideoWatched(dayPlan.day, videoId, watched)}
          onSubmitQuiz={submitDayQuiz}
          onNavigate={setViewedTarget}
        />
      );
    }
  } else if (viewedTarget.type === 'checkpoint') {
    content = (
      <CheckpointView
        key={`checkpoint-${viewedTarget.anchorDay}`}
        anchorDay={viewedTarget.anchorDay}
        progress={state}
        onSubmitCheckpoint={submitCheckpoint}
        onNavigate={setViewedTarget}
      />
    );
  } else if (viewedTarget.type === 'certification') {
    content = (
      <CertificationView progress={state} onSubmitTheory={submitCertificationTheory} onSubmitPractical={submitPracticalCase} />
    );
  } else {
    content = (
      <article className="day-view">
        <header className="day-view__header">
          <span className="status-pill status-pill--success">✓ Программа завершена</span>
          <h2 className="day-view__title">Обучение полностью завершено</h2>
          <p className="day-view__objective">
            Все 20 дней, три контрольные недели и финальная сертификация (теория и практический кейс) успешно
            пройдены. Поздравляем!
          </p>
        </header>
      </article>
    );
  }

  return (
    <div className="app-shell">
      <Header employeeName={state.employeeName} onLoadDemo={handleLoadDemo} onReset={handleReset} />
      <StatusSummary summary={summary} />
      <div className="app-layout">
        <DayNav progress={state} viewedTarget={viewedTarget} onSelect={setViewedTarget} />
        <main className="app-main">{content}</main>
      </div>
      <footer className="app-footer">
        Демо-проект Buyer Academy. Все сотрудники, учебные материалы, видео и результаты — вымышленные данные,
        созданные исключительно для демонстрации продукта.
      </footer>
    </div>
  );
}

export default App;
