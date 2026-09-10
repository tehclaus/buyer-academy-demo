import { useState } from 'react';
import { DayNav } from './components/DayNav';
import { DayView } from './components/DayView';
import { Header } from './components/Header';
import { StatusSummary } from './components/StatusSummary';
import { getDayPlan, getModuleForDay } from './data/curriculum';
import { useProgress } from './hooks/useProgress';
import { computeStatusSummary } from './progressEngine';
import './App.css';

const DEMO_ANCHOR_DAY = 8;

function App() {
  const { state, markVideoWatched, submitQuiz, loadDemoState, resetProgress } = useProgress();
  const [viewedDay, setViewedDay] = useState<number>(state.unlockedDay);

  const handleLoadDemo = () => {
    loadDemoState();
    setViewedDay(DEMO_ANCHOR_DAY);
  };

  const handleReset = () => {
    resetProgress();
    setViewedDay(1);
  };

  const dayPlan = getDayPlan(viewedDay);
  const moduleTitle = getModuleForDay(viewedDay)?.title ?? '';
  const summary = computeStatusSummary(state);

  return (
    <div className="app-shell">
      <Header employeeName={state.employeeName} onLoadDemo={handleLoadDemo} onReset={handleReset} />
      <StatusSummary summary={summary} />
      <div className="app-layout">
        <DayNav progress={state} viewedDay={viewedDay} onSelectDay={setViewedDay} />
        <main className="app-main">
          {dayPlan && (
            <DayView
              key={dayPlan.day}
              dayPlan={dayPlan}
              moduleTitle={moduleTitle}
              progress={state}
              onToggleVideo={(videoId, watched) => markVideoWatched(viewedDay, videoId, watched)}
              onSubmitQuiz={submitQuiz}
              onGoToDay={setViewedDay}
            />
          )}
        </main>
      </div>
      <footer className="app-footer">
        Демо-проект Buyer Academy. Все сотрудники, учебные материалы, видео и результаты — вымышленные данные,
        созданные исключительно для демонстрации продукта.
      </footer>
    </div>
  );
}

export default App;
