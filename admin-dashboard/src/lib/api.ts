// API utility functions for backend communication

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';
import type {
  LoginResponse,
  Employee,
  CreateEmployeeResponse,
  TimeLog,
  DailyAttendanceRecord,
  WeeklyReport,
  DashboardOverview,
  ApiError,
} from '@/types';

const API_BASE = `${SUPABASE_URL}/functions/v1`;

// Helper function to get auth headers
function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };
  
  if (token) {
    headers['x-user-token'] = token;
  }
  
  return headers;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || 'An error occurred');
  }
  return response.json();
}

// Authentication APIs
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<LoginResponse>(response);
}

export async function registerAdmin(
  fullName: string,
  username: string,
  password: string,
  organizationName: string
): Promise<{ user_id: string; organization_id: string; access_token: string }> {
  const response = await fetch(`${API_BASE}/register-admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      full_name: fullName,
      username,
      password,
      organization_name: organizationName,
    }),
  });
  return handleResponse(response);
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  return handleResponse(response);
}

// Employee Management APIs
export async function getEmployees(token: string): Promise<{ employees: Employee[] }> {
  const response = await fetch(`${API_BASE}/list-employees`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}

export async function createEmployee(
  token: string,
  fullName: string
): Promise<CreateEmployeeResponse> {
  const response = await fetch(`${API_BASE}/create-employee`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ full_name: fullName }),
  });
  return handleResponse(response);
}

export async function deactivateEmployee(
  token: string,
  userId: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/deactivate-employee`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ user_id: userId }),
  });
  return handleResponse(response);
}

export async function resetEmployeePassword(
  token: string,
  userId: string
): Promise<{ new_password: string; message: string }> {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ user_id: userId }),
  });
  return handleResponse(response);
}

// Attendance APIs
export async function getDailyAttendance(
  token: string,
  date: string
): Promise<{ date: string; attendance: DailyAttendanceRecord[] }> {
  const response = await fetch(`${API_BASE}/daily-attendance?date=${date}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}

export async function getWeeklyReport(
  token: string,
  startDate: string
): Promise<WeeklyReport> {
  const response = await fetch(`${API_BASE}/weekly-report?start_date=${startDate}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}

export async function getDashboardOverview(token: string): Promise<DashboardOverview> {
  const response = await fetch(`${API_BASE}/dashboard-overview`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}

// Employee Time Logs API
export async function getEmployeeLogs(
  token: string,
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ logs: TimeLog[]; total_count: number }> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  params.append('limit', '100');
  
  const response = await fetch(`${API_BASE}/my-logs?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
}
