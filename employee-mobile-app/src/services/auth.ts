import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { LoginResponse } from '../types';

const TOKEN_KEY = 'user_token';
const USER_KEY = 'user_data';

// Check if we're running on web
const isWeb = Platform.OS === 'web';

export const authService = {
  async saveToken(token: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  async getToken(): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  },

  async saveUser(user: LoginResponse): Promise<void> {
    if (isWeb) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    }
  },

  async getUser(): Promise<LoginResponse | null> {
    if (isWeb) {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } else {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
  },

  async clearAuth(): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },
};
