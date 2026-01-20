-- Table profiles pour AgentLinkdin
-- À exécuter dans votre projet Supabase (SQL Editor)

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  directive_json jsonb,
  onboarding_json jsonb,
  onboarding_completed boolean default false,
  plan text check (plan in ('free', 'pro')) default 'free',
  is_active boolean default true,
  telegram_chat_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Policy: Les utilisateurs peuvent lire leur propre profil
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy: Les utilisateurs peuvent mettre à jour leur propre profil
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Policy: Les utilisateurs peuvent insérer leur propre profil
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pour créer le profil automatiquement
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
