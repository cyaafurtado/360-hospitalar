# DEPLOY — 360 Hospitalar

> Mesma stack do Portal-Licitações: **Vercel** (frontend) + **Railway** (backend + Postgres).
> Fluxo: você dá `git push` → Vercel e Railway atualizam sozinhos. Sem upload manual.

```
360hospitalar.com.br      → Frontend Next.js (Vercel)
api.360hospitalar.com.br  → Backend Express  (Railway)
Banco de dados             → Postgres (plugin do Railway)
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
| `CORS_ORIGIN` | `https://360hospitalar.com.br` |

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
   | `NEXT_PUBLIC_API_URL` | `https://api.360hospitalar.com.br` |

   > Se ainda não criou o subdomínio da API (Parte 4), use **temporariamente** a URL
   > `*.up.railway.app` do passo 2.3. Depois troque e faça **Redeploy**.
4. **Deploy**. O Vercel gera uma URL `*.vercel.app` — já dá pra mostrar ao cliente.

> Variável `NEXT_PUBLIC_*` entra no build: ao trocá-la, faça **Redeploy** (Deployments → ⋯ → Redeploy).

---

## PARTE 4 — Domínio na Hostinger (DNS)

A Hostinger guarda só o **DNS** do `360hospitalar.com.br`. O front fica no domínio **raiz**
(por isso é registro `A`, não `CNAME` — raiz de domínio não aceita CNAME) e a API num subdomínio.

### 4.1 Frontend (raiz) → Vercel
1. Vercel: **Project (frontend) → Settings → Domains → Add** → `360hospitalar.com.br`.
   O Vercel mostra o IP a apontar (histórico: `76.76.21.21` — use o valor exato que a Vercel exibir
   na hora, pode mudar).
2. Hostinger → **hPanel → Domínios → 360hospitalar.com.br → DNS / Zona DNS → Adicionar registro**:
   - **Tipo:** `A` · **Nome:** `@` (raiz) · **Valor:** *(IP que a Vercel mostrar)* · **TTL:** padrão
3. (Opcional, recomendado) Adicione também `www`: na Vercel, **Add** → `www.360hospitalar.com.br`
   → ela sugere redirecionar para a raiz e mostra um CNAME (`cname.vercel-dns.com`).
   Hostinger: **Tipo:** `CNAME` · **Nome:** `www` · **Valor:** `cname.vercel-dns.com`.

### 4.2 Backend → Railway
1. Railway: serviço do backend → **Settings → Networking → Custom Domain** →
   `api.360hospitalar.com.br`. O Railway mostra um CNAME (ex.: `xxx.up.railway.app`).
2. Hostinger → Zona DNS → Adicionar registro:
   - **Tipo:** `CNAME` · **Nome:** `api` · **Valor:** *(o que o Railway mostrar)* · **TTL:** padrão

> Em minutos a algumas horas o HTTPS é emitido automaticamente nos dois lados.
> O CORS do backend já libera `360hospitalar.com.br` (raiz + subdomínios) e `*.vercel.app`.

### 4.3 Conferir
- `https://api.360hospitalar.com.br/health` → `{"status":"ok"}`
- `https://360hospitalar.com.br` → abre o diretório, busca e perfis funcionando.

### 4.4 Desligar o domínio antigo (depois de confirmar o novo)
1. Atualize `CORS_ORIGIN` no Railway para `https://360hospitalar.com.br` (remova a URL antiga).
2. Remova o domínio antigo em **Vercel → Domains** e **Railway → Networking → Custom Domain**.
3. Apague os registros CNAME antigos (`360-hospitalar` e `api-360-hospitalar`) na zona DNS de
   `verificadoagora.com.br` na Hostinger.

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
