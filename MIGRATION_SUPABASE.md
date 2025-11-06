# Migration vers Supabase - Résumé

## ✅ Fichiers créés

1. **`config/supabase.ts`** - Configuration du client Supabase
2. **`services/apiClient.ts`** - Client API de bas niveau pour Supabase
3. **`services/apiService.ts`** - Service API de haut niveau (remplace dataService.ts)
4. **`database/schema.sql`** - Schéma SQL pour créer les tables dans Supabase
5. **`BACKEND_SETUP.md`** - Guide d'installation et de configuration

## ✅ Fichiers mis à jour

1. **`app/(tabs)/index.tsx`** - Migré vers apiService
2. **`app/(tabs)/search.tsx`** - Migré vers apiService
3. **`app/(tabs)/scan.tsx`** - Migré vers apiService

## ⚠️ Fichiers restants à migrer

Les fichiers suivants utilisent encore `dataService` et doivent être migrés vers `apiService` :

1. `app/(tabs)/missing.tsx`
2. `app/(tabs)/notifications.tsx`
3. `app/_layout.tsx`
4. `components/agent/ActivityHistory.tsx`
5. `components/import/ImportDataModal.tsx`
6. `components/notifications/NotificationCard.tsx`
7. `components/supervisor/ExportData.tsx`
8. `components/supervisor/FlightManagement.tsx`
9. `components/supervisor/FlightStatistics.tsx`
10. `components/supervisor/ManualEdit.tsx`

## 📋 Prochaines étapes

1. **Exécuter le schéma SQL dans Supabase** :
   - Connectez-vous à https://vrjcwjjrgklhsmmyxucb.supabase.co
   - Allez dans SQL Editor
   - Copiez et exécutez le contenu de `database/schema.sql`

2. **Migrer les fichiers restants** :
   - Remplacer `import { dataService }` par `import { apiService }`
   - Convertir les appels synchrones en appels asynchrones avec `await`
   - Ajouter des états pour les données chargées de manière asynchrone

3. **Tester la connexion** :
   - Lancer l'application
   - Vérifier que les données se chargent depuis Supabase
   - Tester les fonctionnalités principales (scan, recherche, etc.)

4. **Ajuster les politiques RLS** (optionnel) :
   - Configurer l'authentification Supabase
   - Créer des politiques RLS plus restrictives selon les rôles

## 🔧 Notes importantes

- Toutes les méthodes de `apiService` sont maintenant **asynchrones** (retournent des Promises)
- Les erreurs sont gérées avec try/catch dans `apiService`
- Les dates sont automatiquement converties en ISO strings
- Le service `dataService.ts` peut être conservé pour référence ou supprimé une fois la migration complète

## 📝 Exemple de migration

**Avant** :
```typescript
import { dataService } from '@/services/dataService';

const flight = dataService.getFlight(id);
const flights = dataService.getFlights();
```

**Après** :
```typescript
import { apiService } from '@/services/apiService';

const flight = await apiService.getFlight(id);
const flights = await apiService.getFlights();
```

