import apiClient from './client';
import type { ApiResponse } from '$lib/types';

export interface APIKey {
  id: string;
  name: string;
  key?: string; // Only returned on create
  role: 'admin' | 'registry_owner' | 'public';
  registryId?: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface CreateAPIKey {
  name: string;
  role: 'admin' | 'registry_owner' | 'public';
  registryId?: string;
  expiresAt?: string;
}

export interface ValidateKeyResponse {
  valid: boolean;
  apiKey?: APIKey;
  reason?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v2';

export const apiKeyApi = {
  validate: async (key: string): Promise<ValidateKeyResponse> => {
    try {
      const response = await fetch(`${API_BASE}/api-keys`, {
        method: 'GET',
        headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        return {
          valid: true,
          apiKey: { id: 'temp', name: 'Validated Key', role: 'admin', createdAt: new Date().toISOString() },
        };
      } else if (response.status === 401) {
        return { valid: false, reason: 'Invalid or expired API key' };
      } else if (response.status === 403) {
        const publicResponse = await fetch(`${API_BASE}/trust-frameworks?limit=1`, {
          method: 'GET',
          headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
        });
        if (publicResponse.ok) {
          return {
            valid: true,
            apiKey: { id: 'temp', name: 'Validated Key', role: 'public', createdAt: new Date().toISOString() },
          };
        }
      }
      return { valid: false, reason: 'Unable to validate API key' };
    } catch (error) {
      return { valid: false, reason: 'Network error or backend unavailable' };
    }
  },

  list: () => apiClient.get<{ data: APIKey[] }>('/api-keys'),

  get: (id: string) => apiClient.get<{ data: APIKey }>(`/api-keys/${id}`),

  create: (data: CreateAPIKey) => apiClient.post<ApiResponse<APIKey>>('/api-keys', data),

  delete: (id: string) => apiClient.delete<ApiResponse<{ id: string }>>(`/api-keys/${id}`),
};
