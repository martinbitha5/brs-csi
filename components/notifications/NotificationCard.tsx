import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Notification, NotificationPriority, Flight } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/services/apiService';

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onDismiss?: () => void;
}

export function NotificationCard({
  notification,
  onPress,
  onDismiss,
}: NotificationCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getPriorityColor = (priority: NotificationPriority): string => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return '#EF4444'; // red-500
      case NotificationPriority.HIGH:
        return '#F59E0B'; // amber-500
      case NotificationPriority.MEDIUM:
        return '#3B82F6'; // blue-500
      case NotificationPriority.LOW:
        return '#6B7280'; // gray-500
      default:
        return '#6B7280';
    }
  };

  const getPriorityIcon = (priority: NotificationPriority): keyof typeof Ionicons.glyphMap => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'alert-circle';
      case NotificationPriority.HIGH:
        return 'warning';
      case NotificationPriority.MEDIUM:
        return 'information-circle';
      case NotificationPriority.LOW:
        return 'notifications-outline';
      default:
        return 'notifications-outline';
    }
  };

  const priorityColor = getPriorityColor(notification.priority);
  const iconName = getPriorityIcon(notification.priority);

  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    const loadFlight = async () => {
      if (notification.flight_id) {
        const flightData = await apiService.getFlight(notification.flight_id);
        setFlight(flightData || null);
      }
    };
    loadFlight();
  }, [notification.flight_id]);

  const dynamicStyles = {
    card: {
      ...styles.card,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderLeftColor: priorityColor,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      // Opacité plus élevée pour meilleure lisibilité (0.9 au lieu de 0.7 pour les notifications lues)
      opacity: notification.read ? 0.9 : 1,
    },
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        dynamicStyles.card,
        pressed && styles.cardPressed,
      ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={24} color={priorityColor} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {notification.title}
            </ThemedText>
            {!notification.read && (
              <View style={[styles.unreadDot, { backgroundColor: priorityColor }]} />
            )}
          </View>
          <ThemedText style={styles.message}>{notification.message}</ThemedText>
          {flight && (
            <View style={[styles.flightDetails, {
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }]}>
              <View style={styles.flightDetailRow}>
                <Ionicons name="airplane-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <ThemedText style={styles.flightDetailText}>
                  <ThemedText type="defaultSemiBold">{flight.code}</ThemedText>
                  {flight.route && ` • ${flight.route}`}
                  {flight.date && ` • ${new Date(flight.date).toLocaleDateString('fr-FR')}`}
                </ThemedText>
              </View>
            </View>
          )}
          <View style={styles.footer}>
            <ThemedText style={styles.time}>
              {formatTime(notification.created_at)}
            </ThemedText>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: `${priorityColor}20` },
              ]}>
              <ThemedText
                style={[styles.priorityText, { color: priorityColor }]}>
                {notification.priority.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        </View>
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name="close"
              size={20}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 5,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
    opacity: 1, // Opacité complète pour meilleure lisibilité
    fontWeight: '400',
  },
  flightDetails: {
    marginTop: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  flightDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flightDetailText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 1, // Opacité complète pour les détails du vol
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 12,
    opacity: 0.7,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});

