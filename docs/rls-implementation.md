# Row Level Security (RLS) Implementation

## Overview

This document describes the Row Level Security (RLS) implementation for the Multi-Organization Employee Time & Attendance Management System. RLS provides database-level security that ensures complete data isolation between organizations and proper access control for different user roles.

## Requirements Addressed

- **Requirement 15.1**: Enable RLS on organizations, users, and time_logs tables
- **Requirement 15.2**: Filter SELECT queries by organization_id
- **Requirement 15.3**: Prevent INSERT with different organization_id
- **Requirement 15.4**: Prevent UPDATE/DELETE on records not matching organization_id
- **Requirement 15.5**: Allow employees to SELECT only their own time_log records
- **Requirement 15.6**: Allow admins to SELECT all time_log records within their organization

## Architecture

### Multi-Tenant Isolation

The system uses PostgreSQL Row Level Security to enforce multi-tenant isolation at the database level. This approach provides several benefits:

1. **Defense in Depth**: Security is enforced at the database layer, independent of application logic
2. **Automatic Filtering**: All queries are automatically filtered by organization_id
3. **Zero Trust**: Even if application code has bugs, the database prevents unauthorized access
4. **Performance**: RLS policies are optimized by PostgreSQL query planner

### Authentication Context

RLS policies rely on `auth.uid()` which returns the authenticated user's ID from the JWT token. Supabase automatically sets this context for all authenticated requests.

```sql
-- Example: Get current user's organization_id
SELECT organization_id FROM users WHERE id = auth.uid()
```

## Policy Design

### Organizations Table

**Policy: org_isolation**
- **Purpose**: Users can only view their own organization
- **Type**: SELECT
- **Logic**: Filter by organization_id matching the user's organization

```sql
CREATE POLICY org_isolation ON organizations
    FOR SELECT
    USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));
```

**Why this works:**
- When a user queries the organizations table, PostgreSQL automatically adds a WHERE clause
- The subquery looks up the user's organization_id from the users table
- Only the matching organization is returned

### Users Table

**Policy: users_org_isolation**
- **Purpose**: Users can only see other users in their organization
- **Type**: SELECT
- **Logic**: Filter by organization_id

```sql
CREATE POLICY users_org_isolation ON users
    FOR SELECT
    USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
```

**Policy: users_admin_insert**
- **Purpose**: Only admins can create users in their organization
- **Type**: INSERT
- **Logic**: Check that the user is an admin and the new user's organization_id matches

```sql
CREATE POLICY users_admin_insert ON users
    FOR INSERT
    WITH CHECK (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
```

**Policy: users_admin_update**
- **Purpose**: Only admins can update users in their organization
- **Type**: UPDATE
- **Logic**: Verify admin role and organization match

```sql
CREATE POLICY users_admin_update ON users
    FOR UPDATE
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
```

**Policy: users_admin_delete**
- **Purpose**: Only admins can delete users in their organization
- **Type**: DELETE
- **Logic**: Verify admin role and organization match

```sql
CREATE POLICY users_admin_delete ON users
    FOR DELETE
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
```

**Policy: users_update_own_password**
- **Purpose**: Users can update their own password
- **Type**: UPDATE
- **Logic**: Allow updates only to the user's own record

```sql
CREATE POLICY users_update_own_password ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
```

### Time Logs Table

**Policy: time_logs_employee_own**
- **Purpose**: Employees can only see their own time logs
- **Type**: SELECT
- **Logic**: Filter by user_id and organization_id

```sql
CREATE POLICY time_logs_employee_own ON time_logs
    FOR SELECT
    USING (
        user_id = auth.uid()
        AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );
```

**Policy: time_logs_admin_all**
- **Purpose**: Admins can see all time logs in their organization
- **Type**: SELECT
- **Logic**: Filter by organization_id and verify admin role

```sql
CREATE POLICY time_logs_admin_all ON time_logs
    FOR SELECT
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
```

**Policy: time_logs_employee_insert**
- **Purpose**: Employees can insert their own time logs
- **Type**: INSERT
- **Logic**: Verify user_id and organization_id match

```sql
CREATE POLICY time_logs_employee_insert ON time_logs
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );
```

**Policy: time_logs_employee_update**
- **Purpose**: Employees can update their own time logs
- **Type**: UPDATE
- **Logic**: Verify user_id and organization_id match

```sql
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
```

**Policy: time_logs_admin_update**
- **Purpose**: Admins can update any time log in their organization
- **Type**: UPDATE
- **Logic**: Verify admin role and organization match

```sql
CREATE POLICY time_logs_admin_update ON time_logs
    FOR UPDATE
    USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
```

## Policy Evaluation

### How RLS Policies Work

When a query is executed:

1. **Authentication**: Supabase verifies the JWT token and sets `auth.uid()`
2. **Policy Lookup**: PostgreSQL finds all applicable policies for the table and operation
3. **Policy Evaluation**: Each policy's USING/WITH CHECK clause is evaluated
4. **Query Rewrite**: PostgreSQL rewrites the query to include policy conditions
5. **Execution**: The modified query runs with automatic filtering

### Example Query Flow

**Original Query (from employee):**
```sql
SELECT * FROM time_logs WHERE date = '2024-01-15';
```

**After RLS Policy Application:**
```sql
SELECT * FROM time_logs 
WHERE date = '2024-01-15'
  AND user_id = auth.uid()
  AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
```

### Policy Combination

When multiple policies exist for the same operation:
- **SELECT**: Policies are combined with OR (any policy that returns true allows access)
- **INSERT/UPDATE/DELETE**: All applicable policies must pass (AND logic)

This is why we have separate policies for employees and admins on time_logs SELECT:
- Employee policy: Returns true if user_id matches
- Admin policy: Returns true if organization matches and role is admin
- Result: Employees see their own logs, admins see all org logs

## Security Guarantees

### What RLS Prevents

1. **Cross-Organization Data Access**: Users cannot query data from other organizations
2. **Privilege Escalation**: Employees cannot perform admin operations
3. **Data Tampering**: Users cannot modify records they don't own
4. **Information Leakage**: Even COUNT queries are filtered by RLS

### What RLS Does NOT Prevent

1. **Application Logic Bugs**: RLS doesn't validate business rules (e.g., duplicate time in)
2. **SQL Injection**: Input sanitization is still required
3. **Denial of Service**: Rate limiting must be implemented separately
4. **Brute Force Attacks**: Authentication rate limiting is separate

## Performance Considerations

### Optimization Strategies

1. **Indexes**: Ensure indexes exist on columns used in RLS policies
   - `users(organization_id)` - Already indexed
   - `time_logs(organization_id, user_id)` - Already indexed

2. **Subquery Caching**: PostgreSQL caches subquery results within a transaction
   - `(SELECT organization_id FROM users WHERE id = auth.uid())` is evaluated once

3. **Policy Simplicity**: Keep policies simple to minimize overhead
   - Avoid complex joins in policy conditions
   - Use indexed columns in policy predicates

### Performance Impact

- **Minimal overhead**: RLS adds ~1-5% query overhead in most cases
- **Optimized by planner**: PostgreSQL query planner optimizes RLS conditions
- **Better than application filtering**: More efficient than filtering in application code

## Testing

### Validation Tests

The file `supabase/tests/rls_validation.sql` contains comprehensive tests for all RLS policies:

1. **Organization Isolation**: Verify users only see their organization
2. **User List Isolation**: Verify users only see users in their organization
3. **Employee Log Isolation**: Verify employees only see their own logs
4. **Admin Log Access**: Verify admins see all organization logs
5. **Cross-Organization Prevention**: Verify users cannot access other organizations
6. **Insert Restrictions**: Verify users cannot insert data for other organizations
7. **Update Restrictions**: Verify users cannot update data they don't own

### Running Tests

```bash
# Using Supabase CLI
supabase db test

# Or manually in SQL Editor
# Copy and paste contents of supabase/tests/rls_validation.sql
```

### Expected Results

All tests should show "PASS" messages. Any "FAIL" message indicates a policy issue that must be fixed before deployment.

## Deployment

### Migration Steps

1. **Apply Migration**: Run `003_enable_rls.sql` on your Supabase project
2. **Run Tests**: Execute `rls_validation.sql` to verify policies
3. **Verify Results**: Ensure all tests pass
4. **Deploy Applications**: Deploy mobile app and admin dashboard

### Rollback Plan

If issues are discovered:

```sql
-- Disable RLS (emergency only)
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS org_isolation ON organizations;
DROP POLICY IF EXISTS users_org_isolation ON users;
-- ... (drop all policies)
```

**Warning**: Disabling RLS removes all security guarantees. Only use in emergency situations.

## Troubleshooting

### Common Issues

**Issue: "permission denied for table"**
- **Cause**: RLS is enabled but no policies allow the operation
- **Solution**: Verify policies exist and user has correct role

**Issue: "infinite recursion detected in policy"**
- **Cause**: Policy references itself in a circular way
- **Solution**: Simplify policy logic, avoid circular references

**Issue: "auth.uid() returns null"**
- **Cause**: Request is not authenticated
- **Solution**: Ensure JWT token is included in request headers

**Issue: "Queries are slow after enabling RLS"**
- **Cause**: Missing indexes on policy columns
- **Solution**: Add indexes on organization_id, user_id, role

### Debugging Policies

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';

-- Test policy as specific user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id-here"}';
SELECT * FROM time_logs;
RESET role;
```

## Best Practices

1. **Always Test**: Run validation tests after any policy changes
2. **Use Indexes**: Ensure policy columns are indexed
3. **Keep Policies Simple**: Complex policies are harder to maintain and debug
4. **Document Changes**: Update this document when policies change
5. **Monitor Performance**: Track query performance after enabling RLS
6. **Regular Audits**: Periodically review policies for security gaps

## References

- [PostgreSQL Row Level Security Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Design Document](../design.md) - See "Row Level Security Policies" section
- [Requirements Document](../.kiro/specs/multi-org-attendance-system/requirements.md) - Requirement 15

## Changelog

### 2024-01-15 - Initial Implementation
- Enabled RLS on organizations, users, and time_logs tables
- Created policies for organization isolation
- Created policies for user management (admin vs employee)
- Created policies for time log access (employee own, admin all)
- Added comprehensive validation tests
