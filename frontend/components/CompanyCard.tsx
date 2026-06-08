'use client';
import { useRouter } from 'next/navigation';
import type { Company } from '../data/types';
import { segmentLabel } from '../data/reference';
import { Icon } from '../lib/icons';
import { Logo } from './Logo';
import { RatingLine } from './Stars';
import { VerifiedTag } from './VerifiedTag';

export function CompanyCard({ c, layout }: { c: Company; layout: 'grid' | 'list' }) {
  const router = useRouter();
  const open = () => router.push(`/empresa/${c.id}`);

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
          <div className="cc-meta">
            <span className="cc-loc">
              <Icon name="pin" size={13} /> {c.city} · {c.uf}
            </span>
          </div>
        </div>
        <div className="cc-aside">
          <RatingLine rating={c.rating} reviews={c.reviews} />
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
      <div className="cc-foot">
        <RatingLine rating={c.rating} reviews={c.reviews} size={13} />
        <span className="cc-loc">
          <Icon name="pin" size={13} /> {c.uf}
        </span>
      </div>
    </article>
  );
}
