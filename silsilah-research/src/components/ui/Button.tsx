import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function Button({ variant = 'secondary', icon, children, className = '', ...props }: ButtonProps) {
  const label = typeof children === 'string' ? children : props['aria-label'];

  return (
    <button
      className={`sr-button sr-button--${variant} ${className}`}
      title={typeof label === 'string' ? label : undefined}
      {...props}
    >
      {icon ? <span className="sr-button__icon">{icon}</span> : null}
      {children ? <span className="sr-button__label">{children}</span> : null}
    </button>
  );
}
