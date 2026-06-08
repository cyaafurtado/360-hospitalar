'use client';
import { Icon } from '../lib/icons';
import { SEGMENTS, STATES } from '../data/reference';
import { Stars } from './Stars';
import { EMPTY_FILTERS, type Filters } from '../lib/store';

type Props = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  counts?: { bySeg: Record<string, number> };
};

export function FilterRail({ filters, setFilters, counts }: Props) {
  const toggleSeg = (id: string) => {
    const next = new Set(filters.segments);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFilters({ ...filters, segments: [...next] });
  };
  const hasActive = filters.segments.length > 0 || !!filters.uf || filters.minRating > 0;

  return (
    <aside className="filter-rail">
      <div className="fr-head">
        <Icon name="filter" size={17} />
        <span>Filtros</span>
        {hasActive ? (
          <button className="fr-clear" onClick={() => setFilters({ ...EMPTY_FILTERS })}>
            Limpar
          </button>
        ) : null}
      </div>

      <div className="fr-block">
        <h4>Segmento</h4>
        <div className="fr-segs">
          {SEGMENTS.map((s) => (
            <label key={s.id} className={'fr-check' + (filters.segments.includes(s.id) ? ' on' : '')}>
              <input type="checkbox" checked={filters.segments.includes(s.id)} onChange={() => toggleSeg(s.id)} />
              <span className="fr-box">
                <Icon name="check" size={12} stroke={3} />
              </span>
              <span className="fr-label">{s.label}</span>
              {counts && <span className="fr-count">{counts.bySeg[s.id] || 0}</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="fr-block">
        <h4>Localização</h4>
        <div className="fr-select">
          <Icon name="pin" size={16} />
          <select value={filters.uf} onChange={(e) => setFilters({ ...filters, uf: e.target.value })}>
            <option value="">Todos os estados</option>
            {STATES.map((s) => (
              <option key={s.uf} value={s.uf}>
                {s.name} ({s.uf})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fr-block">
        <h4>Avaliação mínima</h4>
        <div className="fr-ratings">
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              className={'fr-rate' + (filters.minRating === r ? ' on' : '')}
              onClick={() => setFilters({ ...filters, minRating: r })}
            >
              {r === 0 ? (
                'Todas'
              ) : (
                <>
                  <Stars value={5} size={12} /> {r.toFixed(1)}+
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
