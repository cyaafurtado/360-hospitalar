'use client';
import type { FormEvent } from 'react';
import { Icon } from '../lib/icons';
import { STATES } from '../data/reference';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  segment?: string; // usado como UF
  onSegment?: (v: string) => void;
  big?: boolean;
  placeholder?: string;
};

export function SearchBar({ value, onChange, onSubmit, segment, onSegment, big, placeholder }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };
  return (
    <form className={'searchbar' + (big ? ' big' : '')} onSubmit={handleSubmit}>
      <div className="sb-field">
        <Icon name="search" size={big ? 22 : 18} className="sb-icon" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Buscar prestador, serviço ou segmento…'}
        />
      </div>
      {big && onSegment && (
        <div className="sb-seg">
          <Icon name="pin" size={18} className="sb-icon" />
          <select value={segment || ''} onChange={(e) => onSegment(e.target.value)}>
            <option value="">Todo o Brasil</option>
            {STATES.map((s) => (
              <option key={s.uf} value={s.uf}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <button type="submit" className="btn-primary sb-btn">
        Buscar
      </button>
    </form>
  );
}
