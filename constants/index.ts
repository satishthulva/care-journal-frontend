// API Configuration
// For development, use localhost. For device testing, use your machine's IP.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
export const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'changeme-replace-before-sharing';

// Log API configuration at startup
console.log('[Config] API_BASE_URL:', API_BASE_URL);
console.log('[Config] API_KEY configured:', API_KEY ? 'yes' : 'no');

// Colors
export const Colors = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#10B981',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  // Log type colors
  note: '#6B7280',
  symptom: '#EF4444',
  medication: '#3B82F6',
  mood: '#F59E0B',
  event: '#8B5CF6',
  // Episode status colors
  active: '#10B981',
  closed: '#6B7280',
  archived: '#9CA3AF',
};

// Log Types
export const LogTypes = {
  NOTE: { label: 'Note', color: Colors.note, icon: 'document-text' },
  SYMPTOM: { label: 'Symptom', color: Colors.symptom, icon: 'fitness' },
  MEDICATION: { label: 'Medication', color: Colors.medication, icon: 'medkit' },
  MOOD: { label: 'Mood', color: Colors.mood, icon: 'happy' },
  EVENT: { label: 'Event', color: Colors.event, icon: 'calendar' },
} as const;

export type LogType = keyof typeof LogTypes;
