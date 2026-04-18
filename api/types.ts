// Episode types
export type EpisodeStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface Episode {
  id: string;
  title: string;
  description: string | null;
  status: EpisodeStatus;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  logCount: number;
}

export interface CreateEpisodeRequest {
  title: string;
  description?: string;
  startedAt?: string;
}

export interface UpdateEpisodeRequest {
  title?: string;
  description?: string;
  status?: EpisodeStatus;
}

// Log types
export type LogType = 'NOTE' | 'SYMPTOM' | 'MEDICATION' | 'MOOD' | 'EVENT';

export interface Log {
  id: string;
  episodeId: string;
  content: string;
  type: LogType;
  tags: string[];
  loggedAt: string;
  createdAt: string;
}

export interface CreateLogRequest {
  content: string;
  type?: LogType;
  tags?: string[];
  loggedAt?: string;
}

export interface UpdateLogRequest {
  content?: string;
  type?: LogType;
  tags?: string[];
}

// Conversation types
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  linkedEpisodeId: string | null;
  createdAt: string;
  messages: Message[];
  messageCount: number;
}

export interface CreateConversationRequest {
  title?: string;
  linkedEpisodeId?: string;
}

export interface SendMessageRequest {
  content: string;
}
