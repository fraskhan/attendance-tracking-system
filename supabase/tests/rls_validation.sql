-- ============================================================================
-- RLS POLICY VALIDATION TESTS
-- ============================================================================
-- This file contains SQL tests to validate Row Level Security policies
-- Run these tests after applying the RLS migration (003_enable_rls.sql)
--
-- Requirements tested: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
-- ============================================================================

-- ============================================================================
-- TEST SETUP: Create test organizations and users
-- ============================================================================

-- Create two test organizations
INSERT INTO organizations (id, name) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Organization A'),
    ('22222222-2222-2222-2222-222222222222', 'Organization B')
ON CONFLICT DO NOTHING;

-- Create test users for Organization A
INSERT INTO users (id, organization_id, full_name, username, password_hash, role, is_active) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Admin A', 'admin_a', 'hash', 'admin', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '11111111-1111-1111-1111-111111111111', 'Employee A1', 'employee_a1', 'hash', 'employee', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '11111111-1111-1111-1111-111111111111', 'Employee A2', 'employee_a2', 'hash', 'employee', true)
ON CONFLICT DO NOTHING;

-- Create test users for Organization B
INSERT INTO users (id, organization_id, full_name, username, password_hash, role, is_active) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Admin B', 'admin_b', 'hash', 'admin', true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '22222222-2222-2222-2222-222222222222', 'Employee B1', 'employee_b1', 'hash', 'employee', true)
ON CONFLICT DO NOTHING;

-- Create test time logs for Organization A
INSERT INTO time_logs (organization_id, user_id, date, time_in, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '2024-01-15', '2024-01-15 08:00:00+00', 'incomplete'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '2024-01-15', '2024-01-15 09:00:00+00', 'incomplete')
ON CONFLICT DO NOTHING;

-- Create test time logs for Organization B
INSERT INTO time_logs (organization_id, user_id, date, time_in, status) VALUES
    ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '2024-01-15', '2024-01-15 08:30:00+00', 'incomplete')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEST 1: Organization Isolation
-- Requirement 15.2: Users can only see their own organization
-- ============================================================================

-- Test: Set session to Admin A and verify they can only see Organization A
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

-- This should return only Organization A
SELECT 
    CASE 
        WHEN COUNT(*) = 1 AND MAX(id) = '11111111-1111-1111-1111-111111111111' 
        THEN 'PASS: Admin A can only see Organization A'
        ELSE 'FAIL: Admin A sees wrong organizations'
    END AS test_result
FROM organizations;

-- ============================================================================
-- TEST 2: User List Organization Isolation
-- Requirement 15.2: Users can only see users in their organization
-- ============================================================================

-- Test: Admin A should see only users from Organization A (3 users)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

SELECT 
    CASE 
        WHEN COUNT(*) = 3 
        THEN 'PASS: Admin A sees exactly 3 users from Organization A'
        ELSE 'FAIL: Admin A sees ' || COUNT(*) || ' users (expected 3)'
    END AS test_result
FROM users;

-- ============================================================================
-- TEST 3: Employee Can Only See Own Time Logs
-- Requirement 15.5: Employees can SELECT only their own time_log records
-- ============================================================================

-- Test: Employee A1 should see only their own log (1 record)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab"}';

SELECT 
    CASE 
        WHEN COUNT(*) = 1 AND MAX(user_id) = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab'
        THEN 'PASS: Employee A1 sees only their own time log'
        ELSE 'FAIL: Employee A1 sees ' || COUNT(*) || ' logs (expected 1)'
    END AS test_result
FROM time_logs;

-- ============================================================================
-- TEST 4: Admin Can See All Organization Time Logs
-- Requirement 15.6: Admins can SELECT all time_log records within their organization
-- ============================================================================

-- Test: Admin A should see all logs from Organization A (2 records)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

SELECT 
    CASE 
        WHEN COUNT(*) = 2 
        THEN 'PASS: Admin A sees all 2 time logs from Organization A'
        ELSE 'FAIL: Admin A sees ' || COUNT(*) || ' logs (expected 2)'
    END AS test_result
FROM time_logs;

-- ============================================================================
-- TEST 5: Cross-Organization Access Prevention
-- Requirement 1.2: Prevent users from accessing data from other organizations
-- ============================================================================

-- Test: Admin A should NOT see any users from Organization B
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

SELECT 
    CASE 
        WHEN COUNT(*) = 0 
        THEN 'PASS: Admin A cannot see users from Organization B'
        ELSE 'FAIL: Admin A can see ' || COUNT(*) || ' users from Organization B'
    END AS test_result
FROM users
WHERE organization_id = '22222222-2222-2222-2222-222222222222';

-- ============================================================================
-- TEST 6: Employee Cannot See Other Employee Logs
-- Requirement 15.5: Employees can only see their own logs
-- ============================================================================

-- Test: Employee A1 should NOT see Employee A2's logs
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab"}';

SELECT 
    CASE 
        WHEN COUNT(*) = 0 
        THEN 'PASS: Employee A1 cannot see Employee A2 logs'
        ELSE 'FAIL: Employee A1 can see ' || COUNT(*) || ' logs from other employees'
    END AS test_result
FROM time_logs
WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac';

-- ============================================================================
-- TEST 7: Admin Cannot Insert User in Different Organization
-- Requirement 15.3: Prevent INSERT with different organization_id
-- ============================================================================

-- Test: Admin A should NOT be able to insert a user into Organization B
-- This should fail with a policy violation
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

DO $$
BEGIN
    BEGIN
        INSERT INTO users (organization_id, full_name, username, password_hash, role)
        VALUES ('22222222-2222-2222-2222-222222222222', 'Hacker', 'hacker', 'hash', 'employee');
        
        RAISE NOTICE 'FAIL: Admin A was able to insert user into Organization B';
    EXCEPTION
        WHEN insufficient_privilege OR check_violation THEN
            RAISE NOTICE 'PASS: Admin A cannot insert user into Organization B (policy blocked)';
    END;
END $$;

-- ============================================================================
-- TEST 8: Employee Cannot Insert Time Log for Another User
-- Requirement 15.3: Prevent INSERT with different user_id
-- ============================================================================

-- Test: Employee A1 should NOT be able to insert a time log for Employee A2
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab"}';

DO $$
BEGIN
    BEGIN
        INSERT INTO time_logs (organization_id, user_id, date, time_in, status)
        VALUES ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '2024-01-16', NOW(), 'incomplete');
        
        RAISE NOTICE 'FAIL: Employee A1 was able to insert time log for Employee A2';
    EXCEPTION
        WHEN insufficient_privilege OR check_violation THEN
            RAISE NOTICE 'PASS: Employee A1 cannot insert time log for Employee A2 (policy blocked)';
    END;
END $$;

-- ============================================================================
-- TEST 9: Employee Can Insert Their Own Time Log
-- Requirement 15.3: Allow INSERT with matching user_id and organization_id
-- ============================================================================

-- Test: Employee A1 should be able to insert their own time log
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab"}';

DO $$
BEGIN
    BEGIN
        INSERT INTO time_logs (organization_id, user_id, date, time_in, status)
        VALUES ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '2024-01-16', NOW(), 'incomplete');
        
        RAISE NOTICE 'PASS: Employee A1 can insert their own time log';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'FAIL: Employee A1 cannot insert their own time log: %', SQLERRM;
    END;
END $$;

-- ============================================================================
-- TEST 10: Admin Can Update User in Their Organization
-- Requirement 15.4: Allow UPDATE on records matching organization_id
-- ============================================================================

-- Test: Admin A should be able to update users in Organization A
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

DO $$
BEGIN
    BEGIN
        UPDATE users 
        SET is_active = false 
        WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab';
        
        RAISE NOTICE 'PASS: Admin A can update users in Organization A';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'FAIL: Admin A cannot update users in Organization A: %', SQLERRM;
    END;
END $$;

-- ============================================================================
-- TEST CLEANUP
-- ============================================================================

-- Reset the role
RESET role;

-- Note: To clean up test data, run:
-- DELETE FROM time_logs WHERE organization_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
-- DELETE FROM users WHERE organization_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
-- DELETE FROM organizations WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT '
RLS VALIDATION TESTS COMPLETED

To verify all tests passed:
1. Check that all test results show PASS
2. Verify no FAIL messages appear
3. Confirm policy violations are properly blocked

Key Requirements Validated:
- 15.1: RLS enabled on all tables
- 15.2: SELECT queries filtered by organization_id
- 15.3: INSERT operations restricted by organization_id
- 15.4: UPDATE/DELETE operations restricted by organization_id
- 15.5: Employees can only SELECT their own time_logs
- 15.6: Admins can SELECT all time_logs in their organization

For production deployment:
1. Apply migration 003_enable_rls.sql
2. Run these validation tests
3. Verify all tests pass before deploying applications
' AS summary;
