---
description: Grafo (graph) para: Abaixo eu tenho um md que pedi pra ser criado
argument-hint: [o que construir nesta rodada]
model: opus
---

# Grafo (graph) — Abaixo eu tenho um md que pedi pra ser criado

## Objetivo
Abaixo eu tenho um md que pedi pra ser criado. Meu projeto esta muito parado e tem muitas pausas e muitos erros e preciso que ele continue e seja construido e revisado diversas vezes olhando as regras de negocio que estao todas abaixo, então preciso de varios agentes trabalhando em loope e tbm em horarios sem parar a cada 6 horas, pois as vezes meu limite do claude acaba e quero que ele continue automaticamente de onde parou, caso ainda exista. e se terminar tudo, quero que as rotinas que vc criar seja pausada


# 360 Hospitalar — Project Brief completo (para agentes de melhoria contínua)

> **Propósito deste documento:** dar a um construtor/orquestrador de agentes (grafo em loop,
> melhoria contínua) uma fotografia completa e fiel do estado real do projeto — código, dados,
> infraestrutura, lacunas e riscos — para que ele possa planejar e priorizar trabalho sem precisar
> redescobrir o repositório do zero. Gerado em 2026-10-09 por leitura direta do código-fonte
> (não dos docs antigos, que estão desatualizados — ver seção 9).
>
> **Fonte de verdade concorrente:** `CLAUDE.md` na raiz do repo é a especificação de produto
> (regras de marca, design tokens, regra de honestidade de números, convenções). Este documento
> não a substitui — ele descreve **o que existe de fato** hoje, incluindo onde o código já
> avançou além da spec e onde ainda está atrás dela. Qualquer agente deve ler os dois.

---

## 1. O que é o produto

**360 Hospitalar** é um diretório B2B do setor de saúde brasileiro, com dois lados:

- **Comprador** (clínica, hospital público/privado, órgão público — chamado no código de
  **"instituição"/"contratante"**): navega o diretório **sem login**, busca/filtra fornecedores,
  abre perfis e envia pedido de orçamento/contato. Para enviar o pedido precisa criar conta e
  completar um cadastro de instituição (CNPJ, CNES quando aplicável, responsáveis).
- **Fornecedor** (empresa do setor — laboratório, equipamentos, esterilização, resíduos, gases
  medicinais, software, telemedicina etc.): cria conta, cadastra a empresa (CNPJ validado contra
  a Receita Federal), gerencia perfil, catálogo de serviços, fotos, documentos de verificação e
  responde solicitações recebidas no **Portal**.
- **Administrador** (equipe interna 360 Hospitalar): modera fornecedores, usuários, documentos de
  verificação e cadastros de instituição a partir de um **Painel Admin** próprio.

Esses três perfis são contas com `tipo` fixo (`fornecedor` | `contratante` | `admin`) — não há
troca de perfil numa mesma conta (decisão explícita, commit `1fefea0`).

---

## 2. Stack e infraestrutura (estado real, confirmado no código)

| Camada | Tecnologia confirmada | Versão (package.json) |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind 3 | next ^14.2.35, react ^18.3.1, tailwindcss ^3.4.4 |
| Estado/UI | zustand (persist), axios, lucide-react, recharts, jspdf+jspdf-autotable | zustand ^4.4.7, axios ^1.6.0, recharts ^3.9.0 |
| Backend | Express + TypeScript + `pg` (SQL puro, **sem ORM**) | express ^4.18.2, pg ^8.11.3, typescript ^5.3.2 |
| Auth | JWT (access) + refresh token rotativo em cookie httpOnly + bcryptjs | jsonwebtoken ^9.0.2, bcryptjs ^2.4.3, cookie-parser ^1.4.7 |
| Upload | multer (memória, sem disco) → `BYTEA` no Postgres | multer ^2.4.0 |
| E-mail transacional | Resend (fallback: loga o link em dev se não houver `RESEND_API_KEY`) | resend ^6.22.1 |
| Segurança HTTP | helmet, express-rate-limit, CORS por regex de domínio | helmet ^7.1.0, express-rate-limit ^7.1.5 |
| Deploy frontend | Vercel (`frontend/vercel.json`, framework `nextjs`), auto-deploy no `git push` | — |
| Deploy backend | Railway (`backend/railway.json`, Nixpacks), auto-deploy no `git push`; start roda migrations antes do servidor | — |
| Banco | Postgres (plugin Railway) | — |
| DNS | Hostinger: `360hospitalar.com.br` → A record Vercel; `api.360hospitalar.com.br` → CNAME Railway | — |
| Testes automatizados | **Nenhum** (zero arquivos `*.test.*`/`*.spec.*` no repo) | — |
| CI | **Nenhum pipeline** (sem `.github/workflows`) encontrado | — |

Repositório: `C:\Projetos\360-hospitalar`, branch `main`, working tree limpo na data deste
documento. `.gitignore` cobre `node_modules/`, `dist/`, `.next/`, `.env*`, `*.log` — confirmado
que nenhum artefato de build está commitado (0 arquivos em `dist/`, `node_modules/`, `.next/`
rastreados pelo git).

### Estrutura real de pastas
```
360-hospitalar/
  frontend/
    app/                 # App Router — ver tabela de rotas (seção 4)
      admin/             # painel do administrador (4 subrotas)
      painel/            # painel da instituição/contratante
      portal/            # painel do fornecedor
      ...                # rotas públicas (home, buscar, empresa, cadastrar, entrar, etc.)
    components/          # 24 componentes (Header, FilterRail, CompanyCard, AdminNav,
                          #   PainelNav, PortalNav, SupplierProfile, VerifiedTag, ...)
    lib/                 # api.ts (axios+refresh), cnpj.ts, masks.ts, pdf.ts, services.ts,
                          #   store.ts (zustand), token.ts, useAsync.ts, icons.tsx
    data/                # reference.ts (SEGMENTS=21, STATES=27), types.ts
    styles/globals.css   # 4 temas (orbit/trust/clinic/editorial) + densidade via data-attrs
  backend/
    src/
      config/env.ts           # lê todas as env vars, com defaults de dev
      controllers/            # auth, companies, solicitacoes, cnpj, instituicoes,
                               #   documentos, fotos, admin (7 controllers)
      db/
        connection.ts, migrate.ts
        migrations/            # 24 arquivos .sql numerados (001→024), aplicados em sequência
        repos/                  # companies, solicitacoes, usuarios, instituicoes,
                                 #   documentos, fotos (6 repositórios SQL puro)
      middleware/              # asyncHandler, auth (requireAuth/optionalAuth/requireTipo/
                               #   requireAdmin), errorHandler, upload (multer memoryStorage)
      routes/                  # auth, cnpj, companies, solicitacoes, profile, admin
      services/                # auth.service (hash/JWT), cnpj.service (Receita Federal),
                               #   email.service (Resend)
      models/types.ts          # tipos compartilhados do domínio (Company, Solicitacao, Usuario...)
    scripts/copy-migrations.js # copia .sql pro dist/ no build
    railway.json
  sautek/ admin/ *.html screenshots/   # referência visual de alta fidelidade (NÃO é build)
  CLAUDE.md            # especificação de produto/marca/design (fonte de verdade de UX)
  README.md, DEPLOY.md, COMO-CONTINUAR.md   # ⚠️ desatualizados — ver seção 9
```

---

## 3. Modelo de dados real (24 migrations aplicadas em sequência, `migrate.ts`)

Tabela de controle `migrations` registra o que já rodou; cada arquivo roda uma única vez.

| # | Arquivo | O que faz |
|---|---|---|
| 001 | `companies.sql` | Tabela `companies` — diretório de fornecedores (nome, segmento, tagline, cidade/UF, rating, reviews, verified, founded, employees, services[], badges[], about, phone, site, email, atende_ufs[]) |
| 002 | `requests.sql` | Tabela `solicitacoes` — pedidos de cotação/contato/parceria (tipo, status, prestador_id, dados do solicitante, resumo) |
| 003 | `seed_demo.sql` | Seed inicial de demonstração (parcialmente revertida depois — ver 006–008) |
| 004 | `contrato.sql` | Campos de contrato dentro de `solicitacoes` (assinado, número, valor, datas) |
| 005 | `usuarios.sql` | Tabelas `usuarios` (email único case-insensitive, senha_hash, tipo, company_id, ativo) e `refresh_tokens` (hash SHA-256 do token, nunca o valor puro; motivo de revogação: rotacao/logout/seguranca) — **substitui o login mock** |
| 006 | `donos.sql` | Vínculo dono↔empresa/solicitação (fecha vazamento de dados entre contas) |
| 007 | `remove_demo_extras.sql` | Remove extras de demonstração |
| 008 | `limpa_base_demo.sql` **e** `status_empresa.sql` | (dois arquivos `008_*`, ambos aplicados — ver risco na seção 8) — limpeza de dados demo + coluna `status` (`pre_cadastro`\|`completo`) em `companies` |
| 009 | `plano_empresa.sql` | Coluna `plano` em `companies` (`free`\|`verified`\|`premium`) |
| 010–011 | `admin.sql`, `admin_alisson.sql` | Tipo de usuário `admin`; promove `alisson580@gmail.com` a admin |
| 012 | `catalogo_servicos.sql` | Catálogo de serviços por empresa (nome, descrição, preço, prazo, destaque) |
| 013 | `verificacao_email.sql` | Confirmação de e-mail obrigatória no cadastro |
| 014 | `recuperacao_senha.sql` | Fluxo "esqueci a senha" |
| 015 | `documentos_fornecedor.sql` | Tabela de documentos de verificação do fornecedor — arquivo em **BYTEA** direto no Postgres |
| 016 | `verificacao_documentos.sql` | Status de análise por documento (enviado/aprovado/rejeitado) |
| 017 | `fotos_fornecedor.sql` | Fotos da empresa — também **BYTEA** no Postgres, sem aprovação (aparecem ao subir) |
| 018 | `servico_lista.sql` | Lista de serviços de interesse (seleção múltipla) no formulário de orçamento |
| 019 | `instituicoes.sql` | Tabela `instituicoes` (contratante): tipo (`clinica`\|`hosp_priv`\|`hosp_pub`\|`orgao_pub`), CNPJ, CNES, UF/cidade, about, contato — 1:1 com `usuarios` |
| 020 | `verificacao_instituicao.sql` | Status de verificação da instituição (`em_analise`\|`aprovado`\|`rejeitado`) — nunca bloqueia uso da conta, é só selo |
| 021 | `endereco_instituicao.sql` | Endereço completo da instituição (para exibir mapa) |
| 022 | `email_financeiro_instituicao.sql` | E-mail para nota fiscal/financeiro |
| 023 | `dados_juridicos_instituicao.sql` | Razão social, nome fantasia, natureza jurídica, responsável de cadastro e responsável técnico |
| 024 | `founded_opcional.sql` | `founded` (ano de abertura) passa a aceitar nulo — exibido como "Desde {ano real do CNPJ}" |

**Tabelas finais:** `companies`, `solicitacoes`, `usuarios`, `refresh_tokens`, `instituicoes`,
documentos (fornecedor), fotos (fornecedor), `migrations`. **Não existem** ainda as tabelas da
Parte B do CLAUDE.md (`Organizacoes`, `Usuario_Organizacao`, `Logs_Acesso`, `Auditoria`,
`Tokens` genérica) — ver gap na seção 7.

---

## 4. Rotas do frontend (reais, lidas de `frontend/app/`)

| Rota | Tela | Acesso |
|---|---|---|
| `/` | Home | público |
| `/buscar` | Resultados de busca | público |
| `/empresa/[id]` | Detalhe do fornecedor | público |
| `/empresa/[id]/orcamento` | Solicitar orçamento | **requer conta** (contratante) |
| `/cadastrar` | Cadastro (fornecedor **ou** instituição, assistente multi-etapas, 799 linhas) | público |
| `/entrar` | Login real (JWT) | público |
| `/confirmar-email` | Confirmação de e-mail | público (via link) |
| `/recuperar-senha`, `/redefinir-senha` | Fluxo de senha esquecida | público |
| `/diferenciais`, `/como-verificamos`, `/politica-de-privacidade` | Páginas institucionais | público |
| `/portal` | Dashboard do fornecedor (solicitações) | fornecedor logado |
| `/portal/dashboard` | Resumo/métricas do fornecedor | fornecedor logado |
| `/portal/perfil` | Editar perfil, catálogo, fotos, documentos de verificação | fornecedor logado |
| `/portal/solicitacao/[id]`, `/portal/enviada/[id]` | Detalhe de solicitação / confirmação de envio | fornecedor logado |
| `/painel` | Dashboard da instituição/contratante (fornecedores contatados, tabela) | contratante logado |
| `/painel/perfil` | Perfil da instituição (razão social, CNPJ/CNES, endereço+mapa, responsáveis, e-mail financeiro) | contratante logado |
| `/painel/solicitacao/[id]` | Detalhe de uma solicitação enviada pela instituição | contratante logado |
| `/admin` | Dashboard do admin | admin logado |
| `/admin/usuarios` | Gestão de usuários (reset de senha, ativar/desativar, excluir) | admin logado |
| `/admin/contratos` | Solicitações/contratos (visão admin) | admin logado |
| `/admin/documentos` | Fila de aprovação de documentos de verificação | admin logado |
| `/admin/instituicoes`, `/admin/instituicoes/[id]` | Fila e detalhe de aprovação de instituições (CNPJ/CNES) | admin logado |

Isso já é **bem mais** do que a tabela de rotas do `README.md`/`CLAUDE.md` descreve (que lista
só a Parte A pública + `/portal` e `/portal/perfil`). O painel do admin e o painel da instituição
já existem e estão em produção de fato, mas com um modelo de permissão mais simples do que o
RBAC multi-tenant descrito na "Parte B" do `CLAUDE.md` (ver seção 7).

---

## 5. API do backend (real, lida das rotas montadas em `src/index.ts`)

Prefixo base: `/api`. Todas as rotas passam por `helmet`, CORS restrito por regex de domínio,
`express.json({limit:'10mb'})`, `cookie-parser` e um rate-limit global (300 req/15min por IP).
`optionalAuth` roda em toda requisição (não bloqueia, só preenche `req.user` quando há token).

### `/api/auth` (rate-limit dedicado: 20 req/15min nas rotas sensíveis)
- `POST /register` — cria conta (fornecedor ou contratante), dispara e-mail de confirmação
- `POST /verify-email`, `POST /resend-verification`
- `POST /login` — devolve access token; refresh token vai em cookie httpOnly
- `POST /forgot-password`, `POST /reset-password`
- `POST /refresh` — rotação de refresh token (janela de graça configurável `AUTH_ROTACAO_GRACA_MS`)
- `POST /logout` — revoga refresh token no servidor
- `GET /me` — requer auth

### `/api/cnpj/:cnpj` — requer auth, rate-limit próprio (40/10min)
Consulta em cascata CNPJá → BrasilAPI (cache em memória de 24h, por processo — ver risco §8).

### `/api/companies`
- `GET /` — lista pública (diretório)
- `GET /:id` — detalhe público
- `POST /` — criar empresa, **requer auth**
- `GET /fotos/:id` — pública, sem token (usada direto em `<img src>`)

### `/api/requests` (tudo exige auth — nenhuma rota anônima)
- `GET /`, `POST /`, `GET /:id`
- `PATCH /:id/status`, `PATCH /:id/contract`

### `/api/profile` (tudo exige auth — perfil da empresa da conta logada)
- `GET /`, `PUT /` — perfil do fornecedor
- `POST /documentos`, `PUT /documentos/:id`, `DELETE /documentos/:id`
- `POST /documentos/:id/arquivos` (upload), `GET.../arquivos/:arquivoId` (download),
  `DELETE .../arquivos/:arquivoId`
- `POST /documentos/:id/enviar`, `POST /documentos/:id/cancelar` (envia/cancela análise)
- `POST /fotos` (upload), `DELETE /fotos/:id`
- `GET /instituicao`, `POST /instituicao` (cria na primeira vez; depois só atualiza dados básicos)

### `/api/admin` — tudo exige `requireAuth` + `requireAdmin` (tipo === 'admin')
- Fornecedores: `GET /fornecedores`, `PATCH /fornecedores/:id` (verified/plano),
  `DELETE /fornecedores/:id`
- Usuários: `GET /usuarios`, `POST /usuarios/:id/resetar-senha` (gera senha temporária e revoga
  sessões), `PATCH /usuarios/:id/ativo`, `DELETE /usuarios/:id`
- Solicitações: `GET /solicitacoes`
- Documentos: `GET /documentos`, `PATCH /:id/aprovar`, `PATCH /:id/rejeitar`,
  `GET /documentos/arquivos/:arquivoId`
- Instituições: `GET /instituicoes`, `GET /instituicoes/:id`, `PATCH /:id/aprovar`,
  `PATCH /:id/rejeitar`

`GET /health` (fora de `/api`) responde `{status:'ok', service, timestamp}`.

---

## 6. Regras de produto que já estão implementadas (confirme antes de "corrigir")

- **Honestidade de números** (regra dura do `CLAUDE.md` §4.1): confirmado nos commits
  `881f805`, `2f7c4bf`, `9f599a2`, `aa7ee25` — estatísticas fake foram removidas uma a uma
  (hospitais fake, "2.400+ fornecedores", avaliações fake). O princípio está sendo seguido na
  prática, não é só intenção no documento.
- **"Desde {ano}" é o ano real do CNPJ** (commit `af605c0`, migration 024) — `founded` passou a
  aceitar `null` em vez de inventar um ano.
- **Dono de dado por conta** (commit `d6d2d9b` "Fecha o vazamento") — toda `company` e
  `solicitacao` pertence a um usuário; isso é estrutural (coluna de posse + `requireAuth`), não
  cosmético.
- **Sem troca de perfil por conta** (commit `1fefea0`) — decisão deliberada, não lacuna.
- **Verificação (documentos e instituição) nunca bloqueia o uso da conta** — é selo de confiança,
  aprovação roda em paralelo ao uso normal (ver comentários em `instituicoes.controller.ts` e
  `016_verificacao_documentos.sql`).
- **CNPJ/CNES validados contra fonte oficial** (`cnpj.service.ts`, dois provedores em cascata,
  validação de dígito verificador local antes de gastar chamada externa).

---

## 7. Lacunas reais vs. a especificação do `CLAUDE.md` ("Parte B")

O `CLAUDE.md` descreve a Parte B como: **RBAC completo** (`super`/`admin`/`gestor`/`usuario`,
perfil por vínculo), **multi-tenant** por `organizacao_id`, tabelas `Organizacoes`,
`Usuarios`, `Usuario_Organizacao` (N:N), `Logs_Acesso`, `Auditoria`, `Tokens`, grupos
**Comprar**/**Fornecer** por organização, e rotas `/auth/{register-org,switch-org,...}` +
recursos `/organizations`, `/roles`, `/permissions`, `/approvals`, `/audit`, etc., com a matriz
`admin/admin-data.jsx` (ROLES/MODULES/CAPABILITIES) como fonte da verdade.

**O que existe de fato hoje é mais simples:**
- Permissão = um único campo `usuarios.tipo` com 3 valores fixos (`fornecedor` | `contratante` |
  `admin`). Não há perfis por vínculo, não há papéis intermediários (`gestor`, `super`), não há
  matriz de capabilities.
- Não há conceito de **organização** nem **multi-tenant** — é 1 usuário : 1 empresa OU 1 usuário
  : 1 instituição (`company_id` em `usuarios`, `usuario_id` único em `instituicoes`). Uma pessoa
  não pode pertencer a duas empresas, nem uma empresa ter dois usuários com papéis diferentes.
- Não existem as tabelas `Organizacoes`, `Usuario_Organizacao`, `Logs_Acesso`, `Auditoria`,
  `Tokens` (genérica — existe só `refresh_tokens`, específica de auth).
- Não há `/auth/switch-org`, `/organizations`, `/roles`, `/permissions`, `/approvals`,
  `/access-logs`, `/audit`, `/settings`.
- O "admin" implementado é um **flag de conta**, não um papel dentro de uma matriz RBAC.

**Leitura correta disso:** o produto evoluiu organicamente para cobrir necessidades reais
(verificação de documentos, verificação de instituição, catálogo de serviços, fotos, contrato)
**sem seguir o desenho multi-tenant/RBAC da Parte B**. Isso não é necessariamente um bug — pode
ser que o modelo simples de 3 tipos continue sendo suficiente — mas é uma decisão que precisa ser
tomada explicitamente antes de qualquer agente tentar "completar a Parte B" às cegas: migrar para
multi-tenant real é uma reformulação de esquema (toda tabela ganharia `organizacao_id`, toda
query de posse mudaria), não um incremento.

---

## 8. Dívida técnica e riscos concretos (achados na leitura do código)

1. **Arquivos binários em `BYTEA` no Postgres** (`documentos`, `fotos` — migrations 015/017).
   Funciona, mas Postgres não é feito para blob storage: cada PDF/foto infla o banco, backups
   ficam mais pesados e caros, e não há CDN/cache de borda para as fotos públicas
   (`GET /api/companies/fotos/:id`). Limites atuais: 8MB/documento, 6MB/foto — aceitável agora,
   mas o padrão não escala bem se o volume de fornecedores crescer.
2. **Cache de CNPJ em memória, por processo** (`cnpj.service.ts`, `Map` local, TTL 24h). Em
   Railway com múltiplas instâncias (ou qualquer restart) o cache não é compartilhado nem
   persistido — cada instância reconsulta a API externa, inclusive para o mesmo CNPJ.
3. **`JWT_SECRET` tem fallback hardcoded** (`'default_secret_change_in_production'` em
   `env.ts`). Não há um check de boot que impeça subir em produção sem essa variável definida —
   risco de rodar com o segredo público do código-fonte se alguém esquecer de configurar no
   Railway.
4. **Duas migrations com o mesmo número `008_*`** (`008_limpa_base_demo.sql` e
   `008_status_empresa.sql`). O `migrate.ts` aparentemente aplica por nome de arquivo (ambas
   existem e presumivelmente já rodaram em produção), mas a numeração duplicada é uma fonte de
   confusão/erro para quem for adicionar a próxima migration ou reordenar.
5. **Zero testes automatizados** em todo o repo (frontend e backend). Qualquer loop de agentes
   que for "melhorar sempre" via grafo precisa, no mínimo, instrumentar testes de regressão antes
   de automatizar mudanças — hoje a única rede de segurança é revisão manual + deploy e observar.
6. **Sem CI** — lint/typecheck/build não são verificados automaticamente antes do merge; a
   garantia de "não quebrou" depende de rodar localmente antes do `git push` (que já dispara
   deploy direto em produção via Vercel/Railway).
7. **Documentação de topo (`README.md`, `DEPLOY.md`, `COMO-CONTINUAR.md`) está desatualizada**
   — ver seção 9. Isso é um risco direto para qualquer agente automatizado: se ele ler só esses
   três arquivos (e não o código), vai planejar com base em um estado do projeto que já não
   existe há dezenas de commits.
8. **`backend/dist/` está presente no disco de trabalho** (não rastreado pelo git, confirmado) —
   não é risco de repositório, mas pode confundir um agente que varra o filesystem local em vez
   de `git ls-files`.
9. **`fotos`/`documentos` guardam o binário na mesma tabela/linha consultada para metadados** —
   toda leitura de metadados de documento no admin potencialmente carrega BYTEA junto se as
   queries não projetarem colunas explicitamente (não confirmado se já há projeção seletiva nos
   repos; vale um agente revisar `documentos.repo.ts`/`fotos.repo.ts` antes de assumir que está
   otimizado).

---

## 9. Documentos do repositório que estão desatualizados (não confiar neles sem revisar)

| Arquivo | Afirma | Realidade atual |
|---|---|---|
| `README.md` | "Login do portal é mock por enquanto" | Login é real: JWT + bcrypt + refresh rotativo (migration 005, `auth.service.ts`) |
| `README.md` | Lista de rotas só com Parte A (`/`, `/buscar`, `/empresa/[id]`, `/cadastrar`, `/entrar`, `/portal`, `/portal/perfil`) | Existem também `/painel/*` (instituição) e `/admin/*` (4 subrotas), confirmação de e-mail, recuperação de senha, páginas institucionais |
| `README.md` | API lista 8 endpoints | Existem rotas de `/auth/*` (9), `/cnpj/:cnpj`, `/profile/*` (documentos, fotos, instituição) e `/admin/*` (12+) não listadas |
| `COMO-CONTINUAR.md` | "⏳ Parte B — login real com JWT/bcrypt, RBAC, multi-tenant" como pendente | Login real com JWT/bcrypt **já existe**; RBAC/multi-tenant genuinamente ainda não (isso está certo) |
| `DEPLOY.md` §Parte 5 | Menciona link a partir de `verificadoagora.com.br` e um domínio legado `360-hospitalar.verificadoagora.com.br` | Specs atuais (`CLAUDE.md`) já tratam `360hospitalar.com.br` como domínio definitivo — confirmar se a migração de domínio mencionada no §4.4 do próprio `DEPLOY.md` ("desligar o domínio antigo") já foi concluída antes de seguir esse documento ao pé da letra |

**Ação recomendada para qualquer agente:** tratar `README.md`/`COMO-CONTINUAR.md`/`DEPLOY.md`
como guias operacionais de *como rodar/implantar*, não como fonte de verdade sobre *o que já foi
construído*. Antes de reportar algo como "pendente", confirmar no código (rotas, controllers,
migrations) e no `git log`, não nesses três arquivos.

---

## 10. Design system (confirmado em `globals.css` e `store.ts`)

- 4 temas via `data-theme` no container `.app`: `orbit` (padrão, navy + lima — direção atual),
  `trust`, `clinic`, `editorial` (os três últimos herdados de `sautek/styles.css`, mantidos no
  painel Aparência mas não são mais a direção padrão de produto).
  Densidade via `data-density` (`compact`/`regular`/`comfy`).
- **Atenção à armadilha documentada no próprio `CLAUDE.md`:** `DEFAULT_ACCENT` em
  `frontend/lib/store.ts` (`oklch(0.30 0.10 287)`, navy) é injetado inline como `--primary` pelo
  `AppShell` e **vence** o bloco CSS do tema. Confirmado no código: `store.ts` tem o comentário
  exato sobre isso. Qualquer agente que troque o tema base em `globals.css` **precisa** trocar
  `DEFAULT_ACCENT` junto, ou a UI fica com o tema antigo "colado" via inline style.
- Regra de cor: lima é destaque único (CTA primário sobre navy + palavra-chave em títulos) — não
  espalhar.
- Sem emoji em UI; ícones SVG line (lucide-react + `lib/icons.tsx` inline).
- Máscaras de input centralizadas em `lib/masks.ts` (CNPJ, cartão, validade, telefone).

---

## 11. Regras invioláveis para qualquer agente que for editar este projeto

Extraídas do `CLAUDE.md` (fonte de verdade) + padrões observados no histórico de commits —
um agente de melhoria contínua **não pode violar** nenhuma destas:

1. **Nunca inventar número em tela.** Só entra valor que vem do banco, é fato estrutural
   verificável (ex.: `SEGMENTS.length`, 27 UFs) ou vem de fonte oficial (Receita Federal). Sem
   dado real → mostrar `—` e descrever o critério. Isso vale para rating/reviews também: sem
   avaliação real, não renderizar estrela nem nota.
2. **Fluxo de commit obrigatório:** toda alteração de código é commitada e enviada
   (`git add` → `git commit` descritivo → `git push`) ao final de cada tarefa concluída. Não
   deixar trabalho sem commit — o deploy automático (Vercel/Railway) depende do push.
3. **Migrations são aditivas e numeradas**, nunca editar uma migration já aplicada em produção;
   erro de SQL numa migration nova derruba o `start` do backend (migrate roda antes do
   `index.js`) — testar localmente antes de subir uma migration.
4. **CORS/segurança não se relaxa** para conveniência de desenvolvimento — origem liberada é
   `360hospitalar.com.br` (raiz + subdomínios) e `*.vercel.app`, ponto.
5. **Sem ORM** — toda a camada de dados é SQL puro em `backend/src/db/repos/*.repo.ts`;
   não introduzir Prisma/TypeORM/Sequelize etc. como "melhoria".
6. **Sem emoji na UI**; ícones SVG line.
7. **3 temas herdados + 1 tema padrão (`orbit`) e densidade** continuam como CSS vars
   trocáveis por atributo no container raiz — não hardcodear cor fora de `globals.css`/tokens.
8. **Verificação (documentos/instituição) é selo, nunca trava de uso** — qualquer melhoria na
   fila de aprovação do admin não pode passar a bloquear login/uso da conta durante a análise.
9. **Honestidade de HTML/comentários**: não copiar o padrão Babel-no-browser dos protótipos
   (`sautek/*.jsx`, `admin/*.jsx`, `*.html`) para produção — eles são só referência visual de
   alta fidelidade.

---

## 12. Backlog priorizado (ponto de partida para o grafo de agentes)

Organizado por impacto/urgência, não por ordem de preferência estética — um orquestrador pode
reordenar, mas a classificação abaixo reflete risco real encontrado no código.

### P0 — Risco de produção / segurança
- [ ] Remover o fallback hardcoded de `JWT_SECRET` em `env.ts`; falhar o boot em produção
  (`NODE_ENV=production`) se a env var não estiver definida.
- [ ] Resolver a duplicidade de migration `008_*` (dois arquivos com o mesmo prefixo numérico) —
  decidir uma convenção que impeça recorrência (ex.: checar no CI que não há prefixo repetido).
- [ ] Auditar `documentos.repo.ts`/`fotos.repo.ts`: confirmar que listagens (admin, perfil) nunca
  arrastam a coluna `BYTEA` inteira quando só precisam de metadados.

### P1 — Confiabilidade / manutenibilidade
- [ ] Introduzir testes automatizados mínimos: pelo menos os fluxos críticos de auth
  (registro/login/refresh/reset de senha), criação de solicitação, e aprovação/rejeição no admin.
- [ ] Adicionar um pipeline de CI (lint + typecheck + build) para frontend e backend, mesmo que
  simples, antes do próximo lote de mudanças automatizadas via agente.
- [ ] Atualizar `README.md`, `DEPLOY.md`, `COMO-CONTINUAR.md` para refletir o estado real (rotas,
  endpoints, estado "Parte A completa + partes da Parte B implementadas de forma simplificada").
- [ ] Decidir explicitamente (com o dono do produto) se a Parte B multi-tenant/RBAC completa do
  `CLAUDE.md` ainda é a direção desejada, ou se o modelo atual de 3 tipos fixos deve ser
  formalizado como a arquitetura definitiva — isso muda totalmente o escopo de qualquer trabalho
  futuro de agentes nessa área.

### P2 — Escalabilidade
- [ ] Avaliar mover armazenamento de documentos/fotos de `BYTEA` para object storage (S3-compatível
  ou equivalente), mantendo só metadados no Postgres.
- [ ] Mover o cache de consulta de CNPJ para um armazenamento compartilhado (ou aceitar
  explicitamente que é só uma otimização por instância, documentando a decisão).

### P3 — Produto (gaps de funcionalidade, não de risco)
- [ ] Revisar se a verificação de instituição (CNPJ/CNES) e a verificação de documentos do
  fornecedor têm UX consistente entre si no admin (duas filas, dois modelos de aprovação/rejeição
  — avaliar se vale unificar).
- [ ] Avaliar necessidade de notificação (e-mail/push) quando uma solicitação muda de status, hoje
  limitada ao que `email.service.ts` já dispara (confirmar escopo exato antes de expandir).

---

## 13. Diretrizes para o construtor/orquestrador em grafo-loop

Pensado para quem vai configurar agentes que iteram continuamente sobre este repositório:

1. **Nó de contexto obrigatório antes de qualquer ação:** todo agente deve ler `CLAUDE.md` +
   este arquivo (`PROJECT-BRIEF.md`) antes de propor ou aplicar mudança — nunca só um dos dois.
2. **Nó de verificação de veracidade:** antes de um agente afirmar "X está pendente/quebrado",
   ele deve confirmar lendo o código atual (rotas, controllers, migrations, `git log`), nunca só
   os `.md` de topo (ver seção 9 — eles mentem por desatualização, não por má-fé).
3. **Nó de guardrail de produto:** toda mudança de UI passa por checagem contra a seção 11 antes
   de aplicar (números reais, sem emoji, tema/densidade, selo não bloqueia uso).
4. **Nó de guardrail de dados:** toda mudança de schema é uma migration nova, numerada,
  idempotente (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS` como já é o padrão nas
  24 migrations existentes), testada localmente antes do commit.
5. **Nó de commit/push:** ao final de cada iteração do loop que alterar código, comitar e enviar
  (regra 2 da seção 11) — não acumular mudanças não commitadas entre iterações do grafo.
6. **Critério de "ciclo bem-sucedido":** build do frontend (`next build`) e do backend
  (`tsc` + `copy-migrations`) sem erro, migrations aplicando limpo contra um Postgres local, e
  nenhuma violação das regras da seção 11 introduzida.
7. **Critério de parada/escalonamento para humano:** qualquer decisão que toque a pergunta aberta
  da seção 7 (RBAC/multi-tenant completo vs. modelo simplificado atual) não deve ser resolvida
  automaticamente pelo loop — é uma decisão de produto que precisa de aprovação humana explícita,
  dado o tamanho da reformulação de esquema envolvida.

---

*Fim do brief. Qualquer trecho deste documento que divergir do código no momento da leitura deve
ceder ao código — este arquivo é uma fotografia de 2026-10-09, não um contrato.*

## O pedido desta execução
$ARGUMENTS

_Se o pedido acima vier vazio, execute o objetivo do laço como está. Se vier preenchido, ele é a peça desta rodada — dentro do objetivo, da barra e da referência abaixo._

## A barra
Nada é entregue sem cumprir, ao mesmo tempo:
- todo crítico que receber o resultado final reage com um "uau" honesto e consegue nomear em UMA frase o elemento que carrega esse uau — "correto e competente" NÃO passa. Única exceção: tarefa puramente determinística, em que existe uma saída certa e não existe "quão bem foi feito" — nesse caso o crítico escreve `WOW: N/A — determinística`, justifica em uma linha por que não cabe julgamento de qualidade, e aprova só pela correção verificada. Fora dessa exceção, sem uau não há APROVADO
- num A/B cego contra Procure concorrentes que fazem essa, fica no MESMO patamar ou acima — quem julga não consegue apontar nenhuma lacuna específica e corrigível que a referência resolva e este artefato não; empatar de igual para igual JÁ passa, ficar visivelmente abaixo reprova

## Referência
Referência a igualar ou superar: Procure concorrentes que fazem essa
A barra é ficar **no mesmo patamar ou acima** dessa referência. Empatar de igual para igual já passa; o que reprova é ficar visivelmente abaixo em algo nomeável e corrigível.
Restrições de estilo (a respeitar, mas nunca usadas como referência de qualidade): as convenções do próprio projeto.

## Como verificar
Evidência obrigatória para este tipo de artefato (interface, página ou slide):
> Capturas renderizadas em 390px e 1440px, tema claro e escuro, mais os estados vazio, carregando e erro. Julgar a imagem. Console limpo faz parte da evidência.
- Abrir/rodar o artefato no estado exato em que o usuário vai receber e registrar a reação honesta ANTES de racionalizar. Depois nomear o elemento que carrega o uau e o elo mais fraco. Nunca julgar pelo código-fonte quando existe algo renderizado ou executável para olhar.
- Colocar a referência na MESMA situação e observar o que ela faz — é isso que transforma "ficou abaixo" de opinião em fato citável. Lacuna vale como reprovação só quando é nomeável e corrigível; gosto irredutível vira RISCO NÃO VERIFICADO, não veredito.
- Ler não é verificar. Veredito sem a evidência nomeada não conta. Na dúvida, REPROVADO.

## As etapas do grafo (graph)
- `classificar_assunto` — Descobre do que se trata
- `buscar_dados` — Reúne o que falta na fonte certa  _(só quando: o caso exigir dado externo)_
- `construir_entrega` — Produz a entrega final
- `escalar_humano` — Passa para uma pessoa  _(só quando: o caso for sensível ou estiver fora do escopo)_

## Como percorrer
- Siga as etapas na ordem. Só desvie por uma condição escrita acima; **nunca pule etapa**.
- Ao sair de cada etapa, escreva em uma linha o que ficou decidido — a etapa seguinte recebe isso.
- **Ao fim da última etapa, rode a crítica** contra a barra, como etapa separada e explícita, antes de entregar.
- Se a crítica reprovar, volte à etapa que originou a lacuna, não ao começo. Teto: **12 rodadas**.
- **Rastro obrigatório:** no relatório final, uma linha `ETAPAS: nome → o que ficou decidido` por etapa percorrida, na ordem. Etapa sem linha é etapa pulada — e etapa pulada reprova a entrega.

## O que escrever em cada crítica
A etapa de crítica termina com este bloco, em texto puro — é ele que decide se abre outra rodada:
```
VEREDITO: APROVADO | REPROVADO
WOW: <uau | ok | meh — ou "N/A — determinística" + o porquê em uma linha>
COMO VERIFIQUEI: <comandos rodados e o que observei — obrigatório>
O QUE FALTA (em ordem de impacto; vazio se APROVADO):
1. <maior lacuna>
```

## Relatório final — a ÚLTIMA coisa que você escreve
```
ETAPAS: <nome → o que ficou decidido, uma linha por etapa, na ordem>
RODADAS: <n> (parada por: aprovação | platô | teto)
VEREDITO FINAL: APROVADO | ENTREGUE ABAIXO DA BARRA
PENDÊNCIAS: <lista ou "nenhuma">
ARQUIVOS: <caminhos>
```
Sem esse bloco a tarefa **não está entregue**. `ENTREGUE ABAIXO DA BARRA` é um resultado honesto; "aprovado com ressalva" não existe.
