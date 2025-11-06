# Migration pour corriger l'erreur d'inscription

## Problème

Lors de l'inscription, l'erreur "Session expirée. Veuillez vous reconnecter." ou "Erreur de configuration serveur" apparaît car les politiques RLS (Row Level Security) de Supabase exigent que l'utilisateur soit authentifié, alors que l'inscription se fait sans session.

## Solution

Deux solutions sont disponibles :

### Solution 1 : Fonction PostgreSQL (RECOMMANDÉE)

La migration `migration_create_register_function.sql` crée une fonction PostgreSQL avec `SECURITY DEFINER` qui bypass RLS pour permettre l'inscription publique.

**Avantages :**
- ✅ Bypass complet de RLS pour l'inscription
- ✅ Validation des données côté serveur
- ✅ Transaction atomique (utilisateur + mot de passe)
- ✅ Plus sécurisé

### Solution 2 : Politiques RLS modifiées

La migration `migration_fix_registration_rls.sql` modifie les politiques RLS pour permettre l'INSERT public sur les tables `users` et `user_passwords`.

**Avantages :**
- ✅ Plus simple à comprendre
- ⚠️ Moins sécurisé (nécessite des politiques RLS bien configurées)

## Comment appliquer la migration (Solution 1 - RECOMMANDÉE)

1. Connectez-vous à votre projet Supabase : https://supabase.com
2. Allez dans l'éditeur SQL (SQL Editor)
3. Copiez le contenu du fichier `database/migration_create_register_function.sql`
4. Exécutez le script SQL

**Important :** Après avoir exécuté la migration, l'inscription utilisera automatiquement la fonction PostgreSQL. Si la fonction n'existe pas, le code utilisera automatiquement la méthode classique (fallback).

## Comment appliquer la migration (Solution 2 - Alternative)

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

### Solution 1 (Fonction PostgreSQL)
- La fonction utilise `SECURITY DEFINER` pour bypass RLS
- Les validations sont effectuées côté serveur
- L'inscription est atomique (utilisateur + mot de passe créés ensemble)
- Les permissions sont limitées à l'exécution de la fonction

### Solution 2 (Politiques RLS)
- Les politiques RLS permettent l'INSERT public pour l'inscription
- Les autres opérations (SELECT, UPDATE, DELETE) restent protégées
- L'inscription crée un nouvel utilisateur avec un ID unique généré automatiquement

## Notes

- Si vous avez déjà appliqué le schéma initial (`schema.sql`), vous devez appliquer une des migrations pour corriger les politiques RLS
- Si vous créez une nouvelle base de données, le fichier `schema.sql` a été mis à jour avec les bonnes politiques RLS
- La Solution 1 (fonction PostgreSQL) est recommandée car elle est plus sécurisée et plus robuste

## Dépannage

Si l'inscription ne fonctionne toujours pas après avoir appliqué la migration :

1. Vérifiez que la fonction `register_user` existe dans Supabase :
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'register_user';
   ```

2. Vérifiez les permissions :
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.routine_privileges 
   WHERE routine_name = 'register_user';
   ```

3. Vérifiez les politiques RLS sur les tables `users` et `user_passwords` :
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('users', 'user_passwords');
   ```

4. Consultez les logs de la console de l'application pour voir l'erreur exacte
