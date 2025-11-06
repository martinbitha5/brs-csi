# Configuration Backend Supabase - BRS-CSI

Ce guide explique comment configurer le backend Supabase pour l'application BRS-CSI.

## 📋 Prérequis

- Un compte Supabase (https://supabase.com)
- Le projet Supabase créé avec les identifiants fournis

## 🔧 Configuration

### 1. Créer les tables dans Supabase

1. Connectez-vous à votre projet Supabase : https://vrjcwjjrgklhsmmyxucb.supabase.co
2. Allez dans l'éditeur SQL (SQL Editor)
3. Copiez le contenu du fichier `database/schema.sql`
4. Exécutez le script SQL pour créer toutes les tables nécessaires

### 2. Vérifier les politiques RLS

Les politiques Row Level Security (RLS) sont activées par défaut. Pour simplifier le développement initial, les politiques permettent l'accès à tous les utilisateurs authentifiés. Vous pouvez les ajuster selon vos besoins de sécurité.

### 3. Configuration de l'authentification (optionnel)

Si vous souhaitez utiliser l'authentification Supabase native :

1. Allez dans Authentication > Settings
2. Configurez les providers d'authentification (Email, etc.)
3. Mettez à jour `services/authService.ts` pour utiliser Supabase Auth

Pour l'instant, l'authentification reste locale avec AsyncStorage.

## 📁 Structure des fichiers

- `config/supabase.ts` : Configuration du client Supabase
- `services/apiClient.ts` : Client API de bas niveau pour Supabase
- `services/apiService.ts` : Service API de haut niveau (remplace dataService.ts)
- `database/schema.sql` : Schéma SQL pour créer les tables

## 🔄 Migration depuis dataService

Pour migrer votre application vers Supabase :

1. Remplacez les imports de `dataService` par `apiService`
2. Les méthodes sont maintenant asynchrones (utilisez `await`)
3. Les méthodes retournent des Promises

### Exemple de migration

**Avant (dataService)** :
```typescript
import { dataService } from '@/services/dataService';

const flight = dataService.getFlight(id);
const flights = dataService.getFlights();
```

**Après (apiService)** :
```typescript
import { apiService } from '@/services/apiService';

const flight = await apiService.getFlight(id);
const flights = await apiService.getFlights();
```

## 🚀 Utilisation

### Initialiser les données de test

```typescript
import { apiService } from '@/services/apiService';

// Dans votre composant ou au démarrage de l'app
await apiService.initializeTestData();
```

### Exemples d'utilisation

```typescript
// Récupérer un vol
const flight = await apiService.getFlight('flight-id');

// Créer un passager
const passenger = await apiService.createPassenger({
  name: 'John Doe',
  pnr: 'ABC123',
  flight_id: flight.id,
  pieces_declared: 2,
  status: PassengerStatus.BAGS_EXPECTED,
});

// Scanner un bagage
const result = await apiService.scanBaggage(
  '9071366371',
  'FIH',
  'agent-1',
  ScanAction.CHECKED_IN
);

// Rechercher un bagage
const searchResult = await apiService.searchBaggage(
  undefined,
  'ABC123',
  undefined
);
```

## 🔐 Sécurité

### Clés API

- **Anon Key** : Utilisée côté client (déjà configurée dans `config/supabase.ts`)
- **Service Role Key** : À utiliser uniquement côté serveur (ne jamais exposer côté client)

### Politiques RLS

Les politiques RLS actuelles permettent l'accès à tous les utilisateurs authentifiés. Pour la production, vous devriez :

1. Implémenter l'authentification Supabase
2. Créer des politiques RLS plus restrictives basées sur les rôles utilisateurs
3. Limiter l'accès aux données selon la station de l'utilisateur

## 📊 Tables créées

Le schéma SQL crée les tables suivantes :

- `users` : Utilisateurs de l'application
- `flights` : Vols
- `passengers` : Passagers
- `bag_sets` : Lots de bagages
- `bag_pieces` : Pièces de bagage individuelles
- `scan_logs` : Historique des scans
- `boarding_passes` : Cartes d'embarquement scannées
- `notifications` : Notifications système

## 🐛 Dépannage

### Erreur de connexion

Vérifiez que :
- L'URL Supabase est correcte dans `config/supabase.ts`
- La clé API anon est correcte
- Les tables ont été créées dans Supabase

### Erreurs de permissions

Vérifiez que :
- Les politiques RLS sont correctement configurées
- L'utilisateur est authentifié (si vous utilisez Supabase Auth)

### Erreurs de format de date

Les dates sont automatiquement converties en ISO strings par `apiClient`. Si vous rencontrez des problèmes, vérifiez le format des dates dans la base de données.

## 📝 Notes

- Les méthodes sont maintenant toutes asynchrones
- Les erreurs sont gérées avec try/catch dans `apiService`
- Les logs d'erreur sont affichés dans la console pour le debugging
- Le service `dataService.ts` peut être conservé pour référence ou supprimé une fois la migration complète

## 🔄 Prochaines étapes

1. Exécuter le schéma SQL dans Supabase
2. Tester la connexion avec `initializeTestData()`
3. Migrer progressivement les composants vers `apiService`
4. Implémenter l'authentification Supabase (optionnel)
5. Ajuster les politiques RLS selon vos besoins

