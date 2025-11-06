-- Migration pour créer une fonction PostgreSQL qui permet l'inscription publique
-- Cette fonction bypass RLS en utilisant SECURITY DEFINER
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer l'ancienne fonction si elle existe (nécessaire si le type de retour a changé)
DROP FUNCTION IF EXISTS public.register_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Fonction pour créer un utilisateur et son mot de passe (inscription publique)
CREATE OR REPLACE FUNCTION public.register_user(
  p_name TEXT,
  p_email TEXT,
  p_password TEXT,
  p_role TEXT,
  p_station TEXT,
  p_language TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_record RECORD;
BEGIN
  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Cet email est déjà utilisé.' USING ERRCODE = '23505';
  END IF;

  -- Validation du rôle
  IF p_role NOT IN ('agent', 'supervisor', 'admin') THEN
    RAISE EXCEPTION 'Rôle invalide. Les rôles valides sont: agent, supervisor, admin.';
  END IF;

  -- Validation: les agents et superviseurs doivent avoir une station
  IF (p_role IN ('agent', 'supervisor') AND (p_station IS NULL OR p_station = '')) THEN
    RAISE EXCEPTION 'Les agents et superviseurs doivent avoir une station assignée.';
  END IF;

  -- Validation: les admins ne doivent pas avoir de station
  IF (p_role = 'admin' AND p_station IS NOT NULL AND p_station != '') THEN
    RAISE EXCEPTION 'Les administrateurs ne peuvent pas avoir de station assignée.';
  END IF;

  -- Créer l'utilisateur (bypass RLS grâce à SECURITY DEFINER)
  BEGIN
    INSERT INTO users (name, email, role, station, language)
    VALUES (p_name, p_email, p_role, p_station, p_language)
    RETURNING * INTO v_user_record;

    v_user_id := v_user_record.id;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Cet email est déjà utilisé.' USING ERRCODE = '23505';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erreur lors de la création de l''utilisateur: %', SQLERRM;
  END;

  -- Créer le mot de passe (bypass RLS grâce à SECURITY DEFINER)
  BEGIN
    INSERT INTO user_passwords (user_id, password)
    VALUES (v_user_id, p_password);
  EXCEPTION
    WHEN OTHERS THEN
      -- Si l'insertion du mot de passe échoue, supprimer l'utilisateur créé
      DELETE FROM users WHERE id = v_user_id;
      RAISE EXCEPTION 'Erreur lors de la création du mot de passe: %', SQLERRM;
  END;

  -- Retourner l'utilisateur créé au format JSON
  RETURN json_build_object(
    'id', v_user_record.id,
    'name', v_user_record.name,
    'email', v_user_record.email,
    'role', v_user_record.role,
    'station', v_user_record.station,
    'language', v_user_record.language,
    'created_at', v_user_record.created_at,
    'updated_at', v_user_record.updated_at
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Propager l'erreur avec le message complet
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Donner les permissions d'exécution à tous (pour l'inscription publique)
GRANT EXECUTE ON FUNCTION public.register_user TO anon;
GRANT EXECUTE ON FUNCTION public.register_user TO authenticated;

-- Commentaire pour documentation
COMMENT ON FUNCTION public.register_user IS 'Fonction pour l''inscription publique. Bypass RLS pour permettre la création d''utilisateurs sans authentification.';
