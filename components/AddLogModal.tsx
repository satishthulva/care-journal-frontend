import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, LogTypes } from '@/constants';
import type { LogType } from '@/api/types';

interface AddLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string, type: LogType, tags: string[]) => void;
  isLoading?: boolean;
}

export function AddLogModal({ visible, onClose, onSubmit, isLoading }: AddLogModalProps) {
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<LogType>('NOTE');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit(content.trim(), selectedType, tags);
    setContent('');
    setSelectedType('NOTE');
    setTagsInput('');
  };

  const logTypes = Object.entries(LogTypes) as [LogType, typeof LogTypes.NOTE][];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Entry</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeSelector}
            contentContainerStyle={styles.typeSelectorContent}
          >
            {logTypes.map(([type, info]) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  selectedType === type && { backgroundColor: info.color + '20', borderColor: info.color },
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    selectedType === type && { color: info.color },
                  ]}
                >
                  {info.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind?"
            placeholderTextColor={Colors.textSecondary}
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />

          <TextInput
            style={styles.tagsInput}
            placeholder="Tags (comma-separated)"
            placeholderTextColor={Colors.textSecondary}
            value={tagsInput}
            onChangeText={setTagsInput}
          />

          <TouchableOpacity
            style={[styles.submitButton, !content.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!content.trim() || isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : 'Save Entry'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: Colors.primary,
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeSelectorContent: {
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  contentInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  tagsInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
