import apiClient from './client';
import type { AuditLog, PaginatedResponse } from '$lib/types';

export interface AuditFilters {
  page?: number;
  limit?: number;
  actor?: string;
  action?: 'create' | 'read' | 'update' | 'delete';
  resourceType?: string;
  resourceId?: string;
  result?: 'success' | 'failure';
  startDate?: string;
  endDate?: string;
}

export const auditApi = {
  list: (filters?: AuditFilters) => 
    apiClient.get<PaginatedResponse<AuditLog>>('/audit-log', filters),
};
