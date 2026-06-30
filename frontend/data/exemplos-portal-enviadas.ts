import type { RequestStatus, RequestType } from './types';

export type SolicitacaoEnviada = {
  id: string;
  destinatario: string;
  destinatarioContato: string;
  destinatarioEmail: string;
  segmento: string;
  tipo: RequestType;
  status: RequestStatus;
  servico: string;
  quando: string;
  resumo: string;
  prazo?: string;
};

export const EXEMPLOS_ENVIADAS: SolicitacaoEnviada[] = [
  {
    id: 'ENV-0012',
    destinatario: 'MedSupply Distribuidora',
    destinatarioContato: '(11) 3090-4400',
    destinatarioEmail: 'vendas@medsupply.com.br',
    segmento: 'epi',
    tipo: 'cotacao',
    status: 'respondida',
    servico: 'Luvas cirúrgicas e materiais descartáveis',
    quando: 'há 3 dias',
    prazo: '5 dias úteis',
    resumo: 'Cotação mensal de luvas cirúrgicas estéreis (tamanhos P/M/G), aventais descartáveis e máscaras N95 para reposição de estoque.',
  },
  {
    id: 'ENV-0011',
    destinatario: 'LogMed Transporte e Logística',
    destinatarioContato: '(11) 2200-8800',
    destinatarioEmail: 'parcerias@logmed.com.br',
    segmento: 'transporte',
    tipo: 'parceria',
    status: 'andamento',
    servico: 'Logística e distribuição de materiais hospitalares',
    quando: 'há 5 dias',
    resumo: 'Parceria para distribuição regional dos nossos produtos junto a hospitais e clínicas do interior de SP. Volume estimado: 300 entregas/mês.',
  },
  {
    id: 'ENV-0010',
    destinatario: 'EmbaSteri Embalagens',
    destinatarioContato: '(19) 3344-2200',
    destinatarioEmail: 'comercial@embasteri.com.br',
    segmento: 'esteril',
    tipo: 'cotacao',
    status: 'nova',
    servico: 'Embalagens para esterilização a vapor',
    quando: 'há 7 dias',
    prazo: '10 dias úteis',
    resumo: 'Cotação de embalagens grau cirúrgico para autoclave (papel-grau médico e filme transparente), em diferentes formatos, pedido mínimo mensal de 10.000 unidades.',
  },
  {
    id: 'ENV-0009',
    destinatario: 'LabInsumos Brasil',
    destinatarioContato: '(11) 4001-5500',
    destinatarioEmail: 'cotacoes@labinsumos.com.br',
    segmento: 'lab',
    tipo: 'cotacao',
    status: 'respondida',
    servico: 'Reagentes e insumos de laboratório',
    quando: 'há 11 dias',
    prazo: '7 dias úteis',
    resumo: 'Necessidade de reagentes para testes de biocompatibilidade e controles de qualidade. Interesse em contrato trimestral com preço fixo.',
  },
  {
    id: 'ENV-0008',
    destinatario: 'Compliance Saúde Consultoria',
    destinatarioContato: '(11) 3322-7700',
    destinatarioEmail: 'contato@compliancesaude.com.br',
    segmento: 'consultoria',
    tipo: 'contato',
    status: 'fechada',
    servico: 'Consultoria para certificação ISO 13485',
    quando: 'há 20 dias',
    resumo: 'Consultoria para preparação e obtenção da certificação ISO 13485 (dispositivos médicos). Escopo concluído — certificação obtida com sucesso.',
  },
];
