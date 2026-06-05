import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return <button className={`btn btn--${variant} ${className}`} {...rest} />;
}