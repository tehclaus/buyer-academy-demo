interface DemoControlsProps {
  onLoadDemo: () => void;
  onReset: () => void;
}

export function DemoControls({ onLoadDemo, onReset }: DemoControlsProps) {
  const handleReset = () => {
    if (window.confirm('Сбросить весь прогресс обучения и начать заново с 1 дня?')) {
      onReset();
    }
  };

  return (
    <div className="demo-controls" role="group" aria-label="Демо-управление">
      <button type="button" className="btn btn-secondary" onClick={onLoadDemo}>
        Загрузить демо-состояние
      </button>
      <button type="button" className="btn btn-ghost" onClick={handleReset}>
        Сбросить прогресс
      </button>
    </div>
  );
}
