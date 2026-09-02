import { apiClient } from '../../../shared/lib/axios';
import type { APIResponse, AuthResponseData, User } from '../../../shared/types/api';

export interface RegisterPayload {
  email: string;
  password: string;
  fullname: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<User> => {
    const response = await apiClient.post<APIResponse<AuthResponseData>>('/api/auth/register', payload);
    if (response.data.data?.user) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Registration failed');
  },

  login: async (payload: LoginPayload): Promise<User> => {
    const response = await apiClient.post<APIResponse<AuthResponseData>>('/api/auth/login', payload);
    if (response.data.data?.user) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<APIResponse<AuthResponseData>>('/api/auth/get-me');
    if (response.data.data?.user) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Failed to restore session');
  },

  deleteUser: async (): Promise<void> => {
    await apiClient.delete<APIResponse>('/api/auth/deleteUser');
  },
};
