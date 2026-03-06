# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Multi-Organization Employee Time & Attendance Management System.

## Functions

### register-admin

Admin registration endpoint that creates a new organization and admin user account.

**Endpoint:** `POST /functions/v1/register-admin`

**Request Body:**
```json
{
  "full_name": "John Doe",
  "username": "johndoe",
  "password": "SecurePass123",
  "organization_name": "Acme Corporation"
}
```

**Response (201 Created):**
```json
{
  "user_id": "uuid",
  "organization_id": "uuid",
  "access_token": "jwt_token",
  "refresh_token": "jwt_token"
}
```

**Error Responses:**
- `400 MISSING_FIELDS` - Required fields are missing
- `400 INVALID_PASSWORD` - Password doesn't meet requirements
- `409 USERNAME_EXISTS` - Username already taken
- `500 ORG_CREATION_FAILED` - Failed to create organization
- `500 USER_CREATION_FAILED` - Failed to create user
- `500 INTERNAL_ERROR` - Unexpected error

## Development

### Prerequisites

- Supabase CLI installed
- Local Supabase instance running

### Running Functions Locally

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test a function
curl -i --location --request POST 'http://localhost:54321/functions/v1/register-admin' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"full_name":"Test Admin","username":"testadmin","password":"TestPass123","organization_name":"Test Org"}'
```

### Running Tests

```bash
# Run tests for a specific function
deno test --allow-net --allow-env supabase/functions/register-admin/index.test.ts

# Run all function tests
deno test --allow-net --allow-env supabase/functions/**/*.test.ts
```

### Deploying Functions

```bash
# Deploy a specific function
supabase functions deploy register-admin

# Deploy all functions
supabase functions deploy
```

## Environment Variables

Functions require the following environment variables:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `SUPABASE_JWT_SECRET` - JWT secret for token generation
- `SUPABASE_ANON_KEY` - Anonymous key for client requests

These are automatically available in deployed functions. For local development, they're set by the Supabase CLI.

## Password Requirements

All passwords must meet the following requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Security

- Passwords are hashed using bcrypt before storage
- JWT tokens include organization_id claim for multi-tenant isolation
- Service role key is used for admin operations (bypassing RLS)
- CORS headers are configured for cross-origin requests
