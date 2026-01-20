-- ============================================
-- Migration: Ajout de profile_json à profiles
-- ============================================
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne profile_json si elle n'existe pas
alter table public.profiles 
add column if not exists profile_json jsonb default '{}'::jsonb;

-- Index pour améliorer les performances des requêtes sur profile_json
create index if not exists profiles_profile_json_idx on public.profiles using gin(profile_json);
