export type Credential = {
  name: string;
  detail: string;
  status: 'valida' | 'vigente' | 'vencida';
};

export type PortfolioItem = {
  title: string;
  imageUrl?: string;
};

export type SupplierReview = {
  author: string;
  stars: number;
  text: string;
  viaPlatform: boolean;
};

export type Supplier = {
  id: string;
  name: string;
  category: string;
  city: string;
  verified: boolean;
  marketSince: number;
  platformSince: number;
  contractsCompleted: number;
  institutionsServed: number;
  onTimeRate: number;
  avgResponseHours: number;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  credentials: Credential[];
  portfolio: PortfolioItem[];
  reviews: SupplierReview[];
};

export const SUPPLIERS_DIFERENCIAIS: Supplier[] = [
  {
    id: 'medeng-clinica',
    name: 'MedEng Engenharia Clínica',
    category: 'Engenharia clínica',
    city: 'Marabá/PA',
    verified: true,
    marketSince: 2009,
    platformSince: 2022,
    contractsCompleted: 184,
    institutionsServed: 47,
    onTimeRate: 96,
    avgResponseHours: 4,
    rating: 4.8,
    reviewsCount: 63,
    specialties: [
      'Calibração de equipamentos',
      'Manutenção preventiva',
      'Gestão de parque tecnológico',
      'Engenharia clínica terceirizada',
    ],
    credentials: [
      { name: 'AFE / ANVISA', detail: 'Autorização de Funcionamento de Empresa', status: 'vigente' },
      { name: 'ISO 9001', detail: 'Certificação de gestão da qualidade', status: 'valida' },
      { name: 'CREA-PA', detail: 'Registro de responsável técnico', status: 'valida' },
      { name: 'Licença Sanitária Municipal', detail: 'Marabá/PA', status: 'vencida' },
    ],
    portfolio: [
      { title: 'Parque tecnológico — Hospital Regional do Sudeste do Pará' },
      { title: 'Calibração anual — Rede de UTIs Santa Casa' },
      { title: 'Manutenção preventiva — Centro Cirúrgico Hospital Bom Jesus' },
    ],
    reviews: [
      {
        author: 'Hospital Regional do Sudeste do Pará',
        stars: 5,
        text: 'Equipe extremamente pontual e técnica. Reduziram nosso tempo de equipamento parado em mais de 40%.',
        viaPlatform: true,
      },
      {
        author: 'Santa Casa de Misericórdia',
        stars: 5,
        text: 'Contrato de manutenção preventiva sem nenhuma pendência em 3 anos. Recomendamos sem ressalvas.',
        viaPlatform: true,
      },
      {
        author: 'Clínica Vida Plena',
        stars: 4,
        text: 'Bom atendimento, só o prazo de um chamado específico passou do combinado.',
        viaPlatform: false,
      },
    ],
  },
  {
    id: 'novaeng-servicos',
    name: 'NovaEng Serviços Hospitalares',
    category: 'Manutenção hospitalar',
    city: 'Belém/PA',
    verified: false,
    marketSince: 2025,
    platformSince: 2026,
    contractsCompleted: 0,
    institutionsServed: 0,
    onTimeRate: 0,
    avgResponseHours: 12,
    rating: 0,
    reviewsCount: 0,
    specialties: ['Manutenção preventiva', 'Instalações elétricas hospitalares'],
    credentials: [
      { name: 'AFE / ANVISA', detail: 'Autorização de Funcionamento de Empresa', status: 'vigente' },
    ],
    portfolio: [],
    reviews: [],
  },
];
