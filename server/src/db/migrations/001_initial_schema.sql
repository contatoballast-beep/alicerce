-- ALICERCE DIGITAL ECOSYSTEM - MIGRATION 001
-- Relational Schema for Supabase PostgreSQL & SQLite/libSQL

-- 1. Users & Profiles (RBAC)
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

-- 2. Professional Profiles
CREATE TABLE IF NOT EXISTS professional_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profession TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience_years INTEGER DEFAULT 5,
  bio TEXT,
  services TEXT, -- JSON Array of services offered
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

-- 3. Company Profiles (Construtoras, Empreiteiras, Terraplanagem)
CREATE TABLE IF NOT EXISTS company_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT NOT NULL,
  categories TEXT, -- JSON Array
  services TEXT, -- JSON Array
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

-- 4. Supplier Profiles (Lojas, Concreto, Aço, Locadoras)
CREATE TABLE IF NOT EXISTS supplier_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  cnpj TEXT,
  category TEXT NOT NULL,
  product_types TEXT, -- JSON Array
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

-- 5. Categories & Services Directory
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'service' | 'material' | 'project'
  icon TEXT,
  created_at TEXT NOT NULL
);

-- 6. Portfolios
CREATE TABLE IF NOT EXISTS portfolio_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  media_urls TEXT, -- JSON Array
  budget REAL,
  completion_date TEXT,
  created_at TEXT NOT NULL
);

-- 7. Posts / Carimbo Técnico
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id),
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

-- 8. Opportunities & Demands
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id),
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

-- 9. Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  proposer_id TEXT NOT NULL REFERENCES users(id),
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

-- 10. Material Quote Requests (Cotação de Materiais)
CREATE TABLE IF NOT EXISTS quote_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES users(id),
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
  quote_request_id TEXT NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS quote_responses (
  id TEXT PRIMARY KEY,
  quote_request_id TEXT NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  supplier_id TEXT NOT NULL REFERENCES users(id),
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

-- 11. Realtime Conversations & Messages
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
  sender_id TEXT NOT NULL REFERENCES users(id),
  sender_name TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  text TEXT NOT NULL,
  attachment_url TEXT,
  timestamp TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- 12. Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- 'professional' | 'company' | 'supplier' | 'opportunity'
  target_id TEXT NOT NULL,
  target_title TEXT NOT NULL,
  target_subtitle TEXT,
  target_avatar TEXT,
  created_at TEXT NOT NULL
);

-- 13. Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  reviewer_name TEXT NOT NULL,
  reviewer_avatar TEXT,
  target_user_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  contract_type TEXT,
  created_at TEXT NOT NULL
);

-- 14. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  link TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- 15. Reports & Moderation
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  created_at TEXT NOT NULL
);

-- 16. Verification Requests
CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  document_url TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TEXT NOT NULL
);

-- 17. ALICERCE Ads & Pix Payments
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- INDEXES FOR SPEED & SEARCH
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_city_state ON users(city, state);
CREATE INDEX IF NOT EXISTS idx_prof_profession ON professional_profiles(profession);
CREATE INDEX IF NOT EXISTS idx_prof_city ON professional_profiles(city);
CREATE INDEX IF NOT EXISTS idx_comp_city ON company_profiles(city);
CREATE INDEX IF NOT EXISTS idx_supp_category ON supplier_profiles(category);
CREATE INDEX IF NOT EXISTS idx_supp_city ON supplier_profiles(city);
CREATE INDEX IF NOT EXISTS idx_opp_city ON opportunities(city);
CREATE INDEX IF NOT EXISTS idx_opp_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_msg_sender_rec ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_fav_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
