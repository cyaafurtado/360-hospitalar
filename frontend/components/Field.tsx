import type { ReactNode } from 'react';

export function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="reg-field">
      <span className="reg-label">
        {label}
        {required && <i className="req">*</i>}
      </span>
      {children}
      {hint && <span className="reg-hint">{hint}</span>}
    </label>
  );
}
