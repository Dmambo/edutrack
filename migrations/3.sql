-- Migration to remove mocha_user_id and add password_hash
-- First, create a new users table with the updated schema
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old users table, setting default password for existing users
INSERT INTO users_new (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
SELECT 
  id, 
  email, 
  '$2a$10$default.hash.for.existing.users', -- Default password hash for existing users
  first_name, 
  last_name, 
  role, 
  is_active, 
  created_at, 
  updated_at
FROM users;

-- Drop the old users table
DROP TABLE users;

-- Rename the new table to users
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
