-- Création de la base de données
CREATE DATABASE warip_bank;

-- Se connecter à la base
\c warip_bank;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    street_name TEXT NOT NULL,
    street_number TEXT NOT NULL,
    profession TEXT NOT NULL,
    gender TEXT NOT NULL,
    marital_status TEXT NOT NULL,
    btc_address TEXT,
    eth_address TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'BLOCKED')),
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
    asset VARCHAR(10) NOT NULL CHECK (asset IN ('BTC', 'ETH', 'EUR')),
    amount DECIMAL(20,8) NOT NULL,
    sender_name VARCHAR(100),
    sender_iban VARCHAR(50),
    recipient_name VARCHAR(100) NOT NULL,
    recipient_iban VARCHAR(50) NOT NULL,
    recipient_bic VARCHAR(20),
    reference VARCHAR(100),
    address TEXT,
    tx_hash TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'REJECTED', 'CANCELLED')),
    admin_comment TEXT,
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Création du compte administrateur par défaut
-- Le mot de passe est 'Admin123!' (hashé avec bcrypt)
INSERT INTO users (
    email, password_hash, first_name, last_name, phone, country,
    city, postal_code, street_name, street_number, profession,
    gender, marital_status, status, role
) VALUES (
    'admin@waripbank.com',
    '$2b$10$abc123def456ghi789jklmno...', -- À remplacer par un vrai hash
    'Admin',
    'Warip',
    '+33123456789',
    'FR',
    'Paris',
    '75001',
    'Rue de l\'Administration',
    '1',
    'Administrateur',
    'M',
    'SINGLE',
    'ACTIVE',
    'ADMIN'
);