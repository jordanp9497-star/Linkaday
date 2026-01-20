-- ============================================
-- Table profiles pour AgentLinkdin
-- ============================================

-- Création de la table profiles
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  directive_json jsonb default '{}'::jsonb,
  onboarding_json jsonb default '{}'::jsonb,
  onboarding_completed boolean default false,
  plan text default 'free' check (plan in ('free', 'pro')),
  is_active boolean default false,
  telegram_chat_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- Trigger pour updated_at
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger sur la table profiles
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Activer RLS sur la table profiles
alter table public.profiles enable row level security;

-- ============================================
-- Policies RLS
-- ============================================

-- Policy: L'utilisateur peut SELECT son propre profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy: L'utilisateur peut UPDATE son propre profile
-- NOTE IMPORTANTE: RLS ne peut pas limiter les colonnes modifiables directement.
-- Cette policy permet à l'utilisateur de modifier son profil, mais ne restreint pas les colonnes.
-- Pour limiter les colonnes modifiables par l'utilisateur, utilisez une route API sécurisée (voir documentation ci-dessous).
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy: Service role peut tout faire (SELECT, INSERT, UPDATE, DELETE)
-- Cette policy permet aux opérations backend (webhooks Stripe, n8n, etc.)
-- NOTE: Quand vous utilisez SUPABASE_SERVICE_ROLE_KEY, Supabase bypass RLS par défaut.
-- Cette policy est utile si vous voulez que certaines opérations utilisent RLS même avec service role.
-- Pour la plupart des cas, vous pouvez utiliser directement le client avec service role key sans RLS.
create policy "Service role has full access"
  on public.profiles
  for all
  using (
    -- Vérifier si on utilise la service role key
    -- Le role 'service_role' est présent dans le JWT quand on utilise la service role key
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  )
  with check (
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

-- ============================================
-- Fonction pour créer automatiquement un profil lors de l'inscription
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pour créer le profil automatiquement lors de l'inscription
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Index pour améliorer les performances
-- ============================================

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_plan_idx on public.profiles(plan);
create index if not exists profiles_is_active_idx on public.profiles(is_active);

-- ============================================
-- DOCUMENTATION: Limitation des colonnes UPDATE
-- ============================================
-- 
-- LIMITATION RLS: Les policies RLS ne peuvent pas limiter les colonnes modifiables
-- dans une UPDATE. La policy "Users can update own profile" permet à l'utilisateur
-- de modifier toutes les colonnes de son profil.
--
-- SOLUTION RECOMMANDÉE: Utiliser la route API sécurisée
--
-- Une route API a été créée dans: app/api/profile/update/route.ts
-- Cette route limite les colonnes modifiables par l'utilisateur à:
--   - directive_json
--   - onboarding_json
--   - onboarding_completed
--
-- Utilisation côté client:
-- ```typescript
-- const response = await fetch('/api/profile/update', {
--   method: 'PATCH',
--   headers: { 'Content-Type': 'application/json' },
--   body: JSON.stringify({
--     directive_json: { ... },
--     onboarding_completed: true
--   })
-- })
-- ```
--
-- Les autres colonnes (plan, is_active, telegram_chat_id, etc.) doivent être
-- modifiées via le service role (webhooks Stripe, n8n, etc.) en utilisant
-- SUPABASE_SERVICE_ROLE_KEY.
--
-- Exemple avec service role (backend uniquement):
-- ```typescript
-- import { createClient } from '@supabase/supabase-js'
-- import { env } from '@/lib/env'
-- 
-- const supabaseAdmin = createClient(
--   env.NEXT_PUBLIC_SUPABASE_URL,
--   env.SUPABASE_SERVICE_ROLE_KEY
-- )
-- 
-- await supabaseAdmin
--   .from('profiles')
--   .update({ plan: 'pro', is_active: true })
--   .eq('id', userId)
-- ```
