// Sautek — dados mock (diretório B2B do setor de saúde)
// Fornecedores e parceiros que atendem clínicas, hospitais e prestadores privados.

const SEGMENTS = [
  { id: "lab", label: "Diagnóstico & Laboratório", icon: "flask" },
  { id: "equip", label: "Equipamentos Médicos", icon: "pulse" },
  { id: "limpeza", label: "Higiene & Limpeza Hospitalar", icon: "spray" },
  { id: "residuos", label: "Gestão de Resíduos", icon: "leaf" },
  { id: "esteril", label: "Esterilização", icon: "shield" },
  { id: "ti", label: "Software & Gestão", icon: "chip" },
  { id: "tele", label: "Telemedicina", icon: "signal" },
  { id: "gases", label: "Gases Medicinais", icon: "drop" },
  { id: "manut", label: "Manutenção de Equipamentos", icon: "wrench" },
  { id: "epi", label: "Uniformes & EPI", icon: "vest" },
  { id: "nutri", label: "Nutrição Hospitalar", icon: "bowl" },
  { id: "farma", label: "Distribuição Farmacêutica", icon: "pill" },
];

const STATES = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

// Paleta de cores para monogramas — tons sóbrios, derivados do azul corporativo
const LOGO_TINTS = [
  "oklch(0.55 0.11 250)", // azul
  "oklch(0.55 0.09 200)", // azul-ciano
  "oklch(0.55 0.10 165)", // verde-saúde
  "oklch(0.55 0.10 285)", // índigo
  "oklch(0.56 0.08 230)", // aço
  "oklch(0.55 0.09 145)", // verde
];

function tintFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return LOGO_TINTS[h % LOGO_TINTS.length];
}

function monogram(name) {
  const clean = name.replace(/[^A-Za-zÀ-ÿ ]/g, "").trim().split(/\s+/);
  if (clean.length === 1) return clean[0].slice(0, 2).toUpperCase();
  return (clean[0][0] + clean[1][0]).toUpperCase();
}

const COMPANIES = [
  {
    id: "medlab",
    name: "MedLab Diagnósticos",
    segment: "lab",
    tagline: "Análises clínicas e apoio laboratorial para redes de saúde",
    city: "Campinas", uf: "SP",
    rating: 4.8, reviews: 312, verified: true, founded: 2004, employees: "500–1.000",
    services: ["Apoio laboratorial 24h", "Coleta domiciliar", "Análises moleculares", "Anatomia patológica", "Telemedicina diagnóstica"],
    badges: ["ISO 9001", "PALC / SBPC", "ANVISA"],
    about: "Rede de apoio laboratorial com mais de 4.000 exames no catálogo e logística refrigerada própria, atendendo hospitais e clínicas em todo o estado.",
    phone: "(19) 3000-1200", site: "medlab.com.br",
  },
  {
    id: "tecvida",
    name: "TecVida Equipamentos",
    segment: "equip",
    tagline: "Equipamentos hospitalares e monitorização multiparâmetros",
    city: "São Paulo", uf: "SP",
    rating: 4.6, reviews: 198, verified: true, founded: 1998, employees: "200–500",
    services: ["Monitores de sinais vitais", "Ventiladores pulmonares", "Bombas de infusão", "Comodato de equipamentos", "Treinamento técnico"],
    badges: ["ANVISA", "ISO 13485", "Inmetro"],
    about: "Importação e distribuição de equipamentos médico-hospitalares com assistência técnica certificada e contratos de comodato para UTIs.",
    phone: "(11) 4002-8922", site: "tecvida.com.br",
  },
  {
    id: "higitec",
    name: "Higitec Serviços Hospitalares",
    segment: "limpeza",
    tagline: "Limpeza terminal e controle de infecção hospitalar",
    city: "Rio de Janeiro", uf: "RJ",
    rating: 4.5, reviews: 144, verified: true, founded: 2009, employees: "1.000+",
    services: ["Limpeza concorrente e terminal", "Higienização de áreas críticas", "Gestão de enxoval", "Controle de pragas", "Equipe dedicada 24/7"],
    badges: ["ISO 9001", "NR-32", "RDC 222"],
    about: "Especializada em higiene hospitalar com protocolos alinhados à CCIH e equipes residentes treinadas para áreas críticas.",
    phone: "(21) 3500-7700", site: "higitec.com.br",
  },
  {
    id: "bioresiduos",
    name: "BioResíduos Ambiental",
    segment: "residuos",
    tagline: "Coleta e tratamento de resíduos de serviços de saúde",
    city: "Curitiba", uf: "PR",
    rating: 4.7, reviews: 89, verified: true, founded: 2011, employees: "200–500",
    services: ["Coleta de resíduos grupo A/B/E", "Tratamento por autoclave", "Logística reversa", "Manifesto digital (MTR)", "Relatórios de conformidade"],
    badges: ["IBAMA", "RDC 222", "PGRSS"],
    about: "Gestão completa de resíduos de saúde com rastreabilidade digital ponta a ponta e licenças ambientais para todo o Sul do país.",
    phone: "(41) 3200-5050", site: "bioresiduos.com.br",
  },
  {
    id: "sterilpro",
    name: "SterilPro Centro de Materiais",
    segment: "esteril",
    tagline: "Esterilização terceirizada e processamento de materiais",
    city: "Belo Horizonte", uf: "MG",
    rating: 4.9, reviews: 76, verified: true, founded: 2015, employees: "50–200",
    services: ["Esterilização por óxido de etileno", "Autoclave a vapor", "Rastreabilidade por lote", "Reprocessamento OPME", "Validação de processos"],
    badges: ["ANVISA", "ISO 11135", "RDC 15"],
    about: "Central de processamento de materiais (CME) terceirizada com rastreabilidade individual de instrumentais e indicadores biológicos.",
    phone: "(31) 3400-9090", site: "sterilpro.com.br",
  },
  {
    id: "clinsys",
    name: "ClinSys Software",
    segment: "ti",
    tagline: "Prontuário eletrônico e gestão para clínicas e hospitais",
    city: "Florianópolis", uf: "SC",
    rating: 4.4, reviews: 421, verified: true, founded: 2013, employees: "200–500",
    services: ["Prontuário eletrônico (PEP)", "Faturamento TISS", "Agenda e telemedicina", "BI assistencial", "Integração com laboratórios"],
    badges: ["LGPD", "Certif. SBIS-CFM", "ISO 27001"],
    about: "Plataforma de gestão em saúde com prontuário eletrônico certificado, faturamento de convênios e painéis de indicadores assistenciais.",
    phone: "(48) 3030-1010", site: "clinsys.com.br",
  },
  {
    id: "telesaude",
    name: "TeleSaúde Connect",
    segment: "tele",
    tagline: "Plataforma de teleconsulta e laudos à distância",
    city: "São Paulo", uf: "SP",
    rating: 4.3, reviews: 167, verified: false, founded: 2019, employees: "50–200",
    services: ["Teleconsulta white-label", "Laudos de imagem remotos", "Segunda opinião médica", "Triagem digital", "API de integração"],
    badges: ["LGPD", "CFM 2.314/22"],
    about: "Infraestrutura de telemedicina para operadoras e hospitais, com fila inteligente de atendimento e emissão de laudos por especialistas.",
    phone: "(11) 4003-3344", site: "telesaude.io",
  },
  {
    id: "oxivida",
    name: "OxiVida Gases Medicinais",
    segment: "gases",
    tagline: "Oxigênio medicinal e redes de gases hospitalares",
    city: "Porto Alegre", uf: "RS",
    rating: 4.6, reviews: 58, verified: true, founded: 2001, employees: "200–500",
    services: ["Oxigênio medicinal", "Ar comprimido medicinal", "Projeto e manutenção de redes", "Cilindros e tanques criogênicos", "Plantão de emergência"],
    badges: ["ANVISA", "RDC 870", "ABNT NBR"],
    about: "Fornecimento de gases medicinais e instalação de redes hospitalares com telemetria de nível e atendimento emergencial 24h.",
    phone: "(51) 3100-6060", site: "oxivida.com.br",
  },
  {
    id: "manutmed",
    name: "ManutMed Engenharia Clínica",
    segment: "manut",
    tagline: "Engenharia clínica e manutenção preventiva certificada",
    city: "Ribeirão Preto", uf: "SP",
    rating: 4.7, reviews: 103, verified: true, founded: 2008, employees: "50–200",
    services: ["Manutenção preventiva e corretiva", "Calibração e segurança elétrica", "Gestão de parque tecnológico", "Laudos para acreditação", "Plantão técnico"],
    badges: ["RDC 02/2010", "Inmetro", "ISO 9001"],
    about: "Engenharia clínica completa para gestão do parque de equipamentos, com indicadores de disponibilidade e suporte a processos de acreditação.",
    phone: "(16) 3600-2020", site: "manutmed.com.br",
  },
  {
    id: "vestmed",
    name: "VestMed Uniformes & EPI",
    segment: "epi",
    tagline: "Vestuário hospitalar e equipamentos de proteção",
    city: "Blumenau", uf: "SC",
    rating: 4.2, reviews: 64, verified: false, founded: 2006, employees: "50–200",
    services: ["Aventais e jalecos", "Campos cirúrgicos", "EPI descartável", "Personalização e bordado", "Logística por assinatura"],
    badges: ["CA / MTE", "ABNT NBR 16064"],
    about: "Confecção e distribuição de vestuário hospitalar e EPIs com certificado de aprovação e programa de reposição automática.",
    phone: "(47) 3300-4040", site: "vestmed.com.br",
  },
  {
    id: "nutricare",
    name: "NutriCare Hospitalar",
    segment: "nutri",
    tagline: "Nutrição clínica e terapia nutricional para internados",
    city: "Salvador", uf: "BA",
    rating: 4.5, reviews: 71, verified: true, founded: 2012, employees: "200–500",
    services: ["Terapia nutricional enteral/parenteral", "Cozinha hospitalar terceirizada", "Dietas especiais", "Consultoria de EMTN", "Controle de custos"],
    badges: ["ANVISA", "RDC 63", "ISO 22000"],
    about: "Operação de nutrição hospitalar e terapia nutricional com equipe multiprofissional e protocolos de segurança alimentar.",
    phone: "(71) 3200-8080", site: "nutricare.com.br",
  },
  {
    id: "farmadistribui",
    name: "FarmaDistribui Logística",
    segment: "farma",
    tagline: "Distribuição farmacêutica com cadeia de frio validada",
    city: "São Paulo", uf: "SP",
    rating: 4.4, reviews: 235, verified: true, founded: 1996, employees: "1.000+",
    services: ["Medicamentos e materiais", "Cadeia de frio validada", "Reposição por consignação", "Gestão de farmácia hospitalar", "Entrega expressa"],
    badges: ["ANVISA", "RDC 304", "Boas Práticas"],
    about: "Distribuidora farmacêutica com central refrigerada validada, atendimento a hospitais e clínicas e reposição automática por nível de estoque.",
    phone: "(11) 4005-6000", site: "farmadistribui.com.br",
  },
];

function segmentLabel(id) {
  const s = SEGMENTS.find((x) => x.id === id);
  return s ? s.label : id;
}

function stateName(uf) {
  const s = STATES.find((x) => x.uf === uf);
  return s ? s.name : uf;
}

// Solicitações recebidas pelo fornecedor logado (cotações e contatos)
const REQUEST_TYPES = [
  { id: "cotacao", label: "Cotação" },
  { id: "contato", label: "Contato" },
  { id: "parceria", label: "Parceria" },
];
const REQUEST_STATUS = [
  { id: "nova", label: "Nova" },
  { id: "andamento", label: "Em andamento" },
  { id: "respondida", label: "Respondida" },
  { id: "fechada", label: "Fechada" },
];

const REQUESTS = [
  { id: "SOL-2041", solicitante: "Mariana Alves", organizacao: "Hospital Santa Lúcia", cargo: "Coordenadora de Suprimentos", tipo: "cotacao", status: "nova", prestador: "MedLab Diagnósticos", uf: "SP", cidade: "Campinas", email: "compras@santalucia.com.br", phone: "(19) 3232-1010", quando: "há 2 horas", resumo: "Apoio laboratorial 24h para nova unidade — 12 mil exames/mês." },
  { id: "SOL-2040", solicitante: "Dr. Paulo Renato", organizacao: "Clínica Vida Plena", cargo: "Diretor Técnico", tipo: "contato", status: "nova", prestador: "MedLab Diagnósticos", uf: "RJ", cidade: "Niterói", email: "diretoria@vidaplena.com.br", phone: "(21) 2710-4422", quando: "há 5 horas", resumo: "Gostaria de conversar sobre coleta domiciliar para pacientes crônicos." },
  { id: "SOL-2038", solicitante: "Fernanda Costa", organizacao: "Rede SaúdeMais", cargo: "Gerente de Compras", tipo: "cotacao", status: "andamento", prestador: "MedLab Diagnósticos", uf: "MG", cidade: "Belo Horizonte", email: "fernanda@saudemais.com.br", phone: "(31) 3045-7788", quando: "ontem", resumo: "Cotação de análises moleculares para 3 hospitais da rede." },
  { id: "SOL-2035", solicitante: "Ricardo Tavares", organizacao: "Instituto Oncológico SP", cargo: "Suprimentos", tipo: "parceria", status: "andamento", prestador: "MedLab Diagnósticos", uf: "SP", cidade: "São Paulo", email: "ricardo@iosp.org.br", phone: "(11) 3567-9000", quando: "há 2 dias", resumo: "Proposta de parceria para anatomia patológica com SLA dedicado." },
  { id: "SOL-2031", solicitante: "Juliana Prado", organizacao: "Maternidade Aurora", cargo: "Enfermeira-chefe", tipo: "cotacao", status: "respondida", prestador: "MedLab Diagnósticos", uf: "PR", cidade: "Curitiba", email: "juliana@aurora.com.br", phone: "(41) 3220-5566", quando: "há 3 dias", resumo: "Exames de triagem neonatal — volume estimado 400/mês." },
  { id: "SOL-2028", solicitante: "Marcos Vinícius", organizacao: "Hospital Regional Norte", cargo: "Compras", tipo: "contato", status: "respondida", prestador: "MedLab Diagnósticos", uf: "BA", cidade: "Salvador", email: "marcos@hrn.ba.gov.br", phone: "(71) 3611-2200", quando: "há 4 dias", resumo: "Informações sobre apoio laboratorial em regime de plantão." },
  { id: "SOL-2022", solicitante: "Camila Restani", organizacao: "Clínica Imagem Sul", cargo: "Administradora", tipo: "cotacao", status: "fechada", prestador: "MedLab Diagnósticos", uf: "RS", cidade: "Porto Alegre", email: "camila@imagemsul.com.br", phone: "(51) 3019-4433", quando: "há 1 semana", resumo: "Pacote de exames laboratoriais de rotina — fechado contrato anual." },
  { id: "SOL-2019", solicitante: "André Lopes", organizacao: "UPA Central", cargo: "Coordenador", tipo: "cotacao", status: "fechada", prestador: "MedLab Diagnósticos", uf: "SC", cidade: "Joinville", email: "andre@upacentral.sc.gov.br", phone: "(47) 3433-1100", quando: "há 2 semanas", resumo: "Exames de urgência com laudo em até 60 min." },
];

function typeLabel(id) { const t = REQUEST_TYPES.find((x) => x.id === id); return t ? t.label : id; }
function statusLabel(id) { const s = REQUEST_STATUS.find((x) => x.id === id); return s ? s.label : id; }

Object.assign(window, {
  SAUTEK_DATA: { SEGMENTS, STATES, COMPANIES, REQUESTS, REQUEST_TYPES, REQUEST_STATUS },
  tintFor, monogram, segmentLabel, stateName, typeLabel, statusLabel,
});
