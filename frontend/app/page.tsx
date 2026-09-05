'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanies } from '../lib/services';
import { useAsync } from '../lib/useAsync';
import { useAppStore } from '../lib/store';
import { Icon } from '../lib/icons';
import { SearchBar } from '../components/SearchBar';
import { SegmentChips } from '../components/SegmentChips';
import { CompanyCard } from '../components/CompanyCard';
import { Loading, LoadError } from '../components/AsyncState';
import { SEGMENTS, STATES } from '../data/reference';

// ── Camada de conteúdo/CMS ─────────────────────────────────────────
// Trocar por variáveis de ambiente ou fetch de CMS em produção.
const ABOUT_IMAGE = '/images/about-saude.jpg';

function AboutImg() {
  const [err, setErr] = useState(false);
  if (err) return <div className="feature-split-img" aria-hidden="true" />;
  return (
    <img
      src={ABOUT_IMAGE}
      alt="Profissionais de saúde em atendimento"
      className="feature-split-img"
      onError={() => setErr(true)}
    />
  );
}

export default function HomePage() {
  const router = useRouter();
  const { query, uf, setQuery, setUf, applySearchUf, pickSegment } = useAppStore();
  const { data: companies, loading, error } = useAsync(() => getCompanies(), []);

  const featured = useMemo(
    () => (companies ? [...companies].sort((a, b) => b.rating - a.rating).slice(0, 6) : []),
    [companies]
  );

  const runSearch = () => { applySearchUf(); router.push('/buscar'); };
  const onSegment = (segId: string) => { pickSegment(segId); router.push('/buscar'); };

  // Números só saem do banco ou de fato estrutural — nada de estatística
  // inventada em tela que cliente real vê.
  const verificados = useMemo(() => (companies ?? []).filter((c) => c.verified).length, [companies]);
  const totalEmpresas = companies?.length ?? 0;

  return (
    <div className="screen home">

      {/* HERO — cartão navy (direção Orbit) */}
      <section className="hero-orbit" aria-label="360 Hospitalar — busca de fornecedores">
        <div className="hero-orbit-inner">
          <span className="hero-badge">Diretório B2B do setor de saúde</span>

          <h1>
            Toda a cadeia de fornecimento em saúde, <em>verificada.</em>
          </h1>

          <p className="hero-orbit-sub">
            Busque, compare e cote com fornecedores auditados em {SEGMENTS.length} segmentos
            e {STATES.length} estados — do laboratório à esterilização, sem intermediários.
          </p>

          <div className="hero-search">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={runSearch}
              segment={uf}
              onSegment={setUf}
              big
              placeholder="Ex: esterilização, equipamentos, software…"
            />
          </div>

          <div className="hero-cta-row">
            <button className="btn-lime" onClick={() => router.push('/buscar')}>
              Explorar fornecedores <Icon name="arrow" size={16} />
            </button>
            <button className="btn-on-dark" onClick={() => router.push('/como-verificamos')}>
              Como verificamos
            </button>
          </div>
        </div>
      </section>

      <section className="stat-strip" aria-label="Cobertura da plataforma">
        <div className="stat-strip-item">
          <div className="stat-strip-num">{SEGMENTS.length}</div>
          <div className="stat-strip-lbl">segmentos cobertos, do laboratório à construção hospitalar</div>
        </div>
        <div className="stat-strip-item">
          <div className="stat-strip-num">{STATES.length}</div>
          <div className="stat-strip-lbl">estados atendidos — busca filtrada por UF</div>
        </div>
        <div className="stat-strip-item">
          <div className="stat-strip-num">{totalEmpresas > 0 ? verificados : '—'}</div>
          <div className="stat-strip-lbl">
            {totalEmpresas > 0
              ? `fornecedores com documentação auditada, de ${totalEmpresas} cadastrados`
              : 'verificação documental antes de aparecer na busca'}
          </div>
        </div>
      </section>

      {/* 4. Explore por segmento */}
      <section className="band">
        <div className="band-head">
          <h2>Explore por segmento</h2>
          <p className="muted">Categorias mais buscadas por gestores de saúde</p>
        </div>
        <SegmentChips onPick={onSegment} limit={8} />
      </section>

      {/* 5. Fornecedores em destaque */}
      <section className="band">
        <div className="band-head row">
          <div>
            <h2>Fornecedores em destaque</h2>
            <p className="muted">Empresas com melhor avaliação dos compradores</p>
          </div>
          <button className="btn-ghost" onClick={() => router.push('/buscar')}>
            Ver todos <Icon name="arrow" size={15} />
          </button>
        </div>
        {loading ? (
          <Loading label="Carregando fornecedores…" />
        ) : error ? (
          <LoadError message={error} />
        ) : (
          <div className="card-grid">
            {featured.map((c) => (
              <CompanyCard key={c.id} c={c} layout="grid" />
            ))}
          </div>
        )}
      </section>

      {/* 6. SEÇÃO FOTOGRÁFICA DIVIDIDA — Por que a 360 Hospitalar */}
      <section className="band">
        <div className="feature-split">
          <AboutImg />

          <div className="feature-split-body">
            <div className="hero-eyebrow">Como funciona a verificação</div>
            <h2>
              O fornecedor só entra na busca depois que os documentos são conferidos.
            </h2>
            <p>
              Consultamos o CNPJ direto na Receita Federal e conferimos licenças e
              certificações antes de liberar o perfil. Quem está com documentação
              vencida ou situação cadastral irregular não recebe o selo.
            </p>

            <div className="feature-pillars">
              <div className="feature-pillar">
                <div className="feature-pillar-ico">
                  <Icon name="shield2" size={22} />
                </div>
                <div>
                  <strong>CNPJ conferido na Receita</strong>
                  <span>Razão social, situação cadastral e data de abertura vêm da base oficial, não do formulário.</span>
                </div>
              </div>
              <div className="feature-pillar">
                <div className="feature-pillar-ico">
                  <Icon name="file" size={22} />
                </div>
                <div>
                  <strong>Licenças com validade</strong>
                  <span>ANVISA, ISO, licença sanitária e registro do responsável técnico, cada uma com data de vencimento.</span>
                </div>
              </div>
              <div className="feature-pillar">
                <div className="feature-pillar-ico">
                  <Icon name="phone" size={22} />
                </div>
                <div>
                  <strong>Cotação direta</strong>
                  <span>Você fala com o fornecedor pela plataforma. Sem intermediário e sem comissão sobre a compra.</span>
                </div>
              </div>
            </div>

            <div className="feature-split-cta">
              <button className="btn-primary" onClick={() => router.push('/cadastrar')}>
                <Icon name="check" size={16} stroke={2.4} /> Cadastrar minha empresa
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
