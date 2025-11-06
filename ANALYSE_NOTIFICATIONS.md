# Analyse du système de notifications - Ce qui manque

## 📋 Vue d'ensemble

Le système de notifications est fonctionnel mais incomplet. Voici un état des lieux détaillé.

---

## ✅ Ce qui est implémenté

### 1. **Composants UI**
- ✅ `NotificationList.tsx` - Liste des notifications avec pull-to-refresh
- ✅ `NotificationCard.tsx` - Carte de notification avec priorité et détails
- ✅ `NotificationBadge.tsx` - Badge avec compteur de notifications non lues
- ✅ `notifications.tsx` - Écran principal des notifications

### 2. **Services**
- ✅ `notificationService.ts` - Génération et gestion des notifications
- ✅ `pushNotificationService.ts` - Notifications push locales

### 3. **Types de notifications implémentés**
- ✅ `FLIGHT_CLOSING_WITH_MISSING_BAGS` - Vols à clôturer avec bagages manquants
- ✅ `INCOMPLETE_BAG_SET` - Lots de bagages incomplets

### 4. **Fonctionnalités**
- ✅ Génération automatique des notifications
- ✅ Filtrage par station (pour les agents/superviseurs)
- ✅ Priorités (URGENT, HIGH, MEDIUM, LOW)
- ✅ Expiration automatique des notifications (24h)
- ✅ Marquage comme lu/non lu
- ✅ Notifications push pour les alertes importantes
- ✅ Navigation vers les détails (vol, bagage)
- ✅ Refresh automatique toutes les 30 secondes
- ✅ Compteur de notifications non lues

---

## ❌ Ce qui manque

### 1. **Types de notifications non implémentés**

#### 🔴 `BAG_MISSING` (CRITIQUE)
**Défini dans** `types/index.ts` mais **non généré** dans `notificationService.ts`

**Ce qui devrait être fait :**
- Détecter les bagages avec statut `MISSING`
- Générer une notification pour chaque bagage manquant
- Inclure les détails du bagage (tag, vol, passager)
- Priorité HIGH ou URGENT selon le contexte

**Code manquant dans `notificationService.generateNotifications()` :**
```typescript
// Détecter les bagages manquants
const missingBagPieces = dataService.getMissingBagPieces(undefined, station);
missingBagPieces.forEach((bagPiece) => {
  const bagSet = dataService.getBagSet(bagPiece.bag_set_id);
  const passenger = bagSet ? dataService.getPassenger(bagSet.passenger_id) : null;
  const flight = bagSet ? dataService.getFlight(bagSet.flight_id) : null;
  
  // Vérifier qu'une notification pour ce vol n'existe pas déjà
  if (flight && !notifications.some((n) => n.flight_id === flight.id && n.type === NotificationType.BAG_MISSING)) {
    notifications.push({
      id: generateId(),
      type: NotificationType.BAG_MISSING,
      priority: NotificationPriority.HIGH,
      title: `Bagage manquant - ${bagPiece.tag_full}`,
      message: `Le bagage ${bagPiece.tag_full}${passenger ? ` de ${passenger.name}` : ''}${flight ? ` (Vol ${flight.code})` : ''} est marqué comme manquant.`,
      flight_id: flight?.id,
      bag_set_id: bagSet?.id,
      bag_piece_id: bagPiece.id,
      station: station,
      read: false,
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + NOTIFICATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
    });
  }
});
```

#### 🟡 `FLIGHT_DEPARTING_SOON` (MOYEN)
**Défini dans** `types/index.ts` mais **non généré** dans `notificationService.ts`

**Ce qui devrait être fait :**
- Détecter les vols qui partent bientôt (ex: dans les 2 heures)
- Générer une notification pour alerter les agents
- Priorité MEDIUM ou HIGH selon le temps restant

**Code manquant dans `notificationService.generateNotifications()` :**
```typescript
// Détecter les vols qui partent bientôt
const flights = dataService.getFlights();
const now = new Date();
const DEPARTURE_WARNING_MINUTES = 120; // 2 heures

flights.forEach((flight) => {
  const flightDate = new Date(flight.date);
  const minutesUntilDeparture = (flightDate.getTime() - now.getTime()) / (1000 * 60);
  
  if (minutesUntilDeparture > 0 && minutesUntilDeparture <= DEPARTURE_WARNING_MINUTES) {
    // Vérifier qu'une notification pour ce vol n'existe pas déjà
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
});
```

---

### 2. **Persistance des notifications lues**

**Problème actuel :**
- Les notifications lues sont stockées uniquement en mémoire (`readNotifications` dans `NotificationList`)
- Lors du rechargement de l'app, toutes les notifications redeviennent non lues

**Solution nécessaire :**
- Utiliser `AsyncStorage` pour sauvegarder les IDs des notifications lues
- Charger cette liste au démarrage de l'app
- Synchroniser avec le service de notifications

**Fichiers à modifier :**
- `components/notifications/NotificationList.tsx` - Ajouter la persistance
- `services/notificationService.ts` - Ajouter des méthodes de sauvegarde/chargement

---

### 3. **Actions manquantes dans l'interface**

#### Marquer toutes comme lues
- Bouton "Tout marquer comme lu" dans l'en-tête
- Action rapide pour les superviseurs/admins

#### Filtrage avancé
- Filtrer par type de notification
- Filtrer par priorité
- Filtrer par vol
- Trier par date, priorité, type

#### Suppression groupée
- Sélection multiple de notifications
- Suppression en lot

---

### 4. **Gestion des notifications expirées**

**Problème actuel :**
- Les notifications expirées sont filtrées mais pas supprimées définitivement
- Elles peuvent réapparaître si les conditions sont recréées

**Amélioration suggérée :**
- Marquer les notifications expirées comme "archivées"
- Option pour voir les notifications archivées
- Nettoyage automatique périodique

---

### 5. **Statistiques et rapports**

**Manquant :**
- Nombre de notifications par type
- Nombre de notifications par priorité
- Historique des notifications (graphiques)
- Temps de réponse moyen aux notifications urgentes

---

### 6. **Notifications en temps réel**

**Problème actuel :**
- Refresh toutes les 30 secondes (polling)
- Pas de système de push notifications réel (serveur)

**Amélioration suggérée :**
- Intégration avec un service de push notifications (Firebase, OneSignal, etc.)
- WebSockets pour les mises à jour en temps réel
- Notifications même quand l'app est en arrière-plan

---

### 7. **Tests et validation**

**Manquant :**
- Tests unitaires pour `notificationService`
- Tests d'intégration pour le flux de notifications
- Tests de performance avec beaucoup de notifications
- Validation des données de notification

---

### 8. **Accessibilité et internationalisation**

**Manquant :**
- Support multilingue pour les messages de notification
- Support des lecteurs d'écran
- Contraste des couleurs pour les priorités
- Tailles de police adaptatives

---

### 9. **Gestion des erreurs**

**Manquant :**
- Gestion d'erreur si `dataService` échoue
- Retry automatique en cas d'échec
- Messages d'erreur utilisateur-friendly
- Logging des erreurs

---

### 10. **Optimisations**

**Améliorations possibles :**
- Debounce pour éviter trop de recalculs
- Mémoïsation des notifications générées
- Pagination pour les grandes listes
- Lazy loading des détails

---

## 🎯 Priorités recommandées

### 🔴 **URGENT** (À faire immédiatement)
1. ✅ Implémenter `BAG_MISSING` notifications
2. ✅ Persistance des notifications lues

### 🟡 **IMPORTANT** (À faire bientôt)
3. ✅ Implémenter `FLIGHT_DEPARTING_SOON` notifications
4. ✅ Ajouter "Marquer toutes comme lues"
5. ✅ Améliorer la gestion des erreurs

### 🟢 **AMÉLIORATION** (À faire plus tard)
6. Filtrage et tri avancés
7. Statistiques et rapports
8. Push notifications serveur
9. Tests unitaires
10. Internationalisation

---

## 📝 Notes techniques

### Structure actuelle
```
notifications.tsx (écran)
  └── NotificationList (composant)
      ├── NotificationCard (carte individuelle)
      └── notificationService (génération)
          └── dataService (données)
```

### Points d'attention
- Les notifications sont générées à chaque appel de `generateNotifications()`
- Pas de cache, donc recalcul à chaque fois
- Les IDs sont générés avec timestamp + random (risque de collision faible mais possible)

---

## 🔧 Fichiers à modifier pour compléter l'implémentation

1. **`services/notificationService.ts`**
   - Ajouter la génération de `BAG_MISSING`
   - Ajouter la génération de `FLIGHT_DEPARTING_SOON`
   - Ajouter la persistance des notifications lues

2. **`components/notifications/NotificationList.tsx`**
   - Ajouter la persistance avec AsyncStorage
   - Ajouter le bouton "Tout marquer comme lu"
   - Ajouter les filtres et tri

3. **`app/(tabs)/notifications.tsx`**
   - Ajouter les actions supplémentaires si nécessaire

---

## ✅ Checklist de complétion

- [ ] Implémenter `BAG_MISSING` notifications
- [ ] Implémenter `FLIGHT_DEPARTING_SOON` notifications
- [ ] Persistance des notifications lues
- [ ] Bouton "Marquer toutes comme lues"
- [ ] Filtrage par type/priorité
- [ ] Tri avancé
- [ ] Gestion d'erreurs améliorée
- [ ] Tests unitaires
- [ ] Internationalisation
- [ ] Push notifications serveur

---

*Dernière mise à jour : Analyse complète du système de notifications*

