import Link from 'next/link';
import { Icon } from '../../lib/icons';

const STEPS = [
  {
    num: '01',
    title: 'Solicitação pelo fornecedor',
    text: 'O fornecedor envia sua solicitação de verificação diretamente pela plataforma, junto com os documentos comprobatórios digitalizados: licenças, certificados, registros em conselhos e certidões.',
  },
  {
    num: '02',
    title: 'Triagem documental',
    text: 'Nossa equipe de curadoria recebe os documentos e verifica integridade, legibilidade e coerência com os dados cadastrais informados — nome, CNPJ, vigência e órgão emissor.',
  },
  {
    num: '03',
    title: 'Consulta nas fontes oficiais',
    text: 'Cada documento é confrontado diretamente nos portais dos órgãos emissores: ANVISA, conselhos profissionais (CRM, COREN, CRF, CRO…), INMETRO, IBAMA e sistemas de certidões federais, estaduais e municipais.',
  },
  {
    num: '04',
    title: 'Auditoria de regularidade',
    text: 'Verificamos a situação cadastral na Receita Federal, ausência de restrições sanitárias ativas (SINAVISA), regularidade junto ao FGTS/INSS e eventuais penalidades registradas em portais de transparência.',
  },
  {
    num: '05',
    title: 'Parecer e emissão do selo',
    text: 'Com todas as fontes confirmando regularidade, emitimos o Selo Verificada. Qualquer inconsistência gera uma notificação ao fornecedor com prazo para regularização antes de nova análise.',
  },
  {
    num: '06',
    title: 'Reavaliação periódica',
    text: 'O selo tem validade de 12 meses. Próximo do vencimento, notificamos o fornecedor para atualizar documentos. Denúncias de compradores também acionam reavaliação imediata.',
  },
];

const DOCS = [
  { icon: 'shield2', label: 'Licença Sanitária / Alvará de Funcionamento', desc: 'Emitida pela Vigilância Sanitária municipal ou estadual, obrigatória para estabelecimentos de saúde e distribuidores.' },
  { icon: 'shield2', label: 'Registro ANVISA', desc: 'Consulta direta no portal CONSULTA.ANVISA.GOV.BR para verificar registros, autorizações de funcionamento e situação de produtos.' },
  { icon: 'shield2', label: 'Certificados ISO (9001, 13485, 27001…)', desc: 'Validados junto ao organismo certificador credenciado pelo INMETRO que emitiu o certificado.' },
  { icon: 'shield2', label: 'Registros em conselhos profissionais', desc: 'CRM, COREN, CRF, CRO, CRBM, CRN, CREFITO — verificados nos portais de cada conselho federal.' },
  { icon: 'shield2', label: 'Certidões negativas', desc: 'Certidão Conjunta da RFB/PGFN, FGTS (CEF), INSS e dívida ativa estadual e municipal.' },
  { icon: 'shield2', label: 'Licença Ambiental', desc: 'Para empresas de gestão de resíduos, gases e insumos regulados — verificada nos órgãos estaduais de meio ambiente (SEMAS, CETESB, FEAM e similares).' },
  { icon: 'shield2', label: 'Boas Práticas de Fabricação (BPF/GMP)', desc: 'Certificado emitido pela ANVISA para fabricantes de medicamentos, correlatos e saneantes.' },
  { icon: 'shield2', label: 'NR-32 (Segurança em saúde)', desc: 'Verificamos a existência de PCMSO/PPRA atualizado e treinamento em biossegurança para empresas prestadoras de serviço.' },
];

const SOURCES = [
  { label: 'ANVISA', url: 'consulta.anvisa.gov.br' },
  { label: 'SINAVISA', url: 'sinavisa.anvisa.gov.br' },
  { label: 'Receita Federal / PGFN', url: 'receita.economia.gov.br' },
  { label: 'CEF — FGTS', url: 'caixa.gov.br' },
  { label: 'Portais dos Conselhos Federais', url: 'cfm.org.br · cofen.gov.br · cff.org.br…' },
  { label: 'INMETRO — Certificados', url: 'inmetro.gov.br' },
  { label: 'Portal da Transparência', url: 'portaltransparencia.gov.br' },
  { label: 'Órgãos Ambientais Estaduais', url: 'SEMAS, CETESB, FEAM e similares' },
];

export default function ComoVerificamosPage() {
  return (
    <div className="screen cv-screen">

      {/* Hero */}
      <section className="cv-hero">
        <div className="cv-hero-eyebrow">
          <span className="verified sm"><Icon name="check" size={12} stroke={2.4} /> Verificada</span>
          <span>Metodologia de auditoria</span>
        </div>
        <h1>Como verificamos os fornecedores</h1>
        <p>
          O Selo Verificada da 360 Hospitalar não é autodeclaratório. Cada empresa passa por um
          processo de auditoria documental conduzido pela nossa equipe de curadoria, com consulta
          direta nas fontes oficiais — antes de qualquer selo ser emitido.
        </p>
      </section>

      {/* Por que verificar */}
      <section className="cv-section">
        <div className="cv-section-label">Por que a verificação importa</div>
        <div className="cv-why-grid">
          <div className="cv-why-card">
            <Icon name="shield2" size={26} />
            <h3>Segurança para compradores</h3>
            <p>Clínicas e hospitais precisam de fornecedores regularizados. Uma licença vencida ou um registro suspenso pode gerar autuações sanitárias e riscos para pacientes.</p>
          </div>
          <div className="cv-why-card">
            <Icon name="star" size={26} />
            <h3>Credibilidade para fornecedores</h3>
            <p>O selo diferencia empresas sérias no diretório. Compradores priorizam fornecedores verificados nas cotações — é um diferencial competitivo real, não apenas cosmético.</p>
          </div>
          <div className="cv-why-card">
            <Icon name="users" size={26} />
            <h3>Ecossistema confiável</h3>
            <p>Um diretório com verificação rigorosa reduz o risco de fraudes, empresas fantasma e fornecedores sem capacidade técnica no setor de saúde.</p>
          </div>
        </div>
      </section>

      {/* Processo passo a passo */}
      <section className="cv-section">
        <div className="cv-section-label">Processo de verificação</div>
        <h2>Seis etapas de auditoria</h2>
        <div className="cv-steps">
          {STEPS.map((s) => (
            <div key={s.num} className="cv-step">
              <span className="cv-step-num">{s.num}</span>
              <div className="cv-step-body">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documentos verificados */}
      <section className="cv-section">
        <div className="cv-section-label">O que auditamos</div>
        <h2>Tipos de documentos analisados</h2>
        <div className="cv-docs-grid">
          {DOCS.map((d) => (
            <div key={d.label} className="cv-doc-card">
              <span className="cv-doc-ico"><Icon name={d.icon as 'shield2'} size={18} /></span>
              <div>
                <strong>{d.label}</strong>
                <p>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fontes oficiais */}
      <section className="cv-section">
        <div className="cv-section-label">Fontes consultadas</div>
        <h2>Portais e sistemas oficiais</h2>
        <p className="cv-section-desc">
          Nossa equipe acessa diretamente os sistemas governamentais — nunca confiaos apenas no
          documento enviado pelo fornecedor. Abaixo, as principais fontes:
        </p>
        <div className="cv-sources">
          {SOURCES.map((src) => (
            <div key={src.label} className="cv-source-row">
              <span className="cv-source-label">{src.label}</span>
              <span className="cv-source-url">{src.url}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Prazo e validade */}
      <section className="cv-section cv-section-split">
        <div>
          <div className="cv-section-label">Prazo</div>
          <h2>Quanto tempo leva?</h2>
          <p>
            A análise completa leva <strong>até 2 dias úteis</strong> após o recebimento de todos
            os documentos. Casos que exigem consulta a múltiplos órgãos estaduais podem levar até
            4 dias úteis. O fornecedor é notificado por e-mail em cada etapa.
          </p>
        </div>
        <div>
          <div className="cv-section-label">Validade</div>
          <h2>Por quanto tempo vale?</h2>
          <p>
            O Selo Verificada tem validade de <strong>12 meses</strong>. Aos 10 meses, enviamos um
            aviso de renovação. O fornecedor que não renovar tem o selo suspenso automaticamente ao
            final da vigência. Denúncias fundamentadas de compradores acionam uma reavaliação
            imediata, independente do prazo.
          </p>
        </div>
      </section>

      {/* Limitações */}
      <section className="cv-section cv-disclaimer">
        <Icon name="signal" size={20} />
        <div>
          <h3>O que a verificação não garante</h3>
          <p>
            O Selo Verificada atesta a <strong>regularidade documental</strong> da empresa na data
            da auditoria. Ele não é uma garantia de qualidade dos serviços prestados, não substitui
            a due diligence interna do comprador e não cobre ocorrências posteriores à emissão.
            Recomendamos sempre verificar avaliações de outros compradores e solicitar referências
            antes de fechar contratos de alto valor.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="cv-cta">
        <div className="cv-cta-inner">
          <span className="verified"><Icon name="check" size={13} stroke={2.4} /> Verificada</span>
          <h2>Quer o selo para sua empresa?</h2>
          <p>O processo é gratuito. Cadastre sua empresa e solicite a verificação.</p>
          <div className="cv-cta-btns">
            <Link href="/cadastrar" className="btn-primary">
              Solicitar verificação <Icon name="arrow" size={15} />
            </Link>
            <Link href="/buscar" className="btn-ghost">
              Ver fornecedores verificados
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
