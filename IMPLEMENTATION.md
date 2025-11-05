# Implémentation BRS-CSI

## Structure du projet

Le projet a été structuré selon les spécifications du projet BRS-CSI. Voici ce qui a été implémenté :

### Types et modèles de données

- **`types/index.ts`** : Tous les types TypeScript correspondant au modèle de données
  - Flights, Passengers, BagSets, BagPieces, ScanLogs
  - Enums pour les statuts (BagPieceStatus, BagSetStatus, PassengerStatus, etc.)
  - Types pour les formulaires et réponses API

### Constantes

- **`constants/airports.ts`** : Liste des 9 aéroports avec codes IATA
- **`constants/statusLabels.ts`** : Labels en français et couleurs pour les statuts

### Services

- **`services/dataService.ts`** : Service de gestion des données (simulation locale)
  - Gestion des vols, passagers, lots de bagages, pièces de bagage
  - Fonction de scan avec validation
  - Fonction de recherche par tag, PNR ou nom
  - Initialisation avec données de test

### Composants UI

#### Composants de bagage
- **`components/baggage/StatusBadge.tsx`** : Badge affichant le statut d'un bagage
- **`components/baggage/BaggageCard.tsx`** : Carte affichant les informations d'une pièce de bagage
- **`components/baggage/BaggageList.tsx`** : Liste complète des bagages d'un passager avec progression

#### Composants de formulaire
- **`components/forms/ScanInput.tsx`** : Champ de saisie pour scanner un bagage
- **`components/forms/SearchInput.tsx`** : Champ de recherche avec onglets (tag/PNR)

### Écrans

- **`app/(tabs)/index.tsx`** : Écran d'accueil avec actions rapides
- **`app/(tabs)/scan.tsx`** : Écran de scan pour les agents
- **`app/(tabs)/search.tsx`** : Écran de recherche pour les agents
- **`app/(tabs)/_layout.tsx`** : Navigation par onglets mise à jour

## Fonctionnalités implémentées

### ✅ Phase 1 : Structure de base
- [x] Types TypeScript complets
- [x] Constantes (aéroports, statuts)
- [x] Service de données avec simulation locale
- [x] Composants UI réutilisables

### ✅ Phase 2 : Interfaces utilisateur
- [x] Écran de scan de bagage
- [x] Écran de recherche de bagage
- [x] Affichage des informations de bagage
- [x] Gestion des lots de bagages (progression X/N)
- [x] Gestion du cas "0 bagage"

## Données de test

Le service inclut une fonction `initializeTestData()` qui crée :
- Un vol : FIH-FKI (Kinshasa → Kisangani)
- Un passager : Jean Doe (PNR: ABC123, 2 bagages)
- Un lot de bagages : base_tag 907136637
- 2 pièces : 9071366371 et 9071366372

## Prochaines étapes

### À implémenter
1. **Authentification** : Système de connexion avec rôles (Agent, Superviseur, Admin)
2. **Scanner QR/Barcode** : Intégration d'Expo Camera ou Barcode Scanner
3. **API Backend** : Remplacer la simulation locale par de vraies API
4. **Import CSV/Excel** : Fonctionnalité d'import de données depuis le système de check-in
5. **Notifications** : Alertes pour bagages manquants, vols à clôturer
6. **Reporting** : Statistiques et exports pour superviseurs
7. **Gestion multi-station** : Sélection de la station active pour les agents

### Améliorations UI/UX
- Animation lors du scan
- Feedback haptique
- Mode hors ligne
- Synchronisation automatique

## Démarrage

```bash
# Installer les dépendances (si nécessaire)
npm install

# Démarrer l'application
npm start

# Ou spécifier la plateforme
npm run android
npm run ios
npm run web
```

## Structure des dossiers

```
BRS-CSI/
├── app/                    # Écrans Expo Router
│   ├── (tabs)/            # Navigation par onglets
│   └── _layout.tsx        # Layout principal
├── components/             # Composants réutilisables
│   ├── baggage/          # Composants liés aux bagages
│   └── forms/            # Composants de formulaire
├── constants/             # Constantes (aéroports, labels)
├── services/              # Services (dataService)
├── types/                 # Types TypeScript
└── hooks/                 # Hooks React personnalisés
```

## Notes importantes

- Le service de données actuel est une **simulation en mémoire** qui sera remplacée par une vraie API
- Les données sont réinitialisées à chaque redémarrage de l'application
- L'authentification n'est pas encore implémentée (utiliser l'ID agent-1 par défaut)
- Le scanner QR/Barcode n'est pas encore intégré (saisie manuelle uniquement)

