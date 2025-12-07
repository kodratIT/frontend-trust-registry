import { apiClient } from './client';
import type { ApiResponse } from '$lib/types';

export interface Delegation {
  id: string;
  rootIssuerDid: string;
  delegateIssuerDid: string;
  scope: {
    jurisdictions?: string[];
    credentialTypes?: string[];
    contexts?: string[];
  };
  delegationProof: Record<string, unknown>;
  delegatedAt: string;
  validUntil?: string;
  status: 'active' | 'revoked';
  createdAt: string;
  rootIssuer?: {
    did: string;
    name?: string;
  };
  delegateIssuer?: {
    did: string;
    name?: string;
  };
}

export interface CreateDelegation {
  delegateDid: string;
  scope: {
    jurisdictions?: string[];
    credentialTypes?: string[];
    contexts?: string[];
  };
  delegationProof: Record<string, unknown>;
  validUntil?: string;
}

export const delegationApi = {
  listDelegates: (issuerDid: string) =>
    apiClient.get<{ data: Delegation[] }>(`/issuers/${encodeURIComponent(issuerDid)}/delegates`),

  getDelegationChain: (issuerDid: string) =>
    apiClient.get<{ data: Delegation[] }>(`/issuers/${encodeURIComponent(issuerDid)}/delegation-chain`),

  create: (issuerDid: string, data: CreateDelegation) =>
    apiClient.post<ApiResponse<Delegation>>(`/issuers/${encodeURIComponent(issuerDid)}/delegate`, data),

  revoke: (issuerDid: string, delegateDid: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/issuers/${encodeURIComponent(issuerDid)}/delegates/${encodeURIComponent(delegateDid)}`),
};
