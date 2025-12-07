import { apiClient } from './client';

export interface TRQPAuthorizationRequest {
  entity_id: string;
  authority_id: string;
  action: string;
  resource: string;
  context?: {
    time?: string;
    locator?: string;
  };
}

export interface TRQPAuthorizationResponse {
  entity_id: string;
  authority_id: string;
  action: string;
  resource: string;
  authorized: boolean;
  time_requested?: string;
  time_evaluated: string;
  message?: string;
  context?: Record<string, string>;
}

export interface TRQPRecognitionRequest {
  entity_id: string;
  authority_id: string;
  action: string;
  resource: string;
  context?: {
    time?: string;
  };
}

export interface TRQPRecognitionResponse {
  entity_id: string;
  authority_id: string;
  action: string;
  resource: string;
  recognized: boolean;
  time_requested?: string;
  time_evaluated: string;
  message?: string;
  context?: Record<string, string>;
}

export const trqpApi = {
  authorization: (data: TRQPAuthorizationRequest) =>
    apiClient.post<TRQPAuthorizationResponse>('/authorization', data),

  recognition: (data: TRQPRecognitionRequest) =>
    apiClient.post<TRQPRecognitionResponse>('/recognition', data),
};
