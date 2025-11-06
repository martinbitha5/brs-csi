-- Migration pour ajouter la table user_passwords
-- À exécuter dans l'éditeur SQL de Supabase si la table n'existe pas déjà

-- Table des mots de passe utilisateurs
CREATE TABLE IF NOT EXISTS user_passwords (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_user_passwords_updated_at BEFORE UPDATE ON user_passwords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

-- Politique RLS : permettre la lecture et écriture pour tous les utilisateurs authentifiés
CREATE POLICY "Allow all for authenticated users" ON user_passwords
  FOR ALL USING (auth.role() = 'authenticated');

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_passwords_user_id ON user_passwords(user_id);

