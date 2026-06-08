import { segmentLabel } from '../data/reference';
import { Icon } from '../lib/icons';
import { Logo } from './Logo';

export function PreviewCard({
  name: rawName,
  segment,
  tagline,
  uf,
  verified,
}: {
  name: string;
  segment: string;
  tagline: string;
  uf: string;
  verified: boolean;
}) {
  const name = rawName || 'Sua Empresa';
  const seg = segment ? segmentLabel(segment) : 'Segmento';
  return (
    <article className="company-card grid preview">
      <div className="cc-head">
        <Logo name={name} size={52} />
        {verified ? (
          <span className="verified sm">
            <Icon name="check" size={11} stroke={2.4} /> Verificada
          </span>
        ) : (
          <span className="verified sm new-badge">
            <Icon name="star" size={11} stroke={2} /> Novo
          </span>
        )}
      </div>
      <h3>{name}</h3>
      <div className="cc-seg">{seg}</div>
      <p className="cc-tag">{tagline || 'Uma frase curta descrevendo o que sua empresa oferece.'}</p>
      <div className="cc-foot">
        <span className="rating-line muted">Aguardando avaliações</span>
        <span className="cc-loc">
          <Icon name="pin" size={13} /> {uf || '—'}
        </span>
      </div>
    </article>
  );
}
