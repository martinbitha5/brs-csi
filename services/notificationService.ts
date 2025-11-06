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
   * Génère des notifications à partir des détections
   * @param station - Station optionnelle pour filtrer
   * @returns Liste des notifications générées
   */
  generateNotifications: async (station?: string): Promise<Notification[]> => {
    const notifications: Notification[] = [];
    const now = new Date();

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

    return notifications.sort((a, b) => {
      // Trier par priorité puis par date
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
  },

  /**
   * Marque une notification comme lue
   */
  markAsRead: (notificationId: string): void => {
    // Dans une vraie implémentation, cela mettrait à jour la base de données
    // Pour l'instant, c'est géré par le composant qui maintient l'état local
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

