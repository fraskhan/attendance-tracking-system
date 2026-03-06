# Next.js Admin Dashboard Setup Guide

## Overview

This guide will help you set up the Next.js admin dashboard for the Multi-Organization Attendance System.

## Prerequisites

- ✅ Node.js installed (you have this)
- ✅ Backend API complete and tested (you have this)
- ✅ Supabase project configured (you have this)

## Step 1: Create Next.js Project

Run this command in your project root:

```bash
npx create-next-app@latest admin-dashboard
```

When prompted, choose:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Import alias: **Yes** (default @/*)

## Step 2: Navigate to Project

```bash
cd admin-dashboard
```

## Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install date-fns
npm install lucide-react
```

## Step 4: Create Environment File

Create `.env.local` in the admin-dashboard folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://omjwuntbttxydlsofxao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 5: Project Structure

The admin dashboard will have this structure:

```
admin-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing/login page
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Dashboard overview
│   │   │   ├── employees/
│   │   │   │   └── page.tsx    # Employee management
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx    # Daily attendance
│   │   │   └── reports/
│   │   │       └── page.tsx    # Weekly reports
│   │   └── api/                # API routes (optional)
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── auth/               # Auth components
│   │   ├── employees/          # Employee components
│   │   └── attendance/         # Attendance components
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── api.ts              # API functions
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── index.ts            # TypeScript types
├── public/
└── package.json
```

## Step 6: What We'll Build

### Pages

1. **Login Page** (`/`)
   - Admin login form
   - Redirect to dashboard on success

2. **Dashboard Overview** (`/dashboard`)
   - Key metrics (total employees, logged in today, etc.)
   - Quick stats
   - Navigation to other sections

3. **Employee Management** (`/dashboard/employees`)
   - List all employees
   - Add new employee
   - Deactivate employee
   - Reset password
   - View employee history

4. **Daily Attendance** (`/dashboard/attendance`)
   - Date selector
   - Employee attendance list
   - Photo thumbnails
   - Status indicators

5. **Weekly Reports** (`/dashboard/reports`)
   - Week selector
   - Employee summaries
   - Organization totals
   - Export functionality

### Components

1. **Auth Components**
   - LoginForm
   - ProtectedRoute

2. **Employee Components**
   - EmployeeList
   - EmployeeCard
   - AddEmployeeModal
   - ResetPasswordModal

3. **Attendance Components**
   - AttendanceTable
   - PhotoViewer
   - StatusBadge
   - DatePicker

4. **Dashboard Components**
   - MetricCard
   - Sidebar
   - Header

## Step 7: API Integration

All API calls will use the backend endpoints we built:

```typescript
// lib/api.ts example
const API_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ username, password })
  });
  return response.json();
}

// Similar functions for all other endpoints...
```

## Step 8: Authentication Flow

1. User enters credentials on login page
2. Call `/login` endpoint
3. Store access token in localStorage or cookies
4. Redirect to dashboard
5. Protected routes check for valid token
6. Include token in all API requests

## Step 9: Styling with Tailwind

The project will use Tailwind CSS for styling:
- Responsive design
- Modern UI components
- Dark mode support (optional)
- Consistent color scheme

## Step 10: Development Workflow

1. Start development server:
   ```bash
   npm run dev
   ```

2. Open browser: `http://localhost:3000`

3. Build pages incrementally:
   - Start with login page
   - Then dashboard overview
   - Then employee management
   - Then attendance views
   - Finally reports

## Next Steps

Once the project is set up, I can help you build:

1. **Phase 1: Authentication**
   - Login page
   - Protected route wrapper
   - Token management

2. **Phase 2: Dashboard Layout**
   - Sidebar navigation
   - Header with user info
   - Main content area

3. **Phase 3: Employee Management**
   - Employee list
   - Add employee modal
   - Employee actions

4. **Phase 4: Attendance Views**
   - Daily attendance table
   - Photo viewer
   - Status indicators

5. **Phase 5: Reports**
   - Weekly report view
   - Data visualization
   - Export functionality

## Tips

- Use React Query for data fetching and caching
- Implement loading states for better UX
- Add error handling for all API calls
- Use TypeScript for type safety
- Test each page as you build it

## Ready to Start?

Run the commands above to create the Next.js project, then let me know when you're ready to start building the pages!

I'll help you create each component and page step by step.
