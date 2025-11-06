import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ActivityHistory } from '@/components/agent/ActivityHistory';
import { authService } from '@/services/authService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';
import { Ionicons } from '@expo/vector-icons';

export default function ActivityScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentUser = authService.getCurrentUser();
  const { t } = useTranslation();

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      ...styles.header,
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
      borderBottomColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <ThemedView style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Ionicons 
              name="time-outline" 
              size={28} 
              color={isDark ? '#ECEDEE' : '#11181C'} 
              style={styles.titleIcon}
            />
            <ThemedText type="title" style={styles.title}>
              {t('activity.title')}
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.subtitle}>
            {t('activity.subtitle')}
          </ThemedText>
        </View>
      </ThemedView>
      <View style={styles.content}>
        <ActivityHistory 
          agentId={currentUser?.id}
          station={currentUser?.station || undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    marginLeft: 40,
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
});

