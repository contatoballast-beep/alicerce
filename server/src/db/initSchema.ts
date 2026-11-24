import { db } from './turso.js';
import bcrypt from 'bcryptjs';

async function safeAlter(sql: string) {
  try {
    await db.execute(sql);
  } catch {
    // Column already exists
  }
}

export async function initSchema() {
  console.log('[Ballast DB] Inicializando schema relacional Ballast Architecture...');

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      crea_cau_number TEXT,
      cnpj_number TEXT,
      phone TEXT,
      whatsapp TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      bio TEXT,
      avatar TEXT,
      is_verified INTEGER DEFAULT 0,
      verification_status TEXT DEFAULT 'unverified',
      consent_lgpd INTEGER DEFAULT 1,
      plan TEXT DEFAULT 'gratuito',
      subscription_status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS professional_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      profession TEXT NOT NULL,
      specialty TEXT NOT NULL,
      experience_years INTEGER DEFAULT 0,
      bio TEXT,
      services TEXT,
      styles TEXT,
      project_types TEXT,
      investment_ranges TEXT,
      service_area TEXT,
      serves_pf INTEGER DEFAULT 1,
      serves_pj INTEGER DEFAULT 1,
      crea_cau_number TEXT,
      whatsapp TEXT,
      phone TEXT,
      rating REAL DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      availability TEXT DEFAULT 'disponivel',
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS company_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      trade_name TEXT,
      cnpj TEXT,
      categories TEXT,
      services TEXT,
      region_served TEXT,
      phone TEXT,
      whatsapp TEXT,
      website TEXT,
      description TEXT,
      rating REAL DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS supplier_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      cnpj TEXT,
      category TEXT NOT NULL,
      product_types TEXT,
      delivery_available INTEGER DEFAULT 1,
      phone TEXT,
      whatsapp TEXT,
      website TEXT,
      description TEXT,
      region_served TEXT,
      rating REAL DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS portfolio_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      context TEXT,
      category TEXT,
      project_type TEXT,
      city TEXT,
      state TEXT,
      year TEXT,
      photo_credit TEXT,
      media_urls TEXT,
      budget REAL,
      completion_date TEXT,
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

    CREATE TABLE IF NOT EXISTS post_likes (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      owner_avatar TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      specialty TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      budget_min REAL NOT NULL,
      budget_max REAL NOT NULL,
      deadline_days INTEGER DEFAULT 30,
      deadline_date TEXT,
      photos_urls TEXT,
      demand_type TEXT DEFAULT 'projeto_arquitetonico',
      current_stage TEXT,
      style_preferences TEXT,
      status TEXT DEFAULT 'aberta',
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
      status TEXT DEFAULT 'pendente',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS proposal_requests (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      architect_id TEXT NOT NULL,
      architect_name TEXT NOT NULL,
      thread_id TEXT,
      project_type TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      budget_range TEXT,
      timeline TEXT,
      current_stage TEXT,
      description TEXT NOT NULL,
      style_preferences TEXT,
      status TEXT DEFAULT 'enviada',
      architect_response TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quote_requests (
      id TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL,
      requester_name TEXT NOT NULL,
      requester_phone TEXT,
      requester_whatsapp TEXT,
      supplier_id TEXT,
      supplier_name TEXT,
      delivery_address TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      status TEXT DEFAULT 'aberta',
      total_quoted REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quote_request_items (
      id TEXT PRIMARY KEY,
      quote_request_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS quote_responses (
      id TEXT PRIMARY KEY,
      quote_request_id TEXT NOT NULL,
      supplier_id TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      shipping_price REAL DEFAULT 0,
      total_sum REAL NOT NULL,
      delivery_days INTEGER DEFAULT 3,
      validity_days INTEGER DEFAULT 7,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participant_one_id TEXT NOT NULL,
      participant_two_id TEXT NOT NULL,
      participant_one_name TEXT NOT NULL,
      participant_two_name TEXT NOT NULL,
      participant_one_avatar TEXT,
      participant_two_avatar TEXT,
      participant_one_role TEXT,
      participant_two_role TEXT,
      project_title TEXT,
      opportunity_id TEXT,
      proposal_request_id TEXT,
      last_message TEXT,
      last_message_time TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      client_message_id TEXT,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      text TEXT NOT NULL,
      attachment_url TEXT,
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_title TEXT NOT NULL,
      target_subtitle TEXT,
      target_avatar TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      reviewer_id TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      reviewer_avatar TEXT,
      target_user_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      contract_type TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      link TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      reporter_name TEXT,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pendente',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      document_type TEXT NOT NULL,
      document_number TEXT NOT NULL,
      document_url TEXT,
      status TEXT DEFAULT 'pendente',
      created_at TEXT NOT NULL
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
      status TEXT DEFAULT 'aguardando_pagamento',
      payment_method TEXT NOT NULL,
      pix_qr_code TEXT,
      pix_copia_cola TEXT,
      invoice_nfse_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS telemetry_events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      user_id TEXT,
      path TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL
    );
  `;

  try {
    await db.executeMultiple(schemaSql);

    // Safe additive migrations for existing databases (MUST run BEFORE creating indexes on new columns)
    await safeAlter("ALTER TABLE professional_profiles ADD COLUMN styles TEXT");
    await safeAlter("ALTER TABLE professional_profiles ADD COLUMN project_types TEXT");
    await safeAlter("ALTER TABLE professional_profiles ADD COLUMN investment_ranges TEXT");
    await safeAlter("ALTER TABLE professional_profiles ADD COLUMN service_area TEXT");
    await safeAlter("ALTER TABLE portfolio_items ADD COLUMN context TEXT");
    await safeAlter("ALTER TABLE portfolio_items ADD COLUMN project_type TEXT");
    await safeAlter("ALTER TABLE portfolio_items ADD COLUMN city TEXT");
    await safeAlter("ALTER TABLE portfolio_items ADD COLUMN state TEXT");
    await safeAlter("ALTER TABLE portfolio_items ADD COLUMN year TEXT");
    await safeAlter("ALTER TABLE portfolio_items ADD COLUMN photo_credit TEXT");
    await safeAlter("ALTER TABLE conversations ADD COLUMN participant_one_avatar TEXT");
    await safeAlter("ALTER TABLE conversations ADD COLUMN participant_two_avatar TEXT");
    await safeAlter("ALTER TABLE conversations ADD COLUMN participant_one_role TEXT");
    await safeAlter("ALTER TABLE conversations ADD COLUMN participant_two_role TEXT");
    await safeAlter("ALTER TABLE conversations ADD COLUMN project_title TEXT");
    await safeAlter("ALTER TABLE conversations ADD COLUMN opportunity_id TEXT");
    await safeAlter("ALTER TABLE conversations ADD COLUMN proposal_request_id TEXT");
    await safeAlter("ALTER TABLE messages ADD COLUMN client_message_id TEXT");
    await safeAlter("ALTER TABLE opportunities ADD COLUMN current_stage TEXT");
    await safeAlter("ALTER TABLE opportunities ADD COLUMN style_preferences TEXT");
    await safeAlter("ALTER TABLE reports ADD COLUMN reporter_name TEXT");
    await safeAlter("ALTER TABLE reports ADD COLUMN details TEXT");

    // Indexes created safely AFTER additive column migrations
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
      "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
      "CREATE INDEX IF NOT EXISTS idx_prof_user ON professional_profiles(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_prof_city ON professional_profiles(city)",
      "CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_items(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_msg_thread_created ON messages(thread_id, created_at)",
      "CREATE INDEX IF NOT EXISTS idx_msg_client_id ON messages(thread_id, client_message_id)",
      "CREATE INDEX IF NOT EXISTS idx_conv_p1 ON conversations(participant_one_id)",
      "CREATE INDEX IF NOT EXISTS idx_conv_p2 ON conversations(participant_two_id)",
      "CREATE INDEX IF NOT EXISTS idx_quotes_req ON quote_requests(requester_id)",
      "CREATE INDEX IF NOT EXISTS idx_quotes_sup ON quote_requests(supplier_id)",
      "CREATE INDEX IF NOT EXISTS idx_prop_req_client ON proposal_requests(client_id)",
      "CREATE INDEX IF NOT EXISTS idx_prop_req_arch ON proposal_requests(architect_id)",
      "CREATE INDEX IF NOT EXISTS idx_fav_user ON favorites(user_id)",
    ];
    for (const idxSql of indexes) {
      await safeAlter(idxSql);
    }

    // Seed reference taxonomy (categories only — no fake users, no fake ads, no hardcoded passwords)
    const catCheck = await db.execute("SELECT COUNT(*) as cnt FROM categories");
    if (Number(catCheck.rows[0].cnt) === 0) {
      const now = new Date().toISOString();
      const categoriesSeed = [
        ['cat_1', 'Arquitetura Residencial', 'arquitetura-residencial', 'project', 'Home'],
        ['cat_2', 'Reformas & Retrofit', 'reformas-retrofit', 'project', 'Hammer'],
        ['cat_3', 'Arquitetura de Interiores', 'interiores', 'project', 'Layers'],
        ['cat_4', 'Arquitetura Comercial & Corporativa', 'comercial', 'project', 'Building2'],
        ['cat_5', 'Paisagismo & Áreas Externas', 'paisagismo', 'project', 'Trees'],
        ['cat_6', 'Arquitetura Sustentável', 'sustentavel', 'project', 'Leaf'],
        ['cat_7', 'Projetos Complementares & Engenharia', 'engenharia-complementar', 'service', 'Compass'],
        ['cat_8', 'Consultoria & Viabilidade de Terreno', 'viabilidade', 'service', 'MapPin']
      ];
      for (const cat of categoriesSeed) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO categories (id, name, slug, type, icon, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [cat[0], cat[1], cat[2], cat[3], cat[4], now]
        });
      }
    }

    // Remove legacy insecure demo admin / mock accounts if present (non-fatal if FK referenced)
    try {
      await db.execute("DELETE FROM users WHERE id IN ('usr_admin', 'usr_rhuan_admin') AND email IN ('admin@alicerce.com.br', 'rhuangumbi@gmail.com') AND crea_cau_number = 'CREA-BR 000001/D'");
      await db.execute("DELETE FROM ad_campaigns WHERE id IN ('camp_1', 'camp_2') AND pix_copia_cola LIKE '%alicerce-pay@bancopix.com.br%'");
    } catch (cleanupErr) {
      console.warn('[Ballast DB] Limpeza de registros legados ignorada:', cleanupErr);
    }

    // Optional secure admin bootstrap ONLY when explicitly configured via environment variables
    const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (bootstrapEmail && bootstrapPassword && bootstrapPassword.length >= 12) {
      const existing = await db.execute({
        sql: "SELECT id FROM users WHERE LOWER(email) = ?",
        args: [bootstrapEmail]
      });
      if (existing.rows.length === 0) {
        const hash = await bcrypt.hash(bootstrapPassword, 12);
        const now = new Date().toISOString();
        await db.execute({
          sql: `INSERT INTO users (id, name, email, password_hash, role, city, state, is_verified, verification_status, consent_lgpd, plan, created_at)
                VALUES (?, 'Administração Ballast', ?, ?, 'admin', 'São Paulo', 'SP', 1, 'verified', 1, 'admin', ?)`,
          args: [`usr_admin_${Date.now()}`, bootstrapEmail, hash, now]
        });
        console.log('[Ballast DB] Conta administrativa inicial provisionada via variáveis de ambiente.');
      }
    }

    console.log('[Ballast DB] Schema pronto.');
  } catch (err) {
    console.error('[Ballast DB] Erro ao inicializar schema:', err);
    throw err;
  }
}
