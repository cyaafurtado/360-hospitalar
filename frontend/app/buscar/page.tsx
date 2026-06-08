'use client';
import { useMemo } from 'react';
import { getCompanies } from '../../lib/services';
import { useAsync } from '../../lib/useAsync';
import { useAppStore, EMPTY_FILTERS, type Sort } from '../../lib/store';
import { segmentLabel, STATES } from '../../data/reference';
import { Icon } from '../../lib/icons';
import { SearchBar } from '../../components/SearchBar';
import { FilterRail } from '../../components/FilterRail';
import { CompanyCard } from '../../components/CompanyCard';
import { Loading, LoadError } from '../../components/AsyncState';

export default function BuscarPage() {
  const { query, uf, setQuery, setUf, applySearchUf, filters, setFilters, sort, setSort, layout, setLayout } =
    useAppStore();
  const { data, loading, error } = useAsync(() => getCompanies(), []);
  const all = useMemo(() => data ?? [], [data]);

  const counts = useMemo(() => {
    const bySeg: Record<string, number> = {};
    all.forEach((c) => {
      bySeg[c.segment] = (bySeg[c.segment] || 0) + 1;
    });
    return { bySeg };
  }, [all]);

  const results = useMemo(() => {
    let list = all.filter((c) => {
      if (filters.segments.length && !filters.segments.includes(c.segment)) return false;
      if (filters.uf && c.uf !== filters.uf) return false;
      if (filters.minRating && c.rating < filters.minRating) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = (c.name + ' ' + c.tagline + ' ' + segmentLabel(c.segment) + ' ' + c.services.join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'reviews') list = [...list].sort((a, b) => b.reviews - a.reviews);
    if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [all, filters, query, sort]);

  const hasActive = filters.segments.length > 0 || !!filters.uf || filters.minRating > 0;

  return (
    <div className="screen results">
      <div className="results-searchrow">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={applySearchUf}
          segment={uf}
          onSegment={setUf}
          big
          placeholder="Buscar fornecedor ou serviço…"
        />
      </div>
      <div className="results-body">
        <FilterRail filters={filters} setFilters={setFilters} counts={counts} />
        <div className="results-main">
          <div className="results-bar">
            <div className="rb-count">
              <strong>{results.length}</strong> fornecedor{results.length === 1 ? '' : 'es'}
              {filters.uf && (
                <>
                  {' '}
                  em <em>{STATES.find((s) => s.uf === filters.uf)?.name}</em>
                </>
              )}
            </div>
            <div className="rb-right">
              <div className="rb-sort">
                <label>Ordenar</label>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                  <option value="rating">Melhor avaliados</option>
                  <option value="reviews">Mais avaliações</option>
                  <option value="az">Nome (A–Z)</option>
                </select>
              </div>
              <div className="layout-toggle">
                <button className={layout === 'grid' ? 'on' : ''} onClick={() => setLayout('grid')} title="Grade">
                  <Icon name="grid" size={16} />
                </button>
                <button className={layout === 'list' ? 'on' : ''} onClick={() => setLayout('list')} title="Lista">
                  <Icon name="list" size={16} />
                </button>
              </div>
            </div>
          </div>

          {hasActive ? (
            <div className="active-chips">
              {filters.segments.map((s) => (
                <span
                  key={s}
                  className="active-chip"
                  onClick={() => setFilters({ ...filters, segments: filters.segments.filter((x) => x !== s) })}
                >
                  {segmentLabel(s)} <Icon name="close" size={12} />
                </span>
              ))}
              {filters.uf && (
                <span className="active-chip" onClick={() => setFilters({ ...filters, uf: '' })}>
                  {filters.uf} <Icon name="close" size={12} />
                </span>
              )}
              {filters.minRating > 0 && (
                <span className="active-chip" onClick={() => setFilters({ ...filters, minRating: 0 })}>
                  {filters.minRating}+ <Icon name="close" size={12} />
                </span>
              )}
            </div>
          ) : null}

          {loading ? (
            <Loading label="Carregando fornecedores…" />
          ) : error ? (
            <LoadError message={error} />
          ) : results.length === 0 ? (
            <div className="empty">
              <Icon name="search" size={34} />
              <h3>Nenhum fornecedor encontrado</h3>
              <p>Tente ampliar os filtros ou mudar os termos de busca.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setFilters({ ...EMPTY_FILTERS });
                  setQuery('');
                }}
              >
                Limpar busca
              </button>
            </div>
          ) : (
            <div className={layout === 'list' ? 'card-list' : 'card-grid results-grid'}>
              {results.map((c) => (
                <CompanyCard key={c.id} c={c} layout={layout} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
