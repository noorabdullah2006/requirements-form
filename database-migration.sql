-- ============================================================
-- ONE-TIME FIX — Run this in Supabase SQL Editor
-- Adds missing columns to existing tables + creates missing tables
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- ============================================================

-- Fix existing projects table — add missing columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS reference_urls     TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS available_assets   TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hosting_details    VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMP DEFAULT NOW();

-- Create missing tables (IF NOT EXISTS = safe if they already exist)
CREATE TABLE IF NOT EXISTS project_pages (
    id         SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    page_name  VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS project_features (
    id           SERIAL PRIMARY KEY,
    project_id   INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS project_files (
    id         SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_name  VARCHAR(255) NOT NULL,
    file_path  VARCHAR(500) NOT NULL,
    file_type  VARCHAR(100),
    file_size  INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_notes (
    id         SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    admin_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    note       TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fix users table — add role column for Multi-Admin Support
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';

-- Set main admin (abdullah) as Super Admin
UPDATE users SET role = 'super_admin' WHERE email = 'noorabdullah.qr10@gmail.com';

