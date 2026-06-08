'use client';
import { Icon } from '../lib/icons';
import { SEGMENTS } from '../data/reference';

export function SegmentChips({ onPick, active }: { onPick: (id: string) => void; active?: string }) {
  return (
    <div className="seg-chips">
      {SEGMENTS.map((s) => (
        <button
          key={s.id}
          type="button"
          className={'seg-chip' + (active === s.id ? ' on' : '')}
          onClick={() => onPick(s.id)}
        >
          <span className="seg-chip-ico">
            <Icon name={s.icon} size={18} />
          </span>
          {s.label}
        </button>
      ))}
    </div>
  );
}
