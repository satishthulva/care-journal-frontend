import axios from 'axios';
import { API_BASE_URL, API_KEY } from '@/constants';
import type {
  Episode,
  CreateEpisodeRequest,
  UpdateEpisodeRequest,
  Log,
  CreateLogRequest,
  UpdateLogRequest,
  Conversation,
  CreateConversationRequest,
  SendMessageRequest,
  Message,
} from './types';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[API] Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('[API] No response received:', error.message);
    } else {
      console.error('[API] Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Episode API
export const episodeApi = {
  getAll: () => apiClient.get<Episode[]>('/episodes'),
  getActive: () => apiClient.get<Episode>('/episodes/active'),
  getById: (id: string) => apiClient.get<Episode>(`/episodes/${id}`),
  create: (data: CreateEpisodeRequest) => apiClient.post<Episode>('/episodes', data),
  update: (id: string, data: UpdateEpisodeRequest) => apiClient.patch<Episode>(`/episodes/${id}`, data),
  archive: (id: string) => apiClient.delete(`/episodes/${id}`),
};

// Log API
export const logApi = {
  getByEpisode: (episodeId: string) => apiClient.get<Log[]>(`/episodes/${episodeId}/logs`),
  getById: (id: string) => apiClient.get<Log>(`/logs/${id}`),
  create: (episodeId: string, data: CreateLogRequest) => apiClient.post<Log>(`/episodes/${episodeId}/logs`, data),
  update: (id: string, data: UpdateLogRequest) => apiClient.patch<Log>(`/logs/${id}`, data),
  delete: (id: string) => apiClient.delete(`/logs/${id}`),
};

// Conversation API
export const conversationApi = {
  getAll: () => apiClient.get<Conversation[]>('/conversations'),
  getById: (id: string) => apiClient.get<Conversation>(`/conversations/${id}`),
  create: (data: CreateConversationRequest) => apiClient.post<Conversation>('/conversations', data),
  sendMessage: (id: string, data: SendMessageRequest) => apiClient.post<Message>(`/conversations/${id}/messages`, data),
  delete: (id: string) => apiClient.delete(`/conversations/${id}`),
};
