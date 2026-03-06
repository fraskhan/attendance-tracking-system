-- Multi-Organization Employee Time & Attendance Management System
-- Row Level Security (RLS) Policies Migration
-- 
-- This migration enables RLS on all tables and creates policies for:
-- - Organization isolation (users can only see their own organization)
-- - User management (admins can manage users in their org)
-- - Time log access (employees see own logs, admins see all org logs)
--
-- Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS TABLE RLS POLICIES
-- ============================================================================

-- Users can only see their own organization
-- Requirement 15.2: Filter SELECT queries by organization_id
CREATE POLICY org_isolation ON organizations
    FOR SELECT
    USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Allow users to see their organization details
-- This is needed for organization name display, etc.
CREATE POLICY org_read_own ON organizations
    FOR SELECT
    USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ============================================================================
-- USERS TABLE RLS POLICIES
-- ============================================================================

-- Users can see other users in their organization
-- Requirement 15.2: Filter SELECT queries by organization_id
CREATE POLICY users_org_isolation ON users
    FOR SELECT
    USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Admins can insert users in their organization
-- Requirement 15.3: Prevent INSERT with different organization_id
CREATE POLICY users_admin_insert ON users
    FOR INSERT
    WITH CHECK (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Admins can update users in their organization
-- Requirement 15.4: Prevent UPDATE on records not matching organization_id
CREATE POLICY users_admin_update ON users
    FOR UPDATE
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Admins can delete users in their organization
-- Requirement 15.4: Prevent DELETE on records not matching organization_id
CREATE POLICY users_admin_delete ON users
    FOR DELETE
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Users can update their own password (for password change)
CREATE POLICY users_update_own_password ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- TIME LOGS TABLE RLS POLICIES
-- ============================================================================

-- Employees can only see their own logs
-- Requirement 15.5: Allow employees to SELECT only their own time_log records
CREATE POLICY time_logs_employee_own ON time_logs
    FOR SELECT
    USING (
        user_id = auth.uid()
        AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Admins can see all logs in their organization
-- Requirement 15.6: Allow admins to SELECT all time_log records within their organization
CREATE POLICY time_logs_admin_all ON time_logs
    FOR SELECT
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Employees can insert their own logs
-- Requirement 15.3: Prevent INSERT with different organization_id
CREATE POLICY time_logs_employee_insert ON time_logs
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Employees can update their own logs
-- Requirement 15.4: Prevent UPDATE on records not matching organization_id
CREATE POLICY time_logs_employee_update ON time_logs
    FOR UPDATE
    USING (
        user_id = auth.uid()
        AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
    WITH CHECK (
        user_id = auth.uid()
        AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Admins can update any log in their organization (for corrections)
CREATE POLICY time_logs_admin_update ON time_logs
    FOR UPDATE
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY org_isolation ON organizations IS 
    'Users can only view their own organization - enforces multi-tenant isolation';

COMMENT ON POLICY users_org_isolation ON users IS 
    'Users can only view other users within their organization';

COMMENT ON POLICY users_admin_insert ON users IS 
    'Only admins can create new users within their organization';

COMMENT ON POLICY users_admin_update ON users IS 
    'Only admins can update users within their organization';

COMMENT ON POLICY users_admin_delete ON users IS 
    'Only admins can delete users within their organization';

COMMENT ON POLICY users_update_own_password ON users IS 
    'Users can update their own password for password change functionality';

COMMENT ON POLICY time_logs_employee_own ON time_logs IS 
    'Employees can only view their own time logs';

COMMENT ON POLICY time_logs_admin_all ON time_logs IS 
    'Admins can view all time logs within their organization';

COMMENT ON POLICY time_logs_employee_insert ON time_logs IS 
    'Employees can only insert time logs for themselves';

COMMENT ON POLICY time_logs_employee_update ON time_logs IS 
    'Employees can only update their own time logs';

COMMENT ON POLICY time_logs_admin_update ON time_logs IS 
    'Admins can update any time log within their organization for corrections';
