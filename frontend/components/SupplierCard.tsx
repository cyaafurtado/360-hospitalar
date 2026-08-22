'use client';
import { Icon, ICON_PATHS } from '../lib/icons';
import type { Supplier } from '../data/types';

const ANO_ATUAL = new Date().getFullYear();

function CardStars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill={i <= full ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.5}
          className={i <= full ? 'text-yellow-400' : 'text-slate-300'}
        >
          <path d={ICON_PATHS.star} />
        </svg>
      ))}
    </span>
  );
}

function CardMetric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[15px] font-extrabold leading-none text-slate-900">{value}</span>
      <span className="mt-1 text-[10.5px] leading-tight text-slate-500">{label}</span>
    </div>
  );
}

export function SupplierCard({
  supplier,
  onSelect,
}: {
  supplier: Supplier;
  onSelect?: (id: string) => void;
}) {
  const yearsInMarket = ANO_ATUAL - supplier.marketSince;

  return (
    <article
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(supplier.id)}
      onKeyDown={(e) => {
        if (!onSelect) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(supplier.id);
        }
      }}
      className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm outline-none transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0B6E74] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">{supplier.name}</h3>
          {supplier.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0B6E74]/10 px-2 py-0.5 text-[11px] font-bold text-[#0B6E74]">
              <Icon name="check" size={11} stroke={2.6} /> Fornecedor verificado
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          {supplier.category} · {supplier.city}
        </p>
      </div>

      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#B8860B]/10 px-3 py-1 text-xs font-extrabold tracking-wide text-[#B8860B]">
        <Icon name="clock" size={12} stroke={2.4} />
        {yearsInMarket} {yearsInMarket === 1 ? 'ano' : 'anos'} de mercado
      </span>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <CardStars rating={supplier.rating} />
          <strong className="font-bold text-slate-800">{supplier.rating.toFixed(1)}</strong>
          <span className="text-slate-400">({supplier.reviewsCount})</span>
        </span>
        <span>Responde em ~{supplier.avgResponseHours}h</span>
      </div>

      <div className="mt-1 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        <CardMetric value={supplier.contractsCompleted} label="Contratos concluídos" />
        <CardMetric value={supplier.institutionsServed} label="Instituições atendidas" />
        <CardMetric value={`${supplier.onTimeRate}%`} label="No prazo" />
      </div>
    </article>
  );
}
