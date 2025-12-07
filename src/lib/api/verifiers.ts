import apiClient from './client';
import type { 
  Verifier, 
  CreateVerifier, 
  ApiResponse, 
  PaginatedResponse 
} from '$lib/types';

export interface VerifierFilters {
  page?: number;
  limit?: number;
  registryId?: string;
  status?: string;
  jurisdiction?: string;
  accreditationLevel?: string;
  did?: string;
}

export const verifierApi = {
  list: (filters?: VerifierFilters) => 
    apiClient.get<PaginatedResponse<Verifier>>('/verifiers', filters),

  get: (did: string) => 
    apiClient.get<ApiResponse<Verifier>>(`/verifiers/${encodeURIComponent(did)}`),

  create: (data: CreateVerifier) => 
    apiClient.post<ApiResponse<Verifier>>('/verifiers', data),

  update: (did: string, data: Partial<CreateVerifier>) => 
    apiClient.put<ApiResponse<Verifier>>(`/verifiers/${encodeURIComponent(did)}`, data),

  updateStatus: (did: string, status: string, reason?: string) =>
    apiClient.patch<ApiResponse<Verifier>>(`/verifiers/${encodeURIComponent(did)}/status`, { status, reason }),

  addCredentialType: (did: string, schemaId: string) =>
    apiClient.post<ApiResponse<void>>(`/verifiers/${encodeURIComponent(did)}/credential-types`, { schemaId }),

  removeCredentialType: (did: string, schemaId: string) =>
    apiClient.delete<ApiResponse<void>>(`/verifiers/${encodeURIComponent(did)}/credential-types/${schemaId}`),
};
