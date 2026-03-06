# Admin Dashboard - Multi-Organization Attendance System

A Next.js admin dashboard for managing employees and viewing attendance records.

## Features

- Admin authentication with role-based access
- Dashboard overview with key metrics
- Employee management (create, deactivate, reset passwords)
- Daily attendance viewing with photo verification
- Weekly reports with CSV export
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- Backend API running (Supabase Edge Functions)
- Admin account created via backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create `.env.local` file (already created):
```env
NEXT_PUBLIC_SUPABASE_URL=https://omjwuntbttxydlsofxao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Start development server:
```bash
npm run dev
```

4. Open browser:
```
http://localhost:3000
```

## Project Structure

```
admin-dashboard/
├── app/
│   ├── page.tsx                    # Login page
│   ├── layout.tsx                  # Root layout
│   └── dashboard/
│       ├── layout.tsx              # Dashboard layout with sidebar
│       ├── page.tsx                # Dashboard overview
│       ├── employees/
│       │   └── page.tsx            # Employee management
│       ├── attendance/
│       │   └── page.tsx            # Daily attendance
│       └── reports/
│           └── page.tsx            # Weekly reports
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.tsx     # Auth wrapper
│   │   └── Sidebar.tsx             # Navigation sidebar
│   ├── lib/
│   │   ├── api.ts                  # API functions
│   │   ├── auth.ts                 # Auth utilities
│   │   ├── supabase.ts             # Supabase config
│   │   └── utils.ts                # Helper functions
│   └── types/
│       └── index.ts                # TypeScript types
└── .env.local                      # Environment variables
```

## Pages

### 1. Login Page (`/`)
- Admin login form
- Validates admin role
- Redirects to dashboard on success

### 2. Dashboard Overview (`/dashboard`)
- Total active employees
- Employees logged in today
- Missing time outs today
- Total hours logged today
- Quick action links

### 3. Employee Management (`/dashboard/employees`)
- List all employees
- Add new employee
- View employee status (active/inactive)
- Deactivate employee
- Reset employee password
- Copy credentials to clipboard

### 4. Daily Attendance (`/dashboard/attendance`)
- Select date to view
- Employee attendance list
- Time in/out records
- Total hours worked
- Status indicators
- View attendance photos

### 5. Weekly Reports (`/dashboard/reports`)
- Select week to view
- Employee summaries
- Total hours per employee
- Days worked
- Missing time outs
- Days not logged
- Organization totals
- Export to CSV

## API Integration

All API calls use the backend endpoints:

- `POST /login` - Admin authentication
- `GET /list-employees` - Get all employees
- `POST /create-employee` - Create new employee
- `PATCH /deactivate-employee` - Deactivate employee
- `POST /reset-password` - Reset employee password
- `GET /daily-attendance` - Get daily attendance
- `GET /weekly-report` - Get weekly report
- `GET /dashboard-overview` - Get dashboard metrics

## Authentication Flow

1. User enters credentials on login page
2. API validates credentials and role
3. Access token stored in localStorage
4. Token included in all API requests via `x-user-token` header
5. Protected routes check for valid token
6. Logout clears token and redirects to login

## Development

### Run development server:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Run linter:
```bash
npm run lint
```

## Technologies

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- React Query (for data fetching)
- Lucide React (icons)
- date-fns (date formatting)

## Testing

To test the dashboard:

1. Create an admin account using the backend API:
```bash
node test-register-admin.js
```

2. Login with admin credentials
3. Test each feature:
   - Create employees
   - View attendance
   - Generate reports
   - Deactivate employees
   - Reset passwords

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the project:
```bash
npm run build
```

Start the server:
```bash
npm start
```

## Environment Variables

Required variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Security

- Admin-only access enforced
- Protected routes with authentication check
- Token-based authentication
- Role validation on login
- Secure password handling (backend)
- Multi-tenant data isolation (RLS)

## Troubleshooting

### Cannot login
- Verify backend API is running
- Check environment variables
- Ensure admin account exists
- Check browser console for errors

### API errors
- Verify Supabase URL and keys
- Check network tab for failed requests
- Ensure backend functions are deployed

### TypeScript errors
- Run `npm install` to ensure dependencies
- Check tsconfig.json path configuration
- Restart TypeScript server in IDE

## Support

For issues or questions, refer to:
- Backend API documentation
- Supabase documentation
- Next.js documentation
