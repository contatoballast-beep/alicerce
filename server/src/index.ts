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

// Initialize Database Schema
await initSchema();

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'online',
    service: 'ALICERCE Backend API',
    database: 'Turso DB (@libsql/client)',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Middleware: Authenticate JWT (optional or required)
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

function optionalToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (!err) req.user = user;
      next();
    });
  } else {
    next();
  }
}

/* ==========================================================================
   1. AUTHENTICATION & ONBOARDING
   ========================================================================== */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, creaCauNumber, cnpjNumber, phone, whatsapp, city, state } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    // Check if user already exists
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email]
    });
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado na plataforma' });
    }

    const passHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const isRhuanAdmin = email.toLowerCase() === 'rhuangumbi@gmail.com';
    const userRole = isRhuanAdmin ? 'admin' : (role || 'cliente');
    const now = new Date().toISOString();

    const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

    await db.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, crea_cau_number, cnpj_number, phone, whatsapp, city, state, avatar, is_verified, verification_status, consent_lgpd, plan, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      args: [
        userId,
        name,
        email,
        passHash,
        userRole,
        creaCauNumber || (isRhuanAdmin ? 'CREA-BR 000001/D' : null),
        cnpjNumber || null,
        phone || null,
        whatsapp || phone || null,
        city || 'São Paulo',
        state || 'SP',
        avatar,
        isRhuanAdmin ? 1 : 0,
        isRhuanAdmin ? 'verified' : 'unverified',
        isRhuanAdmin ? 'admin' : 'gratuito',
        now
      ]
    });

    // Create sub-profile based on role
    if (userRole === 'profissional' || userRole === 'profissional_crea' || userRole === 'profissional_cau') {
      await db.execute({
        sql: `INSERT INTO professional_profiles (id, user_id, profession, specialty, experience_years, services, city, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `prof_${Date.now()}`,
          userId,
          userRole === 'profissional_cau' ? 'Arquiteto' : 'Engenheiro Civil',
          'Construção Civil & Projetos',
          3,
          JSON.stringify(['Projetos', 'Laudos']),
          city || 'São Paulo',
          state || 'SP',
          now
        ]
      });
    } else if (userRole === 'empresa' || userRole === 'empresa_cnpj') {
      await db.execute({
        sql: `INSERT INTO company_profiles (id, user_id, company_name, cnpj, city, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `comp_${Date.now()}`,
          userId,
          name,
          cnpjNumber || '00.000.000/0001-00',
          city || 'São Paulo',
          state || 'SP',
          now
        ]
      });
    } else if (userRole === 'fornecedor') {
      await db.execute({
        sql: `INSERT INTO supplier_profiles (id, user_id, company_name, cnpj, category, city, state, created_at)
              VALUES (?, ?, ?, ?, 'Materiais de Construção', ?, ?, ?)`,
        args: [
          `supp_${Date.now()}`,
          userId,
          name,
          cnpjNumber || '00.000.000/0001-00',
          city || 'São Paulo',
          state || 'SP',
          now
        ]
      });
    }

    const token = jwt.sign({ id: userId, email, role: userRole }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role: userRole,
        creaCauNumber: isRhuanAdmin ? 'CREA-BR 000001/D' : creaCauNumber,
        cnpjNumber,
        phone,
        whatsapp,
        city: city || 'São Paulo',
        state: state || 'SP',
        avatar,
        verified: isRhuanAdmin,
        consentLgpd: true,
        createdAt: now
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao registrar usuário' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
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

    const isRhuanAdmin = email.toLowerCase() === 'rhuangumbi@gmail.com';
    const effectiveRole = isRhuanAdmin ? 'admin' : user.role;

    if (isRhuanAdmin && user.role !== 'admin') {
      await db.execute({
        sql: "UPDATE users SET role = 'admin', is_verified = 1, verification_status = 'verified', plan = 'admin' WHERE LOWER(email) = LOWER(?)",
        args: [email]
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: effectiveRole }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        creaCauNumber: user.crea_cau_number,
        cnpjNumber: user.cnpj_number,
        phone: user.phone,
        whatsapp: user.whatsapp,
        city: user.city,
        state: user.state,
        bio: user.bio,
        avatar: user.avatar,
        verified: isRhuanAdmin || Boolean(user.is_verified),
        plan: isRhuanAdmin ? 'admin' : user.plan,
        createdAt: user.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [req.user.id]
    });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    const user: any = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      creaCauNumber: user.crea_cau_number,
      cnpjNumber: user.cnpj_number,
      phone: user.phone,
      whatsapp: user.whatsapp,
      city: user.city,
      state: user.state,
      bio: user.bio,
      avatar: user.avatar,
      verified: Boolean(user.is_verified),
      plan: user.plan,
      createdAt: user.created_at
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar perfil' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req: any, res) => {
  try {
    const { name, phone, whatsapp, city, state, bio, avatar, creaCauNumber, cnpjNumber } = req.body;
    await db.execute({
      sql: `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), whatsapp = COALESCE(?, whatsapp),
            city = COALESCE(?, city), state = COALESCE(?, state), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar),
            crea_cau_number = COALESCE(?, crea_cau_number), cnpj_number = COALESCE(?, cnpj_number), updated_at = ?
            WHERE id = ?`,
      args: [name, phone, whatsapp, city, state, bio, avatar, creaCauNumber, cnpjNumber, new Date().toISOString(), req.user.id]
    });
    res.json({ success: true, message: 'Perfil atualizado com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

/* ==========================================================================
   2. PROFESSIONALS & COMPANIES DIRECTORY (Search & Profiles)
   ========================================================================== */
app.get('/api/professionals', async (req, res) => {
  try {
    const { q, city, state, specialty, category } = req.query;
    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.avatar, u.city, u.state, u.is_verified, u.phone, u.whatsapp, u.bio,
             p.profession, p.specialty, p.experience_years, p.services, p.rating, p.reviews_count, p.availability, p.crea_cau_number
      FROM users u
      LEFT JOIN professional_profiles p ON u.id = p.user_id
      WHERE u.role IN ('profissional', 'profissional_crea', 'profissional_cau', 'arquiteto', 'engenheiro')
    `;
    const args: any[] = [];

    if (q) {
      sql += ` AND (u.name LIKE ? OR p.profession LIKE ? OR p.specialty LIKE ? OR p.services LIKE ?)`;
      const queryParam = `%${q}%`;
      args.push(queryParam, queryParam, queryParam, queryParam);
    }
    if (city) {
      sql += ` AND (u.city LIKE ? OR p.city LIKE ?)`;
      args.push(`%${city}%`, `%${city}%`);
    }
    if (state) {
      sql += ` AND (u.state = ? OR p.state = ?)`;
      args.push(state, state);
    }

    sql += ` ORDER BY p.rating DESC, p.reviews_count DESC`;
    const result = await db.execute({ sql, args });

    const professionals = result.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      avatar: r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: r.city,
      state: r.state,
      phone: r.phone,
      whatsapp: r.whatsapp || r.phone,
      bio: r.bio,
      profession: r.profession || 'Especialista da Construção',
      specialty: r.specialty || 'Serviços Técnicos',
      experienceYears: r.experience_years || 5,
      services: r.services ? JSON.parse(r.services) : ['Consultoria', 'Execução'],
      creaCauNumber: r.crea_cau_number,
      rating: r.rating || 5.0,
      reviewsCount: r.reviews_count || 0,
      availability: r.availability || 'disponivel',
      isVerified: Boolean(r.is_verified)
    }));

    res.json(professionals);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao listar profissionais' });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const { q, city } = req.query;
    let sql = `
      SELECT u.id, u.name, u.email, u.avatar, u.city, u.state, u.is_verified, u.phone, u.whatsapp, u.bio,
             c.company_name, c.trade_name, c.cnpj, c.categories, c.services, c.region_served, c.rating, c.reviews_count, c.website
      FROM users u
      LEFT JOIN company_profiles c ON u.id = c.user_id
      WHERE u.role IN ('empresa', 'empresa_cnpj', 'construtora')
    `;
    const args: any[] = [];

    if (q) {
      sql += ` AND (u.name LIKE ? OR c.company_name LIKE ? OR c.services LIKE ?)`;
      args.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (city) {
      sql += ` AND u.city LIKE ?`;
      args.push(`%${city}%`);
    }

    const result = await db.execute({ sql, args });
    const companies = result.rows.map((r: any) => ({
      id: r.id,
      name: r.company_name || r.name,
      tradeName: r.trade_name,
      cnpj: r.cnpj,
      city: r.city,
      state: r.state,
      phone: r.phone,
      whatsapp: r.whatsapp || r.phone,
      website: r.website,
      avatar: r.avatar,
      categories: r.categories ? JSON.parse(r.categories) : ['Construção'],
      services: r.services ? JSON.parse(r.services) : ['Obras'],
      rating: r.rating || 5.0,
      reviewsCount: r.reviews_count || 0,
      isVerified: Boolean(r.is_verified)
    }));

    res.json(companies);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
});

/* ==========================================================================
   3. SUPPLIERS & MATERIAL QUOTE ENGINE (Cotações de Materiais)
   ========================================================================== */
app.get('/api/suppliers', async (req, res) => {
  try {
    const { q, category, city } = req.query;
    let sql = `
      SELECT u.id, u.name, u.email, u.avatar, u.city, u.state, u.phone, u.whatsapp,
             s.company_name, s.cnpj, s.category, s.product_types, s.delivery_available, s.rating, s.reviews_count, s.region_served, s.website
      FROM users u
      LEFT JOIN supplier_profiles s ON u.id = s.user_id
      WHERE u.role = 'fornecedor'
    `;
    const args: any[] = [];

    if (q) {
      sql += ` AND (u.name LIKE ? OR s.company_name LIKE ? OR s.product_types LIKE ?)`;
      args.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category) {
      sql += ` AND s.category LIKE ?`;
      args.push(`%${category}%`);
    }
    if (city) {
      sql += ` AND u.city LIKE ?`;
      args.push(`%${city}%`);
    }

    const result = await db.execute({ sql, args });
    const suppliers = result.rows.map((r: any) => ({
      id: r.id,
      name: r.company_name || r.name,
      cnpj: r.cnpj,
      category: r.category || 'Materiais Básicos',
      productTypes: r.product_types ? JSON.parse(r.product_types) : ['Cimento', 'Areia', 'Blocos'],
      deliveryAvailable: Boolean(r.delivery_available),
      city: r.city,
      state: r.state,
      phone: r.phone,
      whatsapp: r.whatsapp || r.phone,
      website: r.website,
      avatar: r.avatar,
      rating: r.rating || 5.0,
      reviewsCount: r.reviews_count || 0
    }));

    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao listar fornecedores' });
  }
});

// Create Material Quote Request
app.post('/api/quotes', async (req, res) => {
  try {
    const { requesterId, requesterName, requesterPhone, requesterWhatsapp, supplierId, supplierName, deliveryAddress, city, state, notes, items } = req.body;
    const quoteId = `quote_${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO quote_requests (id, requester_id, requester_name, requester_phone, requester_whatsapp, supplier_id, supplier_name, delivery_address, city, state, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aberta', ?, ?)`,
      args: [
        quoteId,
        requesterId || 'usr_curr',
        requesterName || 'Cliente ALICERCE',
        requesterPhone || '(11) 98765-4321',
        requesterWhatsapp || '(11) 98765-4321',
        supplierId || null,
        supplierName || 'Fornecedores Gerais',
        deliveryAddress || 'Rua da Obra, 100',
        city || 'São Paulo',
        state || 'SP',
        notes || '',
        now
      ]
    });

    if (Array.isArray(items)) {
      for (const it of items) {
        await db.execute({
          sql: `INSERT INTO quote_request_items (id, quote_request_id, product_name, quantity, unit, notes)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [`item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, quoteId, it.productName, it.quantity, it.unit || 'un', it.notes || '']
        });
      }
    }

    res.status(201).json({ id: quoteId, status: 'aberta', message: 'Cotação de materiais enviada com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar solicitação de cotação' });
  }
});

// List Quote Requests
app.get('/api/quotes', async (req, res) => {
  try {
    const { userId, supplierId } = req.query;
    let sql = `SELECT * FROM quote_requests`;
    const args: any[] = [];

    if (userId) {
      sql += ` WHERE requester_id = ?`;
      args.push(userId);
    } else if (supplierId) {
      sql += ` WHERE supplier_id = ? OR supplier_id IS NULL`;
      args.push(supplierId);
    }

    sql += ` ORDER BY id DESC`;
    const quotesResult = await db.execute({ sql, args });
    const itemsResult = await db.execute("SELECT * FROM quote_request_items");
    const responsesResult = await db.execute("SELECT * FROM quote_responses");

    const quotes = quotesResult.rows.map((q: any) => ({
      id: q.id,
      requesterId: q.requester_id,
      requesterName: q.requester_name,
      requesterPhone: q.requester_phone,
      requesterWhatsapp: q.requester_whatsapp,
      supplierId: q.supplier_id,
      supplierName: q.supplier_name,
      deliveryAddress: q.delivery_address,
      city: q.city,
      state: q.state,
      status: q.status,
      notes: q.notes,
      createdAt: q.created_at,
      items: itemsResult.rows
        .filter((it: any) => it.quote_request_id === q.id)
        .map((it: any) => ({
          id: it.id,
          productName: it.product_name,
          quantity: it.quantity,
          unit: it.unit,
          notes: it.notes
        })),
      responses: responsesResult.rows
        .filter((r: any) => r.quote_request_id === q.id)
        .map((r: any) => ({
          id: r.id,
          supplierId: r.supplier_id,
          supplierName: r.supplier_name,
          unitPrice: r.unit_price,
          totalPrice: r.total_price,
          shippingPrice: r.shipping_price,
          totalSum: r.total_sum,
          deliveryDays: r.delivery_days,
          validityDays: r.validity_days,
          notes: r.notes,
          createdAt: r.created_at
        }))
    }));

    res.json(quotes);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar cotações' });
  }
});

// Supplier responds to Quote
app.post('/api/quotes/:id/respond', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const { supplierId, supplierName, unitPrice, totalPrice, shippingPrice, totalSum, deliveryDays, validityDays, notes } = req.body;
    const responseId = `resp_${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO quote_responses (id, quote_request_id, supplier_id, supplier_name, unit_price, total_price, shipping_price, total_sum, delivery_days, validity_days, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        responseId,
        quoteId,
        supplierId || 'usr_fornecedor',
        supplierName || 'Polimix Concreto',
        unitPrice,
        totalPrice,
        shippingPrice || 0,
        totalSum,
        deliveryDays || 3,
        validityDays || 7,
        notes || '',
        now
      ]
    });

    await db.execute({
      sql: "UPDATE quote_requests SET status = 'respondida', total_quoted = ? WHERE id = ?",
      args: [totalSum, quoteId]
    });

    res.status(201).json({ id: responseId, quoteId, status: 'respondida', totalSum });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao responder cotação' });
  }
});

/* ==========================================================================
   4. OPPORTUNITIES & PROPOSALS
   ========================================================================== */
app.get('/api/opportunities', async (req, res) => {
  try {
    const { q, category, city, status } = req.query;
    let sql = `SELECT * FROM opportunities WHERE id NOT IN ('opp_1', 'opp_2')`;
    const args: any[] = [];

    if (q) {
      sql += ` AND (title LIKE ? OR description LIKE ? OR specialty LIKE ?)`;
      args.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (city) {
      sql += ` AND city LIKE ?`;
      args.push(`%${city}%`);
    }
    if (category) {
      sql += ` AND category LIKE ?`;
      args.push(`%${category}%`);
    }
    if (status) {
      sql += ` AND status = ?`;
      args.push(status);
    }

    sql += ` ORDER BY id DESC`;
    const oppsResult = await db.execute({ sql, args });
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
        deadlineDays: row.deadline_days,
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

app.post('/api/opportunities', async (req, res) => {
  try {
    const { title, description, category, specialty, city, state, budgetMin, budgetMax, deadlineDays, ownerId, ownerName, ownerAvatar } = req.body;
    const oppId = `opp_${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO opportunities (id, title, description, category, specialty, city, state, budget_min, budget_max, deadline_days, owner_id, owner_name, owner_avatar, status, proposals_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aberta', 0, 'Hoje')`,
      args: [
        oppId,
        title,
        description,
        category || 'Obras e Projetos',
        specialty || 'Engenharia Civil',
        city || 'São Paulo',
        state || 'SP',
        budgetMin || 10000,
        budgetMax || 50000,
        deadlineDays || 30,
        ownerId || 'usr_curr',
        ownerName || 'Eng. Roberto Silva',
        ownerAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
      ]
    });

    res.status(201).json({ id: oppId, title, status: 'aberta' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar oportunidade' });
  }
});

app.post('/api/opportunities/:id/proposals', async (req, res) => {
  try {
    const oppId = req.params.id;
    const { proposerId, proposerName, proposerRole, proposerAvatar, creaCau, value, deadlineDays, scopeDescription, attachmentUrl } = req.body;
    const propId = `prop_${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO proposals (id, opportunity_id, proposer_id, proposer_name, proposer_role, proposer_avatar, crea_cau, value, deadline_days, scope_description, attachment_url, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'em_negociacao', 'Agora mesmo')`,
      args: [
        propId,
        oppId,
        proposerId || 'usr_curr',
        proposerName || 'Eng. Roberto Silva',
        proposerRole || 'profissional_crea',
        proposerAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        creaCau || 'CREA-SP 5069824/D',
        value,
        deadlineDays || 30,
        scopeDescription,
        attachmentUrl || 'Proposta_Tecnica.pdf'
      ]
    });

    await db.execute({
      sql: "UPDATE opportunities SET proposals_count = proposals_count + 1 WHERE id = ?",
      args: [oppId]
    });

    res.status(201).json({ id: propId, opportunityId: oppId, status: 'em_negociacao' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao submeter proposta' });
  }
});

/* ==========================================================================
   5. FEED & CARIMBO TÉCNICO
   ========================================================================== */
app.get('/api/feed/posts', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM posts WHERE id NOT IN ('post_1', 'post_2', 'post_3') ORDER BY id DESC");
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Agora mesmo')`,
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
        deadlineDays || null
      ]
    });

    res.status(201).json({ id: postId, stampId, hashVerification: hash });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar publicação' });
  }
});

app.post('/api/feed/posts/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    await db.execute({
      sql: "UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?",
      args: [postId]
    });
    res.json({ success: true, postId });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao curtir publicação' });
  }
});

/* ==========================================================================
   6. REALTIME CHAT & MESSAGING
   ========================================================================== */
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

app.post('/api/messages', async (req, res) => {
  try {
    const { threadId, senderId, senderName, receiverId, text, attachmentUrl } = req.body;
    const msgId = `msg_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO messages (id, thread_id, sender_id, sender_name, receiver_id, text, attachment_url, timestamp, read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [
        msgId,
        threadId || 'thread_1',
        senderId || 'usr_curr',
        senderName || 'Eng. Roberto Silva',
        receiverId || 'usr_camila',
        text,
        attachmentUrl || null,
        timestamp,
        now
      ]
    });

    const msgObj = {
      id: msgId,
      threadId: threadId || 'thread_1',
      senderId: senderId || 'usr_curr',
      senderName: senderName || 'Eng. Roberto Silva',
      receiverId: receiverId || 'usr_camila',
      text,
      attachmentUrl,
      timestamp,
      read: true
    };

    // Broadcast through WebSocket
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'NEW_MESSAGE', data: msgObj }));
      }
    });

    res.status(201).json(msgObj);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao salvar mensagem' });
  }
});

/* ==========================================================================
   7. FAVORITES HUB
   ========================================================================== */
app.get('/api/favorites', async (req, res) => {
  try {
    const { userId } = req.query;
    const result = await db.execute({
      sql: "SELECT * FROM favorites WHERE user_id = ? ORDER BY id DESC",
      args: [userId ? String(userId) : 'usr_curr']
    });
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar favoritos' });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { userId, targetType, targetId, targetTitle, targetSubtitle, targetAvatar } = req.body;
    const favId = `fav_${Date.now()}`;

    // Check if already favorited
    const existing = await db.execute({
      sql: "SELECT id FROM favorites WHERE user_id = ? AND target_id = ?",
      args: [userId || 'usr_curr', targetId]
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: "DELETE FROM favorites WHERE id = ?",
        args: [existing.rows[0].id]
      });
      return res.json({ favorited: false, id: targetId });
    }

    await db.execute({
      sql: `INSERT INTO favorites (id, user_id, target_type, target_id, target_title, target_subtitle, target_avatar, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        favId,
        userId || 'usr_curr',
        targetType || 'professional',
        targetId,
        targetTitle,
        targetSubtitle || '',
        targetAvatar || '',
        new Date().toISOString()
      ]
    });

    res.status(201).json({ favorited: true, id: targetId, favoriteId: favId });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao favoritar item' });
  }
});

/* ==========================================================================
   8. REVIEWS & RATINGS
   ========================================================================== */
app.get('/api/reviews/:userId', async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const result = await db.execute({
      sql: "SELECT * FROM reviews WHERE target_user_id = ? ORDER BY id DESC",
      args: [targetUserId]
    });
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { reviewerId, reviewerName, reviewerAvatar, targetUserId, rating, comment, contractType } = req.body;
    const reviewId = `rev_${Date.now()}`;
    const now = new Date().toLocaleDateString('pt-BR');

    await db.execute({
      sql: `INSERT INTO reviews (id, reviewer_id, reviewer_name, reviewer_avatar, target_user_id, rating, comment, contract_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        reviewId,
        reviewerId || 'usr_curr',
        reviewerName || 'Cliente ALICERCE',
        reviewerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        targetUserId,
        rating || 5,
        comment || 'Excelente atendimento e pontualidade na execução da obra!',
        contractType || 'Contrato de Obra',
        now
      ]
    });

    // Recalculate average rating
    const avgResult = await db.execute({
      sql: "SELECT AVG(rating) as avg_rate, COUNT(*) as cnt FROM reviews WHERE target_user_id = ?",
      args: [targetUserId]
    });

    const avgRate = Number(avgResult.rows[0].avg_rate || 5.0).toFixed(1);
    const revCount = Number(avgResult.rows[0].cnt || 1);

    await db.execute({
      sql: "UPDATE professional_profiles SET rating = ?, reviews_count = ? WHERE user_id = ?",
      args: [avgRate, revCount, targetUserId]
    });

    res.status(201).json({ id: reviewId, rating: avgRate, reviewsCount: revCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao enviar avaliação' });
  }
});

/* ==========================================================================
   9. CATEGORIES DIRECTORY
   ========================================================================== */
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

/* ==========================================================================
   10. ADMIN DASHBOARD & METRICS
   ========================================================================== */
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const [usersCnt, profCnt, compCnt, suppCnt, oppsCnt, propsCnt, revsCnt] = await Promise.all([
      db.execute("SELECT COUNT(*) as c FROM users"),
      db.execute("SELECT COUNT(*) as c FROM professional_profiles"),
      db.execute("SELECT COUNT(*) as c FROM company_profiles"),
      db.execute("SELECT COUNT(*) as c FROM supplier_profiles"),
      db.execute("SELECT COUNT(*) as c FROM opportunities"),
      db.execute("SELECT COUNT(*) as c FROM proposals"),
      db.execute("SELECT COUNT(*) as c FROM reviews")
    ]);

    res.json({
      totalUsers: Number(usersCnt.rows[0].c),
      totalProfessionals: Number(profCnt.rows[0].c),
      totalCompanies: Number(compCnt.rows[0].c),
      totalSuppliers: Number(suppCnt.rows[0].c),
      totalOpportunities: Number(oppsCnt.rows[0].c),
      totalProposals: Number(propsCnt.rows[0].c),
      totalReviews: Number(revsCnt.rows[0].c),
      platformHealth: '100% Operacional',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao gerar métricas de admin' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await db.execute("SELECT id, name, email, role, city, state, is_verified, plan, created_at FROM users ORDER BY id DESC LIMIT 50");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

app.patch('/api/admin/users/:id/verify', async (req, res) => {
  try {
    const userId = req.params.id;
    await db.execute({
      sql: "UPDATE users SET is_verified = 1, verification_status = 'verified' WHERE id = ?",
      args: [userId]
    });
    res.json({ success: true, userId, status: 'verified' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao verificar usuário' });
  }
});

/* ==========================================================================
   11. ALICERCE ADS & PIX CHECKOUT
   ========================================================================== */
app.get('/api/ads/campaigns', async (req, res) => {
  try {
    const { userId } = req.query;
    let sql = "SELECT * FROM ad_campaigns";
    const args: any[] = [];
    if (userId) {
      sql += " WHERE user_id = ?";
      args.push(userId);
    }
    sql += " ORDER BY id DESC";
    const result = await db.execute({ sql, args });

    const formatted = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      objective: row.objective,
      targetAudience: ['Engenheiros', 'Construtoras'],
      targetRegion: row.target_region,
      dailyBudget: Number(row.daily_budget),
      totalBudget: Number(row.total_budget),
      durationDays: Number(row.duration_days),
      impressionsCount: Number(row.impressions_count || 0),
      clicksCount: Number(row.clicks_count || 0),
      status: row.status,
      paymentMethod: row.payment_method,
      pixQrCode: row.pix_qr_code,
      pixCopiaCola: row.pix_copia_cola,
      invoiceNfseUrl: row.invoice_nfse_url,
      createdAt: row.created_at
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar campanhas' });
  }
});

app.post('/api/ads/campaigns', async (req, res) => {
  try {
    const { userId, title, objective, targetRegion, dailyBudget, totalBudget, durationDays, paymentMethod } = req.body;
    const campId = `camp_${Date.now()}`;
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136alicerce-pay@bancopix.com.br520400005303986540${Number(totalBudget || 700).toFixed(2)}5802BR5916ALICERCE ADS SAO PAULO6009SAO PAULO62070503***6304${hash}`;

    await db.execute({
      sql: `INSERT INTO ad_campaigns (id, user_id, title, objective, target_region, daily_budget, total_budget, duration_days, impressions_count, clicks_count, status, payment_method, pix_qr_code, pix_copia_cola, invoice_nfse_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'ativa', ?, ?, ?, ?, ?)`,
      args: [
        campId,
        userId || 'usr_curr',
        title,
        objective || 'Captação de Leads',
        targetRegion || 'São Paulo e SP',
        dailyBudget || 50,
        totalBudget || 700,
        durationDays || 14,
        paymentMethod || 'pix',
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`,
        pixCode,
        `NFS-e_ALICERCE_${Math.floor(100000 + Math.random() * 900000)}.pdf`,
        new Date().toLocaleDateString('pt-BR')
      ]
    });

    const newCamp = {
      id: campId,
      userId: userId || 'usr_curr',
      title,
      objective: objective || 'Captação de Leads',
      targetAudience: ['Engenheiros', 'Construtoras'],
      targetRegion: targetRegion || 'São Paulo e SP',
      dailyBudget: Number(dailyBudget || 50),
      totalBudget: Number(totalBudget || 700),
      durationDays: Number(durationDays || 14),
      impressionsCount: 0,
      clicksCount: 0,
      status: 'ativa',
      paymentMethod: paymentMethod || 'pix',
      pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`,
      pixCopiaCola: pixCode,
      invoiceNfseUrl: `NFS-e_ALICERCE_${Math.floor(100000 + Math.random() * 900000)}.pdf`,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    res.status(201).json(newCamp);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar campanha de anúncios' });
  }
});

app.post('/api/ads/campaigns/:id/pay', async (req, res) => {
  try {
    const campId = req.params.id;
    await db.execute({
      sql: "UPDATE ad_campaigns SET status = 'ativa' WHERE id = ?",
      args: [campId]
    });
    res.json({ success: true, id: campId, status: 'ativa' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao processar pagamento de anúncio' });
  }
});

app.post('/api/ads/campaigns/:id/toggle', async (req, res) => {
  try {
    const campId = req.params.id;
    const { status } = req.body;
    await db.execute({
      sql: "UPDATE ad_campaigns SET status = ? WHERE id = ?",
      args: [status, campId]
    });
    res.json({ success: true, id: campId, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao alterar status da campanha' });
  }
});

app.post('/api/ads/track/impression', async (req, res) => {
  try {
    const { campaignId } = req.body;
    if (campaignId) {
      await db.execute({
        sql: "UPDATE ad_campaigns SET impressions_count = impressions_count + 1 WHERE id = ?",
        args: [campaignId]
      });
    }
    res.json({ tracked: true, type: 'impression' });
  } catch (err: any) {
    res.json({ tracked: false });
  }
});

app.post('/api/ads/track/click', async (req, res) => {
  try {
    const { campaignId } = req.body;
    if (campaignId) {
      await db.execute({
        sql: "UPDATE ad_campaigns SET clicks_count = clicks_count + 1 WHERE id = ?",
        args: [campaignId]
      });
    }
    res.json({ tracked: true, type: 'click' });
  } catch (err: any) {
    res.json({ tracked: false });
  }
});

/* ==========================================================================
   11. REAL CHAT & CONVERSATIONS API
   ========================================================================== */

function broadcastChatMessage(data: any) {
  if (wss && wss.clients) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'NEW_MESSAGE', data }));
      }
    });
  }
}

// List user conversation threads
app.get('/api/chat/threads', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'usr_curr';
    const result = await db.execute({
      sql: `SELECT * FROM conversations 
            WHERE participant_one_id = ? OR participant_two_id = ? 
            ORDER BY updated_at DESC`,
      args: [userId, userId]
    });

    const threads = result.rows.map((r: any) => {
      const isOne = r.participant_one_id === userId;
      return {
        id: r.id,
        participantId: isOne ? r.participant_two_id : r.participant_one_id,
        participantName: isOne ? r.participant_two_name : r.participant_one_name,
        participantAvatar: (isOne ? r.participant_two_avatar : r.participant_one_avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        participantRole: (isOne ? r.participant_two_role : r.participant_one_role) || 'Profissional',
        lastMessage: r.last_message || '',
        lastMessageTime: r.last_message_time || '',
        unreadCount: 0
      };
    });

    res.json(threads);
  } catch (err: any) {
    console.error('[Chat API] Erro ao listar threads:', err);
    res.status(500).json({ error: 'Erro ao carregar conversas de chat' });
  }
});

// Create or get existing conversation thread
app.post('/api/chat/threads', async (req, res) => {
  try {
    const { 
      participantId, 
      participantName, 
      participantAvatar, 
      participantRole,
      currentUserId,
      currentUserName,
      currentUserAvatar,
      currentUserRole
    } = req.body;

    if (!participantId || !currentUserId) {
      return res.status(400).json({ error: 'IDs dos participantes são obrigatórios' });
    }

    // Check if conversation already exists
    const existing = await db.execute({
      sql: `SELECT * FROM conversations 
            WHERE (participant_one_id = ? AND participant_two_id = ?) 
               OR (participant_one_id = ? AND participant_two_id = ?)`,
      args: [currentUserId, participantId, participantId, currentUserId]
    });

    if (existing.rows.length > 0) {
      const r: any = existing.rows[0];
      const isOne = r.participant_one_id === currentUserId;
      return res.json({
        id: r.id,
        participantId: isOne ? r.participant_two_id : r.participant_one_id,
        participantName: isOne ? r.participant_two_name : r.participant_one_name,
        participantAvatar: (isOne ? r.participant_two_avatar : r.participant_one_avatar) || participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        participantRole: (isOne ? r.participant_two_role : r.participant_one_role) || participantRole || 'Profissional',
        lastMessage: r.last_message || '',
        lastMessageTime: r.last_message_time || '',
        unreadCount: 0
      });
    }

    // Create new conversation
    const threadId = `thread_${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO conversations (
              id, 
              participant_one_id, 
              participant_two_id, 
              participant_one_name, 
              participant_two_name, 
              participant_one_avatar, 
              participant_two_avatar, 
              participant_one_role, 
              participant_two_role, 
              last_message, 
              last_message_time, 
              created_at, 
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', 'Agora', ?, ?)`,
      args: [
        threadId,
        currentUserId,
        participantId,
        currentUserName || 'Usuário ALICERCE',
        participantName || 'Profissional',
        currentUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        currentUserRole || 'cliente',
        participantRole || 'Profissional',
        now,
        now
      ]
    });

    res.status(201).json({
      id: threadId,
      participantId,
      participantName: participantName || 'Profissional',
      participantAvatar: participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      participantRole: participantRole || 'Profissional',
      lastMessage: '',
      lastMessageTime: 'Agora',
      unreadCount: 0
    });
  } catch (err: any) {
    console.error('[Chat API] Erro ao criar conversa:', err);
    res.status(500).json({ error: 'Erro ao iniciar conversa' });
  }
});

// Get messages for a thread
app.get(['/api/chat/messages/:threadId', '/api/messages/:threadId'], async (req, res) => {
  try {
    const { threadId } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC",
      args: [threadId]
    });

    const messages = result.rows.map((r: any) => ({
      id: r.id,
      threadId: r.thread_id,
      senderId: r.sender_id,
      senderName: r.sender_name,
      receiverId: r.receiver_id,
      text: r.text,
      attachmentUrl: r.attachment_url,
      timestamp: r.timestamp,
      read: Boolean(r.read)
    }));

    res.json(messages);
  } catch (err: any) {
    console.error('[Chat API] Erro ao buscar mensagens:', err);
    res.status(500).json({ error: 'Erro ao carregar mensagens' });
  }
});

// Send message
app.post(['/api/chat/messages', '/api/messages'], async (req, res) => {
  try {
    const { threadId, senderId, senderName, receiverId, text, attachmentUrl } = req.body;
    if (!threadId || !text) {
      return res.status(400).json({ error: 'threadId e text são obrigatórios' });
    }

    const msgId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO messages (id, thread_id, sender_id, sender_name, receiver_id, text, attachment_url, timestamp, read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      args: [
        msgId,
        threadId,
        senderId || 'usr_curr',
        senderName || 'Usuário',
        receiverId || '',
        text,
        attachmentUrl || null,
        timestamp,
        now
      ]
    });

    // Update conversation last_message
    await db.execute({
      sql: "UPDATE conversations SET last_message = ?, last_message_time = ?, updated_at = ? WHERE id = ?",
      args: [text, timestamp, now, threadId]
    });

    const newMsg = {
      id: msgId,
      threadId,
      senderId: senderId || 'usr_curr',
      senderName: senderName || 'Usuário',
      receiverId: receiverId || '',
      text,
      attachmentUrl: attachmentUrl || undefined,
      timestamp,
      read: false
    };

    // Broadcast in real-time via WebSocket
    broadcastChatMessage(newMsg);

    res.status(201).json(newMsg);
  } catch (err: any) {
    console.error('[Chat API] Erro ao enviar mensagem:', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Mark messages as read
app.patch('/api/chat/messages/:threadId/read', async (req, res) => {
  try {
    const { threadId } = req.params;
    await db.execute({
      sql: "UPDATE messages SET read = 1 WHERE thread_id = ?",
      args: [threadId]
    });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao atualizar leitura' });
  }
});

/* ==========================================================================
   12. FRONTEND PRODUCTION STATIC SERVING (Zero-Config Fullstack)
   ========================================================================== */
const clientDistCandidates = [
  path.resolve(__dirname, '../../dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist')
];
const clientDistPath = clientDistCandidates.find(p => fs.existsSync(path.join(p, 'index.html')));

if (clientDistPath) {
  console.log(`[Frontend] Servindo arquivos compilados de: ${clientDistPath}`);
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
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  });
}

/* ==========================================================================
   13. HTTP & WEBSOCKET SERVER
   ========================================================================== */
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Novo cliente conectado no Chat ALICERCE');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[WebSocket] Mensagem recebida:', data);
      
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
  console.log(`🚀 ALICERCE Backend v2.0 Rodando na Porta ${PORT}`);
  console.log(`🌐 Turso DB / libSQL Conectado com Sucesso`);
  console.log(`💬 Servidor WebSocket Ativo para Chat em Tempo Real`);
  console.log(`==================================================\n`);
});
