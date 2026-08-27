# Guia de Deploy no Render com Turso DB — ALICERCE Backend

Este guia passo a passo explica como conectar o banco de dados **Turso DB (`@libsql/client`)** e realizar o deploy do servidor **Node.js + Express + WebSocket** no **Render.com**.

---

## 1. Passo 1: Criar o Banco no Turso DB

1. Instale o CLI do Turso no seu computador ou acesse a CLI no terminal:
   ```bash
   curl -sL https://get.tur.so | bash
   ```
2. Crie uma conta e um banco de dados Turso:
   ```bash
   turso auth signup
   turso db create alicerce-db
   ```
3. Obtenha a URL do banco e o Token de Autenticação:
   ```bash
   turso db show alicerce-db --url
   # Exemplo de URL: libsql://alicerce-db-suaconta.turso.io

   turso db tokens create alicerce-db
   # Guarda o token gerado (eyJhbGciOi...)
   ```

---

## 2. Passo 2: Testar o Backend Localmente

No diretório `server/`:
```bash
cd server
npm install
npm run dev
```
O servidor inicializará automaticamente o schema do banco de dados no Turso (ou em `file:alicerce_local.db` se as variáveis não forem informadas).

---

## 3. Passo 3: Deploy Gratuito no Render.com

1. Acesse **[Render.com](https://dashboard.render.com)** e faça login com a sua conta do GitHub (**`contatoballast-beep`**).
2. Clique em **New +** ➔ **Blueprint** (ou **Web Service**).
3. Selecione o repositório GitHub: **`contatoballast-beep/alicerce`**.
4. O Render detectará automaticamente o arquivo [`render.yaml`](file:///C:/Users/rhuan/.gemini/antigravity-ide/scratch/alicerce/render.yaml).
5. Defina as Variáveis de Ambiente na aba **Environment**:
   - `TURSO_DATABASE_URL`: `libsql://alicerce-db-suaconta.turso.io`
   - `TURSO_AUTH_TOKEN`: `eyJhbGciOi...` (Token criado no Turso)
   - `JWT_SECRET`: `sua_chave_secreta_jwt_aqui`
6. Clique em **Apply** ou **Create Web Service**.

---

## 4. Endpoints Disponíveis após o Deploy

Substitua `https://alicerce-backend.onrender.com` pela URL gerada pelo Render:

- **Health Check:** `GET https://alicerce-backend.onrender.com/`
- **Feed Posts:** `GET https://alicerce-backend.onrender.com/api/feed/posts`
- **Oportunidades:** `GET https://alicerce-backend.onrender.com/api/opportunities`
- **Anúncios Ads:** `GET https://alicerce-backend.onrender.com/api/ads/campaigns`
- **WebSocket Live Chat:** `wss://alicerce-backend.onrender.com`
