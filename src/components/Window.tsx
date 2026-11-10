import { useId } from 'react';
import type { ReactNode } from 'react';

interface WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  role?: 'alert';
}

export function Window({ title, children, className = '', role }: WindowProps) {
  const titleId = useId();

  return (
    <section className={`window ${className}`.trim()} aria-labelledby={titleId} role={role}>
      <div className="window-titlebar">
        <h2 id={titleId} className="window-title">
          {title}
        </h2>
        <div className="window-controls" aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </div>
      </div>
      <div className="window-body">{children}</div>
    </section>
  );
}
