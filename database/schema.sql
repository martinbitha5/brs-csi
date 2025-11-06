-- Schéma SQL pour BRS-CSI avec Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('agent', 'supervisor', 'admin')),
  station TEXT,
  language TEXT CHECK (language IN ('fr', 'en', 'lingala', 'swahili')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des vols
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  date DATE NOT NULL,
  route TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des passagers
CREATE TABLE IF NOT EXISTS passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pnr TEXT NOT NULL,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  pieces_declared INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'bags_expected' CHECK (status IN ('no_checked_bag', 'bags_expected', 'bags_complete', 'bags_missing')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des lots de bagages
CREATE TABLE IF NOT EXISTS bag_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  base_tag TEXT NOT NULL,
  pieces_expected INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'in_progress', 'complete', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des pièces de bagage
CREATE TABLE IF NOT EXISTS bag_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_set_id UUID NOT NULL REFERENCES bag_sets(id) ON DELETE CASCADE,
  tag_full TEXT NOT NULL UNIQUE,
  piece_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'checked_in', 'loaded', 'in_transit', 'arrived', 'missing')),
  last_scan_at TIMESTAMPTZ,
  station TEXT,
  boarding_pass_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des cartes d'embarquement
CREATE TABLE IF NOT EXISTS boarding_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_name TEXT NOT NULL,
  pnr TEXT,
  barcode_data TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  segment INTEGER,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  seat TEXT,
  issued_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'pending_sync' CHECK (sync_status IN ('synced', 'pending_sync')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des logs de scan
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_piece_id UUID NOT NULL REFERENCES bag_pieces(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('checked_in', 'loaded', 'arrived', 'error', 'boarding_pass_scanned')),
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('flight_closing_with_missing_bags', 'incomplete_bag_set', 'bag_missing', 'flight_departing_soon')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
  bag_set_id UUID REFERENCES bag_sets(id) ON DELETE CASCADE,
  bag_piece_id UUID REFERENCES bag_pieces(id) ON DELETE CASCADE,
  station TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_passengers_flight_id ON passengers(flight_id);
CREATE INDEX IF NOT EXISTS idx_passengers_pnr ON passengers(pnr);
CREATE INDEX IF NOT EXISTS idx_bag_sets_passenger_id ON bag_sets(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bag_sets_flight_id ON bag_sets(flight_id);
CREATE INDEX IF NOT EXISTS idx_bag_pieces_bag_set_id ON bag_pieces(bag_set_id);
CREATE INDEX IF NOT EXISTS idx_bag_pieces_tag_full ON bag_pieces(tag_full);
CREATE INDEX IF NOT EXISTS idx_bag_pieces_status ON bag_pieces(status);
CREATE INDEX IF NOT EXISTS idx_bag_pieces_station ON bag_pieces(station);
CREATE INDEX IF NOT EXISTS idx_scan_logs_bag_piece_id ON scan_logs(bag_piece_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_agent_id ON scan_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_timestamp ON scan_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_station ON notifications(station);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passengers_updated_at BEFORE UPDATE ON passengers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bag_sets_updated_at BEFORE UPDATE ON bag_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bag_pieces_updated_at BEFORE UPDATE ON bag_pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boarding_passes_updated_at BEFORE UPDATE ON boarding_passes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security) - À activer selon vos besoins
-- Pour l'instant, nous désactivons RLS pour simplifier, mais vous pouvez l'activer plus tard
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bag_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bag_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE boarding_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques de base : permettre la lecture et écriture pour tous les utilisateurs authentifiés
-- Vous pouvez ajuster ces politiques selon vos besoins de sécurité
CREATE POLICY "Allow all for authenticated users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON flights
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON passengers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON bag_sets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON bag_pieces
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON boarding_passes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON scan_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON notifications
  FOR ALL USING (auth.role() = 'authenticated');

