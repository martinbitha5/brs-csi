// Service de gestion des notifications push
// Gère l'enregistrement des tokens et la réception des notifications

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationPriority, NotificationType } from '@/types';
import { authService } from './authService';

const STORAGE_KEY = '@brs_csi_push_token';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const pushNotificationService = {
  /**
   * Enregistre le token de notification push pour l'utilisateur actuel
   * @returns Token de notification push ou null si l'enregistrement échoue
   */
  registerForPushNotifications: async (): Promise<string | null> => {
    try {
      // Vérifier si on est sur un appareil physique
      if (!Device.isDevice) {
        console.warn('Les notifications push nécessitent un appareil physique');
        return null;
      }

      // Vérifier les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permission de notification refusée');
        return null;
      }

      // Configuration Android - créer les canaux avant d'obtenir le token
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Notifications par défaut',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3B82F6',
            sound: 'default',
            description: 'Notifications importantes pour les alertes de bagages',
          });

          await Notifications.setNotificationChannelAsync('urgent', {
            name: 'Notifications urgentes',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#EF4444',
            sound: 'default',
            description: 'Notifications urgentes pour les alertes critiques',
          });
        } catch (channelError) {
          console.warn('Erreur lors de la création des canaux Android:', channelError);
          // Continuer même si la création des canaux échoue
        }
      }

      // Obtenir le token
      // Utiliser le project ID depuis Constants ou extraire depuis app.json
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                        Constants.expoConfig?.extra?.projectId ||
                        Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('Project ID non trouvé. Les notifications push peuvent ne pas fonctionner correctement.');
      }

      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      const token = tokenData.data;

      // Sauvegarder le token
      await AsyncStorage.setItem(STORAGE_KEY, token);

      // Enregistrer le token avec l'utilisateur (ici, vous devriez envoyer au backend)
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // TODO: Envoyer le token au backend pour l'associer à l'utilisateur
        console.log('Token push enregistré pour:', currentUser.email, token);
      }

      return token;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des notifications push:', error);
      return null;
    }
  },

  /**
   * Récupère le token de notification push stocké
   */
  getStoredToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  },

  /**
   * Configure les listeners pour les notifications reçues
   */
  setupNotificationListeners: (
    onNotificationReceived: (notification: Notification) => void,
    onNotificationTapped?: (notification: Notification) => void
  ): { remove: () => void } => {
    // Listener pour les notifications reçues en foreground
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as any;
        
        // Convertir la notification Expo en Notification de l'app
        const appNotification: Notification = {
          id: String(data?.id || notification.request.identifier || ''),
          type: (data?.type as NotificationType) || NotificationType.FLIGHT_CLOSING_WITH_MISSING_BAGS,
          priority: (data?.priority as NotificationPriority) || NotificationPriority.MEDIUM,
          title: String(notification.request.content.title || data?.title || ''),
          message: String(notification.request.content.body || data?.message || ''),
          flight_id: data?.flight_id ? String(data.flight_id) : undefined,
          bag_set_id: data?.bag_set_id ? String(data.bag_set_id) : undefined,
          bag_piece_id: data?.bag_piece_id ? String(data.bag_piece_id) : undefined,
          station: data?.station ? String(data.station) : undefined,
          read: false,
          created_at: String(data?.created_at || new Date().toISOString()),
          expires_at: data?.expires_at ? String(data.expires_at) : undefined,
        };

        onNotificationReceived(appNotification);
      }
    );

    // Listener pour les notifications tapées (quand l'utilisateur clique dessus)
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as any;
        
        const appNotification: Notification = {
          id: String(data?.id || response.notification.request.identifier || ''),
          type: (data?.type as NotificationType) || NotificationType.FLIGHT_CLOSING_WITH_MISSING_BAGS,
          priority: (data?.priority as NotificationPriority) || NotificationPriority.MEDIUM,
          title: String(response.notification.request.content.title || data?.title || ''),
          message: String(response.notification.request.content.body || data?.message || ''),
          flight_id: data?.flight_id ? String(data.flight_id) : undefined,
          bag_set_id: data?.bag_set_id ? String(data.bag_set_id) : undefined,
          bag_piece_id: data?.bag_piece_id ? String(data.bag_piece_id) : undefined,
          station: data?.station ? String(data.station) : undefined,
          read: false,
          created_at: String(data?.created_at || new Date().toISOString()),
          expires_at: data?.expires_at ? String(data.expires_at) : undefined,
        };

        if (onNotificationTapped) {
          onNotificationTapped(appNotification);
        }
      }
    );

    // Retourner une fonction pour supprimer les listeners
    return {
      remove: () => {
        receivedListener.remove();
        responseListener.remove();
      },
    };
  },

  /**
   * Envoie une notification locale (pour les tests ou notifications locales)
   */
  sendLocalNotification: async (
    notification: Notification
  ): Promise<void> => {
    const channelId = notification.priority === NotificationPriority.URGENT 
      ? 'urgent' 
      : 'default';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.message,
        data: {
          id: notification.id,
          type: notification.type,
          priority: notification.priority,
          flight_id: notification.flight_id,
          bag_set_id: notification.bag_set_id,
          bag_piece_id: notification.bag_piece_id,
          station: notification.station,
          created_at: notification.created_at,
          expires_at: notification.expires_at,
        },
        sound: true,
        ...(Platform.OS === 'android' && { channelId }),
        priority: notification.priority === NotificationPriority.URGENT 
          ? Notifications.AndroidNotificationPriority.HIGH 
          : Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: null, // Envoi immédiat
    });
  },

  /**
   * Supprime toutes les notifications planifiées
   */
  cancelAllNotifications: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Supprime un badge de notification
   */
  clearBadge: async (): Promise<void> => {
    await Notifications.setBadgeCountAsync(0);
  },

  /**
   * Obtient le nombre de notifications non lues (badge)
   */
  getBadgeCount: async (): Promise<number> => {
    return await Notifications.getBadgeCountAsync();
  },

  /**
   * Met à jour le badge avec le nombre de notifications non lues
   */
  updateBadge: async (count: number): Promise<void> => {
    await Notifications.setBadgeCountAsync(count);
  },
};

