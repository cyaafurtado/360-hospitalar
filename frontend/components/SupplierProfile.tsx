'use client';
import type { ReactNode } from 'react';
import { Icon, ICON_PATHS } from '../lib/icons';
import type { Supplier } from '../data/types';

const ANO_ATUAL = new Date().getFullYear();

const CREDENTIAL_STATUS_LABEL: Record<string, string> = {
  valida: 'Válida',
  vigente: 'Vigente',
  vencida: 'Vencida',
};

function CredentialPill({ status }: { status: 'valida' | 'vigente' | 'vencida' }) {
  const isOk = status === 'valida' || status === 'vigente';
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ' +
        (isOk ? 'bg-[#2f8f5b]/10 text-[#2f8f5b]' : 'bg-slate-200 text-slate-500')
      }
    >
      {isOk && <Icon name="check" size={10} stroke={2.8} />}
      {CREDENTIAL_STATUS_LABEL[status]}
    </span>
  );
}

function ProfileStars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={16}
          height={16}
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

function HeroMetric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white px-4 py-4 text-center shadow-sm">
      <span className="text-2xl font-extrabold leading-none text-slate-900 sm:text-3xl">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export function SupplierProfile({ supplier }: { supplier: Supplier }) {
  const yearsInMarket = ANO_ATUAL - supplier.marketSince;

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-[#F5F7F7] p-5 sm:p-8">
      {/* Hero */}
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{supplier.name}</h2>
          {supplier.verified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B6E74]/10 px-3 py-1 text-xs font-bold text-[#0B6E74]">
              <Icon name="check" size={13} stroke={2.6} /> Fornecedor verificado
            </span>
          )}
        </div>
        <p className="text-[15px] font-semibold text-[#0B6E74]">{supplier.category}</p>
        <p className="text-sm text-slate-500">
          No mercado desde {supplier.marketSince} · na plataforma desde {supplier.platformSince}
        </p>
      </header>

      {/* Faixa de métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HeroMetric value={yearsInMarket} label={yearsInMarket === 1 ? 'ano de mercado' : 'anos de mercado'} />
        <HeroMetric value={supplier.contractsCompleted} label="contratos concluídos" />
        <HeroMetric
          value={
            <span className="inline-flex items-center gap-1">
              {supplier.rating.toFixed(1)} <ProfileStars rating={supplier.rating} />
            </span>
          }
          label="nota dos compradores"
        />
        <HeroMetric value={`${supplier.onTimeRate}%`} label="no prazo" />
      </div>

      {/* Credenciais verificadas */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          Credenciais verificadas
        </h3>
        <ul className="flex flex-col gap-2">
          {(!supplier.credentials || supplier.credentials.length === 0) && (
            <li className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">
              Nenhuma credencial cadastrada ainda.
            </li>
          )}
          {supplier.credentials?.map((c) => (
            <li
              key={c.name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#0B6E74]/10 text-[#0B6E74]">
                  <Icon name="shield" size={14} stroke={2.2} />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.detail}</div>
                </div>
              </div>
              <CredentialPill status={c.status} />
            </li>
          ))}
        </ul>
      </section>

      {/* Áreas de especialização */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          Áreas de especialização
        </h3>
        <div className="flex flex-wrap gap-2">
          {supplier.specialties?.map((s) => (
            <span
              key={s}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Portfólio */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          Portfólio de serviços
        </h3>
        {!supplier.portfolio || supplier.portfolio.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">
            Este fornecedor ainda não publicou serviços no portfólio.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {supplier.portfolio?.map((p) => (
              <div key={p.title} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex h-32 items-center justify-center bg-slate-100 text-slate-300">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="file" size={28} stroke={1.4} />
                  )}
                </div>
                <div className="p-3 text-sm font-semibold text-slate-800">{p.title}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Avaliações */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          Avaliações {supplier.reviewsCount > 0 && `(${supplier.reviewsCount})`}
        </h3>
        {!supplier.reviews || supplier.reviews.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">
            Ainda não há avaliações para este fornecedor.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {supplier.reviews?.map((r, i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{r.author}</span>
                    <ProfileStars rating={r.stars} />
                  </div>
                  {r.viaPlatform && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0B6E74]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0B6E74]">
                      <Icon name="check" size={10} stroke={2.8} /> Contrato fechado pela plataforma
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
