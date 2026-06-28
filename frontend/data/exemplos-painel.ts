import type { RequestStatus, RequestType } from './types';

export type SolEnviada = {
  id: string;
  prestador: string;
  prestadorContato: string;
  prestadorEmail: string;
  segmento: string;
  tipo: RequestType;
  status: RequestStatus;
  servico: string;
  quando: string;
  resumo: string;
  prazo?: string;
};

export const EXEMPLOS_PAINEL: SolEnviada[] = [
  {
    id: 'SOL-0041',
    prestador: 'MedSafe Esterilização Ltda',
    prestadorContato: '(11) 3344-5566',
    prestadorEmail: 'contato@medsafe.com.br',
    segmento: 'esteril',
    tipo: 'cotacao',
    status: 'respondida',
    servico: 'Esterilização de instrumentais cirúrgicos',
    quando: 'há 2 dias',
    prazo: '10 dias úteis',
    resumo: 'Cotação para esterilização semanal de 800 instrumentais cirúrgicos. Interesse em contrato anual com coleta e entrega.',
  },
  {
    id: 'SOL-0039',
    prestador: 'AirMed Gases Medicinais',
    prestadorContato: '(11) 2255-8800',
    prestadorEmail: 'comercial@airmed.com.br',
    segmento: 'gases',
    tipo: 'cotacao',
    status: 'andamento',
    servico: 'Fornecimento de oxigênio medicinal',
    quando: 'há 4 dias',
    prazo: '5 dias úteis',
    resumo: 'Fornecimento contínuo de O₂ medicinal para 12 leitos de UTI. Necessidade de monitoramento remoto e atendimento 24h.',
  },
  {
    id: 'SOL-0037',
    prestador: 'MedSys Tecnologia em Saúde',
    prestadorContato: '(11) 4002-8922',
    prestadorEmail: 'vendas@medsys.com.br',
    segmento: 'ti',
    tipo: 'contato',
    status: 'nova',
    servico: 'Software de gestão hospitalar',
    quando: 'há 5 dias',
    resumo: 'Interesse em conhecer a solução de prontuário eletrônico com agendamento integrado e módulo de faturamento TISS.',
  },
  {
    id: 'SOL-0034',
    prestador: 'DiagPro Equipamentos Médicos',
    prestadorContato: '(21) 3322-1100',
    prestadorEmail: 'cotacoes@diagpro.com.br',
    segmento: 'equip',
    tipo: 'cotacao',
    status: 'respondida',
    servico: 'Equipamentos de diagnóstico por imagem',
    quando: 'há 8 dias',
    prazo: '15 dias úteis',
    resumo: 'Cotação de 2 ultrassônicos portáteis modelo institucional e contrato de manutenção preventiva anual.',
  },
  {
    id: 'SOL-0031',
    prestador: 'LavClean Hospitalar',
    prestadorContato: '(11) 3377-4400',
    prestadorEmail: 'parceria@lavclean.com.br',
    segmento: 'lavanderia',
    tipo: 'parceria',
    status: 'fechada',
    servico: 'Lavanderia hospitalar terceirizada',
    quando: 'há 12 dias',
    resumo: 'Terceirização completa de lavanderia — enxoval (500 kg/dia), uniformes e roupas cirúrgicas. Contrato de 24 meses assinado.',
  },
  {
    id: 'SOL-0028',
    prestador: 'ProClean Higiene Hospitalar',
    prestadorContato: '(11) 3300-5500',
    prestadorEmail: 'vendas@proclean.com.br',
    segmento: 'limpeza',
    tipo: 'cotacao',
    status: 'nova',
    servico: 'Saneantes e materiais de higiene',
    quando: 'há 14 dias',
    prazo: '7 dias úteis',
    resumo: 'Fornecimento mensal de saneantes, desinfetantes ANVISA e materiais de limpeza para 3 andares e centro cirúrgico.',
  },
  {
    id: 'SOL-0025',
    prestador: 'CapacitaSaúde Treinamentos',
    prestadorContato: '(11) 4003-7800',
    prestadorEmail: 'comercial@capacitasaude.com.br',
    segmento: 'treinamento',
    tipo: 'contato',
    status: 'andamento',
    servico: 'Treinamento em biossegurança NR-32',
    quando: 'há 18 dias',
    resumo: 'Capacitação de 45 colaboradores em NR-32, biossegurança hospitalar e gestão de resíduos de serviços de saúde (RSS).',
  },
];
