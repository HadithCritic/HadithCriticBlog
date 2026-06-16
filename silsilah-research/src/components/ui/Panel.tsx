import type { PropsWithChildren, ReactNode } from 'react';

interface PanelProps extends PropsWithChildren {
  title?: string;
  actions?: ReactNode;
  className?: string;
}

export function Panel({ title, actions, className = '', children }: PanelProps) {
  return (
    <section className={`sr-panel-card ${className}`}>
      {title || actions ? (
        <header className="sr-panel-card__header">
          {title ? <h2>{title}</h2> : <span />}
          {actions}
        </header>
      ) : null}
      <div className="sr-panel-card__body">{children}</div>
    </section>
  );
}
