# RLS Quick Reference Guide

## Quick Start

### Apply RLS Migration

```bash
# Using Supabase Dashboard
1. Go to SQL Editor
2. Copy contents of supabase/migrations/003_enable_rls.sql
3. Click "Run"

# Using Supabase CLI
supabase db reset  # Applies all migrations
```

### Verify RLS is Working

```bash
# Run validation tests
1. Go to SQL Editor
2. Copy contents of supabase/tests/rls_validation.sql
3. Click "Run"
4. Verify all tests show "PASS"
```

## Policy Summary

### Organizations Table
| Policy | Operation | Who | What |
|--------|-----------|-----|------|
| `org_isolation` | SELECT | All users | Can only see their own organization |

### Users Table
| Policy | Operation | Who | What |
|--------|-----------|-----|------|
| `users_org_isolation` | SELECT | All users | Can only see users in their organization |
| `users_admin_insert` | INSERT | Admins | Can create users in their organization |
| `users_admin_update` | UPDATE | Admins | Can update users in their organization |
| `users_admin_delete` | DELETE | Admins | Can delete users in their organization |
| `users_update_own_password` | UPDATE | All users | Can update their own password |

### Time Logs Table
| Policy | Operation | Who | What |
|--------|-----------|-----|------|
| `time_logs_employee_own` | SELECT | Employees | Can only see their own logs |
| `time_logs_admin_all` | SELECT | Admins | Can see all logs in their organization |
| `time_logs_employee_insert` | INSERT | Employees | Can insert their own logs |
| `time_logs_employee_update` | UPDATE | Employees | Can update their own logs |
| `time_logs_admin_update` | UPDATE | Admins | Can update any log in their organization |

## Common Queries

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('organizations', 'users', 'time_logs');
```

### List All Policies
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test as Specific User
```sql
-- Set user context
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-uuid-here"}';

-- Run your query
SELECT * FROM time_logs;

-- Reset
RESET role;
```

## Security Guarantees

✅ **What RLS Protects:**
- Cross-organization data access
- Unauthorized user management
- Unauthorized time log access
- Data tampering by wrong users

❌ **What RLS Does NOT Protect:**
- Business logic violations (use triggers/constraints)
- SQL injection (use parameterized queries)
- Rate limiting (use application layer)
- Authentication (use Supabase Auth)

## Troubleshooting

### "permission denied for table"
**Problem:** User cannot access table  
**Solution:** Check if user is authenticated and policies exist

```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### "auth.uid() returns null"
**Problem:** No authenticated user context  
**Solution:** Ensure JWT token is in request headers

```javascript
// Supabase client automatically handles this
const { data, error } = await supabase
  .from('time_logs')
  .select('*');
```

### Slow Queries After RLS
**Problem:** Queries are slower with RLS enabled  
**Solution:** Verify indexes exist on policy columns

```sql
-- Check indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('organizations', 'users', 'time_logs');
```

## Testing Checklist

Before deploying to production:

- [ ] RLS enabled on all tables (organizations, users, time_logs)
- [ ] All validation tests pass
- [ ] Tested with multiple organizations
- [ ] Tested with admin and employee roles
- [ ] Verified cross-organization access is blocked
- [ ] Verified employees can only see own logs
- [ ] Verified admins can see all org logs
- [ ] Performance is acceptable

## Files Reference

- **Migration:** `supabase/migrations/003_enable_rls.sql`
- **Tests:** `supabase/tests/rls_validation.sql`
- **Documentation:** `docs/rls-implementation.md`
- **This Guide:** `docs/rls-quick-reference.md`

## Next Steps

After RLS is working:

1. ✅ Task 2.1: Enable RLS (COMPLETED)
2. ⏭️ Task 2.2: Write property test for RLS data isolation
3. ⏭️ Task 2.3: Write property test for employee log isolation
4. ⏭️ Task 2.4: Write property test for admin time log access

## Support

For issues or questions:
1. Check `docs/rls-implementation.md` for detailed explanations
2. Run validation tests to identify specific policy issues
3. Review PostgreSQL RLS documentation
4. Check Supabase RLS guide
