'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanies } from '../lib/services';
import { useAsync } from '../lib/useAsync';
import { useAppStore } from '../lib/store';
import { Icon } from '../lib/icons';
import { Logo } from '../components/Logo';
import { SearchBar } from '../components/SearchBar';
import { SegmentChips } from '../components/SegmentChips';
import { CompanyCard } from '../components/CompanyCard';
import { Loading, LoadError } from '../components/AsyncState';

const FEATURED_CLIENTS = [
  'Hospital Israelita Albert Einstein',
  'Hospital Sírio-Libanês',
  'Hospital das Clínicas FMUSP',
  'Hospital Mater Dei',
  'Rede D\'Or São Luiz',
  'Hospital Copa Star',
  'Hospital Oswaldo Cruz',
  'Prevent Senior',
  'Hospital Leforte',
  'Oncoclínicas',
];

const REGISTERED_CLIENTS = [
  'Clínica SIM Saúde',
  'Clínica Integrada',
  'Hospital Santa Catarina',
  'Hospital Anchieta',
  'UPA Central',
  'Centro Médico Campinas',
  'Clínica Mais Saúde',
  'Hospital São Marcos',
];

export default function HomePage() {
  const router = useRouter();
  const { query, uf, setQuery, setUf, applySearchUf, pickSegment } = useAppStore();
  const { data: companies, loading, error } = useAsync(() => getCompanies(), []);

  const featured = useMemo(
    () => (companies ? [...companies].sort((a, b) => b.rating - a.rating).slice(0, 6) : []),
    [companies]
  );

  const runSearch = () => {
    applySearchUf();
    router.push('/buscar');
  };
  const onSegment = (segId: string) => {
    pickSegment(segId);
    router.push('/buscar');
  };

  return (
    <div className="screen home">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-eyebrow">Diretório B2B do setor de saúde</div>
          <h1 className="hero-title">
            Encontre <em>fornecedores</em> e parceiros
            <br />
            confiáveis para sua operação de saúde.
          </h1>
          <p className="hero-sub">
            Clínicas, hospitais e prestadores privados conectam-se a fornecedores verificados — de
            laboratórios e equipamentos a esterilização e gestão de resíduos.
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

      <section className="clients-band">
        <div className="clients-band-inner">
          <div className="clients-group">
            <span className="clients-group-label">Principais hospitais e clínicas</span>
            <div className="clients-strip">
              {FEATURED_CLIENTS.map((name) => (
                <div key={name} className="client-tile">
                  <Logo name={name} size={48} radius="12px" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="clients-group">
            <span className="clients-group-label">Cadastrados na plataforma</span>
            <div className="clients-strip">
              {REGISTERED_CLIENTS.map((name) => (
                <div key={name} className="client-tile">
                  <Logo name={name} size={48} radius="12px" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-head">
          <h2>Explore por segmento</h2>
          <p className="muted">Categorias mais buscadas por gestores de saúde</p>
        </div>
        <SegmentChips onPick={onSegment} limit={8} />
      </section>

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

      <section className="trust-band">
        <div className="trust-item">
          <div className="trust-ico"><Icon name="shield2" size={22} /></div>
          <div>
            <strong>Verificação documental</strong>
            <span>CNPJ, licenças e certificações auditadas.</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-ico"><Icon name="star" size={22} /></div>
          <div>
            <strong>Avaliações reais</strong>
            <span>Notas de compradores do setor de saúde.</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-ico"><Icon name="users" size={22} /></div>
          <div>
            <strong>Contato direto</strong>
            <span>Fale com o fornecedor sem intermediários.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
