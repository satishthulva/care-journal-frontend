import { create } from 'zustand';
import { conversationApi } from '@/api/client';
import type { Conversation, Message } from '@/api/types';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  createConversation: (linkedEpisodeId?: string) => Promise<Conversation | null>;
  sendMessage: (content: string) => Promise<Message | null>;
  deleteConversation: (id: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  isSending: false,
  error: null,

  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('[ChatStore] Fetching conversations...');
      const response = await conversationApi.getAll();
      console.log('[ChatStore] Fetched conversations:', response.data);
      set({ conversations: response.data });
    } catch (error: any) {
      console.error('[ChatStore] Error fetching conversations:', error);
      set({ error: error.message || 'Failed to fetch conversations' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchConversation: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await conversationApi.getById(id);
      set({ currentConversation: response.data });
    } catch (error) {
      set({ error: 'Failed to fetch conversation' });
    } finally {
      set({ isLoading: false });
    }
  },

  createConversation: async (linkedEpisodeId?: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log('[ChatStore] Creating conversation, linkedEpisodeId:', linkedEpisodeId);
      const response = await conversationApi.create({ linkedEpisodeId });
      const newConversation = response.data;
      console.log('[ChatStore] Created conversation:', newConversation);
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation,
      }));
      return newConversation;
    } catch (error: any) {
      console.error('[ChatStore] Error creating conversation:', error);
      set({ error: error.message || 'Failed to create conversation' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    const { currentConversation } = get();
    if (!currentConversation) {
      set({ error: 'No active conversation' });
      return null;
    }

    try {
      set({ isSending: true, error: null });

      // Optimistically add user message
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversation.id,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        currentConversation: state.currentConversation
          ? {
              ...state.currentConversation,
              messages: [...state.currentConversation.messages, tempUserMessage],
            }
          : null,
      }));

      // Send message and get response
      const response = await conversationApi.sendMessage(currentConversation.id, { content });
      const assistantMessage = response.data;

      // Update with actual messages (replacing temp user message)
      set((state) => {
        if (!state.currentConversation) return state;

        // Replace temp user message with real user message ID (assume server added it)
        const updatedMessages = state.currentConversation.messages
          .filter((m) => !m.id.startsWith('temp-'))
          .concat([
            { ...tempUserMessage, id: `user-${Date.now()}` },
            assistantMessage,
          ]);

        return {
          currentConversation: {
            ...state.currentConversation,
            messages: updatedMessages,
            messageCount: updatedMessages.length,
            title: state.currentConversation.title || content.slice(0, 50),
          },
          // Update conversation in list
          conversations: state.conversations.map((c) =>
            c.id === currentConversation.id
              ? { ...c, messageCount: updatedMessages.length, title: c.title || content.slice(0, 50) }
              : c
          ),
        };
      });

      return assistantMessage;
    } catch (error) {
      // Remove optimistic message on error
      set((state) => ({
        currentConversation: state.currentConversation
          ? {
              ...state.currentConversation,
              messages: state.currentConversation.messages.filter((m) => !m.id.startsWith('temp-')),
            }
          : null,
        error: 'Failed to send message',
      }));
      return null;
    } finally {
      set({ isSending: false });
    }
  },

  deleteConversation: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await conversationApi.delete(id);
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
      }));
    } catch (error) {
      set({ error: 'Failed to delete conversation' });
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  clearError: () => set({ error: null }),
}));
