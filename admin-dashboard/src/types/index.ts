// TypeScript types for the admin dashboard

export interface User {
  user_id: string;
  organization_id: string;
  full_name: string;
  username: string;
  role: 'admin' | 'employee';
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface Employee {
  user_id: string;
  full_name: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface TimeLog {
  log_id: string;
  user_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number | null;
  status: 'incomplete' | 'completed' | 'missing';
  time_in_photo_url: string | null;
  time_out_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyAttendanceRecord {
  user_id: string;
  full_name: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number | null;
  status: 'not_logged_in' | 'incomplete' | 'completed' | 'missing';
  time_in_photo_url: string | null;
  time_out_photo_url: string | null;
}

export interface WeeklyReportEmployee {
  user_id: string;
  full_name: string;
  total_hours: number;
  days_worked: number;
  missing_time_outs: number;
  days_not_logged: number;
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  employees: WeeklyReportEmployee[];
  organization_totals: {
    total_hours: number;
    total_days_worked: number;
    total_missing_time_outs: number;
  };
}

export interface DashboardOverview {
  total_active_employees: number;
  logged_in_today: number;
  missing_time_outs_today: number;
  total_hours_today: number;
}

export interface LoginResponse {
  access_token: string;
  user_id: string;
  organization_id: string;
  full_name: string;
  username: string;
  role: 'admin' | 'employee';
  is_active: boolean;
  must_change_password: boolean;
  created_at?: string;
}

export interface CreateEmployeeResponse {
  user_id: string;
  username: string;
  password: string;
  full_name: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}
