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
import { CreateEpisodeModal } from '@/components/CreateEpisodeModal';
import { Colors } from '@/constants';
import type { Episode } from '@/api/types';

function EpisodeListCard({ episode, onPress, onSetActive }: {
  episode: Episode;
  onPress: () => void;
  onSetActive?: () => void;
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusColors = {
    ACTIVE: Colors.active,
    CLOSED: Colors.closed,
    ARCHIVED: Colors.archived,
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[episode.status] }]}>
          <Text style={styles.statusText}>{episode.status}</Text>
        </View>
        <Text style={styles.cardDate}>{formatDate(episode.startedAt)}</Text>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {episode.title}
      </Text>

      {episode.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {episode.description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.cardStats}>{episode.logCount} entries</Text>
        {episode.status !== 'ACTIVE' && onSetActive && (
          <TouchableOpacity onPress={onSetActive} style={styles.activateButton}>
            <Text style={styles.activateText}>Set Active</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function EpisodesScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    episodes,
    isLoading,
    error,
    fetchAllEpisodes,
    createEpisode,
    setActiveEpisode,
    clearError,
  } = useEpisodeStore();

  useEffect(() => {
    fetchAllEpisodes();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllEpisodes();
    setRefreshing(false);
  }, [fetchAllEpisodes]);

  const handleCreateEpisode = async (title: string, description: string) => {
    const result = await createEpisode(title, description);
    if (result) {
      setShowCreateModal(false);
    }
  };

  const handleSetActive = (episode: Episode) => {
    Alert.alert(
      'Set as Active',
      `Make "${episode.title}" your active episode? This will close the current active episode.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set Active', onPress: () => setActiveEpisode(episode.id) },
      ]
    );
  };

  const renderEpisodeItem = ({ item }: { item: Episode }) => (
    <EpisodeListCard
      episode={item}
      onPress={() => router.push(`/episode/${item.id}`)}
      onSetActive={item.status !== 'ACTIVE' ? () => handleSetActive(item) : undefined}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Episodes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first episode to start tracking
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Episodes</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
        >
          <Text style={styles.addText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={episodes}
        renderItem={renderEpisodeItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={[
          styles.listContent,
          episodes.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <CreateEpisodeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardStats: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  activateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
  },
  activateText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
