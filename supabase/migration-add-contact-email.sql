-- ============================================
-- Migration: Ajout de contact_email à profiles
-- ============================================
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne contact_email si elle n'existe pas
alter table public.profiles 
add column if not exists contact_email text;

-- Index pour améliorer les performances des requêtes sur contact_email
create index if not exists profiles_contact_email_idx on public.profiles(contact_email);

-- Optionnel: Ajouter une contrainte de validation email simple
-- Décommentez cette ligne si vous voulez valider le format email au niveau DB
-- alter table public.profiles 
-- add constraint profiles_contact_email_check 
-- check (contact_email is null or contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Note: Pour ajouter NOT NULL après déploiement, exécutez:
-- 1. Mettre à jour toutes les valeurs NULL avec une valeur par défaut
-- UPDATE public.profiles SET contact_email = email WHERE contact_email IS NULL;
-- 2. Ajouter la contrainte NOT NULL
-- ALTER TABLE public.profiles ALTER COLUMN contact_email SET NOT NULL;
