import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants';
import type { Message } from '@/api/types';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'USER';

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.content, isUser && styles.contentUser]}>
          {message.content}
        </Text>
      </View>
      <Text style={[styles.time, isUser && styles.timeUser]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginVertical: 4,
    marginHorizontal: 16,
  },
  containerUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  contentUser: {
    color: '#fff',
  },
  time: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: 8,
  },
  timeUser: {
    marginRight: 8,
    marginLeft: 0,
  },
});
