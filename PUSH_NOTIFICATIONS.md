# Configuration des Notifications Push

## Vue d'ensemble

Le système de notifications push a été intégré dans l'application BRS-CSI. Il permet d'envoyer des notifications push aux utilisateurs pour les alertes importantes concernant les bagages et les vols.

## Fonctionnalités implémentées

### 1. Enregistrement des tokens
- Enregistrement automatique du token de notification push lors de la connexion
- Stockage du token dans AsyncStorage
- Support iOS et Android

### 2. Gestion des notifications
- **Notifications en foreground** : Affichage automatique des notifications reçues lorsque l'app est ouverte
- **Notifications tapées** : Navigation automatique vers la page appropriée quand l'utilisateur clique sur une notification
- **Badge de notification** : Mise à jour automatique du badge avec le nombre de notifications non lues

### 3. Intégration avec le système existant
- Détection automatique des nouvelles alertes importantes (urgentes ou high priority)
- Envoi de notifications push pour les nouvelles alertes
- Synchronisation avec le système de notifications in-app

## Configuration requise

### Pour le développement local
Les notifications push fonctionnent sur les appareils physiques. Pour tester:
1. Utilisez l'application sur un appareil physique (iOS ou Android)
2. Les notifications locales fonctionneront automatiquement

### Pour la production (notifications push distantes)
Pour recevoir des notifications push depuis un serveur, vous devez:

1. **Configurer un projet Expo** :
   - Créez un compte sur [expo.dev](https://expo.dev)
   - Créez un nouveau projet ou liez votre projet existant
   - Obtenez votre Project ID

2. **Ajouter le Project ID dans app.json** :
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "votre-project-id"
         }
       }
     }
   }
   ```

3. **Configurer EAS (Expo Application Services)** :
   - Installez EAS CLI : `npm install -g eas-cli`
   - Connectez-vous : `eas login`
   - Configurez votre projet : `eas build:configure`

4. **Backend pour envoyer des notifications** :
   - Utilisez le service Expo Push Notification API
   - Envoyez les notifications via HTTP POST vers `https://exp.host/--/api/v2/push/send`
   - Format du payload :
     ```json
     {
       "to": "ExponentPushToken[...]",
       "sound": "default",
       "title": "Titre de la notification",
       "body": "Message de la notification",
       "data": {
         "id": "notification-id",
         "type": "FLIGHT_CLOSING_WITH_MISSING_BAGS",
         "priority": "urgent",
         "flight_id": "flight-id",
         ...
       }
     }
     ```

## Structure des fichiers

### Services
- **`services/pushNotificationService.ts`** : Service principal pour gérer les notifications push
  - `registerForPushNotifications()` : Enregistre le token
  - `setupNotificationListeners()` : Configure les listeners
  - `sendLocalNotification()` : Envoie une notification locale
  - `updateBadge()` : Met à jour le badge

### Composants
- **`components/notifications/NotificationBadge.tsx`** : Badge avec synchronisation push
- **`components/notifications/NotificationList.tsx`** : Liste avec déclenchement de push notifications

### App Layout
- **`app/_layout.tsx`** : Initialisation des notifications push au démarrage

## Utilisation

### Enregistrement automatique
Les notifications push sont automatiquement enregistrées lorsque:
- L'utilisateur se connecte
- L'application démarre et l'utilisateur est authentifié

### Envoi de notifications
Les notifications push sont automatiquement envoyées pour:
- Nouvelles alertes urgentes (URGENT priority)
- Nouvelles alertes importantes (HIGH priority)
- Vols à clôturer avec bagages manquants
- Lots de bagages incomplets

### Navigation depuis les notifications
Quand l'utilisateur clique sur une notification:
- **Bagage spécifique** : Navigation vers la page de recherche avec le tag du bagage
- **Lot de bagages** : Navigation vers la page de recherche avec le premier bagage du lot
- **Vol** : Navigation vers la page superviseur pour voir les statistiques

## Tests

### Tester les notifications locales
```typescript
import { pushNotificationService } from '@/services/pushNotificationService';
import { Notification, NotificationPriority } from '@/types';

const testNotification: Notification = {
  id: 'test-1',
  type: NotificationType.FLIGHT_CLOSING_WITH_MISSING_BAGS,
  priority: NotificationPriority.URGENT,
  title: 'Test Notification',
  message: 'Ceci est une notification de test',
  read: false,
  created_at: new Date().toISOString(),
};

await pushNotificationService.sendLocalNotification(testNotification);
```

## Notes importantes

1. **Appareil physique requis** : Les notifications push ne fonctionnent pas sur les simulateurs/émulateurs
2. **Permissions** : L'application demande automatiquement les permissions de notification
3. **Badge** : Le badge est automatiquement mis à jour avec le nombre de notifications non lues
4. **Canal Android** : Les notifications sont configurées avec des canaux Android (default et urgent)

## Dépannage

### Les notifications ne s'affichent pas
- Vérifiez que vous êtes sur un appareil physique
- Vérifiez que les permissions de notification sont accordées
- Vérifiez les logs de la console pour les erreurs

### Le Project ID n'est pas trouvé
- Ajoutez le Project ID dans `app.json` sous `expo.extra.eas.projectId`
- Ou configurez EAS pour votre projet

### Les notifications push distantes ne fonctionnent pas
- Vérifiez que le token est correctement enregistré
- Vérifiez que le backend envoie les notifications avec le bon format
- Vérifiez que le Project ID est correctement configuré

