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

// ── Camada de conteúdo/CMS ─────────────────────────────────────────
// Trocar por variáveis de ambiente ou fetch de CMS em produção.
const HERO_IMAGE  = '/images/hero-saude.jpg';
const ABOUT_IMAGE = '/images/about-saude.jpg';

function HeroImg() {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <img
      src={HERO_IMAGE}
      alt="Equipe clínica em ambiente hospitalar"
      className="hero-photo-img"
      onError={() => setErr(true)}
      aria-hidden="true"
    />
  );
}

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

  return (
    <div className="screen home">

      {/* 2. HERO FOTOGRÁFICO full-bleed */}
      <section className="hero-photo" aria-label="360 Hospitalar — busca de fornecedores">
        <HeroImg />
        <div className="hero-photo-scrim" aria-hidden="true" />

        <div className="hero-photo-inner">
          <div className="hero-eyebrow">Diretório B2B do setor de saúde</div>

          <h1 className="hero-title">
            Encontre fornecedores e parceiros
            <br />
            <em>confiáveis</em> para sua operação de saúde.
          </h1>

          <p className="hero-sub">
            Clínicas, hospitais e prestadores privados conectam-se a fornecedores
            verificados — de laboratórios e equipamentos a esterilização e gestão
            de resíduos.
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

          <div className="hero-stats">
            <div>
              <strong>2.400+</strong>
              <span>fornecedores cadastrados</span>
            </div>
            <div className="div" />
            <div>
              <strong>12</strong>
              <span>segmentos de saúde</span>
            </div>
            <div className="div" />
            <div>
              <strong>98%</strong>
              <span>verificados e auditados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de símbolos da área da saúde */}
      <section className="icon-band" aria-label="Áreas de atuação da saúde">
        <div className="icon-band-track">
          {[
            'cross',
            'stethoscope',
            'heart',
            'pulse',
            'flask',
            'pill',
            'shield2',
            'drop',
          ].map((ic, i) => (
            <span key={i} className="icon-band-item">
              <Icon name={ic} size={22} stroke={1.6} />
            </span>
          ))}
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
            <div className="hero-eyebrow">Por que a 360 Hospitalar</div>
            <h2>
              Cada fornecedor passa por verificação antes de aparecer na busca.
            </h2>
            <p>
              Garantimos que hospitais, clínicas e gestores de saúde encontrem
              apenas parceiros com documentação em dia e histórico avaliado por
              pares do setor.
            </p>

            <div className="feature-pillars">
              <div className="feature-pillar">
                <div className="feature-pillar-ico">
                  <Icon name="shield2" size={22} />
                </div>
                <div>
                  <strong>Verificação documental</strong>
                  <span>CNPJ, licenças sanitárias e certificações auditadas antes da aprovação.</span>
                </div>
              </div>
              <div className="feature-pillar">
                <div className="feature-pillar-ico">
                  <Icon name="star" size={22} />
                </div>
                <div>
                  <strong>Avaliações reais</strong>
                  <span>Notas e comentários de compradores verificados do setor de saúde.</span>
                </div>
              </div>
              <div className="feature-pillar">
                <div className="feature-pillar-ico">
                  <Icon name="users" size={22} />
                </div>
                <div>
                  <strong>Contato direto</strong>
                  <span>Fale com o fornecedor sem intermediários — cotação em minutos.</span>
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
