# DEPLOY — 360 Hospitalar

> Mesma stack do Portal-Licitações: **Vercel** (frontend) + **Railway** (backend + Postgres).
> Fluxo: você dá `git push` → Vercel e Railway atualizam sozinhos. Sem upload manual.

```
360-hospitalar.verificadoagora.com.br      → Frontend Next.js (Vercel)
api-360-hospitalar.verificadoagora.com.br  → Backend Express  (Railway)
Banco de dados                             → Postgres (plugin do Railway)
```

---

## PARTE 1 — Subir o código para o GitHub (uma vez)

No terminal, dentro de `C:\Projetos\360-hospitalar`:

```powershell
git add -A
git commit -m "360 Hospitalar - Next.js + Express (Parte A)"
```

Crie um repositório vazio em github.com (ex.: `360-hospitalar`, pode ser **privado**) e:

```powershell
git remote add origin https://github.com/SEU_USUARIO/360-hospitalar.git
git branch -M main
git push -u origin main
```

> Já existe um commit antigo no reppositório local? Sem problema — `git push` envia tudo.

---

## PARTE 2 — Backend + Banco no Railway

### 2.1 Criar o projeto e o banco
1. Acesse railway.app → **New Project** → **Deploy from GitHub repo** → escolha `360-hospitalar`.
2. Quando perguntar a pasta, ou depois em **Settings → Root Directory**, defina **`backend`**.
   (É lá que estão o `package.json` e o `railway.json` da API.)
3. No mesmo projeto: **New → Database → Add PostgreSQL**. O Railway cria o banco e injeta a
   variável **`DATABASE_URL`** automaticamente no serviço do backend.

### 2.2 Variáveis de ambiente do backend
No serviço do backend → aba **Variables**, adicione:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | *(uma chave longa e aleatória — só será usada na Parte B)* |
| `CORS_ORIGIN` | `https://360-hospitalar.verificadoagora.com.br` |

> `DATABASE_URL` e `PORT` já vêm do Railway — não precisa criar.
> Para gerar o JWT_SECRET: https://generate-secret.now.sh/64

### 2.3 Deploy e domínio
- O Railway roda sozinho: `npm install && npm run build` e depois
  `node dist/db/migrate.js && node dist/index.js` (as **migrations + seed** rodam no start).
- Em **Settings → Networking → Generate Domain**, gere a URL pública. Teste no navegador:
  `https://<sua-url>.up.railway.app/health` → deve responder `{"status":"ok",...}`.

---

## PARTE 3 — Frontend no Vercel

1. vercel.app → **Add New… → Project** → importe `360-hospitalar`.
2. Em **Root Directory**, selecione **`frontend`**. O Vercel detecta **Next.js** sozinho.
3. Em **Environment Variables**, adicione:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://api-360-hospitalar.verificadoagora.com.br` |

   > Se ainda não criou o subdomínio da API (Parte 4), use **temporariamente** a URL
   > `*.up.railway.app` do passo 2.3. Depois troque e faça **Redeploy**.
4. **Deploy**. O Vercel gera uma URL `*.vercel.app` — já dá pra mostrar ao cliente.

> Variável `NEXT_PUBLIC_*` entra no build: ao trocá-la, faça **Redeploy** (Deployments → ⋯ → Redeploy).

---

## PARTE 4 — Subdomínios na Hostinger (DNS)

A Hostinger guarda só o **DNS** do `verificadoagora.com.br`. Você cria 2 apontamentos (CNAME):

### 4.1 Frontend → Vercel
1. Vercel: **Project (frontend) → Settings → Domains → Add** →
   `360-hospitalar.verificadoagora.com.br`. O Vercel mostra um CNAME (ex.: `cname.vercel-dns.com`).
2. Hostinger: **hPanel → Domínios → verificadoagora.com.br → DNS / Zona DNS → Adicionar registro**:
   - **Tipo:** `CNAME` · **Nome:** `360-hospitalar` · **Valor:** `cname.vercel-dns.com` · **TTL:** padrão

### 4.2 Backend → Railway
1. Railway: serviço do backend → **Settings → Networking → Custom Domain** →
   `api-360-hospitalar.verificadoagora.com.br`. O Railway mostra um CNAME (ex.: `xxx.up.railway.app`).
2. Hostinger → Zona DNS → Adicionar registro:
   - **Tipo:** `CNAME` · **Nome:** `api-360-hospitalar` · **Valor:** *(o que o Railway mostrar)* · **TTL:** padrão

> Em minutos a algumas horas o HTTPS é emitido automaticamente nos dois lados.
> O CORS do backend já libera `*.verificadoagora.com.br` e `*.vercel.app` — não precisa mexer.

### 4.3 Conferir
- `https://api-360-hospitalar.verificadoagora.com.br/health` → `{"status":"ok"}`
- `https://360-hospitalar.verificadoagora.com.br` → abre o diretório, busca e perfis funcionando.

---

## PARTE 5 — Linkar a partir do portal principal (verificadoagora.com.br)

O `360-hospitalar.verificadoagora.com.br` já é um **site independente**. Para o cliente
chegar nele a partir do site principal, é só adicionar um link/botão lá apontando para a URL —
ex.: um card "360 Hospitalar" ou um item de menu:

```html
<a href="https://360-hospitalar.verificadoagora.com.br">360 Hospitalar</a>
```

(Se o portal principal também é um projeto seu, basta adicionar esse link no menu/home dele.)

---

## Atualizar depois (fluxo normal)

```powershell
# edite o código…
git add -A
git commit -m "o que mudou"
git push
```

- Mudou o **frontend**? → Vercel redeploya em ~2 min.
- Mudou o **backend**? → Railway redeploya em ~2 min (rodando as migrations novas, se houver).

## Migrations novas (quando criar tabelas/colunas)
Crie um arquivo numerado em `backend/src/db/migrations/` (ex.: `004_xxx.sql`). No próximo
deploy o Railway aplica sozinho (o `migrate` roda antes do `start`). ⚠️ Erro de SQL na
migration derruba o start — teste localmente antes (ver README).

## Se algo quebrar
- Frontend fora do ar → painel **Vercel → Deployments** (o último está vermelho?).
- Login/busca não funciona → painel **Railway → backend → Deploy Logs**; confira `DATABASE_URL`
  e `CORS_ORIGIN`.
- `Network Error` no navegador → `NEXT_PUBLIC_API_URL` na Vercel está com a URL certa da API?
