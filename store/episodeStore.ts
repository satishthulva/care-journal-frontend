import { create } from 'zustand';
import { episodeApi, logApi } from '@/api/client';
import type { Episode, Log, CreateLogRequest, LogType } from '@/api/types';

interface EpisodeState {
  activeEpisode: Episode | null;
  episodes: Episode[];
  logs: Log[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActiveEpisode: () => Promise<void>;
  fetchAllEpisodes: () => Promise<void>;
  fetchLogs: (episodeId: string) => Promise<void>;
  createEpisode: (title: string, description?: string) => Promise<Episode | null>;
  updateEpisode: (id: string, title?: string, description?: string) => Promise<void>;
  closeEpisode: (id: string) => Promise<void>;
  setActiveEpisode: (id: string) => Promise<void>;
  addLog: (content: string, type: LogType, tags?: string[]) => Promise<Log | null>;
  deleteLog: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useEpisodeStore = create<EpisodeState>((set, get) => ({
  activeEpisode: null,
  episodes: [],
  logs: [],
  isLoading: false,
  error: null,

  fetchActiveEpisode: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await episodeApi.getActive();
      const episode = response.data;
      set({ activeEpisode: episode });
      // Also fetch logs for active episode
      if (episode) {
        const logsResponse = await logApi.getByEpisode(episode.id);
        set({ logs: logsResponse.data });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ activeEpisode: null, logs: [] });
      } else {
        set({ error: 'Failed to fetch active episode' });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllEpisodes: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await episodeApi.getAll();
      set({ episodes: response.data });
    } catch (error) {
      set({ error: 'Failed to fetch episodes' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLogs: async (episodeId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await logApi.getByEpisode(episodeId);
      set({ logs: response.data });
    } catch (error) {
      set({ error: 'Failed to fetch logs' });
    } finally {
      set({ isLoading: false });
    }
  },

  createEpisode: async (title: string, description?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await episodeApi.create({ title, description });
      const newEpisode = response.data;
      set((state) => ({
        episodes: [newEpisode, ...state.episodes],
        activeEpisode: newEpisode.status === 'ACTIVE' ? newEpisode : state.activeEpisode,
      }));
      return newEpisode;
    } catch (error) {
      set({ error: 'Failed to create episode' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEpisode: async (id: string, title?: string, description?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await episodeApi.update(id, { title, description });
      const updatedEpisode = response.data;
      set((state) => ({
        episodes: state.episodes.map((e) => (e.id === id ? updatedEpisode : e)),
        activeEpisode: state.activeEpisode?.id === id ? updatedEpisode : state.activeEpisode,
      }));
    } catch (error) {
      set({ error: 'Failed to update episode' });
    } finally {
      set({ isLoading: false });
    }
  },

  closeEpisode: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await episodeApi.update(id, { status: 'CLOSED' });
      const updatedEpisode = response.data;
      set((state) => ({
        episodes: state.episodes.map((e) => (e.id === id ? updatedEpisode : e)),
        activeEpisode: state.activeEpisode?.id === id ? null : state.activeEpisode,
      }));
    } catch (error) {
      set({ error: 'Failed to close episode' });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveEpisode: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await episodeApi.update(id, { status: 'ACTIVE' });
      const updatedEpisode = response.data;
      set((state) => ({
        episodes: state.episodes.map((e) => {
          if (e.id === id) return updatedEpisode;
          if (e.status === 'ACTIVE') return { ...e, status: 'CLOSED' as const };
          return e;
        }),
        activeEpisode: updatedEpisode,
      }));
      // Fetch logs for the new active episode
      const logsResponse = await logApi.getByEpisode(id);
      set({ logs: logsResponse.data });
    } catch (error) {
      set({ error: 'Failed to set active episode' });
    } finally {
      set({ isLoading: false });
    }
  },

  addLog: async (content: string, type: LogType, tags: string[] = []) => {
    const { activeEpisode } = get();
    if (!activeEpisode) {
      set({ error: 'No active episode' });
      return null;
    }

    try {
      set({ isLoading: true, error: null });
      const response = await logApi.create(activeEpisode.id, { content, type, tags });
      const newLog = response.data;
      set((state) => ({
        logs: [newLog, ...state.logs],
        activeEpisode: state.activeEpisode
          ? { ...state.activeEpisode, logCount: state.activeEpisode.logCount + 1 }
          : null,
      }));
      return newLog;
    } catch (error) {
      set({ error: 'Failed to add log' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteLog: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await logApi.delete(id);
      set((state) => ({
        logs: state.logs.filter((l) => l.id !== id),
        activeEpisode: state.activeEpisode
          ? { ...state.activeEpisode, logCount: Math.max(0, state.activeEpisode.logCount - 1) }
          : null,
      }));
    } catch (error) {
      set({ error: 'Failed to delete log' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
