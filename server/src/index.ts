import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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

const PORT = Number(process.env.PORT || 4000);
const IS_PROD = process.env.NODE_ENV === 'production';

// Strict JWT_SECRET enforcement (never uses hardcoded fallback secrets)
function resolveJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  const bannedSecrets = new Set([
    'alicerce_super_secret_jwt_key_2026',
    'sua_chave_secreta_jwt_super_segura_2026',
    'secret',
    'changeme',
  ]);
  if (!envSecret || envSecret.length < 24 || bannedSecrets.has(envSecret)) {
    const ephemeral = crypto.randomBytes(32).toString('hex');
    console.warn(
      '[Ballast Security WARNING] JWT_SECRET ausente, curto (<24 chars) ou igual a chave legada insegura. Usando chave criptográfica aleatória em memória. Configure um JWT_SECRET forte (32+ chars) nas variáveis de ambiente do Render para persistir sessões entre reinícios.'
    );
    return ephemeral;
  }
  return envSecret;
}

const JWT_SECRET = resolveJwtSecret();

// CORS Allowlist
const defaultOrigins = [
  'https://ballastarch.com',
  'https://www.ballastarch.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];
const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

const app = express();
app.set('trust proxy', 1);

// Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    try {
      const host = new URL(origin).hostname.toLowerCase();
      if (
        host === 'ballastarch.com' ||
        host.endsWith('.ballastarch.com') ||
        host.endsWith('.vercel.app') ||
        host.endsWith('.onrender.com') ||
        host === 'localhost' ||
        host === '127.0.0.1'
      ) {
        return callback(null, true);
      }
    } catch {}
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));

// Lightweight in-memory rate limiter
function createRateLimiter(maxRequests: number, windowMs: number) {
  const store = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = store.get(ip);
    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: 'Muitas requisições. Aguarde alguns instantes e tente novamente.' });
    }
    return next();
  };
}

const authLimiter = createRateLimiter(30, 15 * 60 * 1000);
const writeLimiter = createRateLimiter(120, 60 * 1000);

// Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PUBLIC_ROLES = new Set([
  'cliente',
  'pessoa_fisica',
  'profissional',
  'profissional_cau',
  'profissional_crea',
  'empresa_cnpj',
  'fornecedor',
]);

function safeJsonParse<T>(raw: any, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isSafeHttpUrl(url: any): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'https:') return true;
    if (!IS_PROD && parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function isSafeAttachmentUrl(url: any): boolean {
  if (!isSafeHttpUrl(url)) return false;
  const clean = String(url).trim().toLowerCase().split('?')[0];
  const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.dwg', '.zip'];
  return allowedExts.some((ext) => clean.endsWith(ext));
}

function clampPagination(req: Request, defaultLimit = 20, maxLimit = 50) {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(String(req.query.limit || String(defaultLimit)), 10) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function sanitizeString(val: any, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

// Initialize Database Schema
await initSchema();

interface AuthedUser {
  id: string;
  email: string;
  role: string;
  name: string;
  avatar: string | null;
  city: string;
  state: string;
  is_verified: number;
  verification_status: string;
  crea_cau_number: string | null;
  cnpj_number: string | null;
}

interface AuthedRequest extends Request {
  user?: AuthedUser;
}

async function resolveUserFromToken(token: string): Promise<AuthedUser | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!payload?.id) return null;
    const result = await db.execute({
      sql: 'SELECT id, email, role, name, avatar, city, state, is_verified, verification_status, crea_cau_number, cnpj_number FROM users WHERE id = ?',
      args: [payload.id],
    });
    if (result.rows.length === 0) return null;
    const row: any = result.rows[0];
    return {
      id: String(row.id),
      email: String(row.email),
      role: String(row.role),
      name: String(row.name),
      avatar: row.avatar ? String(row.avatar) : null,
      city: String(row.city || ''),
      state: String(row.state || ''),
      is_verified: Number(row.is_verified || 0),
      verification_status: String(row.verification_status || 'unverified'),
      crea_cau_number: row.crea_cau_number ? String(row.crea_cau_number) : null,
      cnpj_number: row.cnpj_number ? String(row.cnpj_number) : null,
    };
  } catch {
    return null;
  }
}

async function authenticateToken(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ error: 'Sessão não autenticada. Faça login para continuar.' });
  }
  const user = await resolveUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
  req.user = user;
  next();
}

async function optionalToken(req: AuthedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (token) {
    const user = await resolveUserFromToken(token);
    if (user) req.user = user;
  }
  next();
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores autorizados.' });
  }
  next();
}

function formatUserResponse(user: any, prof?: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    creaCauNumber: user.crea_cau_number || undefined,
    cnpjNumber: user.cnpj_number || undefined,
    phone: user.phone || undefined,
    whatsapp: user.whatsapp || undefined,
    city: user.city,
    state: user.state,
    bio: user.bio || undefined,
    avatar: user.avatar || '',
    verified: Boolean(user.is_verified),
    verificationStatus: user.verification_status || (user.is_verified ? 'verified' : user.crea_cau_number ? 'declared' : 'unverified'),
    consentLgpd: Boolean(user.consent_lgpd),
    plan: user.plan || 'gratuito',
    createdAt: user.created_at,
    professionalProfile: prof
      ? {
          profession: prof.profession,
          specialty: prof.specialty,
          experienceYears: Number(prof.experience_years || 0),
          services: safeJsonParse<string[]>(prof.services, []),
          styles: safeJsonParse<string[]>(prof.styles, []),
          projectTypes: safeJsonParse<string[]>(prof.project_types, []),
          investmentRanges: safeJsonParse<string[]>(prof.investment_ranges, []),
          serviceArea: prof.service_area || '',
          availability: prof.availability || 'disponivel',
        }
      : undefined,
  };
}

/* ==========================================================================
   HEALTH CHECK
   ========================================================================== */
app.get('/api/health', async (_req, res) => {
  try {
    await db.execute('SELECT 1 as ok');
    res.json({
      ok: true,
      status: 'online',
      service: 'Ballast Architecture API',
      database: 'connected',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      ok: false,
      status: 'degraded',
      service: 'Ballast Architecture API',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

/* ==========================================================================
   1. AUTHENTICATION, SESSIONS & LGPD ACCOUNT MANAGEMENT
   ========================================================================== */
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 120);
    const email = sanitizeString(req.body.email, 160).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const requestedRole = sanitizeString(req.body.role || 'cliente', 40);
    const creaCauNumber = sanitizeString(req.body.creaCauNumber, 60) || null;
    const cnpjNumber = sanitizeString(req.body.cnpjNumber, 30) || null;
    const phone = sanitizeString(req.body.phone, 30) || null;
    const whatsapp = sanitizeString(req.body.whatsapp || req.body.phone, 30) || null;
    const city = sanitizeString(req.body.city, 80);
    const state = sanitizeString(req.body.state, 2).toUpperCase();
    const bio = sanitizeString(req.body.bio, 1200) || null;
    const consentLgpd = req.body.consentLgpd !== false;

    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Informe seu nome completo (mínimo 2 caracteres).' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 8 caracteres.' });
    }
    if (!city || state.length !== 2) {
      return res.status(400).json({ error: 'Informe sua cidade e estado (UF com 2 letras).' });
    }
    if (!consentLgpd) {
      return res.status(400).json({ error: 'É necessário aceitar a Política de Privacidade (LGPD) para criar sua conta.' });
    }
    if (!PUBLIC_ROLES.has(requestedRole)) {
      return res.status(400).json({ error: 'Tipo de conta inválido para cadastro público.' });
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE LOWER(email) = ?',
      args: [email],
    });
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado na Ballast.' });
    }

    const passHash = await bcrypt.hash(password, 12);
    const userId = `usr_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const verificationStatus = creaCauNumber ? 'declared' : 'unverified';

    await db.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, crea_cau_number, cnpj_number, phone, whatsapp, city, state, bio, avatar, is_verified, verification_status, consent_lgpd, plan, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 0, ?, 1, 'gratuito', ?)`,
      args: [
        userId,
        name,
        email,
        passHash,
        requestedRole,
        creaCauNumber,
        cnpjNumber,
        phone,
        whatsapp,
        city,
        state,
        bio,
        verificationStatus,
        now,
      ],
    });

    const isProfessional = ['profissional', 'profissional_cau', 'profissional_crea'].includes(requestedRole);
    let createdProf: any = null;

    if (isProfessional) {
      const profession = sanitizeString(
        req.body.profession || (requestedRole === 'profissional_cau' ? 'Arquiteto e Urbanista' : 'Engenheiro Civil'),
        80
      );
      const specialty = sanitizeString(req.body.specialty || 'Arquitetura Residencial', 120);
      const experienceYears = Math.max(0, Math.min(70, parseInt(String(req.body.experienceYears || '0'), 10) || 0));
      const services = Array.isArray(req.body.services)
        ? req.body.services.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 12)
        : [];
      const styles = Array.isArray(req.body.styles)
        ? req.body.styles.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 8)
        : [];
      const projectTypes = Array.isArray(req.body.projectTypes)
        ? req.body.projectTypes.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 8)
        : [];
      const investmentRanges = Array.isArray(req.body.investmentRanges)
        ? req.body.investmentRanges.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 6)
        : [];
      const serviceArea = sanitizeString(req.body.serviceArea || `${city}, ${state}`, 160);
      const availability = ['disponivel', 'agenda_limitada', 'lista_espera'].includes(req.body.availability)
        ? req.body.availability
        : 'disponivel';

      await db.execute({
        sql: `INSERT INTO professional_profiles (
                id, user_id, profession, specialty, experience_years, bio, services, styles, project_types, investment_ranges, service_area,
                crea_cau_number, phone, whatsapp, rating, reviews_count, availability, city, state, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)`,
        args: [
          `prof_${crypto.randomUUID()}`,
          userId,
          profession,
          specialty,
          experienceYears,
          bio,
          JSON.stringify(services),
          JSON.stringify(styles),
          JSON.stringify(projectTypes),
          JSON.stringify(investmentRanges),
          serviceArea,
          creaCauNumber,
          phone,
          whatsapp,
          availability,
          city,
          state,
          now,
        ],
      });

      createdProf = {
        profession,
        specialty,
        experience_years: experienceYears,
        services: JSON.stringify(services),
        styles: JSON.stringify(styles),
        project_types: JSON.stringify(projectTypes),
        investment_ranges: JSON.stringify(investmentRanges),
        service_area: serviceArea,
        availability,
      };
    } else if (requestedRole === 'empresa_cnpj') {
      await db.execute({
        sql: `INSERT INTO company_profiles (id, user_id, company_name, cnpj, city, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [`comp_${crypto.randomUUID()}`, userId, name, cnpjNumber, city, state, now],
      });
    } else if (requestedRole === 'fornecedor') {
      await db.execute({
        sql: `INSERT INTO supplier_profiles (id, user_id, company_name, cnpj, category, city, state, created_at)
              VALUES (?, ?, ?, ?, 'Materiais e Acabamentos', ?, ?, ?)`,
        args: [`supp_${crypto.randomUUID()}`, userId, name, cnpjNumber, city, state, now],
      });
    }

    const token = jwt.sign({ id: userId, role: requestedRole }, JWT_SECRET, { expiresIn: '7d' });

    const createdUser = {
      id: userId,
      name,
      email,
      role: requestedRole,
      crea_cau_number: creaCauNumber,
      cnpj_number: cnpjNumber,
      phone,
      whatsapp,
      city,
      state,
      bio,
      avatar: '',
      is_verified: 0,
      verification_status: verificationStatus,
      consent_lgpd: 1,
      plan: 'gratuito',
      created_at: now,
    };

    res.status(201).json({
      token,
      user: formatUserResponse(createdUser, createdProf),
    });
  } catch (err) {
    console.error('[Auth] Erro no cadastro:', err);
    res.status(500).json({ error: 'Não foi possível concluir o cadastro. Tente novamente.' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const email = sanitizeString(req.body.email, 160).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const user: any = result.rows[0];
    const valid = await bcrypt.compare(password, String(user.password_hash));
    if (!valid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const profRes = await db.execute({
      sql: 'SELECT * FROM professional_profiles WHERE user_id = ?',
      args: [user.id],
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: formatUserResponse(user, profRes.rows[0]),
    });
  } catch (err) {
    console.error('[Auth] Erro no login:', err);
    res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [req.user!.id],
    });
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }
    const profRes = await db.execute({
      sql: 'SELECT * FROM professional_profiles WHERE user_id = ?',
      args: [req.user!.id],
    });
    res.json(formatUserResponse(result.rows[0], profRes.rows[0]));
  } catch {
    res.status(500).json({ error: 'Erro ao validar sessão.' });
  }
});

app.put('/api/user/profile', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const name = req.body.name !== undefined ? sanitizeString(req.body.name, 120) : null;
    const phone = req.body.phone !== undefined ? sanitizeString(req.body.phone, 30) : null;
    const whatsapp = req.body.whatsapp !== undefined ? sanitizeString(req.body.whatsapp, 30) : null;
    const city = req.body.city !== undefined ? sanitizeString(req.body.city, 80) : null;
    const state = req.body.state !== undefined ? sanitizeString(req.body.state, 2).toUpperCase() : null;
    const bio = req.body.bio !== undefined ? sanitizeString(req.body.bio, 1500) : null;
    const avatar = req.body.avatar !== undefined && (req.body.avatar === '' || isSafeHttpUrl(req.body.avatar))
      ? sanitizeString(req.body.avatar, 500)
      : null;
    const creaCauNumber = req.body.creaCauNumber !== undefined ? sanitizeString(req.body.creaCauNumber, 60) : null;
    const cnpjNumber = req.body.cnpjNumber !== undefined ? sanitizeString(req.body.cnpjNumber, 30) : null;
    const now = new Date().toISOString();

    // If user changes their registration number, reset verification to 'declared' so it must be validated by Ballast
    const currentUserRow = await db.execute({ sql: 'SELECT crea_cau_number, is_verified, verification_status FROM users WHERE id = ?', args: [userId] });
    const prevCrea = String((currentUserRow.rows[0] as any)?.crea_cau_number || '');
    let nextVerified = Number((currentUserRow.rows[0] as any)?.is_verified || 0);
    let nextVerStatus = String((currentUserRow.rows[0] as any)?.verification_status || 'unverified');
    if (creaCauNumber !== null && creaCauNumber !== prevCrea) {
      nextVerified = 0;
      nextVerStatus = creaCauNumber ? 'declared' : 'unverified';
    }

    await db.execute({
      sql: `UPDATE users
            SET name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                whatsapp = COALESCE(?, whatsapp),
                city = COALESCE(?, city),
                state = COALESCE(?, state),
                bio = COALESCE(?, bio),
                avatar = COALESCE(?, avatar),
                crea_cau_number = COALESCE(?, crea_cau_number),
                cnpj_number = COALESCE(?, cnpj_number),
                is_verified = ?,
                verification_status = ?,
                updated_at = ?
            WHERE id = ?`,
      args: [name, phone, whatsapp, city, state, bio, avatar, creaCauNumber, cnpjNumber, nextVerified, nextVerStatus, now, userId],
    });

    // Update or create professional_profiles if professional fields are provided
    const isProfRole = ['profissional', 'profissional_cau', 'profissional_crea'].includes(req.user!.role);
    if (isProfRole) {
      const existingProf = await db.execute({ sql: 'SELECT id FROM professional_profiles WHERE user_id = ?', args: [userId] });
      const profession = sanitizeString(req.body.profession || 'Arquiteto e Urbanista', 80);
      const specialty = sanitizeString(req.body.specialty || 'Arquitetura Residencial', 120);
      const experienceYears =
        req.body.experienceYears !== undefined
          ? Math.max(0, Math.min(70, parseInt(String(req.body.experienceYears), 10) || 0))
          : null;
      const services = Array.isArray(req.body.services)
        ? JSON.stringify(req.body.services.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 12))
        : null;
      const styles = Array.isArray(req.body.styles)
        ? JSON.stringify(req.body.styles.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 8))
        : null;
      const projectTypes = Array.isArray(req.body.projectTypes)
        ? JSON.stringify(req.body.projectTypes.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 8))
        : null;
      const investmentRanges = Array.isArray(req.body.investmentRanges)
        ? JSON.stringify(req.body.investmentRanges.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 6))
        : null;
      const serviceArea = req.body.serviceArea !== undefined ? sanitizeString(req.body.serviceArea, 160) : null;
      const availability =
        req.body.availability && ['disponivel', 'agenda_limitada', 'lista_espera'].includes(req.body.availability)
          ? req.body.availability
          : null;

      if (existingProf.rows.length > 0) {
        await db.execute({
          sql: `UPDATE professional_profiles
                SET profession = COALESCE(?, profession),
                    specialty = COALESCE(?, specialty),
                    experience_years = COALESCE(?, experience_years),
                    bio = COALESCE(?, bio),
                    services = COALESCE(?, services),
                    styles = COALESCE(?, styles),
                    project_types = COALESCE(?, project_types),
                    investment_ranges = COALESCE(?, investment_ranges),
                    service_area = COALESCE(?, service_area),
                    crea_cau_number = COALESCE(?, crea_cau_number),
                    phone = COALESCE(?, phone),
                    whatsapp = COALESCE(?, whatsapp),
                    availability = COALESCE(?, availability),
                    city = COALESCE(?, city),
                    state = COALESCE(?, state)
                WHERE user_id = ?`,
          args: [
            req.body.profession ? profession : null,
            req.body.specialty ? specialty : null,
            experienceYears,
            bio,
            services,
            styles,
            projectTypes,
            investmentRanges,
            serviceArea,
            creaCauNumber,
            phone,
            whatsapp,
            availability,
            city,
            state,
            userId,
          ],
        });
      } else {
        await db.execute({
          sql: `INSERT INTO professional_profiles (
                  id, user_id, profession, specialty, experience_years, bio, services, styles, project_types, investment_ranges, service_area,
                  crea_cau_number, phone, whatsapp, availability, city, state, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            `prof_${crypto.randomUUID()}`,
            userId,
            profession,
            specialty,
            experienceYears ?? 0,
            bio,
            services || '[]',
            styles || '[]',
            projectTypes || '[]',
            investmentRanges || '[]',
            serviceArea || `${city || req.user!.city}, ${state || req.user!.state}`,
            creaCauNumber,
            phone,
            whatsapp,
            availability || 'disponivel',
            city || req.user!.city,
            state || req.user!.state,
            now,
          ],
        });
      }
    }

    const updatedUser = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });
    const updatedProf = await db.execute({ sql: 'SELECT * FROM professional_profiles WHERE user_id = ?', args: [userId] });
    res.json({
      success: true,
      user: formatUserResponse(updatedUser.rows[0], updatedProf.rows[0]),
    });
  } catch (err) {
    console.error('[Profile] Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil no servidor.' });
  }
});

// LGPD: Full Data Portability Export
app.get('/api/user/export', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const uid = req.user!.id;
    const [u, prof, portfolio, posts, favs, quotes, propReqs, msgs] = await Promise.all([
      db.execute({
        sql: 'SELECT id, name, email, role, crea_cau_number, cnpj_number, phone, whatsapp, city, state, bio, is_verified, verification_status, consent_lgpd, created_at, updated_at FROM users WHERE id = ?',
        args: [uid],
      }),
      db.execute({ sql: 'SELECT * FROM professional_profiles WHERE user_id = ?', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM portfolio_items WHERE user_id = ?', args: [uid] }),
      db.execute({ sql: 'SELECT id, category, title, content, city, state, created_at FROM posts WHERE author_id = ?', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM favorites WHERE user_id = ?', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM quote_requests WHERE requester_id = ?', args: [uid] }),
      db.execute({ sql: 'SELECT * FROM proposal_requests WHERE client_id = ? OR architect_id = ?', args: [uid, uid] }),
      db.execute({ sql: 'SELECT id, thread_id, sender_id, receiver_id, text, timestamp, created_at FROM messages WHERE sender_id = ? OR receiver_id = ?', args: [uid, uid] }),
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      platform: 'Ballast Architecture',
      legalBasis: 'LGPD — Lei nº 13.709/2018 (Portabilidade e Acesso)',
      account: u.rows[0] || null,
      professionalProfile: prof.rows[0] || null,
      portfolio: portfolio.rows,
      posts: posts.rows,
      favorites: favs.rows,
      quoteRequests: quotes.rows,
      proposalRequests: propReqs.rows,
      messages: msgs.rows,
    });
  } catch {
    res.status(500).json({ error: 'Não foi possível gerar a exportação de dados.' });
  }
});

// LGPD: Real Account Erasure
app.delete('/api/user/account', authenticateToken, authLimiter, async (req: AuthedRequest, res) => {
  try {
    const uid = req.user!.id;
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!password) {
      return res.status(400).json({ error: 'Informe sua senha atual para confirmar a exclusão da conta.' });
    }

    const userRes = await db.execute({ sql: 'SELECT password_hash FROM users WHERE id = ?', args: [uid] });
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }
    const valid = await bcrypt.compare(password, String((userRes.rows[0] as any).password_hash));
    if (!valid) {
      return res.status(401).json({ error: 'Senha incorreta. A conta não foi excluída.' });
    }

    // Delete personal data across tables
    await db.execute({ sql: 'DELETE FROM favorites WHERE user_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM notifications WHERE user_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM post_likes WHERE user_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM portfolio_items WHERE user_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM posts WHERE author_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', args: [uid, uid] });
    await db.execute({ sql: 'DELETE FROM conversations WHERE participant_one_id = ? OR participant_two_id = ?', args: [uid, uid] });
    await db.execute({ sql: 'DELETE FROM proposal_requests WHERE client_id = ? OR architect_id = ?', args: [uid, uid] });
    await db.execute({ sql: 'DELETE FROM quote_requests WHERE requester_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM ad_campaigns WHERE user_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM professional_profiles WHERE user_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM company_profiles WHERE user_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM supplier_profiles WHERE user_id = ?', args: [uid] });
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [uid] });

    // Disconnect active WebSockets for this user
    disconnectUserSockets(uid);

    res.json({ deleted: true, message: 'Sua conta e seus dados pessoais foram excluídos permanentemente.' });
  } catch (err) {
    console.error('[LGPD] Erro ao excluir conta:', err);
    res.status(500).json({ error: 'Erro ao processar a exclusão da conta.' });
  }
});

/* ==========================================================================
   2. PROFESSIONALS, ARCHITECTS DIRECTORY & PORTFOLIOS
   ========================================================================== */
app.get('/api/professionals', async (req, res) => {
  try {
    const { q, city, state, specialty, projectType, style, investmentRange, availability, verifiedOnly } = req.query;
    const { page, limit, offset } = clampPagination(req, 24, 50);

    let sql = `
      SELECT u.id, u.name, u.role, u.avatar, u.city, u.state, u.is_verified, u.verification_status, u.bio, u.crea_cau_number as user_crea,
             p.profession, p.specialty, p.experience_years, p.bio as prof_bio, p.services, p.styles, p.project_types, p.investment_ranges,
             p.service_area, p.rating, p.reviews_count, p.availability, p.crea_cau_number as prof_crea
      FROM users u
      LEFT JOIN professional_profiles p ON u.id = p.user_id
      WHERE u.role IN ('profissional', 'profissional_crea', 'profissional_cau', 'arquiteto', 'engenheiro')
    `;
    const args: any[] = [];

    if (q) {
      const term = `%${String(q).trim()}%`;
      sql += ` AND (u.name LIKE ? OR p.profession LIKE ? OR p.specialty LIKE ? OR p.services LIKE ? OR p.styles LIKE ? OR u.bio LIKE ? OR u.city LIKE ?)`;
      args.push(term, term, term, term, term, term, term);
    }
    if (city) {
      const cTerm = `%${String(city).trim()}%`;
      sql += ` AND (u.city LIKE ? OR p.city LIKE ? OR p.service_area LIKE ?)`;
      args.push(cTerm, cTerm, cTerm);
    }
    if (state) {
      sql += ` AND UPPER(u.state) = UPPER(?)`;
      args.push(String(state).trim());
    }
    if (specialty) {
      sql += ` AND (p.specialty LIKE ? OR p.services LIKE ?)`;
      const sTerm = `%${String(specialty).trim()}%`;
      args.push(sTerm, sTerm);
    }
    if (projectType) {
      sql += ` AND (p.project_types LIKE ? OR p.specialty LIKE ?)`;
      const pTerm = `%${String(projectType).trim()}%`;
      args.push(pTerm, pTerm);
    }
    if (style) {
      sql += ` AND p.styles LIKE ?`;
      args.push(`%${String(style).trim()}%`);
    }
    if (investmentRange) {
      sql += ` AND p.investment_ranges LIKE ?`;
      args.push(`%${String(investmentRange).trim()}%`);
    }
    if (availability) {
      sql += ` AND p.availability = ?`;
      args.push(String(availability).trim());
    }
    if (verifiedOnly === 'true' || verifiedOnly === '1') {
      sql += ` AND u.is_verified = 1`;
    }

    sql += ` ORDER BY u.is_verified DESC, p.reviews_count DESC, u.created_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const result = await db.execute({ sql, args });
    const userIds = result.rows.map((r: any) => String(r.id));

    // Fetch portfolio covers in a single scoped query (no N+1, no global scan)
    let portfolioByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(',');
      const portRes = await db.execute({
        sql: `SELECT id, user_id, title, project_type, city, state, year, photo_credit, media_urls FROM portfolio_items WHERE user_id IN (${placeholders}) ORDER BY created_at DESC`,
        args: userIds,
      });
      for (const row of portRes.rows as any[]) {
        const uid = String(row.user_id);
        if (!portfolioByUser[uid]) portfolioByUser[uid] = [];
        if (portfolioByUser[uid].length < 4) {
          portfolioByUser[uid].push({
            id: row.id,
            title: row.title,
            projectType: row.project_type || '',
            city: row.city || '',
            state: row.state || '',
            year: row.year || '',
            photoCredit: row.photo_credit || '',
            mediaUrls: safeJsonParse<string[]>(row.media_urls, []),
          });
        }
      }
    }

    const professionals = result.rows.map((r: any) => {
      const reg = r.prof_crea || r.user_crea || undefined;
      const isVerified = Boolean(r.is_verified);
      return {
        id: r.id,
        name: r.name,
        role: r.role,
        avatar: r.avatar || '',
        city: r.city,
        state: r.state,
        bio: r.prof_bio || r.bio || '',
        profession: r.profession || (r.role === 'profissional_cau' ? 'Arquiteto e Urbanista' : 'Profissional de Arquitetura e Engenharia'),
        specialty: r.specialty || 'Arquitetura e Projetos',
        experienceYears: Number(r.experience_years || 0),
        services: safeJsonParse<string[]>(r.services, []),
        styles: safeJsonParse<string[]>(r.styles, []),
        projectTypes: safeJsonParse<string[]>(r.project_types, []),
        investmentRanges: safeJsonParse<string[]>(r.investment_ranges, []),
        serviceArea: r.service_area || `${r.city}, ${r.state}`,
        creaCauNumber: reg,
        rating: Number(r.rating || 0),
        reviewsCount: Number(r.reviews_count || 0),
        availability: r.availability || 'disponivel',
        isVerified,
        verificationStatus: isVerified ? 'verified' : reg ? 'declared' : 'unverified',
        portfolioPreview: portfolioByUser[String(r.id)] || [],
      };
    });

    res.json({ items: professionals, page, limit });
  } catch (err) {
    console.error('[Directory] Erro ao listar profissionais:', err);
    res.status(500).json({ error: 'Erro ao carregar catálogo de profissionais.' });
  }
});

// Public Shareable Professional Profile Page endpoint
app.get('/api/professionals/:id', async (req, res) => {
  try {
    const profId = req.params.id;
    const result = await db.execute({
      sql: `SELECT u.id, u.name, u.role, u.avatar, u.city, u.state, u.is_verified, u.verification_status, u.bio, u.crea_cau_number as user_crea, u.created_at,
                   p.profession, p.specialty, p.experience_years, p.bio as prof_bio, p.services, p.styles, p.project_types, p.investment_ranges,
                   p.service_area, p.rating, p.reviews_count, p.availability, p.crea_cau_number as prof_crea
            FROM users u
            LEFT JOIN professional_profiles p ON u.id = p.user_id
            WHERE u.id = ? AND u.role IN ('profissional', 'profissional_crea', 'profissional_cau', 'arquiteto', 'engenheiro')`,
      args: [profId],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil profissional não encontrado.' });
    }

    const r: any = result.rows[0];
    const [portRes, revRes] = await Promise.all([
      db.execute({
        sql: 'SELECT * FROM portfolio_items WHERE user_id = ? ORDER BY created_at DESC',
        args: [profId],
      }),
      db.execute({
        sql: 'SELECT id, reviewer_id, reviewer_name, reviewer_avatar, rating, comment, contract_type, created_at FROM reviews WHERE target_user_id = ? ORDER BY created_at DESC LIMIT 30',
        args: [profId],
      }),
    ]);

    const reg = r.prof_crea || r.user_crea || undefined;
    const isVerified = Boolean(r.is_verified);

    res.json({
      id: r.id,
      name: r.name,
      role: r.role,
      avatar: r.avatar || '',
      city: r.city,
      state: r.state,
      bio: r.prof_bio || r.bio || '',
      profession: r.profession || 'Arquiteto e Urbanista',
      specialty: r.specialty || 'Arquitetura e Projetos',
      experienceYears: Number(r.experience_years || 0),
      services: safeJsonParse<string[]>(r.services, []),
      styles: safeJsonParse<string[]>(r.styles, []),
      projectTypes: safeJsonParse<string[]>(r.project_types, []),
      investmentRanges: safeJsonParse<string[]>(r.investment_ranges, []),
      serviceArea: r.service_area || `${r.city}, ${r.state}`,
      creaCauNumber: reg,
      rating: Number(r.rating || 0),
      reviewsCount: Number(r.reviews_count || 0),
      availability: r.availability || 'disponivel',
      isVerified,
      verificationStatus: isVerified ? 'verified' : reg ? 'declared' : 'unverified',
      createdAt: r.created_at,
      portfolio: portRes.rows.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        title: p.title,
        description: p.description || '',
        context: p.context || '',
        category: p.category || '',
        projectType: p.project_type || '',
        city: p.city || r.city,
        state: p.state || r.state,
        year: p.year || '',
        photoCredit: p.photo_credit || '',
        mediaUrls: safeJsonParse<string[]>(p.media_urls, []),
        budget: p.budget ? Number(p.budget) : undefined,
        createdAt: p.created_at,
      })),
      reviews: revRes.rows,
    });
  } catch (err) {
    console.error('[Directory] Erro ao carregar perfil:', err);
    res.status(500).json({ error: 'Erro ao carregar perfil profissional.' });
  }
});

// Portfolio Management (Guaranteed server confirmation)
app.post('/api/portfolio', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const title = sanitizeString(req.body.title, 140);
    const description = sanitizeString(req.body.description, 2000);
    const context = sanitizeString(req.body.context, 1000);
    const projectType = sanitizeString(req.body.projectType || 'Residencial', 60);
    const city = sanitizeString(req.body.city || req.user!.city, 80);
    const state = sanitizeString(req.body.state || req.user!.state, 2).toUpperCase();
    const year = sanitizeString(req.body.year, 10);
    const photoCredit = sanitizeString(req.body.photoCredit, 120);
    const rawMedia = Array.isArray(req.body.mediaUrls) ? req.body.mediaUrls : [];
    const mediaUrls = rawMedia.filter((u: any) => isSafeHttpUrl(u)).slice(0, 8);

    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição do projeto são obrigatórios.' });
    }

    const id = `port_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO portfolio_items (id, user_id, title, description, context, category, project_type, city, state, year, photo_credit, media_urls, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, req.user!.id, title, description, context, projectType, projectType, city, state, year, photoCredit, JSON.stringify(mediaUrls), now],
    });

    res.status(201).json({
      id,
      userId: req.user!.id,
      title,
      description,
      context,
      projectType,
      city,
      state,
      year,
      photoCredit,
      mediaUrls,
      createdAt: now,
    });
  } catch (err) {
    console.error('[Portfolio] Erro ao criar projeto:', err);
    res.status(500).json({ error: 'Erro ao publicar projeto no portfólio.' });
  }
});

app.delete('/api/portfolio/:id', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const id = req.params.id;
    const existing = await db.execute({ sql: 'SELECT user_id FROM portfolio_items WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Projeto não encontrado.' });
    if (String((existing.rows[0] as any).user_id) !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para excluir este projeto.' });
    }
    await db.execute({ sql: 'DELETE FROM portfolio_items WHERE id = ?', args: [id] });
    res.json({ deleted: true, id });
  } catch {
    res.status(500).json({ error: 'Erro ao remover projeto.' });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const { q, city } = req.query;
    const { page, limit, offset } = clampPagination(req, 20, 50);
    let sql = `
      SELECT u.id, u.name, u.avatar, u.city, u.state, u.is_verified, u.bio,
             c.company_name, c.trade_name, c.categories, c.services, c.region_served, c.rating, c.reviews_count, c.website
      FROM users u
      LEFT JOIN company_profiles c ON u.id = c.user_id
      WHERE u.role IN ('empresa', 'empresa_cnpj', 'construtora')
    `;
    const args: any[] = [];
    if (q) {
      const term = `%${String(q).trim()}%`;
      sql += ` AND (u.name LIKE ? OR c.company_name LIKE ? OR c.services LIKE ?)`;
      args.push(term, term, term);
    }
    if (city) {
      sql += ` AND u.city LIKE ?`;
      args.push(`%${String(city).trim()}%`);
    }
    sql += ` ORDER BY u.is_verified DESC, u.created_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const result = await db.execute({ sql, args });
    res.json({
      items: result.rows.map((r: any) => ({
        id: r.id,
        name: r.company_name || r.name,
        tradeName: r.trade_name || undefined,
        city: r.city,
        state: r.state,
        website: r.website || undefined,
        avatar: r.avatar || '',
        categories: safeJsonParse<string[]>(r.categories, []),
        services: safeJsonParse<string[]>(r.services, []),
        rating: Number(r.rating || 0),
        reviewsCount: Number(r.reviews_count || 0),
        isVerified: Boolean(r.is_verified),
      })),
      page,
      limit,
    });
  } catch {
    res.status(500).json({ error: 'Erro ao listar escritórios e empresas.' });
  }
});

app.get('/api/suppliers', async (req, res) => {
  try {
    const { q, category, city } = req.query;
    const { page, limit, offset } = clampPagination(req, 20, 50);
    let sql = `
      SELECT u.id, u.name, u.avatar, u.city, u.state, u.is_verified,
             s.company_name, s.category, s.product_types, s.delivery_available, s.rating, s.reviews_count, s.region_served, s.website
      FROM users u
      LEFT JOIN supplier_profiles s ON u.id = s.user_id
      WHERE u.role = 'fornecedor'
    `;
    const args: any[] = [];
    if (q) {
      const term = `%${String(q).trim()}%`;
      sql += ` AND (u.name LIKE ? OR s.company_name LIKE ? OR s.product_types LIKE ?)`;
      args.push(term, term, term);
    }
    if (category) {
      sql += ` AND s.category LIKE ?`;
      args.push(`%${String(category).trim()}%`);
    }
    if (city) {
      sql += ` AND u.city LIKE ?`;
      args.push(`%${String(city).trim()}%`);
    }
    sql += ` ORDER BY u.is_verified DESC, u.created_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const result = await db.execute({ sql, args });
    res.json({
      items: result.rows.map((r: any) => ({
        id: r.id,
        name: r.company_name || r.name,
        category: r.category || 'Materiais',
        productTypes: safeJsonParse<string[]>(r.product_types, []),
        deliveryAvailable: Boolean(r.delivery_available),
        city: r.city,
        state: r.state,
        website: r.website || undefined,
        avatar: r.avatar || '',
        rating: Number(r.rating || 0),
        reviewsCount: Number(r.reviews_count || 0),
        isVerified: Boolean(r.is_verified),
      })),
      page,
      limit,
    });
  } catch {
    res.status(500).json({ error: 'Erro ao listar fornecedores.' });
  }
});

/* ==========================================================================
   3. STRUCTURED PROPOSAL REQUESTS (Cliente -> Arquiteto, linked to Chat)
   ========================================================================== */
app.get('/api/proposal-requests', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const uid = req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    const sql = isAdmin
      ? 'SELECT * FROM proposal_requests ORDER BY created_at DESC LIMIT 50'
      : 'SELECT * FROM proposal_requests WHERE client_id = ? OR architect_id = ? ORDER BY created_at DESC LIMIT 50';
    const args = isAdmin ? [] : [uid, uid];
    const result = await db.execute({ sql, args });
    res.json(
      result.rows.map((r: any) => ({
        id: r.id,
        clientId: r.client_id,
        clientName: r.client_name,
        architectId: r.architect_id,
        architectName: r.architect_name,
        threadId: r.thread_id,
        projectType: r.project_type,
        city: r.city,
        state: r.state,
        budgetRange: r.budget_range,
        timeline: r.timeline,
        currentStage: r.current_stage,
        description: r.description,
        stylePreferences: safeJsonParse<string[]>(r.style_preferences, []),
        status: r.status,
        architectResponse: r.architect_response || undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }))
    );
  } catch {
    res.status(500).json({ error: 'Erro ao buscar solicitações de proposta.' });
  }
});

app.post('/api/proposal-requests', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const architectId = sanitizeString(req.body.architectId, 100);
    const projectType = sanitizeString(req.body.projectType, 80);
    const city = sanitizeString(req.body.city || req.user!.city, 80);
    const state = sanitizeString(req.body.state || req.user!.state, 2).toUpperCase();
    const budgetRange = sanitizeString(req.body.budgetRange, 80);
    const timeline = sanitizeString(req.body.timeline, 80);
    const currentStage = sanitizeString(req.body.currentStage, 80);
    const description = sanitizeString(req.body.description, 2000);
    const stylePreferences = Array.isArray(req.body.stylePreferences)
      ? req.body.stylePreferences.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 8)
      : [];

    if (!architectId || !projectType || !description) {
      return res.status(400).json({ error: 'Informe o profissional, tipo de projeto e descrição do briefing.' });
    }
    if (architectId === req.user!.id) {
      return res.status(400).json({ error: 'Não é possível enviar solicitação de proposta para si mesmo.' });
    }

    const archRes = await db.execute({
      sql: 'SELECT id, name, avatar, role FROM users WHERE id = ?',
      args: [architectId],
    });
    if (archRes.rows.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }
    const arch: any = archRes.rows[0];
    const now = new Date().toISOString();
    const reqId = `preq_${crypto.randomUUID()}`;
    const projectTitle = `${projectType} — ${city}/${state}`;

    // Find or create private conversation thread linked to this project
    let threadId = '';
    const existingConv = await db.execute({
      sql: `SELECT id FROM conversations
            WHERE (participant_one_id = ? AND participant_two_id = ?)
               OR (participant_one_id = ? AND participant_two_id = ?)`,
      args: [req.user!.id, architectId, architectId, req.user!.id],
    });

    const summaryText = `Solicitação de proposta — ${projectTitle}\nEtapa: ${currentStage || 'Não informada'} · Orçamento: ${budgetRange || 'A combinar'} · Prazo: ${timeline || 'A definir'}\n\n${description}`;
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (existingConv.rows.length > 0) {
      threadId = String((existingConv.rows[0] as any).id);
      await db.execute({
        sql: 'UPDATE conversations SET project_title = ?, proposal_request_id = ?, last_message = ?, last_message_time = ?, updated_at = ? WHERE id = ?',
        args: [projectTitle, reqId, summaryText.slice(0, 140), timeStr, now, threadId],
      });
    } else {
      threadId = `thread_${crypto.randomUUID()}`;
      await db.execute({
        sql: `INSERT INTO conversations (
                id, participant_one_id, participant_two_id, participant_one_name, participant_two_name,
                participant_one_avatar, participant_two_avatar, participant_one_role, participant_two_role,
                project_title, proposal_request_id, last_message, last_message_time, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          threadId,
          req.user!.id,
          architectId,
          req.user!.name,
          arch.name,
          req.user!.avatar || '',
          arch.avatar || '',
          req.user!.role,
          arch.role,
          projectTitle,
          reqId,
          summaryText.slice(0, 140),
          timeStr,
          now,
          now,
        ],
      });
    }

    await db.execute({
      sql: `INSERT INTO proposal_requests (
              id, client_id, client_name, architect_id, architect_name, thread_id,
              project_type, city, state, budget_range, timeline, current_stage, description, style_preferences,
              status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'enviada', ?, ?)`,
      args: [
        reqId,
        req.user!.id,
        req.user!.name,
        architectId,
        arch.name,
        threadId,
        projectType,
        city,
        state,
        budgetRange,
        timeline,
        currentStage,
        description,
        JSON.stringify(stylePreferences),
        now,
        now,
      ],
    });

    const msgId = `msg_${crypto.randomUUID()}`;
    await db.execute({
      sql: `INSERT INTO messages (id, thread_id, sender_id, sender_name, receiver_id, text, timestamp, read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      args: [msgId, threadId, req.user!.id, req.user!.name, architectId, summaryText, timeStr, now],
    });

    emitToUsers([req.user!.id, architectId], {
      type: 'NEW_MESSAGE',
      data: {
        id: msgId,
        threadId,
        senderId: req.user!.id,
        senderName: req.user!.name,
        receiverId: architectId,
        text: summaryText,
        timestamp: timeStr,
        read: false,
        createdAt: now,
      },
    });

    res.status(201).json({
      id: reqId,
      threadId,
      projectTitle,
      status: 'enviada',
      createdAt: now,
    });
  } catch (err) {
    console.error('[ProposalRequest] Erro:', err);
    res.status(500).json({ error: 'Erro ao enviar solicitação de proposta.' });
  }
});

app.patch('/api/proposal-requests/:id/status', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const id = req.params.id;
    const status = sanitizeString(req.body.status, 30);
    const architectResponse = sanitizeString(req.body.architectResponse, 1000) || null;
    if (!['em_analise', 'respondida', 'recusada', 'cancelada'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const existing = await db.execute({ sql: 'SELECT client_id, architect_id FROM proposal_requests WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Solicitação não encontrada.' });
    const row: any = existing.rows[0];
    const isClient = row.client_id === req.user!.id;
    const isArch = row.architect_id === req.user!.id;
    if (!isArch && !(isClient && status === 'cancelada') && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para alterar esta solicitação.' });
    }

    const now = new Date().toISOString();
    await db.execute({
      sql: 'UPDATE proposal_requests SET status = ?, architect_response = COALESCE(?, architect_response), updated_at = ? WHERE id = ?',
      args: [status, architectResponse, now, id],
    });
    res.json({ id, status, updatedAt: now });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar status da solicitação.' });
  }
});

/* ==========================================================================
   4. PROTECTED MATERIAL QUOTES (Strictly Authenticated & Owner/Supplier Scoped)
   ========================================================================== */
app.post('/api/quotes', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const requesterPhone = sanitizeString(req.body.requesterPhone, 30);
    const requesterWhatsapp = sanitizeString(req.body.requesterWhatsapp || requesterPhone, 30);
    const supplierId = sanitizeString(req.body.supplierId, 100) || null;
    const supplierName = sanitizeString(req.body.supplierName, 120) || 'Fornecedor';
    const deliveryAddress = sanitizeString(req.body.deliveryAddress, 240);
    const city = sanitizeString(req.body.city || req.user!.city, 80);
    const state = sanitizeString(req.body.state || req.user!.state, 2).toUpperCase();
    const notes = sanitizeString(req.body.notes, 1000);
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (!deliveryAddress || items.length === 0) {
      return res.status(400).json({ error: 'Endereço de entrega e ao menos um item são obrigatórios.' });
    }

    const quoteId = `quote_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO quote_requests (id, requester_id, requester_name, requester_phone, requester_whatsapp, supplier_id, supplier_name, delivery_address, city, state, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aberta', ?, ?)`,
      args: [
        quoteId,
        req.user!.id,
        req.user!.name,
        requesterPhone || null,
        requesterWhatsapp || null,
        supplierId,
        supplierName,
        deliveryAddress,
        city,
        state,
        notes,
        now,
      ],
    });

    for (const it of items.slice(0, 30)) {
      const prodName = sanitizeString(it.productName, 140);
      const qty = Number(it.quantity);
      if (!prodName || !Number.isFinite(qty) || qty <= 0) continue;
      await db.execute({
        sql: `INSERT INTO quote_request_items (id, quote_request_id, product_name, quantity, unit, notes)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [`item_${crypto.randomUUID()}`, quoteId, prodName, qty, sanitizeString(it.unit || 'un', 20), sanitizeString(it.notes, 200)],
      });
    }

    res.status(201).json({ id: quoteId, status: 'aberta', createdAt: now });
  } catch (err) {
    console.error('[Quotes] Erro ao criar cotação:', err);
    res.status(500).json({ error: 'Erro ao criar solicitação de cotação.' });
  }
});

app.get('/api/quotes', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, offset } = clampPagination(req, 20, 50);
    const uid = req.user!.id;
    const role = req.user!.role;

    let sql = 'SELECT * FROM quote_requests';
    const args: any[] = [];

    if (role === 'admin') {
      // Admin sees all paginated
    } else if (role === 'fornecedor') {
      sql += ' WHERE requester_id = ? OR supplier_id = ?';
      args.push(uid, uid);
    } else {
      sql += ' WHERE requester_id = ?';
      args.push(uid);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    args.push(limit, offset);

    const quotesResult = await db.execute({ sql, args });
    const quoteIds = quotesResult.rows.map((q: any) => String(q.id));

    let itemsRows: any[] = [];
    let responsesRows: any[] = [];
    if (quoteIds.length > 0) {
      const ph = quoteIds.map(() => '?').join(',');
      const [itRes, respRes] = await Promise.all([
        db.execute({ sql: `SELECT * FROM quote_request_items WHERE quote_request_id IN (${ph})`, args: quoteIds }),
        db.execute({ sql: `SELECT * FROM quote_responses WHERE quote_request_id IN (${ph})`, args: quoteIds }),
      ]);
      itemsRows = itRes.rows as any[];
      responsesRows = respRes.rows as any[];
    }

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
      items: itemsRows
        .filter((it) => it.quote_request_id === q.id)
        .map((it) => ({
          id: it.id,
          productName: it.product_name,
          quantity: Number(it.quantity),
          unit: it.unit,
          notes: it.notes,
        })),
      responses: responsesRows
        .filter((r) => r.quote_request_id === q.id)
        .map((r) => ({
          id: r.id,
          supplierId: r.supplier_id,
          supplierName: r.supplier_name,
          unitPrice: Number(r.unit_price),
          totalPrice: Number(r.total_price),
          shippingPrice: Number(r.shipping_price),
          totalSum: Number(r.total_sum),
          deliveryDays: Number(r.delivery_days),
          validityDays: Number(r.validity_days),
          notes: r.notes,
          createdAt: r.created_at,
        })),
    }));

    res.json({ items: quotes, page, limit });
  } catch (err) {
    console.error('[Quotes] Erro ao buscar cotações:', err);
    res.status(500).json({ error: 'Erro ao buscar cotações.' });
  }
});

app.post('/api/quotes/:id/respond', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const quoteId = req.params.id;
    const qRes = await db.execute({ sql: 'SELECT id, supplier_id FROM quote_requests WHERE id = ?', args: [quoteId] });
    if (qRes.rows.length === 0) return res.status(404).json({ error: 'Cotação não encontrada.' });
    const quote: any = qRes.rows[0];
    if (req.user!.role !== 'fornecedor' && req.user!.role !== 'admin' && quote.supplier_id !== req.user!.id) {
      return res.status(403).json({ error: 'Apenas o fornecedor autorizado pode responder a esta cotação.' });
    }

    const unitPrice = Number(req.body.unitPrice);
    const totalPrice = Number(req.body.totalPrice);
    const shippingPrice = Number(req.body.shippingPrice || 0);
    const totalSum = Number(req.body.totalSum);
    if (!Number.isFinite(totalSum) || totalSum < 0) {
      return res.status(400).json({ error: 'Valores da proposta inválidos.' });
    }

    const responseId = `resp_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO quote_responses (id, quote_request_id, supplier_id, supplier_name, unit_price, total_price, shipping_price, total_sum, delivery_days, validity_days, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        responseId,
        quoteId,
        req.user!.id,
        req.user!.name,
        Number.isFinite(unitPrice) ? unitPrice : 0,
        Number.isFinite(totalPrice) ? totalPrice : totalSum,
        Number.isFinite(shippingPrice) ? shippingPrice : 0,
        totalSum,
        Math.max(1, parseInt(String(req.body.deliveryDays || '3'), 10) || 3),
        Math.max(1, parseInt(String(req.body.validityDays || '7'), 10) || 7),
        sanitizeString(req.body.notes, 500),
        now,
      ],
    });

    await db.execute({
      sql: "UPDATE quote_requests SET status = 'respondida', total_quoted = ? WHERE id = ?",
      args: [totalSum, quoteId],
    });

    res.status(201).json({ id: responseId, quoteId, status: 'respondida', totalSum });
  } catch {
    res.status(500).json({ error: 'Erro ao responder cotação.' });
  }
});

/* ==========================================================================
   5. OPPORTUNITIES & PROPOSALS (Proposals restricted to owner/proposer/admin)
   ========================================================================== */
app.get('/api/opportunities', optionalToken, async (req: AuthedRequest, res) => {
  try {
    const { q, category, city, status } = req.query;
    const { page, limit, offset } = clampPagination(req, 20, 50);

    let sql = `SELECT * FROM opportunities WHERE id NOT IN ('opp_1', 'opp_2')`;
    const args: any[] = [];
    if (q) {
      const term = `%${String(q).trim()}%`;
      sql += ` AND (title LIKE ? OR description LIKE ? OR specialty LIKE ?)`;
      args.push(term, term, term);
    }
    if (city) {
      sql += ` AND city LIKE ?`;
      args.push(`%${String(city).trim()}%`);
    }
    if (category) {
      sql += ` AND category LIKE ?`;
      args.push(`%${String(category).trim()}%`);
    }
    if (status) {
      sql += ` AND status = ?`;
      args.push(String(status).trim());
    }
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const oppsResult = await db.execute({ sql, args });
    const oppIds = oppsResult.rows.map((r: any) => String(r.id));

    let propsRows: any[] = [];
    if (oppIds.length > 0 && req.user) {
      const ph = oppIds.map(() => '?').join(',');
      const pRes = await db.execute({
        sql: `SELECT * FROM proposals WHERE opportunity_id IN (${ph}) ORDER BY created_at DESC`,
        args: oppIds,
      });
      propsRows = pRes.rows as any[];
    }

    const opportunities = oppsResult.rows.map((row: any) => {
      const isOwnerOrAdmin = req.user && (req.user.id === row.owner_id || req.user.role === 'admin');
      const visibleProposals = propsRows
        .filter((p) => p.opportunity_id === row.id && (isOwnerOrAdmin || (req.user && p.proposer_id === req.user.id)))
        .map((p) => ({
          id: p.id,
          opportunityId: p.opportunity_id,
          proposerId: p.proposer_id,
          proposerName: p.proposer_name,
          proposerRole: p.proposer_role,
          proposerAvatar: p.proposer_avatar,
          creaCau: p.crea_cau || undefined,
          value: Number(p.value),
          deadlineDays: Number(p.deadline_days),
          scopeDescription: p.scope_description,
          attachmentUrl: p.attachment_url || undefined,
          status: p.status,
          createdAt: p.created_at,
        }));

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        specialty: row.specialty,
        location: { city: row.city, state: row.state },
        budgetRange: { min: Number(row.budget_min), max: Number(row.budget_max) },
        ownerId: row.owner_id,
        ownerName: row.owner_name,
        ownerAvatar: row.owner_avatar || '',
        status: row.status,
        deadlineDays: Number(row.deadline_days || 30),
        currentStage: row.current_stage || undefined,
        stylePreferences: safeJsonParse<string[]>(row.style_preferences, []),
        proposalsCount: Number(row.proposals_count || 0),
        proposals: visibleProposals,
        createdAt: row.created_at,
      };
    });

    res.json({ items: opportunities, page, limit });
  } catch {
    res.status(500).json({ error: 'Erro ao carregar oportunidades.' });
  }
});

app.post('/api/opportunities', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const title = sanitizeString(req.body.title, 160);
    const description = sanitizeString(req.body.description, 2500);
    const category = sanitizeString(req.body.category || 'Arquitetura Residencial', 80);
    const specialty = sanitizeString(req.body.specialty || 'Projeto Arquitetônico', 80);
    const city = sanitizeString(req.body.city || req.user!.city, 80);
    const state = sanitizeString(req.body.state || req.user!.state, 2).toUpperCase();
    const budgetMin = Math.max(0, Number(req.body.budgetMin || 0));
    const budgetMax = Math.max(budgetMin, Number(req.body.budgetMax || budgetMin));
    const deadlineDays = Math.max(1, parseInt(String(req.body.deadlineDays || '30'), 10) || 30);
    const currentStage = sanitizeString(req.body.currentStage, 80) || null;
    const stylePreferences = Array.isArray(req.body.stylePreferences)
      ? JSON.stringify(req.body.stylePreferences.map((s: any) => sanitizeString(s, 60)).filter(Boolean).slice(0, 8))
      : '[]';

    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição do briefing são obrigatórios.' });
    }

    const oppId = `opp_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO opportunities (id, title, description, category, specialty, city, state, budget_min, budget_max, deadline_days, current_stage, style_preferences, owner_id, owner_name, owner_avatar, status, proposals_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aberta', 0, ?)`,
      args: [
        oppId,
        title,
        description,
        category,
        specialty,
        city,
        state,
        budgetMin,
        budgetMax,
        deadlineDays,
        currentStage,
        stylePreferences,
        req.user!.id,
        req.user!.name,
        req.user!.avatar || '',
        now,
      ],
    });

    res.status(201).json({ id: oppId, title, status: 'aberta', createdAt: now });
  } catch {
    res.status(500).json({ error: 'Erro ao publicar oportunidade.' });
  }
});

app.post('/api/opportunities/:id/proposals', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const oppId = req.params.id;
    const oppRes = await db.execute({ sql: 'SELECT id, owner_id FROM opportunities WHERE id = ?', args: [oppId] });
    if (oppRes.rows.length === 0) return res.status(404).json({ error: 'Demanda não encontrada.' });
    if (String((oppRes.rows[0] as any).owner_id) === req.user!.id) {
      return res.status(400).json({ error: 'Você não pode enviar proposta para sua própria demanda.' });
    }

    const value = Number(req.body.value);
    const deadlineDays = Math.max(1, parseInt(String(req.body.deadlineDays || '30'), 10) || 30);
    const scopeDescription = sanitizeString(req.body.scopeDescription, 2000);
    const attachmentUrl = req.body.attachmentUrl && isSafeAttachmentUrl(req.body.attachmentUrl) ? String(req.body.attachmentUrl).trim() : null;

    if (!Number.isFinite(value) || value <= 0 || !scopeDescription) {
      return res.status(400).json({ error: 'Valor e descrição do escopo são obrigatórios.' });
    }

    const propId = `prop_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO proposals (id, opportunity_id, proposer_id, proposer_name, proposer_role, proposer_avatar, crea_cau, value, deadline_days, scope_description, attachment_url, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'em_negociacao', ?)`,
      args: [
        propId,
        oppId,
        req.user!.id,
        req.user!.name,
        req.user!.role,
        req.user!.avatar || '',
        req.user!.crea_cau_number || null,
        value,
        deadlineDays,
        scopeDescription,
        attachmentUrl,
        now,
      ],
    });

    await db.execute({
      sql: 'UPDATE opportunities SET proposals_count = proposals_count + 1 WHERE id = ?',
      args: [oppId],
    });

    res.status(201).json({ id: propId, opportunityId: oppId, status: 'em_negociacao', createdAt: now });
  } catch {
    res.status(500).json({ error: 'Erro ao enviar proposta.' });
  }
});

/* ==========================================================================
   6. FEED & PROJECTS
   ========================================================================== */
app.get('/api/feed/posts', optionalToken, async (req: AuthedRequest, res) => {
  try {
    const { page, limit, offset } = clampPagination(req, 20, 50);
    const result = await db.execute({
      sql: `SELECT p.*, u.is_verified as author_verified, u.verification_status as author_ver_status
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.id NOT IN ('post_1', 'post_2', 'post_3')
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?`,
      args: [limit, offset],
    });

    let likedSet = new Set<string>();
    if (req.user && result.rows.length > 0) {
      const ids = result.rows.map((r: any) => String(r.id));
      const ph = ids.map(() => '?').join(',');
      const likesRes = await db.execute({
        sql: `SELECT post_id FROM post_likes WHERE user_id = ? AND post_id IN (${ph})`,
        args: [req.user.id, ...ids],
      });
      likedSet = new Set(likesRes.rows.map((r: any) => String(r.post_id)));
    }

    const posts = result.rows.map((row: any) => ({
      id: row.id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorAvatar: row.author_avatar || '',
      authorRole: row.author_role,
      authorBadge: row.author_badge,
      authorVerified: Boolean(row.author_verified),
      category: row.category,
      title: row.title,
      content: row.content,
      mediaUrls: row.media_urls ? (row.media_urls.startsWith('[') ? safeJsonParse<string[]>(row.media_urls, []) : [row.media_urls]) : [],
      technicalStamp: row.registration_number
        ? {
            stampId: row.stamp_id || undefined,
            registrationNumber: row.registration_number,
            hashVerification: row.hash_verification || undefined,
            artRrtCode: row.art_rrt_code || undefined,
            status: row.author_verified ? 'valid' : 'pending',
          }
        : undefined,
      location: { city: row.city, state: row.state },
      budgetEstimated: row.budget_estimated ? Number(row.budget_estimated) : undefined,
      deadlineDays: row.deadline_days ? Number(row.deadline_days) : undefined,
      likesCount: Number(row.likes_count || 0),
      commentsCount: Number(row.comments_count || 0),
      proposalsCount: Number(row.proposals_count || 0),
      isLiked: likedSet.has(String(row.id)),
      isSponsored: Boolean(row.is_sponsored),
      createdAt: row.created_at,
    }));

    res.json({ items: posts, page, limit });
  } catch (err) {
    console.error('[Feed] Erro ao buscar publicações:', err);
    res.status(500).json({ error: 'Erro ao carregar projetos e publicações.' });
  }
});

app.get('/api/feed/posts/:id', optionalToken, async (req: AuthedRequest, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT p.*, u.is_verified as author_verified
            FROM posts p LEFT JOIN users u ON p.author_id = u.id
            WHERE p.id = ?`,
      args: [req.params.id],
    });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Projeto não encontrado.' });
    const row: any = result.rows[0];
    res.json({
      id: row.id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorAvatar: row.author_avatar || '',
      authorRole: row.author_role,
      authorBadge: row.author_badge,
      authorVerified: Boolean(row.author_verified),
      category: row.category,
      title: row.title,
      content: row.content,
      mediaUrls: row.media_urls ? (row.media_urls.startsWith('[') ? safeJsonParse<string[]>(row.media_urls, []) : [row.media_urls]) : [],
      technicalStamp: row.registration_number
        ? {
            stampId: row.stamp_id || undefined,
            registrationNumber: row.registration_number,
            hashVerification: row.hash_verification || undefined,
            artRrtCode: row.art_rrt_code || undefined,
            status: row.author_verified ? 'valid' : 'pending',
          }
        : undefined,
      location: { city: row.city, state: row.state },
      budgetEstimated: row.budget_estimated ? Number(row.budget_estimated) : undefined,
      deadlineDays: row.deadline_days ? Number(row.deadline_days) : undefined,
      likesCount: Number(row.likes_count || 0),
      commentsCount: Number(row.comments_count || 0),
      proposalsCount: Number(row.proposals_count || 0),
      isSponsored: Boolean(row.is_sponsored),
      createdAt: row.created_at,
    });
  } catch {
    res.status(500).json({ error: 'Erro ao carregar projeto.' });
  }
});

app.post('/api/feed/posts', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const title = sanitizeString(req.body.title, 160);
    const content = sanitizeString(req.body.content, 3000);
    const category = sanitizeString(req.body.category || 'portfolio', 40);
    const rawMedia = Array.isArray(req.body.mediaUrls) ? req.body.mediaUrls : [];
    const safeMedia = rawMedia.filter((u: any) => isSafeHttpUrl(u)).slice(0, 6);
    const city = sanitizeString(req.body.location?.city || req.user!.city, 80);
    const state = sanitizeString(req.body.location?.state || req.user!.state, 2).toUpperCase();
    const budgetEstimated = req.body.budgetEstimated ? Number(req.body.budgetEstimated) : null;
    const deadlineDays = req.body.deadlineDays ? parseInt(String(req.body.deadlineDays), 10) : null;
    const artRrtCode = sanitizeString(req.body.artRrtCode, 60) || null;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título e descrição do projeto são obrigatórios.' });
    }

    const postId = `post_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const registrationNumber = req.user!.crea_cau_number || req.user!.cnpj_number || null;
    const stampId = registrationNumber ? `BLS-${new Date().getFullYear()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}` : null;
    const hash = registrationNumber
      ? crypto.createHash('sha256').update(`${postId}:${req.user!.id}:${registrationNumber}:${now}`).digest('hex')
      : null;

    const badge =
      req.user!.role === 'profissional_cau'
        ? req.user!.is_verified
          ? `Arquiteto · ${req.user!.crea_cau_number || 'CAU Verificado'}`
          : 'Arquiteto · Registro declarado'
        : req.user!.role === 'profissional_crea'
        ? req.user!.is_verified
          ? `Engenheiro · ${req.user!.crea_cau_number || 'CREA Verificado'}`
          : 'Engenheiro · Registro declarado'
        : 'Membro Ballast';

    await db.execute({
      sql: `INSERT INTO posts (id, author_id, author_name, author_avatar, author_role, author_badge, category, title, content, media_urls, stamp_id, registration_number, hash_verification, art_rrt_code, city, state, budget_estimated, deadline_days, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        postId,
        req.user!.id,
        req.user!.name,
        req.user!.avatar || '',
        req.user!.role,
        badge,
        category,
        title,
        content,
        safeMedia.length ? JSON.stringify(safeMedia) : null,
        stampId,
        registrationNumber,
        hash,
        artRrtCode,
        city,
        state,
        budgetEstimated,
        deadlineDays,
        now,
      ],
    });

    res.status(201).json({
      id: postId,
      authorId: req.user!.id,
      authorName: req.user!.name,
      authorAvatar: req.user!.avatar || '',
      authorRole: req.user!.role,
      authorBadge: badge,
      authorVerified: Boolean(req.user!.is_verified),
      category,
      title,
      content,
      mediaUrls: safeMedia,
      location: { city, state },
      budgetEstimated: budgetEstimated || undefined,
      deadlineDays: deadlineDays || undefined,
      likesCount: 0,
      commentsCount: 0,
      proposalsCount: 0,
      createdAt: now,
    });
  } catch (err) {
    console.error('[Feed] Erro ao criar post:', err);
    res.status(500).json({ error: 'Erro ao publicar projeto.' });
  }
});

app.post('/api/feed/posts/:id/like', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const postId = req.params.id;
    const uid = req.user!.id;
    const existing = await db.execute({
      sql: 'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      args: [postId, uid],
    });

    let liked = false;
    if (existing.rows.length > 0) {
      await db.execute({ sql: 'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', args: [postId, uid] });
      await db.execute({ sql: 'UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?', args: [postId] });
      liked = false;
    } else {
      await db.execute({
        sql: 'INSERT INTO post_likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        args: [`like_${crypto.randomUUID()}`, postId, uid, new Date().toISOString()],
      });
      await db.execute({ sql: 'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', args: [postId] });
      liked = true;
    }

    const cntRes = await db.execute({ sql: 'SELECT likes_count FROM posts WHERE id = ?', args: [postId] });
    res.json({ success: true, postId, liked, likesCount: Number((cntRes.rows[0] as any)?.likes_count || 0) });
  } catch {
    res.status(500).json({ error: 'Erro ao curtir publicação.' });
  }
});

/* ==========================================================================
   7. FAVORITES, REVIEWS, CATEGORIES, REPORTS & TELEMETRY
   ========================================================================== */
app.get('/api/favorites', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      args: [req.user!.id],
    });
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao carregar salvos.' });
  }
});

app.post('/api/favorites', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const targetId = sanitizeString(req.body.targetId, 100);
    const targetType = sanitizeString(req.body.targetType || 'professional', 30);
    const targetTitle = sanitizeString(req.body.targetTitle, 140);
    const targetSubtitle = sanitizeString(req.body.targetSubtitle, 140);
    const targetAvatar = isSafeHttpUrl(req.body.targetAvatar) ? String(req.body.targetAvatar).trim() : '';

    if (!targetId || !targetTitle) {
      return res.status(400).json({ error: 'Dados do item a favoritar são obrigatórios.' });
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM favorites WHERE user_id = ? AND target_id = ?',
      args: [req.user!.id, targetId],
    });

    if (existing.rows.length > 0) {
      await db.execute({ sql: 'DELETE FROM favorites WHERE id = ?', args: [existing.rows[0].id] });
      return res.json({ favorited: false, id: targetId });
    }

    const favId = `fav_${crypto.randomUUID()}`;
    await db.execute({
      sql: `INSERT INTO favorites (id, user_id, target_type, target_id, target_title, target_subtitle, target_avatar, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [favId, req.user!.id, targetType, targetId, targetTitle, targetSubtitle, targetAvatar, new Date().toISOString()],
    });

    res.status(201).json({ favorited: true, id: targetId, favoriteId: favId });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar favoritos.' });
  }
});

app.get('/api/reviews/:userId', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT id, reviewer_id, reviewer_name, reviewer_avatar, target_user_id, rating, comment, contract_type, created_at FROM reviews WHERE target_user_id = ? ORDER BY created_at DESC LIMIT 50',
      args: [req.params.userId],
    });
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar avaliações.' });
  }
});

app.post('/api/reviews', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const targetUserId = sanitizeString(req.body.targetUserId, 100);
    const rating = Math.min(5, Math.max(1, parseInt(String(req.body.rating || '5'), 10) || 5));
    const comment = sanitizeString(req.body.comment, 1000);
    const contractType = sanitizeString(req.body.contractType || 'Projeto Arquitetônico', 80);

    if (!targetUserId || !comment) {
      return res.status(400).json({ error: 'Comentário e profissional avaliado são obrigatórios.' });
    }
    if (targetUserId === req.user!.id) {
      return res.status(400).json({ error: 'Não é permitido avaliar o próprio perfil.' });
    }

    const reviewId = `rev_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO reviews (id, reviewer_id, reviewer_name, reviewer_avatar, target_user_id, rating, comment, contract_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [reviewId, req.user!.id, req.user!.name, req.user!.avatar || '', targetUserId, rating, comment, contractType, now],
    });

    const avgResult = await db.execute({
      sql: 'SELECT AVG(rating) as avg_rate, COUNT(*) as cnt FROM reviews WHERE target_user_id = ?',
      args: [targetUserId],
    });
    const avgRate = Number(Number(avgResult.rows[0].avg_rate || rating).toFixed(1));
    const revCount = Number(avgResult.rows[0].cnt || 1);

    await db.execute({
      sql: 'UPDATE professional_profiles SET rating = ?, reviews_count = ? WHERE user_id = ?',
      args: [avgRate, revCount, targetUserId],
    });

    res.status(201).json({ id: reviewId, rating: avgRate, reviewsCount: revCount });
  } catch {
    res.status(500).json({ error: 'Erro ao enviar avaliação.' });
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const result = await db.execute('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao carregar categorias.' });
  }
});

// Abuse / Spam Reporting (Chat, Profile, Post)
app.post('/api/reports', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const targetType = sanitizeString(req.body.targetType, 30);
    const targetId = sanitizeString(req.body.targetId, 100);
    const reason = sanitizeString(req.body.reason, 120);
    const details = sanitizeString(req.body.details, 1000);

    if (!['chat', 'profile', 'post', 'proposal'].includes(targetType) || !targetId || !reason) {
      return res.status(400).json({ error: 'Informe o motivo e o alvo da denúncia.' });
    }

    const id = `rep_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO reports (id, reporter_id, reporter_name, target_type, target_id, reason, details, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente', ?)`,
      args: [id, req.user!.id, req.user!.name, targetType, targetId, reason, details, now],
    });

    res.status(201).json({ id, status: 'pendente', message: 'Denúncia registrada para análise da equipe Ballast.' });
  } catch {
    res.status(500).json({ error: 'Erro ao registrar denúncia.' });
  }
});

// Conversion, Web Vitals & Error Telemetry
app.post('/api/telemetry/events', optionalToken, async (req: AuthedRequest, res) => {
  try {
    const eventName = sanitizeString(req.body.eventName, 60);
    const eventPath = sanitizeString(req.body.path, 200);
    const metadata = req.body.metadata ? JSON.stringify(req.body.metadata).slice(0, 1000) : null;
    if (!eventName) return res.status(400).json({ error: 'eventName obrigatório.' });

    await db.execute({
      sql: 'INSERT INTO telemetry_events (id, event_name, user_id, path, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [`evt_${crypto.randomUUID()}`, eventName, req.user?.id || null, eventPath, metadata, new Date().toISOString()],
    });
    res.status(202).json({ recorded: true });
  } catch {
    res.status(202).json({ recorded: false });
  }
});

/* ==========================================================================
   8. ADMIN DASHBOARD & VERIFICATION (Strictly RBAC Protected)
   ========================================================================== */
app.get('/api/admin/metrics', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const [usersCnt, profCnt, compCnt, suppCnt, oppsCnt, propsCnt, revsCnt, repsCnt] = await Promise.all([
      db.execute('SELECT COUNT(*) as c FROM users'),
      db.execute('SELECT COUNT(*) as c FROM professional_profiles'),
      db.execute('SELECT COUNT(*) as c FROM company_profiles'),
      db.execute('SELECT COUNT(*) as c FROM supplier_profiles'),
      db.execute('SELECT COUNT(*) as c FROM opportunities'),
      db.execute('SELECT COUNT(*) as c FROM proposals'),
      db.execute('SELECT COUNT(*) as c FROM reviews'),
      db.execute("SELECT COUNT(*) as c FROM reports WHERE status = 'pendente'"),
    ]);

    res.json({
      totalUsers: Number(usersCnt.rows[0].c),
      totalProfessionals: Number(profCnt.rows[0].c),
      totalCompanies: Number(compCnt.rows[0].c),
      totalSuppliers: Number(suppCnt.rows[0].c),
      totalOpportunities: Number(oppsCnt.rows[0].c),
      totalProposals: Number(propsCnt.rows[0].c),
      totalReviews: Number(revsCnt.rows[0].c),
      pendingReports: Number(repsCnt.rows[0].c),
      platformHealth: 'Operacional',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ error: 'Erro ao gerar métricas administrativas.' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = clampPagination(req, 50, 100);
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, crea_cau_number, city, state, is_verified, verification_status, plan, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      args: [limit, offset],
    });
    res.json({ items: result.rows, page, limit });
  } catch {
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

app.patch('/api/admin/users/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const approve = req.body?.verified !== false;
    await db.execute({
      sql: 'UPDATE users SET is_verified = ?, verification_status = ?, updated_at = ? WHERE id = ?',
      args: [approve ? 1 : 0, approve ? 'verified' : 'unverified', new Date().toISOString(), userId],
    });
    res.json({ success: true, userId, status: approve ? 'verified' : 'unverified' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar verificação do usuário.' });
  }
});

app.get('/api/admin/reports', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const result = await db.execute('SELECT * FROM reports ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao carregar denúncias.' });
  }
});

app.patch('/api/admin/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = sanitizeString(req.body.status, 30);
    if (!['aprovado', 'removido', 'resolvido'].includes(status)) {
      return res.status(400).json({ error: 'Status de moderação inválido.' });
    }
    await db.execute({ sql: 'UPDATE reports SET status = ? WHERE id = ?', args: [status, req.params.id] });
    res.json({ success: true, id: req.params.id, status });
  } catch {
    res.status(500).json({ error: 'Erro ao resolver denúncia.' });
  }
});

/* ==========================================================================
   9. ADS CAMPAIGNS (No Simulated Browser Payment, No Fake NFS-e)
   ========================================================================== */
app.get('/api/ads/campaigns', optionalToken, async (req: AuthedRequest, res) => {
  try {
    let sql = 'SELECT * FROM ad_campaigns';
    const args: any[] = [];
    if (!req.user) {
      sql += " WHERE status = 'ativa'";
    } else if (req.user.role !== 'admin') {
      sql += " WHERE user_id = ? OR status = 'ativa'";
      args.push(req.user.id);
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';
    const result = await db.execute({ sql, args });

    res.json(
      result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        objective: row.objective,
        targetRegion: row.target_region,
        dailyBudget: Number(row.daily_budget),
        totalBudget: Number(row.total_budget),
        durationDays: Number(row.duration_days),
        impressionsCount: Number(row.impressions_count || 0),
        clicksCount: Number(row.clicks_count || 0),
        status: row.status,
        paymentMethod: row.payment_method,
        pixQrCode: row.pix_qr_code || undefined,
        pixCopiaCola: row.pix_copia_cola || undefined,
        invoiceNfseUrl: isSafeHttpUrl(row.invoice_nfse_url) ? row.invoice_nfse_url : undefined,
        createdAt: row.created_at,
      }))
    );
  } catch {
    res.status(500).json({ error: 'Erro ao buscar campanhas.' });
  }
});

app.post('/api/ads/campaigns', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const title = sanitizeString(req.body.title, 160);
    const objective = sanitizeString(req.body.objective || 'Destaque de Perfil', 80);
    const targetRegion = sanitizeString(req.body.targetRegion || `${req.user!.city}, ${req.user!.state}`, 120);
    const dailyBudget = Math.max(10, Number(req.body.dailyBudget || 50));
    const durationDays = Math.max(1, Math.min(90, parseInt(String(req.body.durationDays || '14'), 10) || 14));
    const totalBudget = Number((dailyBudget * durationDays).toFixed(2));

    if (!title) return res.status(400).json({ error: 'Informe o título da campanha.' });

    const campId = `camp_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // Always starts as aguardando_pagamento — never active without verified payment webhook
    await db.execute({
      sql: `INSERT INTO ad_campaigns (id, user_id, title, objective, target_region, daily_budget, total_budget, duration_days, impressions_count, clicks_count, status, payment_method, pix_qr_code, pix_copia_cola, invoice_nfse_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'aguardando_pagamento', 'pix', NULL, NULL, NULL, ?)`,
      args: [campId, req.user!.id, title, objective, targetRegion, dailyBudget, totalBudget, durationDays, now],
    });

    res.status(201).json({
      id: campId,
      userId: req.user!.id,
      title,
      objective,
      targetRegion,
      dailyBudget,
      totalBudget,
      durationDays,
      impressionsCount: 0,
      clicksCount: 0,
      status: 'aguardando_pagamento',
      paymentMethod: 'pix',
      createdAt: now,
    });
  } catch {
    res.status(500).json({ error: 'Erro ao criar campanha.' });
  }
});

// Simulated client-side payment explicitly disabled
app.post('/api/ads/campaigns/:id/pay', authenticateToken, (_req, res) => {
  res.status(501).json({
    error:
      'Confirmação manual de pagamento pelo navegador está desativada por segurança. A ativação ocorre exclusivamente após confirmação autenticada do provedor de pagamentos Pix.',
  });
});

// Authenticated Server-to-Server Pix Payment Webhook (only active when PIX_WEBHOOK_SECRET is configured)
app.post('/api/webhooks/pix', async (req, res) => {
  const secret = process.env.PIX_WEBHOOK_SECRET;
  if (!secret || secret.length < 16) {
    return res.status(503).json({ error: 'Integração de webhook Pix não configurada no servidor.' });
  }
  const provided = String(req.headers['x-webhook-secret'] || '');
  const expectedBuf = Buffer.from(secret);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    return res.status(401).json({ error: 'Assinatura do webhook inválida.' });
  }
  const { campaignId, status, invoiceUrl } = req.body || {};
  if (!campaignId || status !== 'paid') {
    return res.status(400).json({ error: 'Payload de pagamento inválido.' });
  }
  const safeInvoice = isSafeHttpUrl(invoiceUrl) ? String(invoiceUrl).trim() : null;
  await db.execute({
    sql: "UPDATE ad_campaigns SET status = 'ativa', invoice_nfse_url = COALESCE(?, invoice_nfse_url) WHERE id = ?",
    args: [safeInvoice, String(campaignId)],
  });
  res.json({ received: true, campaignId });
});

app.post('/api/ads/campaigns/:id/toggle', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const campId = req.params.id;
    const nextStatus = sanitizeString(req.body.status, 30);
    if (!['ativa', 'pausada'].includes(nextStatus)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const existing = await db.execute({ sql: 'SELECT user_id, status FROM ad_campaigns WHERE id = ?', args: [campId] });
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Campanha não encontrada.' });
    const row: any = existing.rows[0];
    if (row.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para alterar esta campanha.' });
    }
    if (row.status === 'aguardando_pagamento' && nextStatus === 'ativa') {
      return res.status(402).json({ error: 'Esta campanha aguarda confirmação de pagamento para ser ativada.' });
    }

    await db.execute({ sql: 'UPDATE ad_campaigns SET status = ? WHERE id = ?', args: [nextStatus, campId] });
    res.json({ success: true, id: campId, status: nextStatus });
  } catch {
    res.status(500).json({ error: 'Erro ao alterar status da campanha.' });
  }
});

app.post('/api/ads/track/impression', async (req, res) => {
  try {
    const campaignId = sanitizeString(req.body?.campaignId, 100);
    if (campaignId) {
      await db.execute({
        sql: "UPDATE ad_campaigns SET impressions_count = impressions_count + 1 WHERE id = ? AND status = 'ativa'",
        args: [campaignId],
      });
    }
    res.json({ tracked: true });
  } catch {
    res.json({ tracked: false });
  }
});

app.post('/api/ads/track/click', async (req, res) => {
  try {
    const campaignId = sanitizeString(req.body?.campaignId, 100);
    if (campaignId) {
      await db.execute({
        sql: "UPDATE ad_campaigns SET clicks_count = clicks_count + 1 WHERE id = ? AND status = 'ativa'",
        args: [campaignId],
      });
    }
    res.json({ tracked: true });
  } catch {
    res.json({ tracked: false });
  }
});

/* ==========================================================================
   10. PROTECTED REALTIME CHAT & CONVERSATIONS API (Participant-Isolated)
   ========================================================================== */
async function getAuthorizedConversation(threadId: string, userId: string): Promise<any | null> {
  const res = await db.execute({
    sql: 'SELECT * FROM conversations WHERE id = ? AND (participant_one_id = ? OR participant_two_id = ?)',
    args: [threadId, userId, userId],
  });
  return res.rows.length > 0 ? res.rows[0] : null;
}

app.get('/api/chat/threads', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const result = await db.execute({
      sql: `SELECT c.*,
                   (SELECT COUNT(*) FROM messages m WHERE m.thread_id = c.id AND m.receiver_id = ? AND m.read = 0) as unread_count,
                   u1.is_verified as p1_verified,
                   u2.is_verified as p2_verified
            FROM conversations c
            LEFT JOIN users u1 ON c.participant_one_id = u1.id
            LEFT JOIN users u2 ON c.participant_two_id = u2.id
            WHERE c.participant_one_id = ? OR c.participant_two_id = ?
            ORDER BY c.updated_at DESC
            LIMIT 50`,
      args: [userId, userId, userId],
    });

    const threads = result.rows.map((r: any) => {
      const isOne = r.participant_one_id === userId;
      return {
        id: r.id,
        participantId: isOne ? r.participant_two_id : r.participant_one_id,
        participantName: isOne ? r.participant_two_name : r.participant_one_name,
        participantAvatar: (isOne ? r.participant_two_avatar : r.participant_one_avatar) || '',
        participantRole: (isOne ? r.participant_two_role : r.participant_one_role) || 'Membro',
        participantVerified: Boolean(isOne ? r.p2_verified : r.p1_verified),
        projectTitle: r.project_title || undefined,
        opportunityId: r.opportunity_id || undefined,
        proposalRequestId: r.proposal_request_id || undefined,
        lastMessage: r.last_message || '',
        lastMessageTime: r.last_message_time || '',
        unreadCount: Number(r.unread_count || 0),
        updatedAt: r.updated_at,
      };
    });

    res.json(threads);
  } catch (err) {
    console.error('[Chat API] Erro ao listar conversas:', err);
    res.status(500).json({ error: 'Erro ao carregar conversas.' });
  }
});

app.post('/api/chat/threads', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const currentUser = req.user!;
    const participantId = sanitizeString(req.body.participantId, 100);
    const projectTitle = sanitizeString(req.body.projectTitle, 140) || null;
    const opportunityId = sanitizeString(req.body.opportunityId, 100) || null;

    if (!participantId) {
      return res.status(400).json({ error: 'ID do destinatário é obrigatório.' });
    }
    if (participantId === currentUser.id) {
      return res.status(400).json({ error: 'Não é possível iniciar uma conversa consigo mesmo.' });
    }

    // Verify target participant exists
    const targetRes = await db.execute({
      sql: 'SELECT id, name, avatar, role, is_verified FROM users WHERE id = ?',
      args: [participantId],
    });
    if (targetRes.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário destinatário não encontrado.' });
    }
    const target: any = targetRes.rows[0];

    const existing = await db.execute({
      sql: `SELECT * FROM conversations
            WHERE (participant_one_id = ? AND participant_two_id = ?)
               OR (participant_one_id = ? AND participant_two_id = ?)`,
      args: [currentUser.id, participantId, participantId, currentUser.id],
    });

    if (existing.rows.length > 0) {
      const r: any = existing.rows[0];
      if (projectTitle && !r.project_title) {
        await db.execute({
          sql: 'UPDATE conversations SET project_title = ?, opportunity_id = COALESCE(?, opportunity_id) WHERE id = ?',
          args: [projectTitle, opportunityId, r.id],
        });
      }
      const isOne = r.participant_one_id === currentUser.id;
      const unreadRes = await db.execute({
        sql: 'SELECT COUNT(*) as c FROM messages WHERE thread_id = ? AND receiver_id = ? AND read = 0',
        args: [r.id, currentUser.id],
      });
      return res.json({
        id: r.id,
        participantId: isOne ? r.participant_two_id : r.participant_one_id,
        participantName: isOne ? r.participant_two_name : r.participant_one_name,
        participantAvatar: (isOne ? r.participant_two_avatar : r.participant_one_avatar) || target.avatar || '',
        participantRole: (isOne ? r.participant_two_role : r.participant_one_role) || target.role,
        participantVerified: Boolean(target.is_verified),
        projectTitle: r.project_title || projectTitle || undefined,
        opportunityId: r.opportunity_id || opportunityId || undefined,
        proposalRequestId: r.proposal_request_id || undefined,
        lastMessage: r.last_message || '',
        lastMessageTime: r.last_message_time || '',
        unreadCount: Number(unreadRes.rows[0].c || 0),
      });
    }

    const threadId = `thread_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO conversations (
              id, participant_one_id, participant_two_id, participant_one_name, participant_two_name,
              participant_one_avatar, participant_two_avatar, participant_one_role, participant_two_role,
              project_title, opportunity_id, last_message, last_message_time, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, ?)`,
      args: [
        threadId,
        currentUser.id,
        target.id,
        currentUser.name,
        target.name,
        currentUser.avatar || '',
        target.avatar || '',
        currentUser.role,
        target.role,
        projectTitle,
        opportunityId,
        now,
        now,
      ],
    });

    res.status(201).json({
      id: threadId,
      participantId: target.id,
      participantName: target.name,
      participantAvatar: target.avatar || '',
      participantRole: target.role,
      participantVerified: Boolean(target.is_verified),
      projectTitle: projectTitle || undefined,
      opportunityId: opportunityId || undefined,
      lastMessage: '',
      lastMessageTime: '',
      unreadCount: 0,
    });
  } catch (err) {
    console.error('[Chat API] Erro ao criar conversa:', err);
    res.status(500).json({ error: 'Erro ao iniciar conversa.' });
  }
});

// Paginated messages strictly for authorized conversation participants
app.get('/api/chat/messages/:threadId', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const { threadId } = req.params;
    const conv = await getAuthorizedConversation(threadId, req.user!.id);
    if (!conv) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar esta conversa.' });
    }

    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '30'), 10) || 30));
    const before = sanitizeString(req.query.before, 60);

    let sql = 'SELECT * FROM messages WHERE thread_id = ?';
    const args: any[] = [threadId];
    if (before) {
      sql += ' AND created_at < ?';
      args.push(before);
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    args.push(limit + 1);

    const result = await db.execute({ sql, args });
    const hasMore = result.rows.length > limit;
    const sliced = hasMore ? result.rows.slice(0, limit) : result.rows;
    // Reverse back to chronological ascending order
    const ordered = sliced.reverse().map((r: any) => ({
      id: r.id,
      threadId: r.thread_id,
      clientMessageId: r.client_message_id || undefined,
      senderId: r.sender_id,
      senderName: r.sender_name,
      receiverId: r.receiver_id,
      text: r.text,
      attachmentUrl: r.attachment_url || undefined,
      timestamp: r.timestamp,
      read: Boolean(r.read),
      status: r.read ? 'read' : 'sent',
      createdAt: r.created_at,
    }));

    res.json({ messages: ordered, hasMore });
  } catch (err) {
    console.error('[Chat API] Erro ao buscar mensagens:', err);
    res.status(500).json({ error: 'Erro ao carregar mensagens.' });
  }
});

// Send message (strict participant authorization + idempotency + isolated WS emission)
app.post('/api/chat/messages', authenticateToken, writeLimiter, async (req: AuthedRequest, res) => {
  try {
    const threadId = sanitizeString(req.body.threadId, 100);
    const text = sanitizeString(req.body.text, 4000);
    const clientMessageId = sanitizeString(req.body.clientMessageId, 80) || null;
    const rawAttachment = sanitizeString(req.body.attachmentUrl, 500);

    if (!threadId || (!text && !rawAttachment)) {
      return res.status(400).json({ error: 'Conversa e conteúdo da mensagem são obrigatórios.' });
    }
    if (rawAttachment && !isSafeAttachmentUrl(rawAttachment)) {
      return res.status(400).json({
        error: 'Anexo inválido. Use um link HTTPS direto para PDF, JPG, PNG, WEBP, DWG ou ZIP.',
      });
    }

    const conv = await getAuthorizedConversation(threadId, req.user!.id);
    if (!conv) {
      return res.status(403).json({ error: 'Você não tem permissão para enviar mensagens nesta conversa.' });
    }

    // Deduplication via clientMessageId
    if (clientMessageId) {
      const dup = await db.execute({
        sql: 'SELECT * FROM messages WHERE thread_id = ? AND sender_id = ? AND client_message_id = ?',
        args: [threadId, req.user!.id, clientMessageId],
      });
      if (dup.rows.length > 0) {
        const r: any = dup.rows[0];
        return res.status(200).json({
          id: r.id,
          threadId: r.thread_id,
          clientMessageId: r.client_message_id,
          senderId: r.sender_id,
          senderName: r.sender_name,
          receiverId: r.receiver_id,
          text: r.text,
          attachmentUrl: r.attachment_url || undefined,
          timestamp: r.timestamp,
          read: Boolean(r.read),
          status: r.read ? 'read' : 'sent',
          createdAt: r.created_at,
        });
      }
    }

    const receiverId = conv.participant_one_id === req.user!.id ? conv.participant_two_id : conv.participant_one_id;
    const msgId = `msg_${crypto.randomUUID()}`;
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const now = new Date().toISOString();
    const messageText = text || 'Anexo enviado';

    await db.execute({
      sql: `INSERT INTO messages (id, thread_id, client_message_id, sender_id, sender_name, receiver_id, text, attachment_url, timestamp, read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      args: [msgId, threadId, clientMessageId, req.user!.id, req.user!.name, receiverId, messageText, rawAttachment || null, timestamp, now],
    });

    await db.execute({
      sql: 'UPDATE conversations SET last_message = ?, last_message_time = ?, updated_at = ? WHERE id = ?',
      args: [messageText.slice(0, 140), timestamp, now, threadId],
    });

    const newMsg = {
      id: msgId,
      threadId,
      clientMessageId: clientMessageId || undefined,
      senderId: req.user!.id,
      senderName: req.user!.name,
      receiverId,
      text: messageText,
      attachmentUrl: rawAttachment || undefined,
      timestamp,
      read: false,
      status: 'sent' as const,
      createdAt: now,
    };

    // Emit ONLY to the two authorized participants of this conversation!
    emitToUsers([req.user!.id, receiverId], { type: 'NEW_MESSAGE', data: newMsg });

    res.status(201).json(newMsg);
  } catch (err) {
    console.error('[Chat API] Erro ao enviar mensagem:', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// Mark received messages in a thread as read (strictly participant-scoped)
app.patch('/api/chat/messages/:threadId/read', authenticateToken, async (req: AuthedRequest, res) => {
  try {
    const { threadId } = req.params;
    const conv = await getAuthorizedConversation(threadId, req.user!.id);
    if (!conv) {
      return res.status(403).json({ error: 'Sem permissão para esta conversa.' });
    }

    const updateRes = await db.execute({
      sql: 'UPDATE messages SET read = 1 WHERE thread_id = ? AND receiver_id = ? AND read = 0',
      args: [threadId, req.user!.id],
    });

    const otherUserId = conv.participant_one_id === req.user!.id ? conv.participant_two_id : conv.participant_one_id;
    if ((updateRes.rowsAffected || 0) > 0) {
      emitToUsers([otherUserId, req.user!.id], {
        type: 'MESSAGES_READ',
        data: { threadId, readerId: req.user!.id, readAt: new Date().toISOString() },
      });
    }

    res.json({ ok: true, updated: updateRes.rowsAffected || 0 });
  } catch {
    res.status(500).json({ error: 'Erro ao confirmar leitura.' });
  }
});

// Explicit JSON 404 for unknown API endpoints
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint da API não encontrado.' });
});

/* ==========================================================================
   11. FRONTEND PRODUCTION STATIC SERVING
   ========================================================================== */
const clientDistCandidates = [
  path.resolve(__dirname, '../../dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
];
const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (clientDistPath) {
  console.log(`[Ballast Frontend] Servindo arquivos compilados de: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      status: 'online',
      service: 'Ballast Architecture API',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  });
}

/* ==========================================================================
   12. AUTHENTICATED & ISOLATED WEBSOCKET SERVER
   ========================================================================== */
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Map<userId, Set<WebSocket>> — guarantees strict user-scoped delivery
const userSockets = new Map<string, Set<WebSocket>>();

function registerSocket(userId: string, ws: WebSocket) {
  let set = userSockets.get(userId);
  if (!set) {
    set = new Set();
    userSockets.set(userId, set);
  }
  set.add(ws);
}

function unregisterSocket(userId: string | null, ws: WebSocket) {
  if (!userId) return;
  const set = userSockets.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) userSockets.delete(userId);
}

function disconnectUserSockets(userId: string) {
  const set = userSockets.get(userId);
  if (!set) return;
  for (const sock of set) {
    try {
      sock.close(4003, 'Conta desconectada');
    } catch {}
  }
  userSockets.delete(userId);
}

function emitToUsers(userIds: string[], payload: any) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const serialized = JSON.stringify(payload);
  for (const uid of uniqueIds) {
    const sockets = userSockets.get(uid);
    if (!sockets) continue;
    for (const sock of sockets) {
      if (sock.readyState === WebSocket.OPEN) {
        sock.send(serialized);
      }
    }
  }
}

wss.on('connection', async (ws: WebSocket, req) => {
  let authedUserId: string | null = null;

  // Allow JWT either via ?token= query param or initial AUTH message within 5s
  try {
    const urlObj = new URL(req.url || '/', 'http://localhost');
    const queryToken = urlObj.searchParams.get('token');
    if (queryToken) {
      const user = await resolveUserFromToken(queryToken);
      if (user) {
        authedUserId = user.id;
        registerSocket(user.id, ws);
        ws.send(JSON.stringify({ type: 'AUTH_OK', userId: user.id }));
      } else {
        ws.close(4001, 'Token WebSocket inválido ou expirado');
        return;
      }
    }
  } catch {
    ws.close(4001, 'Handshake WebSocket inválido');
    return;
  }

  const authTimeout = !authedUserId
    ? setTimeout(() => {
        if (!authedUserId) {
          ws.close(4001, 'Autenticação WebSocket obrigatória');
        }
      }, 5000)
    : null;

  ws.on('message', async (raw: Buffer) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg?.type === 'AUTH' && typeof msg.token === 'string' && !authedUserId) {
        const user = await resolveUserFromToken(msg.token);
        if (!user) {
          ws.close(4001, 'Token inválido');
          return;
        }
        authedUserId = user.id;
        if (authTimeout) clearTimeout(authTimeout);
        registerSocket(user.id, ws);
        ws.send(JSON.stringify({ type: 'AUTH_OK', userId: user.id }));
        return;
      }
      if (msg?.type === 'PING' && authedUserId) {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
      // All chat message persistence & emission happens exclusively through authenticated POST /api/chat/messages
    } catch {
      // Ignore malformed frames
    }
  });

  ws.on('close', () => {
    if (authTimeout) clearTimeout(authTimeout);
    unregisterSocket(authedUserId, ws);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(`Ballast Architecture API v2.0 rodando na porta ${PORT}`);
  console.log(`WebSocket autenticado e isolado por participante ativo`);
  console.log(`==================================================\n`);
});
