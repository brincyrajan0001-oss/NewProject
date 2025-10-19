-- ========================================================
-- Enable pgcrypto extension for encryption
-- ========================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========================================================
-- Table: patients
-- ========================================================
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY, -- ULID string
    mrn TEXT UNIQUE NOT NULL, -- HOS-YYYYNNNN
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL CHECK (dob < CURRENT_DATE),
    sex TEXT NOT NULL CHECK (sex IN ('male','female','other','unknown')),
    phone BYTEA, -- Encrypted using pgp_sym_encrypt
    email BYTEA, -- Optional, encrypted
    address_line1 TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country_code CHAR(2) NOT NULL, -- ISO-3166-1 alpha-2
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- Functional index for case-insensitive last_name search
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_patients_lower_last_name
ON patients (LOWER(last_name))
WHERE last_name IS NOT NULL;

-- ========================================================
-- Table: audit_log
-- ========================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor TEXT NOT NULL, -- e.g., api-key:recruiter
    action TEXT NOT NULL CHECK (action IN ('CREATE_PATIENT','UPDATE_PATIENT')),
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    ip TEXT,
    user_agent TEXT,
    diff JSONB -- changed fields
);

-- ========================================================
-- Optional: index for audit logs per patient
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_audit_log_patient_id ON audit_log(patient_id);
