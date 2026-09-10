import { DemoControls } from './DemoControls';

interface HeaderProps {
  employeeName: string;
  onLoadDemo: () => void;
  onReset: () => void;
}

export function Header({ employeeName, onLoadDemo, onReset }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__identity">
        <span className="app-header__logo" aria-hidden="true">
          BA
        </span>
        <div>
          <h1 className="app-header__title">Buyer Academy</h1>
          <p className="app-header__subtitle">
            Тренажёр 20-дневной адаптации junior media buyer · сотрудник:{' '}
            <strong>{employeeName}</strong>
          </p>
        </div>
      </div>
      <DemoControls onLoadDemo={onLoadDemo} onReset={onReset} />
    </header>
  );
}
