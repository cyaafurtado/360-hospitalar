// 360 Hospitalar — Painel de Gestão: dados mock + RBAC
const ORG_TYPES = [
  { id: "empresa", label: "Empresa" },
  { id: "clinica", label: "Clínica" },
  { id: "hosp_pub", label: "Hospital Público" },
  { id: "hosp_priv", label: "Hospital Privado" },
  { id: "orgao_pub", label: "Órgão Público" },
];
function orgTypeLabel(id) { const t = ORG_TYPES.find((x) => x.id === id); return t ? t.label : id; }

// Perfis (RBAC)
const ROLES = [
  { id: "super", label: "Super Administrador", tone: "violet", desc: "Controle total da plataforma: todas as organizações, usuários, configurações globais, relatórios e auditoria." },
  { id: "admin", label: "Administrador da Organização", tone: "blue", desc: "Gerencia a própria organização: usuários, perfis e permissões internas, relatórios e configurações da organização." },
  { id: "gestor", label: "Gestor", tone: "teal", desc: "Gerencia operações, equipes e aprovações; visualiza relatórios e indicadores. Sem acesso a configurações críticas." },
  { id: "usuario", label: "Usuário", tone: "slate", desc: "Acessa funcionalidades operacionais autorizadas, consulta informações e acompanha suas atividades." },
];
function roleLabel(id) { const r = ROLES.find((x) => x.id === id); return r ? r.label : id; }
function roleTone(id) { const r = ROLES.find((x) => x.id === id); return r ? r.tone : "slate"; }

// Módulos do sistema + RBAC (quais perfis enxergam cada módulo)
const MODULES = [
  { id: "dashboard", label: "Dashboard", icon: "home", group: "Operação", roles: ["super", "admin", "gestor", "usuario"] },
  // COMPRAR — disponível para todas as organizações (toda org pode contratar)
  { id: "buscar", label: "Buscar fornecedores", icon: "search", group: "Comprar", roles: ["super", "admin", "gestor", "usuario"], area: "comprar" },
  { id: "cotacoes", label: "Minhas cotações", icon: "file", group: "Comprar", roles: ["super", "admin", "gestor", "usuario"], area: "comprar" },
  { id: "contratados", label: "Fornecedores contratados", icon: "building", group: "Comprar", roles: ["super", "admin", "gestor"], area: "comprar" },
  // FORNECER — apenas organizações que atuam como fornecedor
  { id: "solicitacoes", label: "Solicitações recebidas", icon: "list", group: "Fornecer", roles: ["super", "admin", "gestor", "usuario"], area: "fornecer" },
  { id: "catalogo", label: "Meu catálogo de serviços", icon: "grid", group: "Fornecer", roles: ["super", "admin", "gestor"], area: "fornecer" },
  { id: "avaliacoes", label: "Avaliações recebidas", icon: "star", group: "Fornecer", roles: ["super", "admin", "gestor", "usuario"], area: "fornecer" },
  { id: "organizacoes", label: "Organizações", icon: "building", group: "Gestão", roles: ["super", "admin"] },
  { id: "usuarios", label: "Usuários", icon: "users", group: "Gestão", roles: ["super", "admin"] },
  { id: "perfis", label: "Perfis & Permissões", icon: "key", group: "Gestão", roles: ["super", "admin"] },
  { id: "aprovacoes", label: "Aprovações", icon: "check", group: "Operação", roles: ["super", "admin", "gestor"] },
  { id: "configuracoes", label: "Configurações", icon: "gear", group: "Segurança", roles: ["super", "admin"] },
];

// Organizações (multi-tenant) — 2 exemplos
const ORGS = [
  { id: "plat", razao: "360 Hospitalar Tecnologia Ltda.", fantasia: "Plataforma 360", cnpj: "41.222.333/0001-90", tipo: "empresa", fornecedor: true, email: "contato@360hospitalar.com.br", telefone: "(11) 4000-0360", endereco: "Av. Paulista, 1000 — São Paulo/SP", status: "ativa", usuarios: 2, criada: "2023-02-10" },
  { id: "santalucia", razao: "Hospital Santa Lúcia Ltda.", fantasia: "Hospital Santa Lúcia", cnpj: "98.765.432/0001-11", tipo: "hosp_priv", fornecedor: false, email: "adm@santalucia.com.br", telefone: "(21) 2710-4422", endereco: "Av. das Clínicas, 55 — Niterói/RJ", status: "ativa", usuarios: 2, criada: "2023-09-21" },
];
function orgById(id) { return ORGS.find((o) => o.id === id); }

// Lado da plataforma — uma organização SEMPRE pode comprar; fornecer é papel adicional
function isFornecedor(org) { return org.tipo === "empresa" || !!org.fornecedor; }
function orgAreas(org) { return isFornecedor(org) ? ["comprar", "fornecer"] : ["comprar"]; }
function areaLabel(a) { return a === "fornecer" ? "Fornece serviços" : "Compra serviços"; }

// Usuário logado (sessão de demonstração) + vínculos (Usuario_Organizacao)
const SESSION_USER = {
  id: "u-ana", nome: "Ana Martins", email: "ana.martins@360hospitalar.com.br",
  vinculos: [
    { orgId: "plat", perfil: "super" },
    { orgId: "santalucia", perfil: "admin" },
  ],
};

// Usuários por organização (Usuarios + Usuario_Organizacao) — 2 exemplos por organização
const USERS = [
  { id: "u-ana", nome: "Ana Martins", email: "ana.martins@360hospitalar.com.br", orgId: "plat", perfil: "super", status: "ativo", ultimo: "há 2 min" },
  { id: "u-joao", nome: "João Vieira", email: "joao@360hospitalar.com.br", orgId: "plat", perfil: "usuario", status: "ativo", ultimo: "há 8 min" },
  { id: "u-elaine", nome: "Elaine Rocha", email: "elaine@santalucia.com.br", orgId: "santalucia", perfil: "super", status: "ativo", ultimo: "há 3 h" },
  { id: "u-fabio", nome: "Fábio Lima", email: "fabio@santalucia.com.br", orgId: "santalucia", perfil: "usuario", status: "ativo", ultimo: "há 30 min" },
];

// Matriz de permissões (capacidade × perfil)
const CAPABILITIES = [
  { id: "cap-orgs-all", label: "Gerenciar todas as organizações", roles: { super: true, admin: false, gestor: false, usuario: false } },
  { id: "cap-org-own", label: "Gerenciar a própria organização", roles: { super: true, admin: true, gestor: false, usuario: false } },
  { id: "cap-users", label: "Criar, editar e remover usuários", roles: { super: true, admin: true, gestor: false, usuario: false } },
  { id: "cap-roles", label: "Definir perfis e permissões", roles: { super: true, admin: true, gestor: false, usuario: false } },
  { id: "cap-ops", label: "Gerenciar operações e processos", roles: { super: true, admin: true, gestor: true, usuario: false } },
  { id: "cap-approve", label: "Aprovar solicitações internas", roles: { super: true, admin: true, gestor: true, usuario: false } },
  { id: "cap-reports", label: "Visualizar relatórios e indicadores", roles: { super: true, admin: true, gestor: true, usuario: false } },
  { id: "cap-global", label: "Configurações globais do sistema", roles: { super: true, admin: false, gestor: false, usuario: false } },
  { id: "cap-audit", label: "Acesso a auditoria e logs", roles: { super: true, admin: true, gestor: false, usuario: false } },
  { id: "cap-self", label: "Atualizar dados pessoais", roles: { super: true, admin: true, gestor: true, usuario: true } },
  { id: "cap-operate", label: "Acessar funcionalidades operacionais", roles: { super: true, admin: true, gestor: true, usuario: true } },
];

// Logs de acesso — 2 exemplos
const ACCESS_LOGS = [
  { id: 1, usuario: "Ana Martins", orgId: "plat", acao: "Login bem-sucedido", ip: "187.45.12.9", agent: "Chrome · macOS", quando: "Hoje, 09:42" },
  { id: 2, usuario: "Elaine Rocha", orgId: "santalucia", acao: "Login bem-sucedido", ip: "177.92.4.21", agent: "Safari · iOS", quando: "Hoje, 08:55" },
];

// Trilha de auditoria (super) — 2 exemplos
const AUDIT = [
  { id: 1, ator: "Ana Martins", acao: "Criou", recurso: "Usuário · João Vieira (Plataforma 360)", de: "—", para: "usuario", quando: "Hoje, 09:50" },
  { id: 2, ator: "Elaine Rocha", acao: "Atualizou", recurso: "Organização · Hospital Santa Lúcia", de: "pendente", para: "ativa", quando: "Ontem, 14:02" },
];

Object.assign(window, {
  ADMIN_DATA: { ORG_TYPES, ROLES, MODULES, ORGS, USERS, CAPABILITIES, ACCESS_LOGS, AUDIT, SESSION_USER },
  orgTypeLabel, roleLabel, roleTone, orgById, isFornecedor, orgAreas, areaLabel,
});
