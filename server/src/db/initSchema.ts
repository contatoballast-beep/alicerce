import { db } from './turso.js';
import bcrypt from 'bcryptjs';

export async function initSchema() {
  console.log('[Turso DB] Verificando e criando tabelas SQL...');

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      crea_cau_number TEXT,
      cnpj_number TEXT,
      verified INTEGER DEFAULT 1,
      phone TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT NOT NULL,
      author_role TEXT NOT NULL,
      author_badge TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      media_urls TEXT,
      stamp_id TEXT,
      registration_number TEXT,
      hash_verification TEXT,
      art_rrt_code TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      budget_estimated REAL,
      deadline_days INTEGER,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      proposals_count INTEGER DEFAULT 0,
      is_sponsored INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      specialty TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      budget_min REAL NOT NULL,
      budget_max REAL NOT NULL,
      owner_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      owner_avatar TEXT NOT NULL,
      status TEXT DEFAULT 'aberto',
      proposals_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL,
      proposer_id TEXT NOT NULL,
      proposer_name TEXT NOT NULL,
      proposer_role TEXT NOT NULL,
      proposer_avatar TEXT NOT NULL,
      crea_cau TEXT,
      value REAL NOT NULL,
      deadline_days INTEGER NOT NULL,
      scope_description TEXT NOT NULL,
      attachment_url TEXT,
      status TEXT DEFAULT 'em_negociacao',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      text TEXT NOT NULL,
      attachment_url TEXT,
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      objective TEXT NOT NULL,
      target_region TEXT NOT NULL,
      daily_budget REAL NOT NULL,
      total_budget REAL NOT NULL,
      duration_days INTEGER NOT NULL,
      impressions_count INTEGER DEFAULT 0,
      clicks_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ativa',
      payment_method TEXT NOT NULL,
      pix_qr_code TEXT,
      pix_copia_cola TEXT,
      invoice_nfse_url TEXT,
      created_at TEXT NOT NULL
    );
  `;

  try {
    await db.executeMultiple(schemaSql);
    console.log('[Turso DB] Tabelas criadas com sucesso!');

    // Check if initial user exists, if not seed initial demo user
    const checkUser = await db.execute("SELECT COUNT(*) as cnt FROM users");
    const count = Number(checkUser.rows[0].cnt);

    if (count === 0) {
      console.log('[Turso DB] Inserindo dados iniciais (Seed)...');
      const passHash = await bcrypt.hash('senha123', 10);
      
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, crea_cau_number, verified, phone, city, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'usr_curr',
          'Eng. Roberto Silva',
          'roberto.silva@alicerce.com.br',
          passHash,
          'profissional_crea',
          'CREA-SP 5069824/D',
          1,
          '(11) 98765-4321',
          'São Paulo',
          'SP',
          new Date().toISOString()
        ]
      });

      // Seed initial post
      await db.execute({
        sql: `INSERT INTO posts (id, author_id, author_name, author_avatar, author_role, author_badge, category, title, content, media_urls, stamp_id, registration_number, hash_verification, art_rrt_code, city, state, budget_estimated, deadline_days, likes_count, comments_count, proposals_count, is_sponsored, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'post_1',
          'usr_camila',
          'Engª. Camila Torres',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          'profissional_crea',
          'Engenheira Estrutural • CREA-SP',
          'obra_andamento',
          'Concretagem de Laje Protendida - Edifício Horizon (14º Pavimento)',
          'Concluímos hoje a concretagem de 450m² de laje protendida no Edifício Horizon. Utilizado fck 40 MPa com aditivo plastificante.',
          'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80',
          'ALC-2026-8812',
          'CREA-SP 5092182/D',
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          'ART SP2026/998124',
          'São Paulo',
          'SP',
          1250000,
          180,
          142,
          29,
          8,
          0,
          'Há 2 horas'
        ]
      });

      // Seed initial opportunity
      await db.execute({
        sql: `INSERT INTO opportunities (id, title, description, category, specialty, city, state, budget_min, budget_max, owner_id, owner_name, owner_avatar, status, proposals_count, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'opp_1',
          'Projeto Estrutural e Cálculo de Fundações para Galpão Logístico (4.000m²)',
          'Necessitamos de engenheiro calculista para elaborar projeto executivo estrutural em pré-moldado de concreto para galpão na Rodovia Dutra.',
          'Projeto Estrutural',
          'Estruturas de Concreto / Metal',
          'Guarulhos',
          'SP',
          45000,
          75000,
          'usr_logistica',
          'ViaSul Logística Empreendimentos',
          'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
          'aberto',
          2,
          'Há 3 dias'
        ]
      });

      console.log('[Turso DB] Seed concluído com sucesso!');
    }

  } catch (err) {
    console.error('[Turso DB] Erro ao inicializar schema:', err);
  }
}
