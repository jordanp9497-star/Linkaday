-- ============================================
-- Migration optionnelle: Ajout de colonnes supplémentaires à profiles
-- ============================================
-- À exécuter dans Supabase SQL Editor si vous voulez stocker ces champs comme colonnes séparées
-- Sinon, ils peuvent être stockés dans personal_json ou directive_json

-- Ajouter les colonnes si elles n'existent pas
alter table public.profiles 
add column if not exists job_title text,
add column if not exists industry text,
add column if not exists seniority text,
add column if not exists tone text,
add column if not exists focus jsonb default '[]'::jsonb,
add column if not exists stack_context jsonb default '[]'::jsonb,
add column if not exists audience_target jsonb default '[]'::jsonb,
add column if not exists personal_json jsonb default '{}'::jsonb;

-- Index pour améliorer les performances
create index if not exists profiles_industry_idx on public.profiles(industry);
create index if not exists profiles_tone_idx on public.profiles(tone);

-- Note: Si vous préférez stocker ces champs dans des JSON (personal_json, directive_json),
-- vous n'avez pas besoin d'exécuter cette migration.
-- Le code fonctionnera dans les deux cas (colonnes séparées ou JSON).
