import apiClient from './client';
import type { 
  Issuer, 
  CreateIssuer, 
  ApiResponse, 
  PaginatedResponse 
} from '$lib/types';

export interface IssuerFilters {
  page?: number;
  limit?: number;
  registryId?: string;
  status?: string;
  jurisdiction?: string;
  accreditationLevel?: string;
  did?: string;
}

export const issuerApi = {
  list: (filters?: IssuerFilters) => 
    apiClient.get<PaginatedResponse<Issuer>>('/issuers', filters),

  get: (did: string) => 
    apiClient.get<ApiResponse<Issuer>>(`/issuers/${encodeURIComponent(did)}`),

  create: (data: CreateIssuer) => 
    apiClient.post<ApiResponse<Issuer>>('/issuers', data),

  update: (did: string, data: Partial<CreateIssuer>) => 
    apiClient.put<ApiResponse<Issuer>>(`/issuers/${encodeURIComponent(did)}`, data),

  updateStatus: (did: string, status: string, reason?: string) =>
    apiClient.patch<ApiResponse<Issuer>>(`/issuers/${encodeURIComponent(did)}/status`, { status, reason }),

  getStatusHistory: (did: string, page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<unknown>>(`/issuers/${encodeURIComponent(did)}/status-history`, { page, limit }),

  addCredentialType: (did: string, schemaId: string) =>
    apiClient.post<ApiResponse<void>>(`/issuers/${encodeURIComponent(did)}/credential-types`, { schemaId }),

  removeCredentialType: (did: string, schemaId: string) =>
    apiClient.delete<ApiResponse<void>>(`/issuers/${encodeURIComponent(did)}/credential-types/${schemaId}`),

  // Delegation
  createDelegation: (did: string, data: { delegateDid: string; scope: unknown; delegationProof: unknown; validUntil?: string }) =>
    apiClient.post<ApiResponse<unknown>>(`/issuers/${encodeURIComponent(did)}/delegate`, data),

  listDelegates: (did: string) =>
    apiClient.get<ApiResponse<unknown[]>>(`/issuers/${encodeURIComponent(did)}/delegates`),

  getDelegationChain: (did: string) =>
    apiClient.get<ApiResponse<unknown>>(`/issuers/${encodeURIComponent(did)}/delegation-chain`),

  revokeDelegation: (did: string, delegateDid: string) =>
    apiClient.delete<ApiResponse<void>>(`/issuers/${encodeURIComponent(did)}/delegates/${encodeURIComponent(delegateDid)}`),
};
