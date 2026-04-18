import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, LogTypes } from '@/constants';
import type { Log } from '@/api/types';

interface LogCardProps {
  log: Log;
  onPress?: () => void;
  onDelete?: () => void;
}

export function LogCard({ log, onPress, onDelete }: LogCardProps) {
  const logTypeInfo = LogTypes[log.type] || LogTypes.NOTE;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: logTypeInfo.color + '20' }]}>
          <Text style={[styles.typeText, { color: logTypeInfo.color }]}>
            {logTypeInfo.label}
          </Text>
        </View>
        <Text style={styles.time}>{formatTime(log.loggedAt)}</Text>
      </View>

      <Text style={styles.content} numberOfLines={4}>
        {log.content}
      </Text>

      {log.tags.length > 0 && (
        <View style={styles.tags}>
          {log.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {log.tags.length > 3 && (
            <Text style={styles.moreTags}>+{log.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  content: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  moreTags: {
    fontSize: 12,
    color: Colors.textSecondary,
    alignSelf: 'center',
    marginLeft: 4,
  },
});
