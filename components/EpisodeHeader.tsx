import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import type { Episode } from '@/api/types';

interface EpisodeHeaderProps {
  episode: Episode | null;
  onCreateEpisode?: () => void;
}

export function EpisodeHeader({ episode, onCreateEpisode }: EpisodeHeaderProps) {
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!episode) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Active Episode</Text>
          <Text style={styles.emptySubtitle}>Start tracking by creating a new episode</Text>
          <TouchableOpacity style={styles.createButton} onPress={onCreateEpisode}>
            <Text style={styles.createButtonText}>+ New Episode</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/episode/${episode.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>ACTIVE</Text>
        </View>
        <Text style={styles.date}>Started {formatDate(episode.startedAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {episode.title}
      </Text>

      {episode.description && (
        <Text style={styles.description} numberOfLines={2}>
          {episode.description}
        </Text>
      )}

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{episode.logCount}</Text>
          <Text style={styles.statLabel}>entries</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: Colors.active,
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
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
