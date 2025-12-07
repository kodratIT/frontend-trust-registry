import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '$lib/types';

export interface Recognition {
  id: string;
  authorityId: string;
  entityId: string;
  action: string;
  resource: string;
  recognized: boolean;
  validFrom?: string;
  validUntil?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  authority?: {
    id: string;
    name: string;
    ecosystemDid: string;
  };
}

export interface CreateRecognition {
  authorityRegistryId: string;
  entityId: string;
  action: string;
  resource: string;
  validFrom?: string;
  validUntil?: string;
  metadata?: Record<string, unknown>;
}

export interface RecognitionListParams {
  page?: number;
  limit?: number;
  authorityId?: string;
  entityId?: string;
  action?: string;
}

export const recognitionApi = {
  list: (params?: RecognitionListParams) =>
    apiClient.get<PaginatedResponse<Recognition>>('/recognitions', params),

  get: (id: string) =>
    apiClient.get<{ data: Recognition }>(`/recognitions/${id}`),

  create: (data: CreateRecognition) =>
    apiClient.post<ApiResponse<Recognition>>('/recognitions', data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(`/recognitions/${id}`),
};
