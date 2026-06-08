# COMO CONTINUAR — 360 Hospitalar

> Mesmo fluxo do Portal-Licitações. Tudo sincroniza pelo **GitHub**; Vercel/Railway
> atualizam sozinhos a cada `git push`.

---

## ⚠️ ANTES DE DESLIGAR O PC (sempre)

```powershell
git add -A
git commit -m "wip: salvando trabalho"
git push
```

Sem o `push`, o próximo dia / o celular não veem suas mudanças.

---

## 🌐 LINKS (favorite no navegador)

| O que é | Onde |
|---|---|
| Site no ar (cliente vê) | https://360-hospitalar.verificadoagora.com.br |
| Painel **Vercel** (frontend) | https://vercel.com/dashboard |
| Painel **Railway** (backend + banco) | https://railway.app/dashboard |
| Código no GitHub | https://github.com/SEU_USUARIO/360-hospitalar |

---

## 💻 RODAR NO PC (desenvolvimento)

Precisa de um Postgres local (ou use o do Railway). Em 2 terminais:

```powershell
# 1) Backend (porta 3001)
cd C:\Projetos\360-hospitalar\backend
copy .env.example .env      # edite DATABASE_URL se necessário
npm install
npm run migrate             # cria tabelas + seed
npm run dev

# 2) Frontend (porta 3000)
cd C:\Projetos\360-hospitalar\frontend
npm install
npm run dev                 # usa frontend/.env.local → API em localhost:3001
```

Abra http://localhost:3000.

---

## 🚀 COMO O SITE ATUALIZA

```
você edita o código  →  git push  →  Vercel (frontend) e Railway (backend) atualizam sozinhos
```

- Mudou **tela** (frontend)? → Vercel redeploya em ~2 min.
- Mudou **API** (backend)? → Railway redeploya em ~2 min.

Para conferir, veja se o último deploy ficou **verde** no painel.

---

## 📱 PELO CELULAR

- **claude.ai/code** (recomendado): login na mesma conta, abra o repo `360-hospitalar`,
  descreva o que quer, aprove o diff, o Claude dá push → atualiza sozinho.
- ✅ Seguro pelo celular: telas, textos, ajustes de UI.
- ⚠️ Cuidado pelo celular: criar/alterar **migrations** (`backend/src/db/migrations/*.sql`).
  Erro de SQL derruba o start do backend (o `migrate` roda antes do `index.js`). Teste no PC.

---

## 🗺️ ESTADO ATUAL E PRÓXIMOS PASSOS

- ✅ **Parte A** — Diretório público + Portal do fornecedor + Solicitar orçamento (Next.js + API).
- ⏳ **Parte B** — Painel de Gestão (login real com JWT/bcrypt, RBAC, multi-tenant). Front de
  referência em `admin/*.jsx`; especificação na seção "PARTE B" do `CLAUDE.md`.
- ⏳ Login do Portal hoje é **mock** (qualquer e-mail/senha entra). Vira real junto com a Parte B.

Para continuar: abra o Claude Code e diga *"Leia o CLAUDE.md e vamos fazer a Parte B"* (ou o passo que quiser).

---

## 🆘 SE QUEBRAR
- Site fora do ar → Vercel → Deployments (último vermelho?).
- Busca/perfil não carrega → Railway → backend → Deploy Logs; confira `DATABASE_URL` e `CORS_ORIGIN`.
- `Network Error` no navegador → `NEXT_PUBLIC_API_URL` na Vercel aponta para a API certa?
