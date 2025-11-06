# Migration pour corriger l'erreur d'inscription

## Problème

Lors de l'inscription, l'erreur "Session expirée. Veuillez vous reconnecter." apparaît car les politiques RLS (Row Level Security) de Supabase exigent que l'utilisateur soit authentifié, alors que l'inscription se fait sans session.

## Solution

La migration `migration_fix_registration_rls.sql` modifie les politiques RLS pour permettre l'inscription publique (INSERT) sur les tables `users` et `user_passwords`, tout en gardant les autres opérations (SELECT, UPDATE, DELETE) réservées aux utilisateurs authentifiés.

## Comment appliquer la migration

1. Connectez-vous à votre projet Supabase : https://supabase.com
2. Allez dans l'éditeur SQL (SQL Editor)
3. Copiez le contenu du fichier `database/migration_fix_registration_rls.sql`
4. Exécutez le script SQL

## Vérification

Après avoir appliqué la migration, testez l'inscription :
1. Allez sur l'écran d'inscription
2. Remplissez le formulaire
3. Cliquez sur "S'inscrire"
4. L'inscription devrait fonctionner sans erreur

## Sécurité

Les politiques RLS permettent :
- ✅ **INSERT public** : Permet l'inscription sans authentification
- ✅ **SELECT/UPDATE/DELETE authentifié** : Seuls les utilisateurs authentifiés peuvent lire, modifier ou supprimer les données

Cette configuration est sécurisée car :
- L'inscription crée un nouvel utilisateur avec un ID unique généré automatiquement
- Le mot de passe est créé immédiatement après l'utilisateur avec le même ID
- Il n'est pas possible pour un utilisateur non authentifié de créer un mot de passe pour un utilisateur existant

## Notes

- Si vous avez déjà appliqué le schéma initial (`schema.sql`), vous devez appliquer cette migration pour corriger les politiques RLS
- Si vous créez une nouvelle base de données, le fichier `schema.sql` a été mis à jour avec les bonnes politiques RLS

