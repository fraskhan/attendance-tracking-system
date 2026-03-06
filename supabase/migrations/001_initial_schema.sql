-- Multi-Organization Employee Time & Attendance Management System
-- Initial Database Schema Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    must_change_password BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, username)
);

-- Performance indexes for users table
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- TIME LOGS TABLE
-- ============================================================================
CREATE TABLE time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIMESTAMPTZ,
    time_in_photo_url TEXT,
    time_out TIMESTAMPTZ,
    time_out_photo_url TEXT,
    total_hours DECIMAL(5,2),
    status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('completed', 'missing', 'incomplete')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id, date)
);

-- Performance indexes for time_logs table
CREATE INDEX idx_time_logs_org ON time_logs(organization_id);
CREATE INDEX idx_time_logs_user ON time_logs(user_id);
CREATE INDEX idx_time_logs_date ON time_logs(date);
CREATE INDEX idx_time_logs_status ON time_logs(status);
CREATE INDEX idx_time_logs_org_date ON time_logs(organization_id, date);
CREATE INDEX idx_time_logs_user_date ON time_logs(user_id, date);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp on time_logs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_logs_updated_at
    BEFORE UPDATE ON time_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VALIDATION FUNCTIONS
-- ============================================================================

-- Function to validate time_out is after time_in
CREATE OR REPLACE FUNCTION validate_time_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.time_out IS NOT NULL AND NEW.time_in IS NOT NULL THEN
        IF NEW.time_out <= NEW.time_in THEN
            RAISE EXCEPTION 'time_out must be after time_in';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_time_order
    BEFORE INSERT OR UPDATE ON time_logs
    FOR EACH ROW
    EXECUTE FUNCTION validate_time_order();

-- Function to calculate total_hours automatically
CREATE OR REPLACE FUNCTION calculate_total_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.time_out IS NOT NULL AND NEW.time_in IS NOT NULL THEN
        NEW.total_hours = ROUND(
            EXTRACT(EPOCH FROM (NEW.time_out - NEW.time_in)) / 3600.0,
            2
        );
        NEW.status = 'completed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_total_hours
    BEFORE INSERT OR UPDATE ON time_logs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_hours();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE organizations IS 'Stores organization/tenant information for multi-tenant isolation';
COMMENT ON TABLE users IS 'Stores user accounts (admins and employees) with organization association';
COMMENT ON TABLE time_logs IS 'Stores employee time in/out records with photo verification';

COMMENT ON COLUMN users.must_change_password IS 'Flag to force password change on first login';
COMMENT ON COLUMN users.is_active IS 'Flag to enable/disable user account access';
COMMENT ON COLUMN time_logs.status IS 'Status: incomplete (only time_in), completed (both times), missing (time_out not recorded)';
COMMENT ON COLUMN time_logs.total_hours IS 'Automatically calculated from time_out - time_in';
