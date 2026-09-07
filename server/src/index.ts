import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from './db/turso.js';
import { initSchema } from './db/initSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'alicerce_super_secret_jwt_key_2026';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Turso DB Schema
await initSchema();

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ALICERCE Backend API',
    database: 'Turso DB (@libsql/client)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Middleware: Authenticate JWT
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token de autenticação não fornecido' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
}

/* ==========================================
   1. AUTHENTICATION ROUTES (Multi-Perfil)
   ========================================== */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, creaCauNumber, cnpjNumber, city, state } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Preencha os campos obrigatórios' });
    }

    const passHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, crea_cau_number, cnpj_number, verified, city, state, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      args: [userId, name, email, passHash, role || 'profissional_crea', creaCauNumber || null, cnpjNumber || null, city || 'São Paulo', state || 'SP', new Date().toISOString()]
    });

    const token = jwt.sign({ id: userId, email, role: role || 'profissional_crea' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role: role || 'profissional_crea',
        creaCauNumber,
        cnpjNumber,
        verified: true,
        city: city || 'São Paulo',
        state: state || 'SP'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao registrar usuário' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email]
    });

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const user: any = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

/* ==========================================
   2. FEED & POSTS ROUTES (Carimbo Técnico)
   ========================================== */
app.get('/api/feed/posts', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM posts ORDER BY id DESC");
    const posts = result.rows.map((row: any) => ({
      id: row.id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorAvatar: row.author_avatar,
      authorRole: row.author_role,
      authorBadge: row.author_badge,
      category: row.category,
      title: row.title,
      content: row.content,
      mediaUrls: row.media_urls ? [row.media_urls] : [],
      technicalStamp: {
        stampId: row.stamp_id,
        registrationNumber: row.registration_number,
        hashVerification: row.hash_verification,
        artRrtCode: row.art_rrt_code,
        status: 'valid'
      },
      location: { city: row.city, state: row.state },
      budgetEstimated: row.budget_estimated,
      deadlineDays: row.deadline_days,
      likesCount: row.likes_count,
      commentsCount: row.comments_count,
      proposalsCount: row.proposals_count,
      isSponsored: Boolean(row.is_sponsored),
      createdAt: row.created_at
    }));

    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar publicações' });
  }
});

app.post('/api/feed/posts', async (req, res) => {
  try {
    const { authorId, authorName, authorAvatar, authorRole, authorBadge, category, title, content, mediaUrls, location, budgetEstimated, deadlineDays } = req.body;
    const postId = `post_${Date.now()}`;
    const stampId = `ALC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const hash = Math.random().toString(36).substring(2) + Date.now().toString(36);

    await db.execute({
      sql: `INSERT INTO posts (id, author_id, author_name, author_avatar, author_role, author_badge, category, title, content, media_urls, stamp_id, registration_number, hash_verification, art_rrt_code, city, state, budget_estimated, deadline_days, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        postId,
        authorId || 'usr_curr',
        authorName || 'Eng. Roberto Silva',
        authorAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        authorRole || 'profissional_crea',
        authorBadge || 'CREA-SP 5069824/D',
        category || 'obra_andamento',
        title,
        content,
        mediaUrls && mediaUrls[0] ? mediaUrls[0] : null,
        stampId,
        'CREA-SP 5069824/D',
        hash,
        'ART SP2026/998124',
        location?.city || 'São Paulo',
        location?.state || 'SP',
        budgetEstimated || null,
        deadlineDays || null,
        'Agora mesmo'
      ]
    });

    res.status(201).json({ id: postId, stampId, hashVerification: hash });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar publicação' });
  }
});

/* ==========================================
   3. OPPORTUNITIES & PROPOSALS ROUTES
   ========================================== */
app.get('/api/opportunities', async (req, res) => {
  try {
    const oppsResult = await db.execute("SELECT * FROM opportunities ORDER BY id DESC");
    const propsResult = await db.execute("SELECT * FROM proposals");

    const opportunities = oppsResult.rows.map((row: any) => {
      const oppProposals = propsResult.rows
        .filter((p: any) => p.opportunity_id === row.id)
        .map((p: any) => ({
          id: p.id,
          opportunityId: p.opportunity_id,
          proposerId: p.proposer_id,
          proposerName: p.proposer_name,
          proposerRole: p.proposer_role,
          proposerAvatar: p.proposer_avatar,
          creaCau: p.crea_cau,
          value: p.value,
          deadlineDays: p.deadline_days,
          scopeDescription: p.scope_description,
          attachmentUrl: p.attachment_url,
          status: p.status,
          createdAt: p.created_at
        }));

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        specialty: row.specialty,
        location: { city: row.city, state: row.state },
        budgetRange: { min: row.budget_min, max: row.budget_max },
        ownerId: row.owner_id,
        ownerName: row.owner_name,
        ownerAvatar: row.owner_avatar,
        status: row.status,
        proposalsCount: oppProposals.length,
        proposals: oppProposals,
        createdAt: row.created_at
      };
    });

    res.json(opportunities);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar oportunidades' });
  }
});

app.post('/api/opportunities/:id/proposals', async (req, res) => {
  try {
    const oppId = req.params.id;
    const { proposerId, proposerName, proposerRole, proposerAvatar, creaCau, value, deadlineDays, scopeDescription, attachmentUrl } = req.body;
    const propId = `prop_${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO proposals (id, opportunity_id, proposer_id, proposer_name, proposer_role, proposer_avatar, crea_cau, value, deadline_days, scope_description, attachment_url, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        propId,
        oppId,
        proposerId || 'usr_curr',
        proposerName || 'Eng. Roberto Silva',
        proposerRole || 'profissional_crea',
        proposerAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        creaCau || 'CREA-SP 5069824/D',
        value,
        deadlineDays,
        scopeDescription,
        attachmentUrl || 'Proposta_Tecnica.pdf',
        'em_negociacao',
        'Agora mesmo'
      ]
    });

    res.status(201).json({ id: propId, opportunityId: oppId, status: 'em_negociacao' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao submeter proposta' });
  }
});

/* ==========================================
   4. ALICERCE ADS & PIX CHECKOUT
   ========================================== */
app.get('/api/ads/campaigns', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM ad_campaigns ORDER BY id DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar campanhas' });
  }
});

app.post('/api/ads/campaigns', async (req, res) => {
  try {
    const { userId, title, objective, targetRegion, dailyBudget, totalBudget, durationDays, paymentMethod } = req.body;
    const campId = `camp_${Date.now()}`;
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136alicerce-pay@bancopix.com.br520400005303986540${totalBudget.toFixed(2)}5802BR5916ALICERCE ADS SAO PAULO6009SAO PAULO62070503***6304${hash}`;

    await db.execute({
      sql: `INSERT INTO ad_campaigns (id, user_id, title, objective, target_region, daily_budget, total_budget, duration_days, impressions_count, clicks_count, status, payment_method, pix_qr_code, pix_copia_cola, invoice_nfse_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'ativa', ?, ?, ?, ?, ?)`,
      args: [
        campId,
        userId || 'usr_curr',
        title,
        objective || 'Captação de Leads',
        targetRegion || 'São Paulo e SP',
        dailyBudget,
        totalBudget,
        durationDays,
        paymentMethod || 'pix',
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`,
        pixCode,
        `NFS-e_ALICERCE_${Math.floor(100000 + Math.random() * 900000)}.pdf`,
        new Date().toLocaleDateString('pt-BR')
      ]
    });

    res.status(201).json({ id: campId, pixCopiaCola: pixCode, status: 'ativa' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar campanha de anúncios' });
  }
});

/* ==========================================
   5. MESSAGES & WEBSOCKET REALTIME CHAT
   ========================================== */
app.get('/api/messages/:threadId', async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM messages ORDER BY id ASC",
      args: []
    });
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar mensagens' });
  }
});

// Serve Frontend Production Build (if available)
const clientDistCandidates = [
  path.resolve(__dirname, '../../dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist')
];
const clientDistPath = clientDistCandidates.find(p => fs.existsSync(path.join(p, 'index.html')));

if (clientDistPath) {
  console.log(`[Frontend] Servindo frontend de: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      service: 'ALICERCE Backend API',
      database: 'Turso DB (@libsql/client)',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
}

/* Create HTTP Server & WebSocket Server */
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Novo cliente conectado no Chat ALICERCE');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[WebSocket] Mensagem recebida:', data);
      
      // Broadcast message to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'NEW_MESSAGE', data }));
        }
      });
    } catch (err) {
      console.error('[WebSocket] Erro ao processar mensagem:', err);
    }
  });
});

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(`🚀 ALICERCE Backend Rodando na Porta ${PORT}`);
  console.log(`🌐 Turso DB / libSQL Conectado com Sucesso`);
  console.log(`💬 Servidor WebSocket Ativo para Chat em Tempo Real`);
  console.log(`==================================================\n`);
});
