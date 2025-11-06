import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Notification } from '@/types';
import { NotificationCard } from './NotificationCard';
import { NotificationFilters } from './NotificationFilters';
import { notificationService } from '@/services/notificationService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationListProps {
  station?: string;
  onNotificationPress?: (notification: Notification) => void;
}

export function NotificationList({
  station,
  onNotificationPress,
}: NotificationListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(
    new Set()
  );
  const [refreshing, setRefreshing] = useState(false);
  const [previousNotificationIds, setPreviousNotificationIds] = useState<Set<string>>(
    new Set()
  );

  const STORAGE_KEY = '@brs_csi_read_notifications';

  // Charger les notifications lues depuis AsyncStorage au démarrage
  useEffect(() => {
    const loadReadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const readIds = JSON.parse(stored);
          setReadNotifications(new Set(readIds));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications lues:', error);
      }
    };
    loadReadNotifications();
  }, []);

  const loadNotifications = async () => {
    const generated = await notificationService.generateNotifications(station);
    const filtered = notificationService.filterExpired(generated);
    
    // Marquer comme lues celles qui étaient déjà lues
    const withReadStatus = filtered.map((n) => ({
      ...n,
      read: readNotifications.has(n.id),
    }));
    
    // Détecter et envoyer des push notifications pour les nouvelles alertes importantes
    const currentNotificationIds = new Set(filtered.map((n) => n.id));
    await notificationService.sendPushNotificationsForNewAlerts(
      filtered,
      previousNotificationIds
    );
    setPreviousNotificationIds(currentNotificationIds);
    
    setNotifications(withReadStatus);
    setFilteredNotifications(withReadStatus);
  };

  useEffect(() => {
    loadNotifications();
    
    // Recharger les notifications toutes les 30 secondes
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [station, readNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Marquer comme lue
    const newReadSet = new Set(readNotifications).add(notification.id);
    setReadNotifications(newReadSet);
    
    // Sauvegarder dans AsyncStorage
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newReadSet)));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications lues:', error);
    }
    
    // Mettre à jour l'état local
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    if (onNotificationPress) {
      onNotificationPress(notification);
    }
  };

  const handleMarkAllAsRead = async () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadNotifications(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(allIds)));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications lues:', error);
    }
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const unreadCount = notificationService.countUnreadByPriority(
    filteredNotifications
  ).total;

  if (filteredNotifications.length === 0 && notifications.length > 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          Aucune notification ne correspond aux filtres
        </ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Essayez de modifier vos critères de recherche
        </ThemedText>
      </ThemedView>
    );
  }

  if (notifications.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          Aucune notification pour le moment
        </ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Vous serez alerté en cas de problème avec les bagages ou les vols
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <NotificationFilters
        notifications={notifications}
        onFilterChange={setFilteredNotifications}
        onFilterReset={() => setFilteredNotifications(notifications)}
      />
      {unreadCount > 0 && (
        <ThemedView
          style={[
            styles.header,
            {
              backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
              borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
            },
          ]}>
          <View style={styles.headerRow}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
            </ThemedText>
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}>
              <ThemedText style={styles.markAllButtonText}>
                Tout marquer comme lu
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      )}
      <View style={styles.list}>
        {filteredNotifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => handleNotificationPress(notification)}
            onDismiss={() => handleDismiss(notification.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    flex: 1,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  markAllButtonText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

