import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Notification, NotificationPriority } from '@/types';
import { notificationService } from '@/services/notificationService';
import { pushNotificationService } from '@/services/pushNotificationService';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface NotificationBadgeProps {
  station?: string;
  onPress?: () => void;
}

export function NotificationBadge({ station, onPress }: NotificationBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUrgent, setHasUrgent] = useState(false);

  useEffect(() => {
    const updateBadge = async () => {
      const notifications = await notificationService.generateNotifications(station);
      const filtered = notificationService.filterExpired(notifications);
      const counts = notificationService.countUnreadByPriority(filtered);
      
      setUnreadCount(counts.total);
      setHasUrgent(counts.urgent > 0);
      
      // Mettre à jour le badge de notification push
      try {
        await pushNotificationService.updateBadge(counts.total);
      } catch (error) {
        // Ignorer les erreurs silencieusement si les notifications push ne sont pas disponibles
        console.debug('Impossible de mettre à jour le badge push:', error);
      }
    };

    updateBadge();
    
    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(updateBadge, 30000);

    return () => clearInterval(interval);
  }, [station]);

  if (unreadCount === 0) {
    return null;
  }

  const badgeColor = hasUrgent ? '#EF4444' : '#3B82F6';

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="notifications"
          size={24}
          color={isDark ? '#ECEDEE' : '#11181C'}
        />
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});

