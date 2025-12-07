import apiClient from './client';
import type { 
  TrustRegistry, 
  CreateTrustRegistry, 
  ApiResponse, 
  PaginatedResponse 
} from '$lib/types';

export interface RegistryFilters {
  page?: number;
  limit?: number;
  status?: string;
  trustFrameworkId?: string;
  ecosystemDid?: string;
}

export const registryApi = {
  list: (filters?: RegistryFilters) => 
    apiClient.get<PaginatedResponse<TrustRegistry>>('/registries', filters),

  get: (id: string) => 
    apiClient.get<ApiResponse<TrustRegistry>>(`/registries/${id}`),

  create: (data: CreateTrustRegistry) => 
    apiClient.post<ApiResponse<TrustRegistry>>('/registries', data),

  update: (id: string, data: Partial<CreateTrustRegistry>) => 
    apiClient.put<ApiResponse<TrustRegistry>>(`/registries/${id}`, data),

  linkTrustFramework: (id: string, trustFrameworkId: string) =>
    apiClient.patch<ApiResponse<TrustRegistry>>(`/registries/${id}/trust-framework`, { trustFrameworkId }),

  unlinkTrustFramework: (id: string) =>
    apiClient.delete<ApiResponse<TrustRegistry>>(`/registries/${id}/trust-framework`),

  verifyDid: (did: string) =>
    apiClient.post<ApiResponse<{ did: string; valid: boolean; method: string; didDocument?: unknown }>>('/registries/verify-did', { did }),
};
