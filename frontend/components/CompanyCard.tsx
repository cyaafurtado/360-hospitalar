'use client';
import { useRouter } from 'next/navigation';
import type { Company } from '../data/types';
import { segmentLabel } from '../data/reference';
import { Icon } from '../lib/icons';
import { Logo } from './Logo';
import { RatingLine } from './Stars';
import { VerifiedTag } from './VerifiedTag';

// Enquanto a empresa não tem avaliação real, estrela vazia só passa a impressão
// de produto abandonado. No lugar entram os dados que o comprador B2B de fato
// usa para decidir: certificações auditadas, cobertura e tempo de mercado.
function Signals({ c, max = 3 }: { c: Company; max?: number }) {
  const badges = c.badges ?? [];
  if (badges.length === 0) return null;
  const restantes = badges.length - max;
  return (
    <div className="cc-signals">
      {badges.slice(0, max).map((b) => (
        <span key={b} className="cc-chip">
          <Icon name="shield2" size={11} /> {b}
        </span>
      ))}
      {restantes > 0 && <span className="cc-chip more">+{restantes}</span>}
    </div>
  );
}

// Devolve null quando não há nada concreto a dizer — melhor um card mais curto
// do que uma linha de rodapé vazia com borda.
function Facts({ c }: { c: Company }) {
  const ufs = c.atendeUfs?.length ?? 0;
  const anos = c.founded ? new Date().getFullYear() - c.founded : 0;
  if (ufs === 0 && anos === 0) return null;
  return (
    <div className="cc-facts">
      {ufs > 0 && (
        <span className="cc-fact">
          <Icon name="pin" size={13} /> atende <strong>{ufs}</strong> {ufs === 1 ? 'estado' : 'estados'}
        </span>
      )}
      {anos > 0 && (
        <span className="cc-fact">
          <Icon name="cal" size={13} /> <strong>{anos}</strong> {anos === 1 ? 'ano' : 'anos'} de mercado
        </span>
      )}
    </div>
  );
}

function temFacts(c: Company): boolean {
  return (c.atendeUfs?.length ?? 0) > 0 || (c.founded ? new Date().getFullYear() - c.founded : 0) > 0;
}

export function CompanyCard({ c, layout }: { c: Company; layout: 'grid' | 'list' }) {
  const router = useRouter();
  const open = () => router.push(`/empresa/${c.id}`);
  const temAvaliacao = c.reviews > 0;

  if (layout === 'list') {
    return (
      <article className="company-card list" onClick={open}>
        <Logo name={c.name} size={64} />
        <div className="cc-main">
          <div className="cc-toprow">
            <h3>{c.name}</h3>
            {c.verified && <VerifiedTag small />}
          </div>
          <div className="cc-seg">{segmentLabel(c.segment)}</div>
          <p className="cc-tag">{c.tagline}</p>
          <Signals c={c} max={4} />
          <div className="cc-meta">
            <span className="cc-loc">
              <Icon name="pin" size={13} /> {c.city} · {c.uf}
            </span>
          </div>
        </div>
        <div className="cc-aside">
          {temAvaliacao ? <RatingLine rating={c.rating} reviews={c.reviews} /> : <Facts c={c} />}
          <button className="btn-ghost cc-cta">
            Ver perfil <Icon name="arrow" size={15} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="company-card grid" onClick={open}>
      <div className="cc-head">
        <Logo name={c.name} size={52} />
        {c.verified && <VerifiedTag small />}
      </div>
      <h3>{c.name}</h3>
      <div className="cc-seg">{segmentLabel(c.segment)}</div>
      <p className="cc-tag">{c.tagline}</p>
      <Signals c={c} />
      {(temAvaliacao || temFacts(c)) && (
        <div className="cc-foot">
          {temAvaliacao ? (
            <>
              <RatingLine rating={c.rating} reviews={c.reviews} size={13} />
              <span className="cc-loc">
                <Icon name="pin" size={13} /> {c.uf}
              </span>
            </>
          ) : (
            <Facts c={c} />
          )}
        </div>
      )}
    </article>
  );
}
