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
import { useChatStore } from '@/store/chatStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { ConversationCard } from '@/components/ConversationCard';
import { Colors } from '@/constants';
import type { Conversation } from '@/api/types';

export default function ChatScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    conversations,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    clearError,
  } = useChatStore();

  const { activeEpisode } = useEpisodeStore();

  useEffect(() => {
    console.log('[ChatScreen] Component mounted, fetching conversations...');
    fetchConversations();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [fetchConversations]);

  const handleNewChat = async (linkEpisode: boolean = false) => {
    console.log('[ChatScreen] handleNewChat called, linkEpisode:', linkEpisode);
    const linkedEpisodeId = linkEpisode && activeEpisode ? activeEpisode.id : undefined;
    console.log('[ChatScreen] Creating conversation with linkedEpisodeId:', linkedEpisodeId);
    const conversation = await createConversation(linkedEpisodeId);
    console.log('[ChatScreen] Created conversation result:', conversation);
    if (conversation) {
      router.push(`/chat/${conversation.id}`);
    }
  };

  const handleOpenConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    router.push(`/chat/${conversation.id}`);
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteConversation(conversation.id),
        },
      ]
    );
  };

  const showNewChatOptions = () => {
    console.log('[ChatScreen] showNewChatOptions called, activeEpisode:', activeEpisode?.id);
    if (activeEpisode) {
      Alert.alert('New Chat', 'Link this chat to your active episode for context?', [
        { text: 'No, Start Fresh', onPress: () => handleNewChat(false) },
        {
          text: `Yes, Link to "${activeEpisode.title}"`,
          onPress: () => handleNewChat(true),
        },
      ]);
    } else {
      handleNewChat(false);
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <ConversationCard
      conversation={item}
      onPress={() => handleOpenConversation(item)}
      onDelete={() => handleDeleteConversation(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a chat with your AI assistant to get insights and support
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={showNewChatOptions}>
        <Text style={styles.emptyButtonText}>Start Chatting</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity onPress={showNewChatOptions} style={styles.newChatButton}>
          <Text style={styles.newChatText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
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
  newChatButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newChatText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flex: 1,
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
