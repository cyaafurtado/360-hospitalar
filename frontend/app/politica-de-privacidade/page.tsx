import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '../../lib/icons';

export const metadata: Metadata = {
  title: 'Política de Privacidade — 360 Hospitalar',
  description:
    'Saiba como a 360 Hospitalar coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
};

const SECTIONS = [
  {
    id: 'responsavel',
    title: '1. Responsável pelo tratamento',
    body: `A 360 Hospitalar é responsável pelo tratamento dos dados pessoais coletados nesta plataforma. Para dúvidas ou exercício de direitos, entre em contato pelo e-mail privacidade@360hospitalar.com.br.`,
  },
  {
    id: 'dados-coletados',
    title: '2. Dados que coletamos',
    body: `Coletamos diferentes categorias de dados conforme o uso que você faz da plataforma:

• Visitantes: dados de navegação (páginas acessadas, dispositivo, IP anonimizado) para fins de análise de desempenho.
• Solicitantes de orçamento: nome, cargo, organização, e-mail, telefone, estado e cidade — fornecidos voluntariamente ao preencher o formulário de solicitação.
• Fornecedores cadastrados: razão social, CNPJ, dados de contato, documentos comprobatórios (licenças, certificados) e informações do perfil público (descrição, serviços, avaliações recebidas).
• Usuários do Portal: credenciais de acesso (e-mail e senha em hash bcrypt) e registros de atividade para auditoria de segurança.`,
  },
  {
    id: 'finalidade',
    title: '3. Finalidade e base legal',
    body: `Tratamos seus dados com as seguintes finalidades e bases legais (art. 7º da LGPD):

• Exibir o perfil público do fornecedor no diretório — execução de contrato (art. 7º, V).
• Encaminhar solicitações de orçamento ao fornecedor correspondente — execução de contrato (art. 7º, V).
• Verificação documental e emissão do Selo Verificada — execução de contrato e cumprimento de obrigação legal (art. 7º, V e II).
• Enviar comunicações sobre o status da verificação e do cadastro — legítimo interesse (art. 7º, IX).
• Análise estatística anônima de uso da plataforma — legítimo interesse (art. 7º, IX).
• Prevenção a fraudes e segurança da plataforma — legítimo interesse (art. 7º, IX).`,
  },
  {
    id: 'compartilhamento',
    title: '4. Compartilhamento de dados',
    body: `Não vendemos nem comercializamos dados pessoais. Os dados podem ser compartilhados somente nas seguintes situações:

• Com o fornecedor destinatário, quando um comprador envia uma solicitação de orçamento ou contato.
• Com prestadores de serviço técnico (hospedagem, banco de dados, envio de e-mail transacional) que atuam como operadores sob contrato de confidencialidade.
• Com autoridades competentes, quando exigido por lei, ordem judicial ou para defesa de direitos em processos administrativos ou judiciais.`,
  },
  {
    id: 'retencao',
    title: '5. Retenção dos dados',
    body: `Os dados são mantidos pelo tempo necessário às finalidades descritas ou pelos prazos legais aplicáveis:

• Dados de perfil público do fornecedor: enquanto o cadastro estiver ativo; excluídos em até 30 dias após o encerramento.
• Solicitações de orçamento: 5 anos, para fins de registro e eventual disputa contratual.
• Logs de acesso: 6 meses, conforme o Marco Civil da Internet (Lei 12.965/2014, art. 15).
• Documentos da verificação: 5 anos após o encerramento do cadastro.`,
  },
  {
    id: 'direitos',
    title: '6. Seus direitos (LGPD)',
    body: `Nos termos da Lei 13.709/2018, você tem os seguintes direitos em relação aos seus dados pessoais:

• Confirmação e acesso: saber se tratamos seus dados e obter cópia deles.
• Correção: solicitar a atualização de dados incompletos, inexatos ou desatualizados.
• Anonimização, bloqueio ou eliminação: para dados desnecessários ou tratados em desconformidade com a lei.
• Portabilidade: receber seus dados em formato estruturado para transferência a outro fornecedor.
• Eliminação dos dados tratados com base no consentimento.
• Informação sobre compartilhamentos.
• Revogação do consentimento a qualquer momento.

Para exercer qualquer direito, envie sua solicitação para privacidade@360hospitalar.com.br. Responderemos em até 15 dias.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies e tecnologias similares',
    body: `Utilizamos cookies estritamente necessários para o funcionamento da plataforma (autenticação, preferências de sessão). Não utilizamos cookies de rastreamento de terceiros para fins publicitários.

Você pode configurar seu navegador para bloquear ou alertar sobre cookies, mas algumas funcionalidades da plataforma podem deixar de funcionar corretamente.`,
  },
  {
    id: 'seguranca',
    title: '8. Segurança',
    body: `Adotamos medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acesso não autorizado, perda ou destruição acidental, incluindo: transmissão via HTTPS/TLS, senhas armazenadas com hash bcrypt (custo ≥ 12), tokens JWT de curta duração e registro de auditoria de acessos.

Em caso de incidente que possa acarretar risco ou dano relevante aos titulares, notificaremos a ANPD e os afetados nos prazos legais.`,
  },
  {
    id: 'alteracoes',
    title: '9. Alterações nesta política',
    body: `Esta política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas por e-mail aos usuários cadastrados ou por aviso na plataforma. A data da última atualização é indicada no topo desta página.`,
  },
  {
    id: 'contato',
    title: '10. Contato e encarregado (DPO)',
    body: `Para exercer direitos, tirar dúvidas ou registrar reclamações relacionadas à privacidade:

E-mail: privacidade@360hospitalar.com.br
Prazo de resposta: até 15 dias úteis.

Você também pode registrar reclamações diretamente à Autoridade Nacional de Proteção de Dados (ANPD): www.gov.br/anpd`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="screen cv-screen">

      <section className="cv-hero">
        <div className="cv-hero-eyebrow">
          <span className="verified sm"><Icon name="shield2" size={12} stroke={2.4} /> LGPD</span>
          <span>Atualizado em 22 de junho de 2026</span>
        </div>
        <h1>Política de Privacidade</h1>
        <p>
          Esta política descreve como a <strong>360 Hospitalar</strong> coleta, usa, armazena e
          protege dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei
          13.709/2018 — LGPD).
        </p>
      </section>

      <nav className="policy-toc">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="policy-toc-item">
            {s.title}
          </a>
        ))}
      </nav>

      <div className="policy-body">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="policy-section">
            <h2>{s.title}</h2>
            {s.body.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </section>
        ))}
      </div>

      <div className="policy-footer-cta">
        <Link href="/" className="btn-ghost">
          <Icon name="back" size={15} /> Voltar ao início
        </Link>
      </div>

    </div>
  );
}
