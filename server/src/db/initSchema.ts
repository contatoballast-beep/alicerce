import { db } from './turso.js';
import bcrypt from 'bcryptjs';

export async function initSchema() {
  console.log('[Turso DB] Inicializando Schema Completo do Ecossistema ALICERCE...');

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
      experience_years INTEGER DEFAULT 5,
      bio TEXT,
      services TEXT,
      serves_pf INTEGER DEFAULT 1,
      serves_pj INTEGER DEFAULT 1,
      crea_cau_number TEXT,
      whatsapp TEXT,
      phone TEXT,
      rating REAL DEFAULT 5.0,
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
      cnpj TEXT NOT NULL,
      categories TEXT,
      services TEXT,
      region_served TEXT,
      phone TEXT,
      whatsapp TEXT,
      website TEXT,
      description TEXT,
      rating REAL DEFAULT 5.0,
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
      rating REAL DEFAULT 5.0,
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
      category TEXT,
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
      demand_type TEXT DEFAULT 'projeto_obra',
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
      last_message TEXT,
      last_message_time TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT,
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
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
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
    console.log('[Turso DB] Schema SQL criado com sucesso!');

    // Check if initial seeding is needed
    const checkUsers = await db.execute("SELECT COUNT(*) as cnt FROM users");
    const count = Number(checkUsers.rows[0].cnt);

    if (count === 0) {
      console.log('[Turso DB] Inserindo dados essenciais de demonstração operacional...');
      const passHash = await bcrypt.hash('alicerce2026', 10);
      const now = new Date().toISOString();

      // 1. Admin
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, crea_cau_number, phone, whatsapp, city, state, bio, avatar, is_verified, verification_status, consent_lgpd, plan, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'admin', ?)`,
        args: [
          'usr_admin',
          'Gestor ALICERCE',
          'admin@alicerce.com.br',
          passHash,
          'admin',
          'CREA-BR 000001/D',
          '(11) 99999-0000',
          '5511999990000',
          'São Paulo',
          'SP',
          'Administrador Geral da Plataforma ALICERCE.',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          1,
          'verified',
          now
        ]
      });

      // 2. Professional (Engineer)
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, crea_cau_number, phone, whatsapp, city, state, bio, avatar, is_verified, verification_status, consent_lgpd, plan, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pro', ?)`,
        args: [
          'usr_curr',
          'Eng. Roberto Silva',
          'roberto.silva@alicerce.com.br',
          passHash,
          'profissional_crea',
          'CREA-SP 5069824/D',
          '(11) 98765-4321',
          '5511987654321',
          'São Paulo',
          'SP',
          'Engenheiro Civil especialista em estruturas de concreto e laudos técnicos periciais com 12 anos de experiência.',
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
          1,
          'verified',
          now
        ]
      });

      await db.execute({
        sql: `INSERT INTO professional_profiles (id, user_id, profession, specialty, experience_years, bio, services, serves_pf, serves_pj, crea_cau_number, whatsapp, phone, rating, reviews_count, availability, city, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, 4.9, 18, 'disponivel', ?, ?, ?)`,
        args: [
          'prof_1',
          'usr_curr',
          'Engenheiro Civil',
          'Cálculo Estrutural & Laudos',
          12,
          'Especialista em projetos executivos estruturais, reforço de estruturas e laudos técnicos com ART.',
          JSON.stringify(['Cálculo Estrutural', 'Laudo Técnico com ART', 'Vistoria Predial', 'Acompanhamento de Obras']),
          'CREA-SP 5069824/D',
          '5511987654321',
          '(11) 98765-4321',
          'São Paulo',
          'SP',
          now
        ]
      });

      // 3. Architect
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, crea_cau_number, phone, whatsapp, city, state, bio, avatar, is_verified, verification_status, consent_lgpd, plan, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pro', ?)`,
        args: [
          'usr_camila',
          'Arqª. Camila Torres',
          'camila.torres@alicerce.com.br',
          passHash,
          'profissional_cau',
          'CAU A99182-0',
          '(41) 98877-6655',
          '5541988776655',
          'Curitiba',
          'PR',
          'Arquiteta e Urbanista com foco em arquitetura residencial contemporânea e interiores sustentáveis.',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          1,
          'verified',
          now
        ]
      });

      await db.execute({
        sql: `INSERT INTO professional_profiles (id, user_id, profession, specialty, experience_years, bio, services, serves_pf, serves_pj, crea_cau_number, whatsapp, phone, rating, reviews_count, availability, city, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, 5.0, 24, 'disponivel', ?, ?, ?)`,
        args: [
          'prof_2',
          'usr_camila',
          'Arquiteta & Urbanista',
          'Projetos Residenciais & Interiores',
          8,
          'Desenvolvimento de projetos arquitetônicos completos, maquetes 3D e aprovação em prefeitura.',
          JSON.stringify(['Projeto Arquitetônico', 'Design de Interiores', 'Aprovação em Prefeitura', 'Modelagem 3D']),
          'CAU A99182-0',
          '5541988776655',
          '(41) 98877-6655',
          'Curitiba',
          'PR',
          now
        ]
      });

      // 4. Company (Construtora)
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, cnpj_number, phone, whatsapp, city, state, bio, avatar, is_verified, verification_status, consent_lgpd, plan, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'empresa_pro', ?)`,
        args: [
          'usr_construtora',
          'Vanguard Construtora & Engenharia LTDA',
          'contato@vanguard.com.br',
          passHash,
          'empresa_cnpj',
          '33.910.402/0001-12',
          '(11) 3344-5566',
          '5511977778888',
          'São Paulo',
          'SP',
          'Construtora e empreiteira focada em obras comerciais, galpões industriais e condomínios de alto padrão.',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
          1,
          'verified',
          now
        ]
      });

      await db.execute({
        sql: `INSERT INTO company_profiles (id, user_id, company_name, trade_name, cnpj, categories, services, region_served, phone, whatsapp, website, description, rating, reviews_count, city, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.8, 31, ?, ?, ?)`,
        args: [
          'comp_1',
          'usr_construtora',
          'Vanguard Construtora e Engenharia LTDA',
          'Vanguard Obras',
          '33.910.402/0001-12',
          JSON.stringify(['Construção Civil', 'Estruturas', 'Reformas Corporativas']),
          JSON.stringify(['Turn-Key', 'Edificações Residenciais', 'Galpões Industriais', 'Terraplanagem']),
          'Grande São Paulo, Campinas e Litoral',
          '(11) 3344-5566',
          '5511977778888',
          'https://vanguardobras.com.br',
          'Empresa especializada em execução de obras com gestão técnica completa e cumprimento rigoroso de prazos.',
          'São Paulo',
          'SP',
          now
        ]
      });

      // 5. Supplier (Fornecedor de Materiais)
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, cnpj_number, phone, whatsapp, city, state, bio, avatar, is_verified, verification_status, consent_lgpd, plan, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'fornecedor_pro', ?)`,
        args: [
          'usr_fornecedor',
          'Polimix Concreto & Materiais Básicos',
          'vendas@polimixalicerce.com.br',
          passHash,
          'fornecedor',
          '12.345.678/0001-90',
          '(11) 4004-9000',
          '5511988889999',
          'São Paulo',
          'SP',
          'Distribuidor líder de cimento, concreto usinado, blocos estruturais e aço para construção civil.',
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80',
          1,
          'verified',
          now
        ]
      });

      await db.execute({
        sql: `INSERT INTO supplier_profiles (id, user_id, company_name, cnpj, category, product_types, delivery_available, phone, whatsapp, website, description, region_served, rating, reviews_count, city, state, created_at)
              VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 4.9, 52, ?, ?, ?)`,
        args: [
          'supp_1',
          'usr_fornecedor',
          'Polimix Concreto & Materiais Básicos',
          '12.345.678/0001-90',
          'Cimento, Concreto & Blocos',
          JSON.stringify(['Cimento CP-II / CP-IV', 'Concreto Usinado FCK 25/30/40', 'Bloco Estrutural 14x19x39', 'Aço CA-50 / CA-60', 'Areia Média e Brita 1']),
          '(11) 4004-9000',
          '5511988889999',
          'https://polimixmateriais.com.br',
          'Fornecimento de materiais pesados para obras civis com entrega pontual de caminhão betoneira e caçamba.',
          'São Paulo, ABC e Região Metropolitana',
          'São Paulo',
          'SP',
          now
        ]
      });

      // 6. Posts (Purge legacy mock posts)
      await db.execute("DELETE FROM posts WHERE id IN ('post_1', 'post_2', 'post_3')");

      // 7. Opportunity
      await db.execute({
        sql: `INSERT INTO opportunities (id, owner_id, owner_name, owner_avatar, title, description, category, specialty, city, state, budget_min, budget_max, deadline_days, status, proposals_count, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 45, 'aberta', 2, ?)`,
        args: [
          'opp_1',
          'usr_camila',
          'Arqª. Camila Torres',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          'Projeto Estrutural e Cálculo de Fundações para Galpão Logístico (4.000m²)',
          'Necessitamos de engenheiro calculista para elaborar projeto executivo estrutural em pré-moldado de concreto para galpão na Rodovia Dutra.',
          'Projeto Estrutural',
          'Estruturas de Concreto / Metal',
          'Guarulhos',
          'SP',
          45000,
          75000,
          'Há 3 dias'
        ]
      });

      // 8. Proposal
      await db.execute({
        sql: `INSERT INTO proposals (id, opportunity_id, proposer_id, proposer_name, proposer_role, proposer_avatar, crea_cau, value, deadline_days, scope_description, attachment_url, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'em_negociacao', ?)`,
        args: [
          'prop_1',
          'opp_1',
          'usr_curr',
          'Eng. Roberto Silva',
          'profissional_crea',
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
          'CREA-SP 5069824/D',
          58000,
          30,
          'Elaboração de modelo tridimensional em software BIM/TQS, detalhamento completo de armaduras, blocos e sapatas de fundação com emissão de ART registrada.',
          'Proposta_Tecnica_Roberto_Silva.pdf',
          'Ontem'
        ]
      });

      // 9. Categories
      const categoriesSeed = [
        ['cat_1', 'Projetos de Arquitetura', 'arquitetura', 'service', 'Compass'],
        ['cat_2', 'Projetos Estruturais & Fundações', 'estrutural', 'service', 'Building2'],
        ['cat_3', 'Instalações Elétricas & Hidráulicas', 'instalacoes', 'service', 'Zap'],
        ['cat_4', 'Alvenaria, Reformas & Construção', 'alvenaria', 'service', 'Hammer'],
        ['cat_5', 'Cimento, Areia, Brita & Concreto', 'concreto-agregados', 'material', 'Truck'],
        ['cat_6', 'Aço, Armaduras & Estruturas Metálicas', 'aco-metal', 'material', 'Boxes'],
        ['cat_7', 'Locação de Máquinas & Equipamentos', 'locacao-maquinas', 'material', 'Wrench'],
        ['cat_8', 'Pisos, Revestimentos & Acabamento', 'acabamento', 'material', 'Layers']
      ];

      for (const cat of categoriesSeed) {
        await db.execute({
          sql: `INSERT INTO categories (id, name, slug, type, icon, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [cat[0], cat[1], cat[2], cat[3], cat[4], now]
        });
      }

      // 10. Initial Active Ad Campaigns
      await db.execute({
        sql: `INSERT INTO ad_campaigns (id, user_id, title, objective, target_region, daily_budget, total_budget, duration_days, impressions_count, clicks_count, status, payment_method, pix_qr_code, pix_copia_cola, invoice_nfse_url, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativa', 'pix', ?, ?, ?, ?)`,
        args: [
          'camp_1',
          'usr_fornecedor',
          'Polimix Concreto - Entrega Expressa de Concreto Usinado fck 30 MPa com Bomba em SP',
          'Venda Direta de Materiais',
          'São Paulo e Região Metropolitana',
          80,
          1120,
          14,
          1840,
          94,
          'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014BR.GOV.BCB.PIX',
          '00020126580014BR.GOV.BCB.PIX0136alicerce-pay@bancopix.com.br5204000053039865401120.005802BR5916ALICERCE ADS6009SAO PAULO62070503***6304ABCD',
          'NFS-e_ALICERCE_882910.pdf',
          new Date().toLocaleDateString('pt-BR')
        ]
      });

      await db.execute({
        sql: `INSERT INTO ad_campaigns (id, user_id, title, objective, target_region, daily_budget, total_budget, duration_days, impressions_count, clicks_count, status, payment_method, pix_qr_code, pix_copia_cola, invoice_nfse_url, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativa', 'pix', ?, ?, ?, ?)`,
        args: [
          'camp_2',
          'usr_construtora',
          'Vanguard Construtora - Contratação de Empreiteiras Hidráulica e Elétrica para Edifícios',
          'Captação de Leads e Obras',
          'São Paulo e Campinas - SP',
          60,
          840,
          14,
          1250,
          68,
          'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014BR.GOV.BCB.PIX',
          '00020126580014BR.GOV.BCB.PIX0136alicerce-pay@bancopix.com.br520400005303986540840.005802BR5916ALICERCE ADS6009SAO PAULO62070503***6304WXYZ',
          'NFS-e_ALICERCE_991823.pdf',
          new Date().toLocaleDateString('pt-BR')
        ]
      });

      console.log('[Turso DB] Seed de dados operacionais e campanhas de ads concluído com sucesso!');
    }

  } catch (err) {
    console.error('[Turso DB] Erro ao inicializar schema:', err);
  }
}
