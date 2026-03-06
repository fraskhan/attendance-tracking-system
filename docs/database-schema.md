# Database Schema Reference

## Overview

The Multi-Organization Attendance System uses PostgreSQL with Row Level Security for complete multi-tenant data isolation. This document provides a quick reference for the database schema.

## Entity Relationship Diagram

```
┌─────────────────┐
│  organizations  │
│─────────────────│
│ id (PK)         │
│ name            │
│ created_at      │
│ created_by      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────┴────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ organization_id │◄────┐
│ full_name       │     │
│ username        │     │
│ password_hash   │     │
│ role            │     │
│ must_change_pwd │     │
│ is_active       │     │
│ created_at      │     │
└────────┬────────┘     │
         │              │
         │ 1:N          │
         │              │
┌────────┴────────┐     │
│   time_logs     │     │
│─────────────────│     │
│ id (PK)         │     │
│ organization_id │─────┘
│ user_id         │
│ date            │
│ time_in         │
│ time_in_photo   │
│ time_out        │
│ time_out_photo  │
│ total_hours     │
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Tables

### organizations

Stores organization/tenant information for multi-tenant isolation.

| Column      | Type         | Constraints | Description                    |
|-------------|--------------|-------------|--------------------------------|
| id          | UUID         | PRIMARY KEY | Unique organization identifier |
| name        | TEXT         | NOT NULL    | Organization name              |
| created_at  | TIMESTAMPTZ  | DEFAULT NOW | Creation timestamp             |
| created_by  | UUID         |             | Admin user who created org     |

**Indexes**: None (small table, primary key sufficient)

---

### users

Stores both admin and employee accounts with organization association.

| Column               | Type    | Constraints                      | Description                           |
|----------------------|---------|----------------------------------|---------------------------------------|
| id                   | UUID    | PRIMARY KEY                      | Unique user identifier                |
| organization_id      | UUID    | NOT NULL, FK → organizations(id) | Organization association              |
| full_name            | TEXT    | NOT NULL                         | User's full name                      |
| username             | TEXT    | NOT NULL, UNIQUE                 | Login username                        |
| password_hash        | TEXT    | NOT NULL                         | Bcrypt hashed password                |
| role                 | TEXT    | NOT NULL, CHECK                  | 'admin' or 'employee'                 |
| must_change_password | BOOLEAN | DEFAULT FALSE                    | Force password change on next login   |
| is_active            | BOOLEAN | DEFAULT TRUE                     | Account active status                 |
| created_at           | TIMESTAMPTZ | DEFAULT NOW                  | Account creation timestamp            |

**Constraints**:
- `UNIQUE(organization_id, username)` - Username unique within organization
- `CHECK (role IN ('admin', 'employee'))` - Valid roles only

**Indexes**:
- `idx_users_org` on `organization_id`
- `idx_users_username` on `username`
- `idx_users_role` on `role`
- `idx_users_active` on `is_active`

---

### time_logs

Stores employee time in/out records with photo verification.

| Column             | Type         | Constraints                      | Description                        |
|--------------------|--------------|----------------------------------|------------------------------------|
| id                 | UUID         | PRIMARY KEY                      | Unique log identifier              |
| organization_id    | UUID         | NOT NULL, FK → organizations(id) | Organization association           |
| user_id            | UUID         | NOT NULL, FK → users(id)         | Employee who logged time           |
| date               | DATE         | NOT NULL                         | Date of attendance (YYYY-MM-DD)    |
| time_in            | TIMESTAMPTZ  |                                  | Time in timestamp                  |
| time_in_photo_url  | TEXT         |                                  | Storage URL for time in photo      |
| time_out           | TIMESTAMPTZ  |                                  | Time out timestamp                 |
| time_out_photo_url | TEXT         |                                  | Storage URL for time out photo     |
| total_hours        | DECIMAL(5,2) |                                  | Calculated hours (auto-computed)   |
| status             | TEXT         | NOT NULL, DEFAULT 'incomplete'   | 'incomplete', 'completed', 'missing' |
| created_at         | TIMESTAMPTZ  | DEFAULT NOW                      | Record creation timestamp          |
| updated_at         | TIMESTAMPTZ  | DEFAULT NOW                      | Last update timestamp              |

**Constraints**:
- `UNIQUE(organization_id, user_id, date)` - One log per employee per day
- `CHECK (status IN ('completed', 'missing', 'incomplete'))` - Valid statuses only

**Indexes**:
- `idx_time_logs_org` on `organization_id`
- `idx_time_logs_user` on `user_id`
- `idx_time_logs_date` on `date`
- `idx_time_logs_status` on `status`
- `idx_time_logs_org_date` on `(organization_id, date)` - Composite for daily reports
- `idx_time_logs_user_date` on `(user_id, date)` - Composite for employee history

---

## Database Functions & Triggers

### update_updated_at_column()

**Purpose**: Automatically updates the `updated_at` timestamp on time_logs

**Trigger**: `update_time_logs_updated_at` - BEFORE UPDATE on time_logs

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### validate_time_order()

**Purpose**: Ensures time_out is after time_in

**Trigger**: `check_time_order` - BEFORE INSERT OR UPDATE on time_logs

**Validation**: Raises exception if `time_out <= time_in`

```sql
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
```

---

### calculate_total_hours()

**Purpose**: Automatically calculates total_hours and updates status

**Trigger**: `auto_calculate_total_hours` - BEFORE INSERT OR UPDATE on time_logs

**Logic**:
- Calculates hours as `(time_out - time_in) / 3600`
- Rounds to 2 decimal places
- Sets status to 'completed' when both times exist

```sql
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
```

---

## Storage Bucket

### attendance-photos

**Configuration**:
- **Bucket ID**: `attendance-photos`
- **Public**: `false` (private bucket)
- **File Size Limit**: 5MB
- **Allowed Types**: image/jpeg, image/jpg, image/png

**Path Structure**:
```
attendance-photos/
  {organization_id}/
    {user_id}/
      2024-01-15_time_in.jpg
      2024-01-15_time_out.jpg
      2024-01-16_time_in.jpg
      ...
```

**Storage Policies**:
1. `employee_upload_own_photos` - Employees can upload to their own folder
2. `employee_read_own_photos` - Employees can read their own photos
3. `admin_read_org_photos` - Admins can read all photos in their org
4. `admin_delete_org_photos` - Admins can delete photos in their org

---

## Common Queries

### Get all employees in an organization

```sql
SELECT id, full_name, username, role, is_active, created_at
FROM users
WHERE organization_id = $1
ORDER BY created_at DESC;
```

### Get today's attendance for an organization

```sql
SELECT 
    u.id,
    u.full_name,
    tl.time_in,
    tl.time_out,
    tl.total_hours,
    tl.status,
    tl.time_in_photo_url,
    tl.time_out_photo_url
FROM users u
LEFT JOIN time_logs tl ON u.id = tl.user_id AND tl.date = CURRENT_DATE
WHERE u.organization_id = $1 AND u.role = 'employee' AND u.is_active = true
ORDER BY u.full_name;
```

### Get employee's time logs for a date range

```sql
SELECT 
    date,
    time_in,
    time_out,
    total_hours,
    status,
    time_in_photo_url,
    time_out_photo_url
FROM time_logs
WHERE user_id = $1 
    AND date BETWEEN $2 AND $3
ORDER BY date DESC;
```

### Find missing time outs

```sql
SELECT 
    tl.id,
    tl.user_id,
    tl.date,
    tl.time_in,
    u.full_name
FROM time_logs tl
JOIN users u ON tl.user_id = u.id
WHERE tl.organization_id = $1
    AND tl.time_in IS NOT NULL
    AND tl.time_out IS NULL
    AND tl.date < CURRENT_DATE
    AND tl.status != 'missing';
```

### Weekly report for an organization

```sql
SELECT 
    u.id,
    u.full_name,
    COUNT(tl.id) FILTER (WHERE tl.status = 'completed') as days_worked,
    SUM(tl.total_hours) as total_hours,
    COUNT(tl.id) FILTER (WHERE tl.status = 'missing') as missing_time_outs
FROM users u
LEFT JOIN time_logs tl ON u.id = tl.user_id 
    AND tl.date BETWEEN $2 AND $3
WHERE u.organization_id = $1 
    AND u.role = 'employee' 
    AND u.is_active = true
GROUP BY u.id, u.full_name
ORDER BY u.full_name;
```

---

## Data Types Reference

| Type        | Description                          | Example                    |
|-------------|--------------------------------------|----------------------------|
| UUID        | Universally unique identifier        | `550e8400-e29b-41d4-a716-446655440000` |
| TEXT        | Variable-length string               | `"John Doe"`               |
| TIMESTAMPTZ | Timestamp with timezone              | `2024-01-15 08:30:00+00`   |
| DATE        | Date without time                    | `2024-01-15`               |
| DECIMAL(5,2)| Decimal with 5 digits, 2 after point | `8.50` (hours)             |
| BOOLEAN     | True/false value                     | `true`, `false`            |

---

## Status Values

### time_logs.status

| Value        | Description                                      |
|--------------|--------------------------------------------------|
| `incomplete` | Only time_in recorded, waiting for time_out      |
| `completed`  | Both time_in and time_out recorded               |
| `missing`    | Date passed without time_out being recorded      |

### users.role

| Value      | Description                                      |
|------------|--------------------------------------------------|
| `admin`    | Organization administrator with full access      |
| `employee` | Regular employee with limited access             |

---

## Best Practices

1. **Always use parameterized queries** to prevent SQL injection
2. **Use transactions** for operations that modify multiple tables
3. **Leverage RLS policies** instead of application-level filtering
4. **Use indexes** for frequently queried columns
5. **Let triggers handle** automatic calculations (total_hours, updated_at)
6. **Validate constraints** at database level, not just application level
7. **Use UUIDs** for all primary keys for better distribution and security

---

## Migration Management

Migrations are located in `supabase/migrations/` and should be:
- **Numbered sequentially**: `001_`, `002_`, etc.
- **Idempotent**: Safe to run multiple times
- **Reversible**: Include rollback instructions in comments
- **Tested**: Test on local instance before production

---

For more information, see:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
