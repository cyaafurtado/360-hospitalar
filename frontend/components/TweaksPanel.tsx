'use client';
import { useState } from 'react';
import { Icon } from '../lib/icons';
import { useAppStore, type Density, type ThemeName } from '../lib/store';

const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'trust', label: 'Confiança' },
  { value: 'clinic', label: 'Clínico' },
  { value: 'editorial', label: 'Editorial' },
];
const ACCENTS = [
  'oklch(0.56 0.16 248)',
  'oklch(0.52 0.10 200)',
  'oklch(0.50 0.11 162)',
  'oklch(0.45 0.14 282)',
];
const DENSITIES: Density[] = ['compact', 'regular', 'comfy'];
const DENSITY_LABEL: Record<Density, string> = { compact: 'Compacta', regular: 'Regular', comfy: 'Espaçada' };

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const { theme, density, accent, setTheme, setDensity, setAccent } = useAppStore();

  return (
    <>
      {open && (
        <div className="tweaks-panel" role="dialog" aria-label="Ajustes de aparência">
          <div className="tweaks-section">Direção visual</div>
          <div className="tweaks-row">
            <label>Tema</label>
            <div className="tweaks-opts">
              {THEMES.map((t) => (
                <button key={t.value} className={'tweaks-opt' + (theme === t.value ? ' on' : '')} onClick={() => setTheme(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="tweaks-row">
            <label>Cor de destaque</label>
            <div className="tweaks-colors">
              {ACCENTS.map((a) => (
                <button
                  key={a}
                  className={'tweaks-color' + (accent === a ? ' on' : '')}
                  style={{ background: a }}
                  onClick={() => setAccent(a)}
                  aria-label={`Cor ${a}`}
                />
              ))}
            </div>
          </div>
          <div className="tweaks-section">Layout</div>
          <div className="tweaks-row">
            <label>Densidade</label>
            <div className="tweaks-opts">
              {DENSITIES.map((d) => (
                <button key={d} className={'tweaks-opt' + (density === d ? ' on' : '')} onClick={() => setDensity(d)}>
                  {DENSITY_LABEL[d]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <button className="tweaks-fab" onClick={() => setOpen((o) => !o)}>
        <Icon name="sliders" size={16} /> Aparência
      </button>
    </>
  );
}
