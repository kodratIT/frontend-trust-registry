import apiClient from './client';
import type { 
  TrustFramework, 
  CreateTrustFramework, 
  ApiResponse, 
  PaginatedResponse 
} from '$lib/types';

export interface TrustFrameworkFilters {
  page?: number;
  limit?: number;
  status?: string;
  jurisdiction?: string;
}

export const trustFrameworkApi = {
  list: (filters?: TrustFrameworkFilters) => 
    apiClient.get<PaginatedResponse<TrustFramework>>('/trust-frameworks', filters),

  get: (id: string) => 
    apiClient.get<ApiResponse<TrustFramework>>(`/trust-frameworks/${id}`),

  create: (data: CreateTrustFramework) => 
    apiClient.post<ApiResponse<TrustFramework>>('/trust-frameworks', data),

  update: (id: string, data: Partial<CreateTrustFramework>) => 
    apiClient.put<ApiResponse<TrustFramework>>(`/trust-frameworks/${id}`, data),
};
