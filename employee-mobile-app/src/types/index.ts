export interface User {
  user_id: string;
  organization_id: string;
  full_name: string;
  username: string;
  role: 'admin' | 'employee';
  is_active: boolean;
  must_change_password: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  organization_id: string;
  full_name: string;
  username: string;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
}

export interface TimeLog {
  log_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  time_in_photo_url: string | null;
  time_out_photo_url: string | null;
  total_hours: number | null;
  status: 'incomplete' | 'completed' | 'missing';
  created_at: string;
  updated_at: string;
}
