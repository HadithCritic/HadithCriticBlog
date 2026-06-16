import type { PropsWithChildren, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps extends PropsWithChildren {
  title: string;
  open: boolean;
  footer?: ReactNode;
  onClose: () => void;
}

export function Modal({ title, open, footer, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="sr-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="sr-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sr-modal__header">
          <h2>{title}</h2>
          <Button variant="icon" icon={<X size={16} />} aria-label="Close" onClick={onClose} />
        </header>
        <div className="sr-modal__body">{children}</div>
        {footer ? <footer className="sr-modal__footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
