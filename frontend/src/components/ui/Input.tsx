import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, ...rest }: InputProps) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className={error ? 'input input--error' : 'input'} {...rest} />
      {error && (
        <span role="alert" className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}