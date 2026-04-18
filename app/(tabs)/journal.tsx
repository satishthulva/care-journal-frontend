import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEpisodeStore } from '@/store/episodeStore';
import { EpisodeHeader } from '@/components/EpisodeHeader';
import { LogCard } from '@/components/LogCard';
import { AddLogModal } from '@/components/AddLogModal';
import { CreateEpisodeModal } from '@/components/CreateEpisodeModal';
import { Colors } from '@/constants';
import type { Log, LogType } from '@/api/types';

export default function JournalScreen() {
  const router = useRouter();
  const [showAddLog, setShowAddLog] = useState(false);
  const [showCreateEpisode, setShowCreateEpisode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    activeEpisode,
    logs,
    isLoading,
    error,
    fetchActiveEpisode,
    addLog,
    deleteLog,
    createEpisode,
    fetchAllEpisodes,
    clearError,
  } = useEpisodeStore();

  useEffect(() => {
    fetchActiveEpisode();
    fetchAllEpisodes();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActiveEpisode();
    setRefreshing(false);
  }, [fetchActiveEpisode]);

  const handleAddLog = async (content: string, type: LogType, tags: string[]) => {
    const result = await addLog(content, type, tags);
    if (result) {
      setShowAddLog(false);
    }
  };

  const handleCreateEpisode = async (title: string, description: string) => {
    const result = await createEpisode(title, description);
    if (result) {
      setShowCreateEpisode(false);
      await fetchActiveEpisode();
    }
  };

  const handleDeleteLog = (log: Log) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog(log.id) },
    ]);
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

  const renderHeader = () => (
    <View>
      <EpisodeHeader
        episode={activeEpisode}
        onCreateEpisode={() => setShowCreateEpisode(true)}
      />
      {activeEpisode && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <TouchableOpacity onPress={() => router.push('/episodes')}>
            <Text style={styles.viewAllText}>All Episodes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
      </View>

      <FlatList
        data={activeEpisode ? logs : []}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={activeEpisode ? renderEmptyLogs : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {activeEpisode && (
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
        isLoading={isLoading}
      />

      <CreateEpisodeModal
        visible={showCreateEpisode}
        onClose={() => setShowCreateEpisode(false)}
        onSubmit={handleCreateEpisode}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
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
