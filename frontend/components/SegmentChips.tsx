'use client';
import { Icon } from '../lib/icons';
import { SEGMENTS } from '../data/reference';

export function SegmentChips({ onPick, active, limit }: { onPick: (id: string) => void; active?: string; limit?: number }) {
  const list = limit ? SEGMENTS.slice(0, limit) : SEGMENTS;
  return (
    <div className="seg-chips">
      {list.map((s) => (
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
