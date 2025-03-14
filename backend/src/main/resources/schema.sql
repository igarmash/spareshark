-- Spareshark DB Schema

-- Clean up for easier testing (comment out for production)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
                                          id SERIAL PRIMARY KEY,
                                          name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT unique_category_per_user UNIQUE (name, type, user_id)
    );

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
                                            id SERIAL PRIMARY KEY,
                                            amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    category_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_user_transaction FOREIGN KEY (user_id) REFERENCES users(id)
    );

-- Indexes for improved performance
CREATE INDEX IF NOT EXISTS idx_transaction_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_category_user ON categories(user_id);