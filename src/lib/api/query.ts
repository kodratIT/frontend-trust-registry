import apiClient from './client';
import type { QueryRequest, QueryResult, ApiResponse, PaginatedResponse, Issuer, Verifier } from '$lib/types';

export interface QueryFilters {
  did?: string;
  credentialType?: string;
  registryId?: string;
  trustFrameworkId?: string;
  jurisdiction?: string;
  context?: string;
  status?: string;
  accreditationLevel?: string;
  validAt?: string;
  page?: number;
  limit?: number;
}

export const queryApi = {
  single: (query: QueryRequest) => 
    apiClient.post<ApiResponse<QueryResult>>('/query', query),

  batch: (queries: QueryRequest[]) =>
    apiClient.post<ApiResponse<{
      results: QueryResult[];
      totalQueries: number;
      successCount: number;
      failureCount: number;
      totalTime: number;
    }>>('/query/batch', { queries }),

  issuers: (filters?: QueryFilters) =>
    apiClient.get<PaginatedResponse<Issuer>>('/query/issuers', filters),

  verifiers: (filters?: QueryFilters) =>
    apiClient.get<PaginatedResponse<Verifier>>('/query/verifiers', filters),
};
