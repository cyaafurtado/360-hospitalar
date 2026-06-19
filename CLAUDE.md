# 360 Hospitalar — Especificação para Claude Code

> Fonte da verdade do produto. O protótipo HTML/React+Babel (`sautek/*.jsx`, `admin/*.jsx`
> e os `*.html`) é **referência visual de alta fidelidade** — recrie aparência e comportamento
> fielmente, mas na stack de produção abaixo. Não copie o Babel-no-browser para produção.

---

## STACK & INFRA (igual ao projeto Portal-Licitações, para gestão unificada)

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind + axios + zustand + lucide-react.
  Deploy na **Vercel** (auto-deploy a cada `git push`). Pasta `frontend/`.
- **Backend:** Express + TypeScript + `pg` (PostgreSQL com **SQL puro**, migrations versionadas —
  **sem ORM**). JWT + bcrypt para auth. Deploy no **Railway** (auto-deploy a cada `git push`),
  banco **Postgres no Railway**. Pasta `backend/`.
- **Domínio:** Hostinger (DNS). Front em `360-hospitalar.verificadoagora.com.br`,
  API em `api-360-hospitalar.verificadoagora.com.br` (CNAMEs apontando p/ Vercel/Railway).
- Fluxo de trabalho: **editar → `git push` → Vercel e Railway atualizam sozinhos.** Sem upload manual.

### Estrutura do repositório
```
360-hospitalar/
  frontend/            # Next.js (Vercel)
    app/               # rotas (App Router)
    components/        # Icon, Stars, Logo, OrbitMark, CompanyCard, FilterRail…
    lib/               # api (axios), icons, theme, masks, hooks
    data/              # types, segmentos, 27 UFs
    styles/globals.css # Tailwind + tokens/CSS do protótipo (3 temas + densidade)
  backend/             # Express + pg (Railway)
    src/config/env.ts · src/db/{connection,migrate}.ts · src/db/migrations/*.sql
    src/db/repos/*.repo.ts · src/middleware/* · src/controllers/* · src/routes/* · src/services/*
    src/index.ts · railway.json · scripts/copy-migrations.js
  sautek/  admin/  *.html  screenshots/   # referência visual (NÃO é build)
```

### Convenções herdadas do Portal-Licitações (seguir igual)
- API client em `frontend/lib/api.ts` (axios + interceptor de token + `NEXT_PUBLIC_API_URL`).
- Migrations `.sql` numeradas em `backend/src/db/migrations/`; `db/migrate.ts` aplica as pendentes
  (tabela `migrations`). `railway.json`: build `npm install && npm run build`, start
  `node dist/db/migrate.js && node dist/index.js`.
- CORS libera `*.verificadoagora.com.br` e `*.vercel.app`. Helmet + rate-limit em `/api`.
- Camada de dados isolada: front fala só com a API; trocar mock↔API é trivial.

### Estado atual (slices)
- ✅ **Parte A** (diretório público + portal + orçamento) — neste stack.
- ⏳ **Parte B** (Painel de Gestão: auth real, RBAC, multi-tenant) — próximo slice.

---

## 1. Visão geral do produto

360 Hospitalar conecta **compradores** (clínicas, hospitais, prestadores privados) a
**fornecedores** do setor de saúde (laboratório, equipamentos, esterilização, resíduos,
gases medicinais, software, telemedicina, etc.). Dois lados:
- **Comprador (público, sem login):** busca, filtra, abre perfis e envia pedido de orçamento/contato.
- **Fornecedor (logado):** cadastra a empresa, edita o perfil e gerencia as solicitações no Portal.

Fidelidade exigida: **alta**.

### Rotas (Next.js App Router)
| Rota | Tela | Acesso |
|---|---|---|
| `/` | Home | público |
| `/buscar` | Resultados de busca | público |
| `/empresa/[id]` | Detalhe do fornecedor | público |
| `/empresa/[id]/orcamento` | Solicitar orçamento | público |
| `/cadastrar` | Cadastro de empresa (4 etapas) | público |
| `/entrar` | Login do portal | público |
| `/portal` | Solicitações recebidas | fornecedor logado |
| `/portal/perfil` | Meu perfil | fornecedor logado |

---

## 3. Marca

**Logo "Orbit Plus"** (viewBox `0 0 100 100`): anel `<ellipse cx=50 cy=50 rx=40 ry=18 stroke=PRIMARY
stroke-width=5 transform="rotate(-30 50 50)"/>`; "+" esmeralda `<rect x=44.5 y=33 w=11 h=34 rx=5.5/>`
+ `<rect x=33 y=44.5 w=34 h=11 rx=5.5/>`; satélite `<circle cx=86 cy=34 r=5/>`.
Wordmark "360" (ink) + "Hospitalar" (azul). Tagline "REDE DE PRESTADORES".
Fontes: Bricolage Grotesque 800 (wordmark), Nunito Sans 700 (tagline), Hanken Grotesk (UI).

## 4. Design tokens (3 temas + densidade)
Tema base `trust`. `data-theme` (`trust`|`clinic`|`editorial`), `data-density`
(`compact`|`regular`|`comfy`) e `--primary` inline. Trust: `--primary: oklch(0.56 0.16 248)`,
`--accent: oklch(0.68 0.15 165)`, `--star: oklch(0.74 0.15 78)`. Valores completos em
`frontend/styles/globals.css` (portados de `sautek/styles.css`, a fonte da verdade visual).

## 5. Modelo de dados
```ts
type Segment = { id: string; label: string; icon: string };  // 12 segmentos
type State   = { uf: string; name: string };                 // 27 (26 UFs + DF)
type Company = { id; name; segment; tagline; city; uf; rating; reviews; verified;
  founded; employees; services[]; badges[]; about; phone; site; atendeUfs?[] };
type RequestType = "cotacao"|"contato"|"parceria";
type RequestStatus = "nova"|"andamento"|"respondida"|"fechada";
type Request = { id; solicitante; cargo; organizacao; tipo; status; prestador;
  uf; cidade; email; phone; quando; resumo };
```
Helpers: `segmentLabel`, `stateName`, `typeLabel`, `statusLabel`, `monogram`, `tintFor`.
`STATES` deve ter os **27 estados** em ordem alfabética por UF.

## 6. Telas (resumo — detalhes nos `sautek/*.jsx`)
- **Home**: header sticky, hero + busca grande + stats, chips de segmento, grid de destaque (top 6),
  trust band, footer.
- **Resultados** `/buscar`: FilterRail (segmento c/ contagem, UF, nota mínima) + barra (contagem,
  ordenar, grade/lista) + chips ativos + filtragem client-side.
- **Detalhe** `/empresa/[id]`: hero (logo 88px, nota, CTAs), Sobre, Serviços (✓), Avaliações
  (distribuição + reviews), sidebar (certificações + contato), similares. CTAs levam a `/orcamento`.
- **Solicitar orçamento** `/empresa/[id]/orcamento` (`sautek/quote.jsx`): tipo (cotação/contato/parceria),
  seus dados (nome, cargo, org, e-mail, telefone, UF, cidade), serviço + prazo + detalhes;
  validação; tela de sucesso com protocolo `SOL-####` e recap. Em produção `POST /quotes` cria a
  `Request` que aparece no Portal do fornecedor.
- **Cadastro** `/cadastrar` (4 etapas): Dados / Área de atuação (segmento, sede, 27 UFs onde atende,
  porte, frase) / Contato & selos (certificações, conselho RT, termos) / Plano & verificação.
- **Login** `/entrar`: painel azul + form (mock por enquanto → `/portal`).
- **Portal** `/portal`: subnav, cards de resumo, filtros, tabela de solicitações; linha expande com
  **chat + anexo de documento + mudança de status** (ver `.req-panel`/`.rp-*` no CSS e `sautek/portal.jsx`).
- **Meu perfil** `/portal/perfil`: hero + cards (dados/contato/UFs) com modo editar/salvar.

## 7. Planos (etapa 4 do cadastro)
`free` Básico (Grátis) · `verified` Verificada (gratuita mediante análise) · `premium` Destaque
Premium (R$ 19,90/mês, único com cartão). Selo "Verificada" quando `verified`/`premium`.

---

# PARTE B — Painel de Gestão (próximo slice)

Back-office multi-tenant com **auth unificada** (JWT access ~15min + refresh httpOnly rotativo,
bcrypt cost ≥12), **RBAC** (`super`/`admin`/`gestor`/`usuario`, perfil **por vínculo**),
**multi-tenant** por coluna `organizacao_id`. Tipos de org: `empresa`/`clinica`/`hosp_pub`/
`hosp_priv`/`orgao_pub`. Grupos **Comprar** (toda org) e **Fornecer** (org fornecedora:
`tipo==='empresa'` sempre, ou flag `fornecedor`). Referência de front: `admin/*.jsx`
(`360 Hospitalar — Painel de Gestão.html`). Modelagem/contratos/segurança: ver `admin/admin-data.jsx`
(ROLES, MODULES, CAPABILITIES) — a matriz de permissões é a fonte da verdade do RBAC.

Tabelas: `Organizacoes`, `Usuarios`, `Usuario_Organizacao` (vínculo N:N + perfil), `Logs_Acesso`,
`Auditoria`, `Tokens`. Rotas: `/auth/{register-org,login,refresh,logout,forgot-password,
reset-password,verify-email,switch-org}` + recursos `/organizations`, `/users`, `/roles`,
`/permissions`, `/approvals`, `/reports`, `/access-logs`, `/audit`, `/settings` (todos com
authMiddleware + tenantScope + rbacGuard).

## Notas
- Não usar emoji; ícones são SVG line (Lucide / set inline). Visual sóbrio, sem gradientes pesados.
- Máscaras: `maskCNPJ`, `maskCard`, `maskExp`, `maskPhone`.
- Mantenha os 3 temas e a densidade como CSS vars trocáveis por atributo no container raiz.

## Fluxo de commits (obrigatório)
- **Toda alteração de código deve ser commitada e enviada automaticamente** ao repositório remoto.
- Após cada tarefa concluída: `git add` nos arquivos alterados → `git commit` com mensagem descritiva → `git push`.
- Não deixar alterações sem commit. O deploy automático (Vercel/Railway) depende do push.
