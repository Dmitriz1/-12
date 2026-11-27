import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';
import type { ButtonVariant } from './Button';

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={`${styles.button} ${styles[variant]} ${className}`.trim()}
      {...rest}
    />
  );
}
