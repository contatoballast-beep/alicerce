# ALICERCE — Arquitetura de Produção e Especificação Backend

Documento técnico completo detalhando a arquitetura de backend, banco de dados PostgreSQL, filas Redis/BullMQ, infraestrutura S3/CDN e integração fiscal da plataforma **ALICERCE**.

---

## 1. Visão Geral da Arquitetura

```
[ Frontend Next.js / Vite PWA ]
              │
              ▼ (HTTPS / WSS - TLS 1.3)
   [ AWS CloudFront CDN / WAF ]
              │
              ▼
   [ NGINX API Gateway & Rate Limiting ]
              │
   ┌──────────┴──────────────────────────┐
   ▼                                     ▼
[ NestJS Core REST API ]       [ WebSocket Gateway (Socket.io) ]
(Auth, Feed, Oportunidades)    (Mensageria & Notificações Live)
   │                                     │
   ├───────────────┬─────────────────────┤
   ▼               ▼                     ▼
[PostgreSQL 16] [Elasticsearch]   [Redis + BullMQ Queue]
(Relacional)    (Busca Geospatial)(Moderação / Pix / E-mail)
```

---

## 2. Modelo Relacional do Banco de Dados (PostgreSQL 16)

### Tabela `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id
    role VARCHAR(50) NOT NULL, -- 'pessoa_fisica', 'profissional_crea', 'profissional_cau', 'empresa_cnpj', 'investidor', 'admin'
    crea_cau_number VARCHAR(100),
    cnpj_number VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    phone VARCHAR(30),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    consent_lgpd_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_crea_cau ON users(crea_cau_number);
```

### Tabela `posts` & `technical_stamps`
```sql
CREATE TABLE technical_stamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stamp_code VARCHAR(100) UNIQUE NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    art_rrt_code VARCHAR(100),
    hash_verification VARCHAR(256) NOT NULL, -- SHA-256
    status VARCHAR(30) DEFAULT 'valid',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    technical_stamp_id UUID REFERENCES technical_stamps(id),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    budget_estimated NUMERIC(15, 2),
    deadline_days INT,
    city VARCHAR(100),
    state VARCHAR(2),
    likes_count INT DEFAULT 0,
    is_sponsored BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `opportunities` & `proposals`
```sql
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    budget_min NUMERIC(15, 2),
    budget_max NUMERIC(15, 2),
    status VARCHAR(50) DEFAULT 'aberto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    proposer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    value NUMERIC(15, 2) NOT NULL,
    deadline_days INT NOT NULL,
    scope_description TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `ad_campaigns` & `invoices`
```sql
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    objective VARCHAR(100) NOT NULL,
    daily_budget NUMERIC(10, 2) NOT NULL,
    total_budget NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'ativa',
    payment_method VARCHAR(20) NOT NULL, -- 'pix', 'cartao'
    pix_qr_code TEXT,
    nfse_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Filas Assíncronas (Redis + BullMQ)

1. `queue:crea-verification`:
   - Envia requisição para scraper/API de checagem automática no CREA-SP / CAU-BR / Receita Federal.
2. `queue:media-processing`:
   - Redimensiona e compacta imagens enviadas para formato WebP com múltiplas resoluções (375w, 768w, 1200w) via Sharp.js.
3. `queue:content-moderation`:
   - Submete texto e mídia para filtro automático com modelo TensorFlow/AWS Rekognition.
4. `queue:nfse-issuance`:
   - Conecta à API de nota fiscal eletrônica de serviço (Focus NFe / PlugNotas) ao confirmar recebimento de Pix do Ads.

---

## 4. Segurança e LGPD

- **Hash de Senha:** `Argon2id` (memoryCost: 65536, timeCost: 3, parallelism: 4).
- **Sessão JWT:** Access Token de 15 minutos + Refresh Token de 7 dias armazenado em Cookie HTTP-only com flag `SameSite=Strict` e `Secure`.
- **Exportação de Dados LGPD:** Endpoint `GET /api/user/privacy/export` compila todas as publicações, propostas e histórico financeiro em arquivo ZIP assinado digitalmente.
- **Log de Auditoria:** Tabela `audit_logs` grava IP, User-Agent, Ação e Timestamp para qualquer modificação de perfil ou transação.
