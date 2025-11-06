-- Migration pour corriger les politiques RLS et permettre l'inscription publique
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les anciennes politiques qui bloquent l'inscription
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_passwords;

-- Politique pour la table users : permettre l'inscription publique (INSERT) et l'accès pour les utilisateurs authentifiés
-- Permettre l'INSERT pour tous (inscription publique)
CREATE POLICY "Allow public registration" ON users
  FOR INSERT
  WITH CHECK (true);

-- Permettre la lecture pour les utilisateurs authentifiés
CREATE POLICY "Allow read for authenticated users" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Permettre la mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Allow update for authenticated users" ON users
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Permettre la suppression pour les utilisateurs authentifiés (admin uniquement, géré par l'application)
CREATE POLICY "Allow delete for authenticated users" ON users
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Politique pour la table user_passwords : permettre l'inscription publique (INSERT) et l'accès pour les utilisateurs authentifiés
-- Permettre l'INSERT pour tous (inscription publique - création du mot de passe lors de l'inscription)
CREATE POLICY "Allow public password creation" ON user_passwords
  FOR INSERT
  WITH CHECK (true);

-- Permettre la lecture pour les utilisateurs authentifiés
CREATE POLICY "Allow read for authenticated users" ON user_passwords
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Permettre la mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Allow update for authenticated users" ON user_passwords
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Permettre la suppression pour les utilisateurs authentifiés
CREATE POLICY "Allow delete for authenticated users" ON user_passwords
  FOR DELETE
  USING (auth.role() = 'authenticated');

