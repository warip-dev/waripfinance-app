-- Utiliser la base de données existante
USE u120682741_waripfinanc_db;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    street_name VARCHAR(200) NOT NULL,
    street_number VARCHAR(20) NOT NULL,
    profession VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    marital_status VARCHAR(20) NOT NULL,
    btc_address VARCHAR(255),
    eth_address VARCHAR(255),
    status ENUM('PENDING', 'ACTIVE', 'BLOCKED') DEFAULT 'PENDING',
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER') NOT NULL,
    asset ENUM('BTC', 'ETH', 'EUR') NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    sender_name VARCHAR(100),
    sender_iban VARCHAR(50),
    recipient_name VARCHAR(100),
    recipient_iban VARCHAR(50),
    recipient_bic VARCHAR(20),
    reference VARCHAR(100),
    address TEXT,
    tx_hash VARCHAR(255),
    status ENUM('PENDING', 'COMPLETED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    admin_comment TEXT,
    validated_by CHAR(36),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Compte admin par défaut (mot de passe: Admin123!)
INSERT INTO users (
    email, password_hash, first_name, last_name, phone, country,
    city, postal_code, street_name, street_number, profession,
    gender, marital_status, status, role
) VALUES (
    'admin@waripfinance.com',
    '$2b$10$5dQqJb3LtP3LtP3LtP3LtOuFmXjZP5CxYzWqWqWqWqWqWqWqWqW',
    'Admin',
    'Warip',
    '+33123456789',
    'FR',
    'Paris',
    '75001',
    'Rue de l\'Admin',
    '1',
    'Administrateur',
    'M',
    'SINGLE',
    'ACTIVE',
    'ADMIN'
);