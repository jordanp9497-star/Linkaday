# AgentLinkdin

Application Next.js pour générer automatiquement des posts LinkedIn personnalisés.

## 🚀 Installation

```bash
npm install
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### 1. Créer le fichier `.env.local`

Copiez `env.example` vers `.env.local` et remplissez les valeurs :

```bash
cp env.example .env.local
```

Ou créez manuellement `.env.local` avec le contenu suivant :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID=price_your_price_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Telegram
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

### 2. Configuration Supabase

1. **Créer un projet Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet

2. **Récupérer les clés**
   - Allez dans **Settings > API**
   - Copiez :
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Exécuter le schéma SQL**
   - Allez dans **SQL Editor**
   - Ouvrez le fichier `supabase/schema.sql`
   - Copiez-collez tout le contenu
   - Cliquez sur **Run**

### 3. Configuration Stripe

1. **Créer un compte Stripe**
   - Allez sur [stripe.com](https://stripe.com)
   - Créez un compte (mode test pour commencer)

2. **Récupérer la clé secrète**
   - Allez dans **Developers > API keys**
   - Copiez la **Secret key** (commence par `sk_test_`)
   - Collez dans `STRIPE_SECRET_KEY`

3. **Créer un produit et prix**
   - Allez dans **Products**
   - Créez un nouveau produit (ex: "Plan Pro")
   - Créez un prix (ex: 9.90€/mois, récurrent)
   - Copiez le **Price ID** (commence par `price_`)
   - Collez dans `STRIPE_PRICE_ID`

4. **Configurer le webhook**
   - Allez dans **Developers > Webhooks**
   - Cliquez sur **Add endpoint**
   - URL : `https://votre-domaine.com/api/stripe/webhook` (ou `http://localhost:3000/api/stripe/webhook` pour tester avec Stripe CLI)
   - Événements à écouter : `checkout.session.completed`
   - Cliquez sur **Add endpoint**
   - Copiez le **Signing secret** (commence par `whsec_`)
   - Collez dans `STRIPE_WEBHOOK_SECRET`

### 4. Configuration Telegram

1. **Créer un bot Telegram**
   - Ouvrez Telegram et cherchez [@BotFather](https://t.me/botfather)
   - Envoyez `/newbot` et suivez les instructions
   - Copiez le nom d'utilisateur du bot (sans le @)
   - Collez dans `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`

2. **Configurer l'URL de l'application**
   - `NEXT_PUBLIC_APP_URL` : `http://localhost:3000` en local
   - En production : votre URL (ex: `https://votre-domaine.com`)

## 📝 Variables d'environnement

Toutes les variables nécessaires sont dans `env.example`. Créez `.env.local` avec vos valeurs.

## 🎯 Utilisation

1. Lancez l'application : `npm run dev`
2. Allez sur [http://localhost:3000](http://localhost:3000)
3. Connectez-vous avec votre email (magic link)
4. Complétez l'onboarding
5. Abonnez-vous au Plan Pro
6. Connectez Telegram

## 📚 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run start` - Démarre le serveur de production
- `npm run lint` - Lance ESLint

## 🛠️ Technologies

- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase (auth + database)
- Stripe (paiements)
- Sonner (toasts)
