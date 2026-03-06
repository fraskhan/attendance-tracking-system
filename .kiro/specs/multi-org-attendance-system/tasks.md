# Implementation Plan: Multi-Organization Employee Time & Attendance Management System

## Overview

This implementation plan breaks down the multi-tenant attendance tracking system into discrete, incremental coding tasks. The system will be built using Supabase (PostgreSQL + Auth + Storage), React Native/Expo for the mobile app, and Next.js for the admin dashboard. Each task builds on previous work, with testing integrated throughout to validate correctness early.

## Tasks

- [x] 1. Set up Supabase project and database schema
  - Create Supabase project and configure environment
  - Create organizations, users, and time_logs tables with proper constraints
  - Set up indexes for performance optimization
  - Configure Supabase Storage bucket for attendance photos
  - _Requirements: 1.1, 1.5, 13.1_

- [ ]* 1.1 Write property test for database schema constraints
  - **Property 25: Date Format Validation**
  - **Property 26: Time Format Validation**
  - **Validates: Requirements 19.6, 19.7_

- [ ] 2. Implement Row Level Security policies
  - [x] 2.1 Enable RLS on all tables (organizations, users, time_logs)
    - Write RLS policies for organization isolation
    - Write RLS policies for user management (admin vs employee)
    - Write RLS policies for time log access (employee own, admin all)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [ ]* 2.2 Write property test for RLS data isolation
    - **Property 1: Row Level Security Data Isolation**
    - **Validates: Requirements 1.2**

  - [ ]* 2.3 Write property test for employee log isolation
    - **Property 12: Employee Log View Isolation**
    - **Validates: Requirements 7.1**

  - [ ]* 2.4 Write property test for admin time log access
    - **Property 20: Admin Time Log Access Within Organization**
    - **Validates: Requirements 15.6**

- [ ] 3. Implement Supabase Storage policies for photos
  - [x] 3.1 Create storage bucket policies for photo access control
    - Write policy for employee photo upload (own photos only)
    - Write policy for employee photo read (own photos only)
    - Write policy for admin photo read (all org photos)
    - _Requirements: 13.2, 13.3, 13.4_

  - [ ]* 3.2 Write property test for photo access organization boundary
    - **Property 16: Photo Access Organization Boundary**
    - **Validates: Requirements 13.2, 13.3**

  - [ ]* 3.3 Write property test for employee photo access boundary
    - **Property 17: Employee Photo Access User Boundary**
    - **Validates: Requirements 13.4**


- [ ] 4. Implement authentication and user management backend
  - [x] 4.1 Create admin registration endpoint with organization creation
    - Implement POST /auth/register-admin endpoint
    - Create organization record and link admin user
    - Hash password using bcrypt
    - Return JWT token with organization_id claim
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.2 Write property test for admin registration
    - **Property 2: Admin Registration Creates Organization**
    - **Property 3: Admin Linked to Created Organization**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 4.3 Create login endpoint with validation
    - Implement POST /auth/login endpoint
    - Validate credentials against database
    - Check is_active flag
    - Return JWT with user info and must_change_password flag
    - Implement rate limiting for brute force protection
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.7_

  - [ ]* 4.4 Write property test for authentication
    - **Property 18: Valid Credentials Authentication Success**
    - **Property 15: Deactivated Employee Authentication Rejection**
    - **Validates: Requirements 14.1, 14.5**

  - [x] 4.5 Create password change endpoint
    - Implement POST /auth/change-password endpoint
    - Validate current password
    - Validate new password against requirements
    - Update password_hash and set must_change_password to false
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 4.6 Write property test for password validation
    - **Property 19: Password Validation Requirements**
    - **Validates: Requirements 14.6**

  - [ ]* 4.7 Write property test for password change flag
    - **Property 8: Password Change Clears Flag**
    - **Validates: Requirements 4.3**

- [ ] 5. Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement employee management endpoints
  - [x] 6.1 Create employee creation endpoint
    - Implement POST /admin/employees endpoint
    - Generate unique username from full name
    - Generate secure random password
    - Set must_change_password to true and is_active to true
    - Return credentials to admin
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 6.2 Write property test for username generation
    - **Property 4: Username Uniqueness Within Organization**
    - **Validates: Requirements 3.2**

  - [ ]* 6.3 Write property test for password generation
    - **Property 5: Generated Password Security Requirements**
    - **Property 6: New Employee Must Change Password**
    - **Validates: Requirements 3.3, 3.4**

  - [x] 6.4 Create employee list endpoint
    - Implement GET /admin/employees endpoint
    - Return all employees in admin's organization (RLS enforced)
    - Include user_id, full_name, username, is_active, created_at
    - _Requirements: 9.1_

  - [ ]* 6.5 Write property test for admin employee list isolation
    - **Property 14: Admin Employee List Organization Isolation**
    - **Validates: Requirements 9.1**

  - [x] 6.6 Create employee deactivation endpoint
    - Implement PATCH /admin/employees/:id/deactivate endpoint
    - Set is_active to false
    - Verify admin can only deactivate employees in their org (RLS)
    - _Requirements: 9.4, 9.5, 17.1, 17.2_

  - [x] 6.7 Create password reset endpoint
    - Implement POST /admin/employees/:id/reset-password endpoint
    - Generate new secure random password
    - Update password_hash and set must_change_password to true
    - Return new password to admin
    - Log password reset action
    - _Requirements: 9.6, 9.7, 18.1, 18.2, 18.3, 18.4, 18.5_

  - [ ]* 6.8 Write property test for password reset
    - **Property 23: Password Reset Sets Change Flag**
    - **Validates: Requirements 18.3**

- [ ] 7. Implement time logging endpoints
  - [x] 7.1 Create time in endpoint with photo upload
    - Implement POST /time-logs/time-in endpoint (multipart/form-data)
    - Validate no existing time_in for current date
    - Upload photo to Supabase Storage with path: org_id/user_id/YYYY-MM-DD_time_in.jpg
    - Create time_log record with time_in and photo URL
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 7.2 Write property test for duplicate time in prevention
    - **Property 9: Duplicate Time In Prevention**
    - **Validates: Requirements 5.5**

  - [x] 7.3 Create time out endpoint with photo upload
    - Implement POST /time-logs/time-out endpoint (multipart/form-data)
    - Validate time_in exists for current date
    - Validate time_out is after time_in
    - Upload photo to Supabase Storage with path: org_id/user_id/YYYY-MM-DD_time_out.jpg
    - Update time_log with time_out, photo URL, calculate total_hours, set status to 'completed'
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ]* 7.4 Write property test for time out validation
    - **Property 11: Time Out After Time In Validation**
    - **Validates: Requirements 6.8**

  - [ ]* 7.5 Write property test for total hours calculation
    - **Property 10: Total Hours Calculation Accuracy**
    - **Validates: Requirements 6.5**

  - [ ]* 7.6 Write property test for duplicate time out prevention
    - **Property 24: Duplicate Time Out Prevention**
    - **Validates: Requirements 19.2**

  - [x] 7.7 Create employee log viewing endpoint
    - Implement GET /time-logs/my-logs endpoint
    - Support query parameters: start_date, end_date, limit, offset
    - Return paginated time logs for authenticated employee (RLS enforced)
    - Include all log fields and photo URLs
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 8. Checkpoint - Ensure time logging tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement missing time out detection
  - [ ] 9.1 Create scheduled function for missing time out detection
    - Create Supabase Edge Function or cron job
    - Query time_logs where time_in exists, time_out is null, and date < current date
    - Update status to 'missing' for identified records
    - Schedule to run daily at midnight
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 9.2 Write property test for missing time out detection
    - **Property 13: Missing Time Out Detection**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 10. Implement admin reporting endpoints
  - [x] 10.1 Create daily attendance endpoint
    - Implement GET /admin/daily-attendance endpoint
    - Accept date query parameter
    - Return all employees with their time logs for the date
    - Include photo URLs and status indicators
    - Handle employees with no logs (status: 'not_logged_in')
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 10.2 Create weekly report endpoint
    - Implement GET /admin/weekly-report endpoint
    - Accept start_date query parameter (Monday of week)
    - Calculate total hours, days worked, missing time outs, days not logged per employee
    - Calculate organization-wide totals
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 10.3 Create dashboard overview endpoint
    - Implement GET /admin/dashboard-overview endpoint
    - Calculate total active employees, logged in today, missing time outs today, total hours today
    - Optimize queries for performance
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 11. Implement input validation middleware
  - [ ] 11.1 Create validation functions for all input types
    - Implement ISO 8601 timestamp validation
    - Implement YYYY-MM-DD date format validation
    - Implement HH:MM:SS time format validation
    - Implement photo file type and size validation
    - Implement password requirements validation
    - Add validation middleware to all endpoints
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ]* 11.2 Write property test for timestamp validation
    - **Property 21: ISO 8601 Timestamp Validation**
    - **Validates: Requirements 16.4**

  - [ ]* 11.3 Write property test for photo upload validation
    - **Property 22: Photo Upload File Type and Size Validation**
    - **Validates: Requirements 16.5**

- [x] 12. Set up React Native/Expo mobile app project
  - Initialize Expo project with TypeScript
  - Install dependencies: Supabase client, React Navigation, Expo Camera, Expo Image Picker
  - Set up navigation structure (Auth stack, Main stack)
  - Configure Supabase client with project URL and anon key
  - Create basic app structure and theme
  - _Requirements: N/A (infrastructure)_

- [x] 13. Implement mobile app authentication screens
  - [x] 13.1 Create login screen
    - Build login form with username and password inputs
    - Call /auth/login endpoint
    - Handle must_change_password flag
    - Store JWT token in secure storage
    - Navigate to password change or home based on flag
    - Display error messages for invalid credentials or inactive accounts
    - _Requirements: 14.1, 14.5, 4.1_

  - [x] 13.2 Create password change screen
    - Build password change form with current and new password inputs
    - Validate new password meets requirements on client side
    - Call /auth/change-password endpoint
    - Navigate to home on success
    - Display validation errors
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 13.3 Write property test for first login flow
    - **Property 7: First Login Requires Password Change**
    - **Validates: Requirements 4.1**

- [ ] 14. Implement mobile app time logging screens
  - [ ] 14.1 Create time in screen
    - Build UI with camera preview and capture button
    - Request camera permissions
    - Capture photo using Expo Camera
    - Call /time-logs/time-in endpoint with photo and timestamp
    - Display success message and navigate to home
    - Handle errors (duplicate time in, camera permission denied)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 14.2 Create time out screen
    - Build UI with camera preview and capture button
    - Capture photo using Expo Camera
    - Call /time-logs/time-out endpoint with photo and timestamp
    - Display total hours worked
    - Navigate to home
    - Handle errors (no time in, invalid time order)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ] 14.3 Create home screen with today's log
    - Display current date
    - Show time in, time out, and total hours for today
    - Show status indicator (incomplete, completed, missing)
    - Provide buttons to navigate to time in/out screens
    - Disable time in button if already logged in
    - Disable time out button if not logged in yet
    - _Requirements: 7.2_

  - [ ] 14.4 Create log history screen
    - Display weekly view (past 7 days) with time logs
    - Display paginated history view for older records
    - Show status indicators for each log
    - Display time in, time out, and total hours
    - Implement pull-to-refresh
    - _Requirements: 7.3, 7.4, 7.5_

- [ ] 15. Checkpoint - Test mobile app end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Set up Next.js admin dashboard project
  - Initialize Next.js project with TypeScript and App Router
  - Install dependencies: Supabase client, TailwindCSS, React Query
  - Set up authentication middleware for protected routes
  - Configure Supabase client
  - Create basic layout and navigation
  - _Requirements: N/A (infrastructure)_

- [ ] 17. Implement admin dashboard authentication
  - [ ] 17.1 Create admin login page
    - Build login form
    - Call /auth/login endpoint
    - Verify role is 'admin'
    - Store JWT token in cookies
    - Redirect to dashboard
    - _Requirements: 2.4, 14.1_

  - [ ] 17.2 Create admin registration page
    - Build registration form with full name, username, password, organization name
    - Call /auth/register-admin endpoint
    - Redirect to dashboard on success
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 18. Implement admin employee management pages
  - [ ] 18.1 Create employee list page
    - Fetch and display all employees in organization
    - Show full name, username, is_active status, created date
    - Provide button to add new employee
    - Provide buttons for deactivate, reset password, view history per employee
    - Visually distinguish deactivated employees
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 17.3_

  - [ ] 18.2 Create add employee modal
    - Build form with full name input
    - Call /admin/employees endpoint
    - Display generated username and password to admin
    - Provide copy-to-clipboard functionality
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 18.3 Implement deactivate employee action
    - Call /admin/employees/:id/deactivate endpoint
    - Update UI to reflect deactivated status
    - Show confirmation dialog
    - _Requirements: 9.4, 9.5, 17.1, 17.2_

  - [ ] 18.4 Implement reset password action
    - Call /admin/employees/:id/reset-password endpoint
    - Display new password to admin
    - Provide copy-to-clipboard functionality
    - Show confirmation dialog
    - _Requirements: 9.6, 9.7, 18.1, 18.2, 18.3, 18.4_

  - [ ] 18.5 Create employee history page
    - Display all time logs for selected employee
    - Show date, time in, time out, total hours, status
    - Provide date range filter
    - _Requirements: 9.8_

- [ ] 19. Implement admin dashboard overview page
  - [ ] 19.1 Create dashboard with key metrics
    - Fetch and display total active employees
    - Display count of employees logged in today
    - Display count of missing time outs today
    - Display total hours logged today
    - Implement auto-refresh or real-time updates
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 20. Implement admin daily attendance page
  - [ ] 20.1 Create daily attendance view
    - Display date selector
    - Fetch and display all employees with time logs for selected date
    - Show time in, time out, total hours, status for each employee
    - Display photo thumbnails with click-to-enlarge
    - Handle missing photos gracefully with placeholders
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 20.4_

  - [ ] 20.2 Create photo viewer modal
    - Display full-size photo in modal
    - Implement zoom functionality
    - Display photo metadata (timestamp, employee name)
    - Provide navigation to view time in and time out photos side-by-side
    - _Requirements: 20.1, 20.2, 20.3, 20.5_

- [ ] 21. Implement admin weekly reports page
  - [ ] 21.1 Create weekly report view
    - Display week selector (Monday start)
    - Fetch and display report data per employee
    - Show total hours, days worked, missing time outs, days not logged
    - Display organization-wide totals
    - Implement export to CSV functionality
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 22. Final checkpoint - End-to-end testing
  - Test complete admin registration and employee onboarding flow
  - Test complete time logging flow from mobile app
  - Test admin reporting and photo verification
  - Test multi-tenant isolation with multiple organizations
  - Ensure all property tests pass
  - Ensure all unit tests pass
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The implementation follows a backend-first approach, then mobile app, then admin dashboard
- All property tests should run with minimum 100 iterations
- RLS policies provide database-level security, reducing application-level security code
