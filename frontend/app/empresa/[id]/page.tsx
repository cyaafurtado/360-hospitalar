'use client';
import { useParams, useRouter } from 'next/navigation';
import { getCompanies } from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import { segmentLabel } from '../../../data/reference';
import { Icon } from '../../../lib/icons';
import { Logo } from '../../../components/Logo';
import { Stars } from '../../../components/Stars';
import { VerifiedTag } from '../../../components/VerifiedTag';
import { CompanyCard } from '../../../components/CompanyCard';
import { Loading, LoadError } from '../../../components/AsyncState';

const DIST: Record<number, number> = { 5: 0.62, 4: 0.26, 3: 0.08, 2: 0.03, 1: 0.01 };

export default function EmpresaPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { data: companies, loading, error } = useAsync(() => getCompanies(), []);

  if (loading || error) {
    return (
      <div className="screen detail">
        <button className="back-link" onClick={() => router.push('/buscar')}>
          <Icon name="back" size={16} /> Voltar aos resultados
        </button>
        {loading ? <Loading /> : <LoadError message={error} />}
      </div>
    );
  }

  const c = companies?.find((x) => x.id === id);
  if (!c) {
    return (
      <div className="screen detail">
        <button className="back-link" onClick={() => router.push('/buscar')}>
          <Icon name="back" size={16} /> Voltar aos resultados
        </button>
        <div className="empty">
          <Icon name="search" size={34} />
          <h3>Fornecedor não encontrado</h3>
          <p>O perfil que você procura não está disponível.</p>
          <button className="btn-primary" onClick={() => router.push('/buscar')}>
            Ver fornecedores
          </button>
        </div>
      </div>
    );
  }

  const similar = (companies ?? []).filter((x) => x.segment === c.segment && x.id !== c.id).slice(0, 3);
  const orcamento = () => router.push(`/empresa/${c.id}/orcamento`);

  return (
    <div className="screen detail">
      <button className="back-link" onClick={() => router.push('/buscar')}>
        <Icon name="back" size={16} /> Voltar aos resultados
      </button>

      <header className="detail-hero">
        <Logo name={c.name} size={88} radius="var(--logo-radius-lg)" />
        <div className="dh-main">
          <div className="dh-toprow">
            <h1>{c.name}</h1>
            {c.verified && <VerifiedTag />}
          </div>
          <div className="dh-seg">{segmentLabel(c.segment)}</div>
          <p className="dh-tag">{c.tagline}</p>
          <div className="dh-meta">
            <span>
              <Icon name="pin" size={15} /> {c.city} · {c.uf}
            </span>
            <span>
              <Icon name="users" size={15} /> {c.employees} func.
            </span>
            <span>
              <Icon name="cal" size={15} /> Desde {c.founded}
            </span>
          </div>
        </div>
        <div className="dh-rate">
          <div className="dh-score">{c.rating.toFixed(1)}</div>
          <Stars value={c.rating} size={16} />
          <div className="muted">{c.reviews} avaliações</div>
          <button className="btn-primary dh-cta" onClick={orcamento}>
            <Icon name="phone" size={15} /> Solicitar contato
          </button>
          <a className="btn-ghost dh-cta2" href={`https://${c.site}`} target="_blank" rel="noreferrer">
            <Icon name="globe" size={15} /> {c.site}
          </a>
        </div>
      </header>

      <div className="detail-grid">
        <main className="detail-col">
          <section className="d-block">
            <h2>Sobre a empresa</h2>
            <p>{c.about}</p>
          </section>

          <section className="d-block">
            <h2>Serviços e soluções</h2>
            <div className="svc-grid">
              {c.services.map((s) => (
                <div key={s} className="svc-item">
                  <span className="svc-dot">
                    <Icon name="check" size={13} stroke={3} />
                  </span>
                  {s}
                </div>
              ))}
            </div>
          </section>

          <section className="d-block">
            <h2>Avaliações dos compradores</h2>
            <div className="rev-summary">
              <div className="rev-big">
                <div className="rev-num">{c.rating.toFixed(1)}</div>
                <Stars value={c.rating} size={18} />
                <div className="muted">{c.reviews} avaliações</div>
              </div>
              <div className="rev-bars">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="rev-bar-row">
                    <span className="rev-bar-n">
                      {n} <Icon name="star" size={11} />
                    </span>
                    <div className="rev-bar">
                      <div className="rev-bar-fill" style={{ width: `${DIST[n] * 100}%` }} />
                    </div>
                    <span className="rev-bar-pct">{Math.round(DIST[n] * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rev-list">
              <article className="rev-item">
                <div className="rev-head">
                  <strong>Hospital Santa Lúcia</strong>
                  <Stars value={5} size={13} />
                </div>
                <p>Atendimento técnico ágil e equipe muito bem treinada. Renovamos o contrato sem hesitar.</p>
                <span className="rev-when">há 2 semanas · compra verificada</span>
              </article>
              <article className="rev-item">
                <div className="rev-head">
                  <strong>Clínica Vida Plena</strong>
                  <Stars value={4} size={13} />
                </div>
                <p>Boa relação custo-benefício. Logística pontual; documentação de conformidade impecável.</p>
                <span className="rev-when">há 1 mês · compra verificada</span>
              </article>
            </div>
          </section>
        </main>

        <aside className="detail-side">
          <div className="side-card">
            <h3>Certificações</h3>
            <div className="cert-list">
              {c.badges.map((b) => (
                <span key={b} className="cert">
                  <Icon name="shield2" size={13} /> {b}
                </span>
              ))}
            </div>
          </div>
          <div className="side-card">
            <h3>Contato</h3>
            <div className="contact-row">
              <Icon name="phone" size={15} /> {c.phone}
            </div>
            <div className="contact-row">
              <Icon name="globe" size={15} /> {c.site}
            </div>
            <div className="contact-row">
              <Icon name="pin" size={15} /> {c.city} · {c.uf}
            </div>
            <button className="btn-primary block" onClick={orcamento}>
              Solicitar orçamento
            </button>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="band similar">
          <h2>Fornecedores similares</h2>
          <div className="card-grid">
            {similar.map((s) => (
              <CompanyCard key={s.id} c={s} layout="grid" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
