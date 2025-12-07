import apiClient from './client';
import type { 
  CredentialSchema, 
  CreateCredentialSchema, 
  ApiResponse, 
  PaginatedResponse 
} from '$lib/types';

export interface SchemaFilters {
  page?: number;
  limit?: number;
  registryId?: string;
  trustFrameworkId?: string;
  type?: string;
  issuerMode?: string;
  verifierMode?: string;
  name?: string;
}

export const schemaApi = {
  list: (filters?: SchemaFilters) => 
    apiClient.get<PaginatedResponse<CredentialSchema>>('/schemas', filters),

  get: (id: string) => 
    apiClient.get<ApiResponse<CredentialSchema>>(`/schemas/${id}`),

  create: (data: CreateCredentialSchema) => 
    apiClient.post<ApiResponse<CredentialSchema>>('/schemas', data),

  update: (id: string, data: Partial<CreateCredentialSchema>) => 
    apiClient.put<ApiResponse<CredentialSchema>>(`/schemas/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/schemas/${id}`),

  linkRegistry: (id: string, registryId: string) =>
    apiClient.patch<ApiResponse<CredentialSchema>>(`/schemas/${id}/registry`, { registryId }),

  validate: (id: string, data: unknown) =>
    apiClient.post<ApiResponse<{ valid: boolean; errors?: unknown[] }>>(`/schemas/${id}/validate`, { data }),
};
