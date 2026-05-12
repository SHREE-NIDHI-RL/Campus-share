-- CampusShare Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  department    VARCHAR(150),
  role          VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  rating        NUMERIC(3,2) NOT NULL DEFAULT 0,
  trust_score   NUMERIC(5,2) NOT NULL DEFAULT 0,
  borrow_count  INTEGER NOT NULL DEFAULT 0,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  is_blocked    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESOURCES
CREATE TABLE IF NOT EXISTS resources (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  category         VARCHAR(100) NOT NULL,
  image_url        VARCHAR(500),
  images           TEXT[],
  listing_type     VARCHAR(10) NOT NULL DEFAULT 'both' CHECK (listing_type IN ('rent', 'buy', 'both')),
  rent_price       NUMERIC(10,2),
  buy_price        NUMERIC(10,2),
  security_deposit NUMERIC(10,2),
  availability_days INTEGER,
  min_duration     INTEGER DEFAULT 1,
  max_duration     INTEGER DEFAULT 30,
  late_fee_per_day NUMERIC(10,2),
  status           VARCHAR(30) NOT NULL DEFAULT 'available'
                   CHECK (status IN ('available','borrowed','return-due','extension-requested','extension-approved','sold')),
  condition        VARCHAR(30) DEFAULT 'good' CHECK (condition IN ('new','like-new','good','fair','poor')),
  tags             TEXT[],
  quantity         INTEGER NOT NULL DEFAULT 1,
  specifications   JSONB DEFAULT '{}',
  views_count      INTEGER NOT NULL DEFAULT 0,
  request_count    INTEGER NOT NULL DEFAULT 0,
  successful_borrows INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent upgrades for older databases (safe in dev)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(10,2);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS min_duration INTEGER DEFAULT 1;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS max_duration INTEGER DEFAULT 30;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS late_fee_per_day NUMERIC(10,2);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS condition VARCHAR(30) DEFAULT 'good';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS successful_borrows INTEGER NOT NULL DEFAULT 0;

-- Contact upgrade for older databases
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- BORROW REQUESTS
CREATE TABLE IF NOT EXISTS borrow_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id         UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  borrower_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration_days       INTEGER NOT NULL,
  total_rent          NUMERIC(10,2),
  status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected','active','return-due','extension-requested','extension-approved','returned')),
  due_date            DATE,
  extension_requested BOOLEAN NOT NULL DEFAULT false,
  extension_approved  BOOLEAN NOT NULL DEFAULT false,
  extended_due_date   DATE,
  request_type        VARCHAR(10) NOT NULL DEFAULT 'rent' CHECK (request_type IN ('rent', 'buy')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Request type upgrade for older databases
ALTER TABLE borrow_requests ADD COLUMN IF NOT EXISTS request_type VARCHAR(10) NOT NULL DEFAULT 'rent' CHECK (request_type IN ('rent', 'buy'));

-- RATINGS
CREATE TABLE IF NOT EXISTS ratings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  borrow_id   UUID REFERENCES borrow_requests(id) ON DELETE SET NULL,
  score       INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  feedback    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_user, borrow_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  type       VARCHAR(50) NOT NULL DEFAULT 'info',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, resource_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_resources_owner    ON resources(owner_id);
CREATE INDEX IF NOT EXISTS idx_resources_status   ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_borrow_borrower    ON borrow_requests(borrower_id);
CREATE INDEX IF NOT EXISTS idx_borrow_owner       ON borrow_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_borrow_resource    ON borrow_requests(resource_id);
CREATE INDEX IF NOT EXISTS idx_borrow_status      ON borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_notif_user         ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user      ON wishlist(user_id);
