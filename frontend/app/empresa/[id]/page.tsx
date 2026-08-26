'use client';
import { useParams, useRouter } from 'next/navigation';
import { getCompanies, getMyProfile } from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import { segmentLabel } from '../../../data/reference';
import { Icon } from '../../../lib/icons';
import { Logo } from '../../../components/Logo';
import { Stars } from '../../../components/Stars';
import { VerifiedTag } from '../../../components/VerifiedTag';
import { CompanyCard } from '../../../components/CompanyCard';
import { Loading, LoadError } from '../../../components/AsyncState';
import { useAppStore } from '../../../lib/store';

export default function EmpresaPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  const usuario = useAppStore((s) => s.usuario);
  const { data: companies, loading, error } = useAsync(() => getCompanies(), []);

  // Instituição vê o contato só de estar logada. Fornecedor precisa ter
  // finalizado o próprio cadastro (status 'completo') — senão fica embaçado
  // igual pra quem não fez login.
  const souFornecedor = usuario?.tipo === 'fornecedor';
  const { data: meuPerfil } = useAsync(
    () => (souFornecedor ? getMyProfile() : Promise.resolve(null)),
    [souFornecedor]
  );
  const cadastroPendente = souFornecedor && meuPerfil?.status !== 'completo';
  const podeVerContato = !!authEmail && !cadastroPendente;

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
  const loginFrom = `/entrar?from=${encodeURIComponent(`/empresa/${c.id}`)}`;

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
          {podeVerContato ? (
            <a className="btn-ghost dh-cta2" href={`https://${c.site}`} target="_blank" rel="noreferrer">
              <Icon name="globe" size={15} /> {c.site}
            </a>
          ) : !authEmail ? (
            <button className="btn-ghost dh-cta2 dh-cta2-locked" onClick={() => router.push(loginFrom)}>
              <Icon name="shield2" size={15} /> Ver site (faça login)
            </button>
          ) : (
            <button className="btn-ghost dh-cta2 dh-cta2-locked" onClick={() => router.push('/portal/perfil')}>
              <Icon name="shield2" size={15} /> Ver site (finalize seu cadastro)
            </button>
          )}
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

          {c.catalogo && c.catalogo.length > 0 && (
            <section className="d-block">
              <h2>Catálogo de produtos e serviços</h2>
              <div className="catalogo-grid">
                {c.catalogo.map((s) => (
                  <div key={s.id} className={'catalogo-card' + (s.destaque ? ' destaque' : '')}>
                    {s.destaque && (
                      <span className="catalogo-badge">
                        <Icon name="star" size={11} /> Destaque
                      </span>
                    )}
                    <div className="catalogo-nome">{s.nome}</div>
                    <p className="catalogo-desc">{s.descricao}</p>
                    {(s.preco || s.prazo) && (
                      <div className="catalogo-meta">
                        {s.preco && (
                          <span className="catalogo-meta-item">
                            <Icon name="file" size={13} /> {s.preco}
                          </span>
                        )}
                        {s.prazo && (
                          <span className="catalogo-meta-item">
                            <Icon name="clock" size={13} /> {s.prazo}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="d-block">
            <h2>Avaliações dos compradores</h2>
            <div className="rev-summary">
              <div className="rev-big">
                <div className="rev-num">{c.rating.toFixed(1)}</div>
                <Stars value={c.rating} size={18} />
                <div className="muted">{c.reviews} avaliações</div>
              </div>
            </div>
            {c.reviews === 0 && (
              <div className="empty">
                <Icon name="star" size={28} />
                <h3>Ainda sem avaliações</h3>
                <p>Esta empresa ainda não recebeu avaliações de compradores.</p>
              </div>
            )}
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
            {podeVerContato ? (
              <>
                <div className="contact-row">
                  <Icon name="phone" size={15} /> {c.phone}
                </div>
                <div className="contact-row">
                  <Icon name="globe" size={15} /> {c.site}
                </div>
              </>
            ) : (
              <>
                <div className="contact-row">
                  <Icon name="phone" size={15} />
                  <span className="contact-mask">{c.phone}</span>
                </div>
                <div className="contact-row">
                  <Icon name="globe" size={15} />
                  <span className="contact-mask">{c.site}</span>
                </div>
                <div className="contact-gate">
                  <div className="contact-gate-row">
                    <Icon name="shield2" size={14} />
                    <span>
                      {!authEmail
                        ? 'Faça login para ver os dados de contato'
                        : 'Finalize o cadastro da sua empresa para ver os dados de contato'}
                    </span>
                  </div>
                  <button
                    className="btn-link"
                    onClick={() => router.push(!authEmail ? loginFrom : '/portal/perfil')}
                  >
                    {!authEmail ? 'Entrar na minha conta' : 'Completar cadastro'}
                  </button>
                </div>
              </>
            )}
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
