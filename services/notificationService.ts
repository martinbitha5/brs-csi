// Service de gestion des notifications
// Détecte les situations nécessitant une attention des agents

import {
  Notification,
  NotificationType,
  NotificationPriority,
  FlightClosingNotification,
  Flight,
  BagSet,
  BagPiece,
  BagPieceStatus,
  BagSetStatus,
} from '@/types';
import { apiService } from './apiService';
import { pushNotificationService } from './pushNotificationService';
import { apiClient } from './apiClient';

// Génération d'ID UUID simple
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Durée avant clôture d'un vol (en minutes) pour déclencher une notification
const FLIGHT_CLOSING_THRESHOLD_MINUTES = 30; // 30 minutes avant la clôture

// Durée de validité d'une notification (en heures)
const NOTIFICATION_EXPIRY_HOURS = 24;

export const notificationService = {
  /**
   * Détecte les vols qui vont clôturer avec des bagages manquants
   * @param station - Station optionnelle pour filtrer par station
   * @returns Liste des notifications de vols à clôturer
   */
  checkFlightsClosingWithMissingBags: async (
    station?: string
  ): Promise<FlightClosingNotification[]> => {
    const flights = await apiService.getFlights();
    const now = new Date();
    const notifications: FlightClosingNotification[] = [];

    for (const flight of flights) {
      // Calculer l'heure de clôture estimée (par exemple, 30 min avant le départ)
      // Pour cette simulation, on considère que le vol ferme 30 min après la date du vol
      const flightDate = new Date(flight.date);
      const closingTime = new Date(flightDate.getTime() + 30 * 60 * 1000); // 30 min après
      
      // Vérifier si le vol est proche de la clôture
      const timeUntilClosing = closingTime.getTime() - now.getTime();
      const minutesUntilClosing = timeUntilClosing / (1000 * 60);

      if (
        minutesUntilClosing > 0 &&
        minutesUntilClosing <= FLIGHT_CLOSING_THRESHOLD_MINUTES
      ) {
        // Vérifier les bagages manquants pour ce vol
        const incompleteSets = await apiService.checkIncompleteBagSets(flight.id);
        const missingBagPieces = await apiService.getMissingBagPieces(flight.id, station);

        // Filtrer les sets incomplets qui ont vraiment des problèmes
        const problematicSets: BagSet[] = [];
        for (const bagSet of incompleteSets) {
          const pieces = await apiService.getBagPiecesBySet(bagSet.id);
          const scannedPieces = pieces.filter(
            (bp) =>
              bp.status !== BagPieceStatus.CREATED &&
              bp.status !== BagPieceStatus.MISSING
          );
          if (scannedPieces.length < bagSet.pieces_expected) {
            problematicSets.push(bagSet);
          }
        }

        if (problematicSets.length > 0 || missingBagPieces.length > 0) {
          notifications.push({
            flight,
            missingBagsCount: missingBagPieces.length,
            incompleteSetsCount: problematicSets.length,
            closingTime: closingTime.toISOString(),
          });
        }
      }
    }

    return notifications.sort((a, b) => {
      const timeA = new Date(a.closingTime).getTime();
      const timeB = new Date(b.closingTime).getTime();
      return timeA - timeB; // Plus proche en premier
    });
  },

  /**
   * Génère des notifications à partir des détections et les sauvegarde dans Supabase
   * @param station - Station optionnelle pour filtrer
   * @returns Liste des notifications générées
   */
  generateNotifications: async (station?: string): Promise<Notification[]> => {
    const notifications: Notification[] = [];
    const now = new Date();

    // Détecter les vols qui partent bientôt
    const flights = await apiService.getFlights();
    const DEPARTURE_WARNING_MINUTES = 120; // 2 heures

    for (const flight of flights) {
      const flightDate = new Date(flight.date);
      const minutesUntilDeparture = (flightDate.getTime() - now.getTime()) / (1000 * 60);
      
      if (minutesUntilDeparture > 0 && minutesUntilDeparture <= DEPARTURE_WARNING_MINUTES) {
        if (!notifications.some((n) => n.flight_id === flight.id && n.type === NotificationType.FLIGHT_DEPARTING_SOON)) {
          const priority = minutesUntilDeparture <= 60 
            ? NotificationPriority.HIGH 
            : NotificationPriority.MEDIUM;
          
          notifications.push({
            id: generateId(),
            type: NotificationType.FLIGHT_DEPARTING_SOON,
            priority,
            title: `Vol ${flight.code} - Départ imminent`,
            message: `Le vol ${flight.code}${flight.route ? ` (${flight.route})` : ''} part dans ${Math.round(minutesUntilDeparture)} minute(s).`,
            flight_id: flight.id,
            station: station,
            read: false,
            created_at: now.toISOString(),
            expires_at: flightDate.toISOString(),
          });
        }
      }
    }

    // Détecter les vols à clôturer avec bagages manquants
    const flightClosingAlerts = await notificationService.checkFlightsClosingWithMissingBags(
      station
    );

    flightClosingAlerts.forEach((alert) => {
      const closingTime = new Date(alert.closingTime);
      const minutesUntilClosing = (closingTime.getTime() - now.getTime()) / (1000 * 60);
      
      // Déterminer la priorité selon le temps restant
      let priority: NotificationPriority;
      if (minutesUntilClosing <= 15) {
        priority = NotificationPriority.URGENT;
      } else if (minutesUntilClosing <= 30) {
        priority = NotificationPriority.HIGH;
      } else {
        priority = NotificationPriority.MEDIUM;
      }

      const message =
        alert.missingBagsCount > 0 && alert.incompleteSetsCount > 0
          ? `${alert.missingBagsCount} bagage(s) manquant(s) et ${alert.incompleteSetsCount} lot(s) incomplet(s) détecté(s)`
          : alert.missingBagsCount > 0
            ? `${alert.missingBagsCount} bagage(s) manquant(s) détecté(s)`
            : `${alert.incompleteSetsCount} lot(s) incomplet(s) détecté(s)`;

      notifications.push({
        id: generateId(),
        type: NotificationType.FLIGHT_CLOSING_WITH_MISSING_BAGS,
        priority,
        title: `Vol ${alert.flight.code} - Clôture imminente`,
        message: `${message}. Le vol clôture dans ${Math.round(minutesUntilClosing)} minute(s).`,
        flight_id: alert.flight.id,
        station: station,
        read: false,
        created_at: now.toISOString(),
        expires_at: new Date(
          now.getTime() + NOTIFICATION_EXPIRY_HOURS * 60 * 60 * 1000
        ).toISOString(),
      });
    });

    // Détecter les lots incomplets (notification moins urgente)
    const incompleteSets = await apiService.checkIncompleteBagSets();
    for (const bagSet of incompleteSets) {
      const pieces = await apiService.getBagPiecesBySet(bagSet.id);
      const scannedPieces = pieces.filter(
        (bp) =>
          bp.status !== BagPieceStatus.CREATED &&
          bp.status !== BagPieceStatus.MISSING
      );

      if (scannedPieces.length < bagSet.pieces_expected) {
        // Vérifier si une notification pour ce vol n'existe pas déjà
        const flight = await apiService.getFlight(bagSet.flight_id);
        if (flight && !notifications.some((n) => n.flight_id === flight.id)) {
          const missingCount = bagSet.pieces_expected - scannedPieces.length;
          notifications.push({
            id: generateId(),
            type: NotificationType.INCOMPLETE_BAG_SET,
            priority: NotificationPriority.MEDIUM,
            title: `Lot de bagages incomplet`,
            message: `Le lot ${bagSet.base_tag} du vol ${flight.code} a ${missingCount} pièce(s) manquante(s) (${scannedPieces.length}/${bagSet.pieces_expected}).`,
            flight_id: flight.id,
            bag_set_id: bagSet.id,
            station: station,
            read: false,
            created_at: now.toISOString(),
            expires_at: new Date(
              now.getTime() + NOTIFICATION_EXPIRY_HOURS * 60 * 60 * 1000
            ).toISOString(),
          });
        }
      }
    }

    // Détecter les bagages manquants
    const missingBagPieces = await apiService.getMissingBagPieces(undefined, station);
    for (const bagPiece of missingBagPieces) {
      const bagSet = await apiService.getBagSet(bagPiece.bag_set_id);
      if (!bagSet) continue;
      
      const passenger = await apiService.getPassenger(bagSet.passenger_id);
      const flight = await apiService.getFlight(bagSet.flight_id);
      
      if (flight && !notifications.some((n) => n.bag_piece_id === bagPiece.id)) {
        // Déterminer la priorité selon le contexte
        const flightDate = new Date(flight.date);
        const minutesUntilDeparture = (flightDate.getTime() - now.getTime()) / (1000 * 60);
        const priority = minutesUntilDeparture <= 60
          ? NotificationPriority.URGENT
          : NotificationPriority.HIGH;
        
        notifications.push({
          id: generateId(),
          type: NotificationType.BAG_MISSING,
          priority,
          title: `Bagage manquant - ${bagPiece.tag_full}`,
          message: `Le bagage ${bagPiece.tag_full}${passenger ? ` de ${passenger.name}` : ''}${flight ? ` (Vol ${flight.code})` : ''} est marqué comme manquant.`,
          flight_id: flight.id,
          bag_set_id: bagSet.id,
          bag_piece_id: bagPiece.id,
          station: station,
          read: false,
          created_at: now.toISOString(),
          expires_at: new Date(now.getTime() + NOTIFICATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Trier les notifications par priorité puis par date
    const sortedNotifications = notifications.sort((a, b) => {
      const priorityOrder = {
        [NotificationPriority.URGENT]: 4,
        [NotificationPriority.HIGH]: 3,
        [NotificationPriority.MEDIUM]: 2,
        [NotificationPriority.LOW]: 1,
      };
      
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    // Sauvegarder les notifications dans Supabase (éviter les doublons)
    await notificationService.persistNotifications(sortedNotifications, station);

    return sortedNotifications;
  },

  /**
   * Sauvegarde les notifications dans Supabase en évitant les doublons
   * @param notifications - Liste des notifications à sauvegarder
   * @param station - Station optionnelle pour filtrer
   */
  persistNotifications: async (
    notifications: Notification[],
    station?: string
  ): Promise<void> => {
    try {
      // Charger les notifications existantes pour éviter les doublons
      const existingNotifications = await apiClient.getNotifications({
        station,
        read: false,
      });

      const existingIds = new Set(
        existingNotifications.map((n) => {
          // Créer un identifiant unique basé sur le type et les références
          return `${n.type}-${n.flight_id || ''}-${n.bag_set_id || ''}-${n.bag_piece_id || ''}`;
        })
      );

      // Filtrer les nouvelles notifications qui n'existent pas déjà
      const newNotifications = notifications.filter((n) => {
        const uniqueId = `${n.type}-${n.flight_id || ''}-${n.bag_set_id || ''}-${n.bag_piece_id || ''}`;
        return !existingIds.has(uniqueId);
      });

      // Sauvegarder les nouvelles notifications
      for (const notification of newNotifications) {
        try {
          await apiClient.createNotification({
            type: notification.type,
            priority: notification.priority,
            title: notification.title,
            message: notification.message,
            flight_id: notification.flight_id,
            bag_set_id: notification.bag_set_id,
            bag_piece_id: notification.bag_piece_id,
            station: notification.station,
            read: notification.read,
            expires_at: notification.expires_at,
          });
        } catch (error) {
          // Ignorer les erreurs de création (peut être un doublon)
          console.debug('Erreur lors de la création de la notification:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la persistance des notifications:', error);
      // Ne pas bloquer si la persistance échoue
    }
  },

  /**
   * Charge les notifications depuis Supabase
   * @param station - Station optionnelle pour filtrer
   * @returns Liste des notifications chargées
   */
  loadNotifications: async (station?: string): Promise<Notification[]> => {
    try {
      const notifications = await apiClient.getNotifications({
        station,
      });

      // Filtrer les notifications expirées
      return notificationService.filterExpired(notifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      return [];
    }
  },

  /**
   * Marque une notification comme lue dans Supabase
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await apiClient.updateNotification(notificationId, { read: true });
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  },

  /**
   * Filtre les notifications expirées
   */
  filterExpired: (notifications: Notification[]): Notification[] => {
    const now = new Date();
    return notifications.filter((notification) => {
      if (!notification.expires_at) return true;
      return new Date(notification.expires_at) > now;
    });
  },

  /**
   * Compte les notifications non lues par priorité
   */
  countUnreadByPriority: (notifications: Notification[]): {
    urgent: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  } => {
    const unread = notifications.filter((n) => !n.read);
    return {
      urgent: unread.filter((n) => n.priority === NotificationPriority.URGENT).length,
      high: unread.filter((n) => n.priority === NotificationPriority.HIGH).length,
      medium: unread.filter((n) => n.priority === NotificationPriority.MEDIUM).length,
      low: unread.filter((n) => n.priority === NotificationPriority.LOW).length,
      total: unread.length,
    };
  },

  /**
   * Envoie des notifications push pour les notifications urgentes ou importantes
   * @param notifications - Liste des notifications à vérifier
   * @param previousNotificationIds - Set des IDs de notifications précédentes (pour détecter les nouvelles)
   */
  sendPushNotificationsForNewAlerts: async (
    notifications: Notification[],
    previousNotificationIds: Set<string> = new Set()
  ): Promise<void> => {
    try {
      // Filtrer uniquement les nouvelles notifications importantes (urgentes ou high)
      const newImportantNotifications = notifications.filter(
        (n) =>
          !previousNotificationIds.has(n.id) &&
          (n.priority === NotificationPriority.URGENT || n.priority === NotificationPriority.HIGH)
      );

      // Envoyer une notification push pour chaque nouvelle alerte importante
      for (const notification of newImportantNotifications) {
        await pushNotificationService.sendLocalNotification(notification);
      }
    } catch (error) {
      // Ignorer les erreurs silencieusement si les notifications push ne sont pas disponibles
      console.debug('Impossible d\'envoyer les notifications push:', error);
    }
  },
};

