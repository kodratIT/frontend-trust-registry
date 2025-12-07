// API Response Types
export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Trust Framework
export interface TrustFramework {
  id: string;
  name: string;
  version: string;
  description?: string;
  governanceFrameworkUrl?: string;
  legalAgreements?: string[];
  jurisdictions?: string[];
  contexts?: string[];
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
  trustRegistries?: TrustRegistry[];
  credentialSchemas?: CredentialSchema[];
}

export interface CreateTrustFramework {
  name: string;
  version: string;
  description?: string;
  governanceFrameworkUrl?: string;
  legalAgreements?: string[];
  jurisdictions?: string[];
  contexts?: string[];
  status?: 'active' | 'inactive' | 'deprecated';
}

// Trust Registry
export interface TrustRegistry {
  id: string;
  name: string;
  description?: string;
  ecosystemDid: string;
  trustFrameworkId?: string;
  governanceAuthority?: string;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
  trustFramework?: TrustFramework;
  credentialSchemas?: CredentialSchema[];
  issuers?: Issuer[];
  verifiers?: Verifier[];
}

export interface CreateTrustRegistry {
  name: string;
  ecosystemDid: string;
  description?: string;
  trustFrameworkId?: string;
  governanceAuthority?: string;
  status?: 'active' | 'inactive' | 'deprecated';
}

// Credential Schema
export interface CredentialSchema {
  id: string;
  registryId: string;
  trustFrameworkId?: string;
  name: string;
  version: string;
  type: string;
  jsonSchema: Record<string, unknown>;
  contexts?: string[];
  jurisdictions?: string[];
  issuerMode: 'OPEN' | 'ECOSYSTEM' | 'GRANTOR';
  verifierMode: 'OPEN' | 'ECOSYSTEM' | 'GRANTOR';
  createdAt: string;
  updatedAt: string;
  registry?: TrustRegistry;
  trustFramework?: TrustFramework;
}

export interface CreateCredentialSchema {
  registryId: string;
  trustFrameworkId?: string;
  name: string;
  version: string;
  type: string;
  jsonSchema: Record<string, unknown>;
  contexts?: string[];
  jurisdictions?: string[];
  issuerMode: 'OPEN' | 'ECOSYSTEM' | 'GRANTOR';
  verifierMode: 'OPEN' | 'ECOSYSTEM' | 'GRANTOR';
}

// Issuer
export interface Jurisdiction {
  code: string;
  name?: string;
}

export interface Issuer {
  id: string;
  did: string;
  name?: string;
  registryId: string;
  trustFrameworkId?: string;
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  jurisdictions?: Jurisdiction[];
  contexts?: string[];
  accreditationLevel?: 'high' | 'medium' | 'low';
  validFrom?: string;
  validUntil?: string;
  endpoint?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  registry?: TrustRegistry;
  trustFramework?: TrustFramework;
  credentialSchemas?: CredentialSchema[];
  credentialTypes?: CredentialSchema[];
}

export interface CreateIssuer {
  did: string;
  name?: string;
  registryId: string;
  trustFrameworkId?: string;
  status?: 'pending' | 'active' | 'suspended' | 'revoked';
  jurisdictions?: Jurisdiction[];
  contexts?: string[];
  accreditationLevel?: 'high' | 'medium' | 'low';
  validFrom?: string;
  validUntil?: string;
  endpoint?: string;
  credentialTypes?: string[];
}

// Verifier
export interface Verifier {
  id: string;
  did: string;
  name?: string;
  registryId: string;
  trustFrameworkId?: string;
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  jurisdictions?: Jurisdiction[];
  contexts?: string[];
  accreditationLevel?: 'high' | 'medium' | 'low';
  validFrom?: string;
  validUntil?: string;
  endpoint?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  registry?: TrustRegistry;
  trustFramework?: TrustFramework;
  credentialSchemas?: CredentialSchema[];
  credentialTypes?: CredentialSchema[];
}

export interface CreateVerifier {
  did: string;
  name?: string;
  registryId: string;
  trustFrameworkId?: string;
  status?: 'pending' | 'active' | 'suspended' | 'revoked';
  jurisdictions?: Jurisdiction[];
  accreditationLevel?: 'high' | 'medium' | 'low';
}

// Query
export interface QueryRequest {
  entityType: 'issuer' | 'verifier';
  did?: string;
  credentialType?: string;
  registryId?: string;
  trustFrameworkId?: string;
  jurisdiction?: string;
  context?: string;
  status?: 'pending' | 'active' | 'suspended' | 'revoked';
  accreditationLevel?: 'high' | 'medium' | 'low';
  validAt?: string;
}

export interface QueryResult {
  found: boolean;
  entityType: string;
  entity?: Issuer | Verifier;
  registry?: TrustRegistry;
  trustFramework?: TrustFramework;
  credentialTypes?: CredentialSchema[];
  queryTime: number;
}

// Audit Log
export interface AuditLog {
  id: string;
  actor: string;
  action: 'create' | 'read' | 'update' | 'delete';
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  result: 'success' | 'failure';
  timestamp: string;
}

// Auth
export interface AuthState {
  isAuthenticated: boolean;
  apiKey: string | null;
  role: 'admin' | 'registry_owner' | 'public' | null;
}

// API Error
export interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
