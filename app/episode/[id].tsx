import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { episodeApi, logApi } from '@/api/client';
import { useEpisodeStore } from '@/store/episodeStore';
import { LogCard } from '@/components/LogCard';
import { AddLogModal } from '@/components/AddLogModal';
import { Colors } from '@/constants';
import type { Episode, Log, LogType } from '@/api/types';

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { setActiveEpisode, closeEpisode } = useEpisodeStore();

  const fetchData = async () => {
    if (!id) return;

    try {
      const [episodeRes, logsRes] = await Promise.all([
        episodeApi.getById(id),
        logApi.getByEpisode(id),
      ]);
      setEpisode(episodeRes.data);
      setLogs(logsRes.data);
      navigation.setOptions({ title: episodeRes.data.title });
    } catch (error) {
      Alert.alert('Error', 'Failed to load episode');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [id]);

  const handleAddLog = async (content: string, type: LogType, tags: string[]) => {
    if (!id) return;

    setIsSaving(true);
    try {
      const response = await logApi.create(id, { content, type, tags });
      setLogs((prev) => [response.data, ...prev]);
      setEpisode((prev) => prev ? { ...prev, logCount: prev.logCount + 1 } : null);
      setShowAddLog(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLog = (log: Log) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await logApi.delete(log.id);
            setLogs((prev) => prev.filter((l) => l.id !== log.id));
            setEpisode((prev) => prev ? { ...prev, logCount: Math.max(0, prev.logCount - 1) } : null);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  const handleSetActive = () => {
    if (!episode) return;

    Alert.alert(
      'Set as Active',
      'Make this your active episode? This will close the current active episode.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Active',
          onPress: async () => {
            await setActiveEpisode(episode.id);
            setEpisode((prev) => prev ? { ...prev, status: 'ACTIVE' } : null);
          },
        },
      ]
    );
  };

  const handleCloseEpisode = () => {
    if (!episode) return;

    Alert.alert(
      'Close Episode',
      'Are you sure you want to close this episode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          onPress: async () => {
            await closeEpisode(episode.id);
            setEpisode((prev) => prev ? { ...prev, status: 'CLOSED' } : null);
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderHeader = () => {
    if (!episode) return null;

    const statusColors = {
      ACTIVE: Colors.active,
      CLOSED: Colors.closed,
      ARCHIVED: Colors.archived,
    };

    return (
      <View style={styles.headerSection}>
        <View style={styles.episodeHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[episode.status] }]}>
            <Text style={styles.statusText}>{episode.status}</Text>
          </View>
          <Text style={styles.dateText}>Started {formatDate(episode.startedAt)}</Text>
        </View>

        {episode.description && (
          <Text style={styles.description}>{episode.description}</Text>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{episode.logCount}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {episode.status !== 'ACTIVE' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleSetActive}>
              <Text style={styles.actionButtonText}>Set as Active</Text>
            </TouchableOpacity>
          )}
          {episode.status === 'ACTIVE' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleCloseEpisode}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                Close Episode
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Entries</Text>
        </View>
      </View>
    );
  };

  const renderLogItem = ({ item }: { item: Log }) => (
    <LogCard log={item} onDelete={() => handleDeleteLog(item)} />
  );

  const renderEmptyLogs = () => (
    <View style={styles.emptyLogs}>
      <Text style={styles.emptyLogsText}>No entries yet</Text>
      <Text style={styles.emptyLogsSubtext}>
        Tap the + button to add your first entry
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyLogs}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {episode?.status === 'ACTIVE' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddLog(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <AddLogModal
        visible={showAddLog}
        onClose={() => setShowAddLog(false)}
        onSubmit={handleAddLog}
        isLoading={isSaving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  headerSection: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 8,
  },
  episodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonTextSecondary: {
    color: Colors.textSecondary,
  },
  sectionHeader: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyLogs: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyLogsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyLogsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
});
