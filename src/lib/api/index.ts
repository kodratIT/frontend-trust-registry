export { apiClient } from './client';
export { apiKeyApi } from './apiKeys';
export { trustFrameworkApi } from './trustFrameworks';
export { registryApi } from './registries';
export { schemaApi } from './schemas';
export { issuerApi } from './issuers';
export { verifierApi } from './verifiers';
export { queryApi } from './query';
export { auditApi } from './audit';
export { trqpApi } from './trqp';
export { recognitionApi } from './recognitions';
export { delegationApi } from './delegations';

// Re-export types
export type { TRQPAuthorizationRequest, TRQPAuthorizationResponse, TRQPRecognitionRequest, TRQPRecognitionResponse } from './trqp';
export type { Recognition, CreateRecognition } from './recognitions';
export type { Delegation, CreateDelegation } from './delegations';
