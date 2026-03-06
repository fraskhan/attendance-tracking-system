import Constants from 'expo-constants';
import { authService } from './auth';
import { LoginResponse, TimeLog } from '../types';

const API_URL = Constants.expoConfig?.extra?.apiUrl || '';
const ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || '';

class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      ...(token && { 'x-user-token': token }),
    };
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password change failed');
    }
  }

  async timeIn(photo: File | { uri: string; type: string; name: string }): Promise<void> {
    const token = await authService.getToken();
    const formData = new FormData();
    
    // Handle both File (web) and object (native) formats
    if (photo instanceof File) {
      formData.append('photo', photo);
    } else {
      formData.append('photo', photo as any);
    }
    
    formData.append('timestamp', new Date().toISOString());

    const response = await fetch(`${API_URL}/time-in`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        ...(token && { 'x-user-token': token }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || error.message || 'Time in failed';
      console.error('Time in error:', error);
      throw new Error(errorMessage);
    }
  }

  async timeOut(photo: File | { uri: string; type: string; name: string }): Promise<void> {
    const token = await authService.getToken();
    const formData = new FormData();
    
    // Handle both File (web) and object (native) formats
    if (photo instanceof File) {
      formData.append('photo', photo);
    } else {
      formData.append('photo', photo as any);
    }
    
    formData.append('timestamp', new Date().toISOString());

    const response = await fetch(`${API_URL}/time-out`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        ...(token && { 'x-user-token': token }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Time out failed');
    }
  }

  async getMyLogs(startDate?: string, endDate?: string, limit = 50, offset = 0): Promise<TimeLog[]> {
    const headers = await this.getHeaders();
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    });

    const response = await fetch(`${API_URL}/my-logs?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch logs');
    }

    const data = await response.json();
    return data.logs || [];
  }
}

export const apiService = new ApiService();
