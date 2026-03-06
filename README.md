# Multi-Organization Employee Time & Attendance Management System

A multi-tenant SaaS application for tracking employee attendance with photo verification. The system enables organizations to manage employee time logging through a mobile app while providing administrators with comprehensive reporting and verification tools through a web dashboard.

## Features

### For Employees (Mobile App)
- 📸 Time in/out with photo verification
- 📊 View personal attendance history
- 🔐 Secure authentication with forced password change on first login
- 📱 Built with React Native/Expo for iOS and Android

### For Administrators (Web Dashboard)
- 👥 Employee management (create, deactivate, reset passwords)
- 📅 Daily attendance monitoring with photo verification
- 📈 Weekly reports and analytics
- 🔍 Photo verification and comparison tools
- 💼 Organization overview dashboard
- 🌐 Built with Next.js

### Security & Architecture
- 🔒 Multi-tenant data isolation using PostgreSQL Row Level Security (RLS)
- 🏢 Complete organization separation at database level
- 🔐 Secure authentication with JWT tokens
- 📦 Cloud storage for photos with access control
- ⚡ Powered by Supabase (PostgreSQL + Auth + Storage)

## Tech Stack

- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Mobile App**: React Native with Expo
- **Admin Dashboard**: Next.js with TypeScript
- **Database**: PostgreSQL with Row Level Security
- **Storage**: Supabase Storage with access policies
- **Testing**: Jest, fast-check (property-based testing)

## Project Structure

```
.
├── supabase/                 # Database and backend configuration
│   ├── migrations/          # SQL migration files
│   │   ├── 001_initial_schema.sql
│   │   └── 002_storage_setup.sql
│   ├── config.toml          # Supabase CLI configuration
│   └── README.md            # Supabase setup guide
├── mobile/                   # React Native mobile app (to be created)
├── admin-dashboard/          # Next.js admin dashboard (to be created)
├── scripts/                  # Setup and utility scripts
│   └── setup-supabase.sh    # Supabase setup helper
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available)
- Supabase CLI (optional, for local development)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd multi-org-attendance-system

# Copy environment variables
cp .env.example .env
```

### 2. Set Up Supabase

#### Option A: Using Supabase Dashboard (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migrations:
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_storage_setup.sql`
3. Get your credentials from Project Settings > API
4. Update `.env` with your credentials

#### Option B: Using Setup Script

```bash
# Make the script executable
chmod +x scripts/setup-supabase.sh

# Run the setup script
./scripts/setup-supabase.sh
```

See [supabase/README.md](supabase/README.md) for detailed setup instructions.

### 3. Configure Environment

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema

### Tables

1. **organizations** - Stores organization/tenant information
2. **users** - Stores admin and employee accounts with role-based access
3. **time_logs** - Stores time in/out records with photo verification

### Key Features

- **Automatic total hours calculation** via database triggers
- **Time validation** ensures time_out is after time_in
- **Unique constraints** prevent duplicate time entries per day
- **Cascading deletes** maintain referential integrity
- **Performance indexes** on frequently queried columns

### Storage

- **Bucket**: `attendance-photos`
- **Path structure**: `{organization_id}/{user_id}/{date}_time_in.jpg`
- **Access control**: Enforced via storage policies

## Development Roadmap

- [x] Task 1: Set up Supabase project and database schema
- [ ] Task 2: Implement Row Level Security policies
- [ ] Task 3: Implement Supabase Storage policies
- [ ] Task 4: Implement authentication and user management backend
- [ ] Task 5-11: Backend API development
- [ ] Task 12-15: Mobile app development
- [ ] Task 16-21: Admin dashboard development
- [ ] Task 22: End-to-end testing

See [.kiro/specs/multi-org-attendance-system/tasks.md](.kiro/specs/multi-org-attendance-system/tasks.md) for the complete implementation plan.

## Testing

The project uses a dual testing approach:

- **Unit Tests**: Validate specific scenarios and edge cases
- **Property-Based Tests**: Verify universal properties using fast-check

```bash
# Run all tests (once implemented)
npm test

# Run property-based tests
npm run test:properties
```

## Security

### Multi-Tenant Isolation

- Complete data isolation between organizations using PostgreSQL RLS
- All queries automatically filtered by organization_id
- No application-level filtering required

### Authentication

- Secure password hashing with bcrypt
- JWT tokens with organization_id claims
- Rate limiting on login endpoints
- Forced password change on first login

### Photo Storage

- Organization-level access control
- Employees can only access their own photos
- Admins can access all photos in their organization
- Signed URLs with expiration

## API Documentation

API endpoints will be documented as they are implemented. The system follows RESTful conventions:

- `/auth/*` - Authentication endpoints
- `/admin/*` - Admin-only endpoints
- `/time-logs/*` - Time logging endpoints

## Contributing

This project follows the implementation plan in `.kiro/specs/multi-org-attendance-system/`. Each task should:

1. Reference specific requirements from requirements.md
2. Follow the design specifications in design.md
3. Include appropriate tests (unit and property-based)
4. Update documentation as needed

## License

[Your License Here]

## Support

For issues and questions:
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the spec files in `.kiro/specs/multi-org-attendance-system/`
- Open an issue in the repository

---

Built with ❤️ using Supabase, React Native, and Next.js
