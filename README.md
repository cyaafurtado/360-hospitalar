# 360 Hospitalar

Diretório B2B do setor de saúde: clínicas e hospitais encontram fornecedores/parceiros
verificados; fornecedores gerenciam o perfil e as solicitações no Portal do parceiro.

**Stack (igual ao Portal-Licitações):** Next.js 14 (Vercel) + Express/TypeScript + `pg`
(PostgreSQL, SQL puro) no Railway. Fluxo: `git push` → deploy automático.

```
frontend/   Next.js 14 (App Router) + Tailwind → Vercel
backend/    Express + pg + migrations .sql      → Railway (+ Postgres)
sautek/  admin/  *.html  screenshots/           → referência visual (não é build)
CLAUDE.md                                        → especificação (Parte A + Parte B)
```

## Rodar localmente

```bash
# Backend (porta 3001) — precisa de um Postgres; configure backend/.env
cd backend && npm install && npm run migrate && npm run dev

# Frontend (porta 3000)
cd frontend && npm install && npm run dev
```

`frontend/.env.local` já aponta a API para `http://localhost:3001`.

## Rotas (Parte A)
`/` Home · `/buscar` Resultados · `/empresa/[id]` Detalhe · `/empresa/[id]/orcamento`
Solicitar orçamento · `/cadastrar` Cadastro · `/entrar` Login · `/portal` Solicitações ·
`/portal/perfil` Meu perfil.

## API (Parte A)
`GET /health` · `GET /api/companies` · `GET /api/companies/:id` · `POST /api/companies` ·
`GET /api/requests` · `POST /api/requests` · `PATCH /api/requests/:id/status` ·
`GET /api/profile` · `PUT /api/profile`.

## Deploy
Veja **[DEPLOY.md](DEPLOY.md)** (Vercel + Railway + subdomínios na Hostinger) e
**[COMO-CONTINUAR.md](COMO-CONTINUAR.md)** (fluxo do dia a dia).

## Estado
- ✅ Parte A — diretório + portal + orçamento.
- ⏳ Parte B — Painel de Gestão (auth real, RBAC, multi-tenant). Ver `CLAUDE.md` e `admin/`.
- Login do portal é mock por enquanto (vira real na Parte B).
