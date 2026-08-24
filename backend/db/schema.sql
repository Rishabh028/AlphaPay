-- PostgreSQL Schema for Digital Alpha Technology Transactions & Rewards Application

-- 1. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    raw_id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    merchant VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(16) NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    is_refund BOOLEAN NOT NULL DEFAULT FALSE,
    coins_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS ix_transactions_raw_id ON transactions(raw_id);
CREATE INDEX IF NOT EXISTS ix_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS ix_transactions_merchant ON transactions(merchant);
CREATE INDEX IF NOT EXISTS ix_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS ix_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS ix_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS ix_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS ix_txn_category_status ON transactions(category, status);
CREATE INDEX IF NOT EXISTS ix_txn_timestamp_amount ON transactions(timestamp, amount);

-- 2. Rewards Catalogue Table
CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    cost_coins INTEGER NOT NULL CHECK (cost_coins > 0),
    discount_value NUMERIC(10, 2) NOT NULL,
    discount_display VARCHAR(64) NOT NULL,
    icon_key VARCHAR(32) NOT NULL DEFAULT 'gift',
    brand_name VARCHAR(64) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Redemptions Ledger Table
CREATE TABLE IF NOT EXISTS redemptions (
    id VARCHAR(36) PRIMARY KEY,
    reward_id VARCHAR(32) NOT NULL REFERENCES rewards(id),
    reward_title VARCHAR(128) NOT NULL,
    coins_spent INTEGER NOT NULL CHECK (coins_spent > 0),
    voucher_code VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_redemptions_reward_id ON redemptions(reward_id);
CREATE INDEX IF NOT EXISTS ix_redemptions_created_at ON redemptions(created_at DESC);
