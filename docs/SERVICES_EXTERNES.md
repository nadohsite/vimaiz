# 🔧 Guide Complet des Services Externes - VIMAIZ

Ce guide explique en détail tous les services externes utilisés dans VIMAIZ, leur utilité, et comment les configurer étape par étape.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Laravel Reverb (WebSocket)](#1-laravel-reverb-websocket)
3. [Pusher (Alternative WebSocket)](#2-pusher-alternative-websocket)
4. [Gmail SMTP (Emails)](#3-gmail-smtp-emails)
5. [Mailgun (Emails Production)](#4-mailgun-emails-production)
6. [OVH Mail Pro (Emails Professionnels)](#5-ovh-mail-pro-emails-professionnels)
7. [Amazon S3 (Stockage Fichiers)](#6-amazon-s3-stockage-fichiers)
8. [Stripe (Paiements)](#7-stripe-paiements)
9. [Google OAuth (Connexion)](#8-google-oauth-connexion)

---

## Vue d'ensemble

### Pourquoi ces services ?

| Service | Utilité dans VIMAIZ |
|---------|---------------------|
| **Reverb/Pusher** | Messages chat instantanés, notifications temps réel |
| **Gmail/Mailgun** | Envoi d'emails (devis, confirmations, alertes) |
| **Amazon S3** | Stockage des photos avant/après missions |
| **Stripe** | Paiements clients par carte bancaire |
| **Google OAuth** | Connexion rapide avec compte Google |

### Schéma des flux

```
Client VIMAIZ
     │
     ├─► Paiement ─────────────► Stripe
     │
     ├─► Chat Message ─────────► Reverb (WebSocket) ─► Destinataire
     │
     ├─► Demande ménage ───────► Email (Gmail/Mailgun) ─► Admin
     │
     └─► Photos mission ───────► Amazon S3 (stockage)
```

---

## 1. Laravel Reverb (WebSocket)

### Qu'est-ce que c'est ?

**Reverb** est un serveur WebSocket intégré à Laravel (gratuit, open-source). Il permet la communication **temps réel bidirectionnelle** entre le serveur et les navigateurs clients.

### Utilité dans VIMAIZ

- ✅ Messages de chat instantanés (sans rafraîchir la page)
- ✅ Notifications en temps réel (icône cloche qui se met à jour)
- ✅ Mise à jour automatique des listes (nouvelles demandes pour admin)

### Comment ça marche ?

```
┌─────────────┐     WebSocket      ┌─────────────┐
│  Navigateur │ ◄────────────────► │   Reverb    │
│   (React)   │   connexion        │   Server    │
└─────────────┘   permanente       └─────────────┘
                                          │
                                          │ Events PHP
                                          ▼
                                   ┌─────────────┐
                                   │   Laravel   │
                                   │ Application │
                                   └─────────────┘
```

### Configuration étape par étape

#### Étape 1: Reverb est déjà installé
```bash
# Vérifier l'installation
composer show laravel/reverb
```

#### Étape 2: Configurer .env
```env
# Activer Reverb pour le broadcast
BROADCAST_CONNECTION=reverb

# Configuration Reverb (valeurs par défaut pour développement)
REVERB_APP_ID=vimaiz-local
REVERB_APP_KEY=vimaiz-key
REVERB_APP_SECRET=vimaiz-secret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

# Variables pour le frontend (Vite)
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

#### Étape 3: Démarrer le serveur Reverb
```bash
# Terminal dédié (reste actif)
php artisan reverb:start

# Vous verrez:
# Starting server on 0.0.0.0:8080...
```

#### Étape 4: Tester
1. Ouvrir 2 navigateurs (ou navigation privée)
2. Se connecter avec 2 utilisateurs différents
3. Envoyer un message → Il apparaît instantanément chez l'autre

### Production

```env
# En production, utiliser wss:// (sécurisé)
REVERB_SCHEME=https
REVERB_HOST=ws.vimaiz.com
REVERB_PORT=443
```

**Nginx config pour Reverb:**
```nginx
server {
    listen 443 ssl;
    server_name ws.vimaiz.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 2. Pusher (Alternative WebSocket)

### Qu'est-ce que c'est ?

**Pusher** est un service cloud payant de WebSocket. C'était le standard avant Reverb. Laravel Echo supporte les deux.

### Reverb vs Pusher

| Critère | Reverb | Pusher |
|---------|--------|--------|
| **Prix** | Gratuit (auto-hébergé) | Gratuit < 200k msg/jour, puis payant |
| **Installation** | Sur votre serveur | Service cloud |
| **Maintenance** | Vous gérez | Pusher gère |
| **Latence** | Dépend de votre serveur | Optimisé globalement |

### Quand utiliser Pusher ?

- Si vous ne voulez pas gérer de serveur WebSocket
- Si vous avez besoin d'une haute disponibilité sans effort
- Si le coût n'est pas un problème

### Configuration Pusher (si vous choisissez cette option)

#### Étape 1: Créer un compte Pusher

1. Aller sur https://pusher.com/
2. Cliquer "Sign Up" (gratuit)
3. Créer une nouvelle "App" (Channels)
4. Choisir région "EU (Ireland)" pour la France
5. Copier les clés API

#### Étape 2: Configurer .env
```env
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=123456
PUSHER_APP_KEY=abcd1234efgh5678
PUSHER_APP_SECRET=secretkey123456
PUSHER_APP_CLUSTER=eu

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

#### Étape 3: Modifier echo.ts
```typescript
// resources/js/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
});
```

> **Recommandation VIMAIZ**: Utilisez **Reverb** (gratuit et performant).

---

## 3. Gmail SMTP (Emails)

### Qu'est-ce que c'est ?

**SMTP** (Simple Mail Transfer Protocol) est le protocole d'envoi d'emails. Gmail permet d'utiliser leurs serveurs SMTP pour envoyer des emails depuis votre application.

### Utilité dans VIMAIZ

- 📧 Envoi de confirmation de devis
- 📧 Notifications de paiement
- 📧 Alertes pour les admins (nouvelle demande)
- 📧 Réinitialisation de mot de passe

### Limites Gmail

- **500 emails/jour** (compte gratuit)
- **2000 emails/jour** (Google Workspace)
- Idéal pour développement et petite production

### Configuration étape par étape

#### Étape 1: Activer la validation en 2 étapes

1. Aller sur https://myaccount.google.com/
2. Cliquer "Sécurité" dans le menu gauche
3. Activer "Validation en deux étapes"
4. Suivre les instructions (téléphone, etc.)

#### Étape 2: Créer un mot de passe d'application

1. Aller sur https://myaccount.google.com/apppasswords
2. Se connecter si demandé
3. Dans "Sélectionner une application" → choisir "Autre (nom personnalisé)"
4. Entrer "VIMAIZ" comme nom
5. Cliquer "Générer"
6. **COPIER LE MOT DE PASSE** (16 caractères, ex: `abcd efgh ijkl mnop`)
7. Ce mot de passe ne sera plus visible !

#### Étape 3: Configurer .env
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD="abcdefghijklmnop"  # Mot de passe d'app (sans espaces)
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@vimaiz.com"
MAIL_FROM_NAME="VIMAIZ"
```

> ⚠️ **Important**: Le `MAIL_PASSWORD` est le mot de passe d'application, PAS votre mot de passe Gmail normal !

#### Étape 4: Tester l'envoi
```bash
php artisan tinker
```
```php
Mail::raw('Test email depuis VIMAIZ', function($msg) {
    $msg->to('enagnonrobert@gmail.com')->subject('Test VIMAIZ');
});
```

#### Problèmes courants

| Erreur | Solution |
|--------|----------|
| "Authentication failed" | Vérifier mot de passe d'app (pas le mot de passe Gmail) |
| "Less secure apps" | Créer mot de passe d'application |
| "SMTP timeout" | Vérifier port 587 et encryption tls |

---

## 4. Mailgun (Emails Production)

### Qu'est-ce que c'est ?

**Mailgun** est un service d'envoi d'emails transactionnels professionnel. Plus fiable que Gmail pour la production avec de meilleures statistiques de délivrabilité.

### Avantages vs Gmail

| Critère | Gmail SMTP | Mailgun |
|---------|------------|---------|
| **Limite** | 500/jour | 5000/mois gratuit, puis illimité |
| **Délivrabilité** | Moyenne | Excellente |
| **Tracking** | Non | Ouvertures, clics, bounces |
| **Domaine custom** | Non | Oui (noreply@vimaiz.com) |
| **Support** | Non | Oui |

### Configuration étape par étape

#### Étape 1: Créer un compte Mailgun

1. Aller sur https://www.mailgun.com/
2. Cliquer "Start Sending For Free"
3. Créer un compte (email + téléphone requis)
4. Vérifier votre email

#### Étape 2: Ajouter votre domaine

1. Dashboard → "Sending" → "Domains"
2. Cliquer "Add New Domain"
3. Entrer: `mg.vimaiz.com` (sous-domaine recommandé)
4. Choisir région: **EU** (pour la France)

#### Étape 3: Configurer les DNS

Mailgun vous donnera des enregistrements DNS à ajouter chez votre registrar (OVH, Gandi, etc.):

```
Type: TXT
Host: mg
Value: v=spf1 include:mailgun.org ~all

Type: TXT  
Host: smtp._domainkey.mg
Value: k=rsa; p=MIGfMA0GCSq...

Type: CNAME
Host: email.mg
Value: mailgun.org
```

#### Étape 4: Récupérer les clés API

1. Dashboard → "API Keys" (menu gauche)
2. Copier "Private API key" (commence par `key-...`)
3. Ou dans "SMTP Credentials" pour les infos SMTP

#### Étape 5: Installer le package
```bash
composer require symfony/mailgun-mailer symfony/http-client
```

#### Étape 6: Configurer .env
```env
MAIL_MAILER=mailgun

MAILGUN_DOMAIN=mg.vimaiz.com
MAILGUN_SECRET=key-xxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_ENDPOINT=api.eu.mailgun.net  # Important pour EU !

MAIL_FROM_ADDRESS=noreply@mg.vimaiz.com
MAIL_FROM_NAME="VIMAIZ"
```

#### Étape 7: Tester
```bash
php artisan tinker
```
```php
Mail::raw('Test Mailgun', function($msg) {
    $msg->to('votre-email@test.com')->subject('Test VIMAIZ Mailgun');
});
```

---

## 5. OVH Mail Pro (Emails Professionnels)

### Qu'est-ce que c'est ?

**OVH Mail Pro** est un service d'email professionnel payant. Vous obtenez des adresses comme `contact@vimaiz.com`.

### Utilité dans VIMAIZ

- Adresse professionnelle pour répondre aux clients
- Peut aussi servir pour l'envoi SMTP

### Configuration étape par étape

#### Étape 1: Commander chez OVH

1. Aller sur https://www.ovhcloud.com/fr/emails/email-pro/
2. Choisir le plan (à partir de ~3€/mois)
3. Associer votre domaine vimaiz.com
4. Créer vos boîtes mail (contact@, support@, etc.)

#### Étape 2: Configurer DNS

OVH configure automatiquement les DNS si le domaine est chez eux. Sinon:

```
Type: MX
Priority: 1
Host: @
Value: mx0.mail.ovh.net

Type: MX
Priority: 5  
Host: @
Value: mx1.mail.ovh.net
```

#### Étape 3: Utiliser comme SMTP (optionnel)
```env
MAIL_MAILER=smtp
MAIL_HOST=pro1.mail.ovh.net
MAIL_PORT=587
MAIL_USERNAME=contact@vimaiz.com
MAIL_PASSWORD=votre_mot_de_passe
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=contact@vimaiz.com
MAIL_FROM_NAME="VIMAIZ"
```

> **Recommandation**: Utilisez OVH Mail pour recevoir des emails (support client), et Mailgun pour envoyer (meilleure délivrabilité).

---

## 6. Amazon S3 (Stockage Fichiers)

### Qu'est-ce que c'est ?

**Amazon S3** (Simple Storage Service) est un service de stockage cloud. Les fichiers sont stockés sur les serveurs d'Amazon et accessibles via URL.

### Utilité dans VIMAIZ

- 📸 Photos avant/après des missions
- 📄 Documents agents (carte identité, RIB, etc.)
- 📁 Toute pièce jointe

### Pourquoi S3 vs stockage local ?

| Critère | Local (public/) | Amazon S3 |
|---------|-----------------|-----------|
| **Espace** | Limité au serveur | Illimité |
| **Sauvegarde** | Manuelle | Automatique |
| **CDN** | Non | Oui (CloudFront) |
| **Coût** | Inclus serveur | ~$0.02/Go/mois |
| **Multi-serveurs** | Problématique | Parfait |

### Configuration étape par étape

#### Étape 1: Créer un compte AWS

1. Aller sur https://aws.amazon.com/
2. Cliquer "Créer un compte AWS"
3. Remplir les informations (carte bancaire requise)
4. Vérifier email et téléphone

#### Étape 2: Créer un bucket S3

1. Console AWS → chercher "S3"
2. Cliquer "Create bucket"
3. **Bucket name**: `vimaiz-production` (unique mondialement)
4. **Region**: `eu-west-3` (Paris)
5. **Block Public Access**: Désactiver pour photos publiques OU garder activé + CloudFront
6. Cliquer "Create bucket"

#### Étape 3: Configurer les permissions (Bucket Policy)

Dans votre bucket → "Permissions" → "Bucket Policy":

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::vimaiz-production/*"
        }
    ]
}
```

#### Étape 4: Créer un utilisateur IAM

1. Console AWS → "IAM" → "Users" → "Create user"
2. **User name**: `vimaiz-app`
3. Cliquer "Next"
4. "Attach policies directly" → chercher `AmazonS3FullAccess`
5. Cocher `AmazonS3FullAccess`
6. Cliquer "Create user"

#### Étape 5: Créer les clés d'accès

1. Cliquer sur l'utilisateur créé
2. Onglet "Security credentials"
3. "Create access key"
4. Choisir "Application running outside AWS"
5. **COPIER** Access Key ID et Secret Access Key
6. Ces clés ne seront plus visibles !

#### Étape 6: Installer le package Laravel
```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

#### Étape 7: Configurer .env
```env
FILESYSTEM_DISK=s3

AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_DEFAULT_REGION=eu-west-3
AWS_BUCKET=vimaiz-production
AWS_USE_PATH_STYLE_ENDPOINT=false
```

#### Étape 8: Tester
```bash
php artisan tinker
```
```php
Storage::disk('s3')->put('test.txt', 'Hello S3!');
Storage::disk('s3')->url('test.txt');
// Retourne: https://vimaiz-production.s3.eu-west-3.amazonaws.com/test.txt
```

### Coûts estimés

| Usage | Coût mensuel |
|-------|--------------|
| 10 Go stockage | ~$0.23 |
| 100 Go stockage | ~$2.30 |
| 10 000 requêtes | ~$0.04 |

---

## 7. Stripe (Paiements)

### Qu'est-ce que c'est ?

**Stripe** est une plateforme de paiement en ligne. Elle gère les transactions par carte bancaire de façon sécurisée.

### Utilité dans VIMAIZ

- 💳 Paiement des prestations de ménage
- 💰 Gestion automatique des commissions
- 🧾 Génération de reçus

### Configuration étape par étape

#### Étape 1: Créer un compte Stripe

1. Aller sur https://stripe.com/fr
2. Cliquer "Commencer maintenant"
3. Créer un compte (email + mot de passe)
4. Vous êtes en mode TEST par défaut

#### Étape 2: Récupérer les clés API (Test)

1. Dashboard Stripe → "Developers" → "API Keys"
2. Copier:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

#### Étape 3: Configurer le Webhook

1. Dashboard → "Developers" → "Webhooks"
2. Cliquer "Add endpoint"
3. **URL**: `https://votre-domaine.com/stripe/webhook`
4. **Events**: Sélectionner:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copier le **Webhook signing secret**: `whsec_...`

#### Étape 4: Configurer .env
```env
STRIPE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

#### Étape 5: Tester avec cartes de test

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0027 6000 3184` | Requiert 3D Secure |
| `4000 0000 0000 0002` | Carte refusée |

> Expiration: n'importe quelle date future. CVC: 3 chiffres quelconques.

#### Étape 6: Passer en production

1. Dashboard → "Activate your account"
2. Remplir les informations entreprise (SIRET, etc.)
3. Vérification bancaire (quelques jours)
4. Remplacer les clés test par les clés live:
```env
STRIPE_KEY=pk_live_51xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET=sk_live_51xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Commissions Stripe

- **1.4% + 0.25€** par transaction (cartes UE)
- **2.9% + 0.25€** par transaction (cartes hors UE)

---

## 8. Google OAuth (Connexion)

### Qu'est-ce que c'est ?

**OAuth** permet aux utilisateurs de se connecter avec leur compte Google existant, sans créer de nouveau mot de passe.

### Utilité dans VIMAIZ

- 🔐 Connexion rapide en 1 clic
- ✅ Email vérifié automatiquement
- 🎯 Moins de friction pour les nouveaux utilisateurs

### Configuration étape par étape

#### Étape 1: Accéder à Google Cloud Console

1. Aller sur https://console.cloud.google.com/
2. Se connecter avec un compte Google
3. Créer un nouveau projet ou en sélectionner un

#### Étape 2: Créer un projet

1. Menu hamburger → "IAM & Admin" → "Create a project"
2. **Project name**: VIMAIZ
3. Cliquer "Create"

#### Étape 3: Configurer l'écran de consentement

1. Menu → "APIs & Services" → "OAuth consent screen"
2. Choisir "External"
3. Remplir:
   - **App name**: VIMAIZ
   - **User support email**: votre email
   - **App logo**: optionnel
   - **Developer contact email**: votre email
4. Cliquer "Save and Continue"
5. Scopes: Ajouter `email` et `profile`
6. Test users: Ajouter votre email pour tester

#### Étape 4: Créer les identifiants OAuth

1. Menu → "APIs & Services" → "Credentials"
2. Cliquer "Create Credentials" → "OAuth client ID"
3. **Application type**: Web application
4. **Name**: VIMAIZ Web
5. **Authorized redirect URIs**: 
   - `http://localhost/auth/google/callback` (dev)
   - `https://vimaiz.com/auth/google/callback` (prod)
6. Cliquer "Create"
7. **COPIER** Client ID et Client Secret

#### Étape 5: Configurer .env
```env
GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

#### Étape 6: Tester

1. Aller sur la page de connexion VIMAIZ
2. Cliquer "Continuer avec Google"
3. Sélectionner un compte Google
4. Autoriser l'accès
5. Vous êtes connecté !

#### Passer en production

1. "OAuth consent screen" → "Publish App"
2. Google vérifiera votre application (peut prendre quelques jours)
3. Une fois approuvé, tous les utilisateurs peuvent se connecter

---

## 📊 Résumé des variables .env

```env
# ═══════════════════════════════════════════════════════════════
# APPLICATION
# ═══════════════════════════════════════════════════════════════
APP_NAME="VIMAIZ"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://vimaiz.com

# ═══════════════════════════════════════════════════════════════
# BASE DE DONNÉES
# ═══════════════════════════════════════════════════════════════
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vimaiz
DB_USERNAME=vimaiz_user
DB_PASSWORD=mot_de_passe_securise

# ═══════════════════════════════════════════════════════════════
# EMAILS (Choisir Gmail OU Mailgun)
# ═══════════════════════════════════════════════════════════════

# Option A: Gmail (dev/petite prod)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=abcdefghijklmnop
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@vimaiz.com
MAIL_FROM_NAME="VIMAIZ"

# Option B: Mailgun (production)
# MAIL_MAILER=mailgun
# MAILGUN_DOMAIN=mg.vimaiz.com
# MAILGUN_SECRET=key-xxxxxxxxxxxxxxxx
# MAILGUN_ENDPOINT=api.eu.mailgun.net

# ═══════════════════════════════════════════════════════════════
# TEMPS RÉEL (WebSocket)
# ═══════════════════════════════════════════════════════════════
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database

REVERB_APP_ID=vimaiz-local
REVERB_APP_KEY=vimaiz-key
REVERB_APP_SECRET=vimaiz-secret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"

# ═══════════════════════════════════════════════════════════════
# STOCKAGE (Choisir local OU S3)
# ═══════════════════════════════════════════════════════════════

# Option A: Local (dev)
FILESYSTEM_DISK=public

# Option B: Amazon S3 (production)
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
# AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# AWS_DEFAULT_REGION=eu-west-3
# AWS_BUCKET=vimaiz-production

# ═══════════════════════════════════════════════════════════════
# PAIEMENTS (Stripe)
# ═══════════════════════════════════════════════════════════════
STRIPE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# ═══════════════════════════════════════════════════════════════
# GOOGLE (OAuth connexion)
# ═══════════════════════════════════════════════════════════════
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

---

## 🚀 Ordre de configuration recommandé

1. **Base de données** - Essentiel pour tout
2. **Gmail SMTP** - Pour tester les emails rapidement
3. **Reverb** - Pour le chat temps réel
4. **Stripe (test)** - Pour tester les paiements
5. **Google OAuth** - Pour la connexion facile

**En production, ajouter:**
6. **Mailgun** - Remplacer Gmail
7. **Amazon S3** - Pour les photos
8. **Stripe (live)** - Activer les vrais paiements

---

## ❓ FAQ

### Puis-je utiliser le projet sans ces services ?

- **Sans Reverb**: Oui, mais pas de temps réel (refresh manuel)
- **Sans emails**: Oui, mais pas de notifications par mail
- **Sans S3**: Oui, utiliser stockage local
- **Sans Stripe**: Non, paiements essentiels
- **Sans Google OAuth**: Oui, connexion classique email/password

### Combien ça coûte en production ?

| Service | Coût mensuel estimé |
|---------|---------------------|
| Reverb | Gratuit (auto-hébergé) |
| Mailgun | ~$0 (5000 emails gratuits) |
| Amazon S3 | ~$2-5 (selon usage) |
| Stripe | 1.4% + 0.25€ par transaction |
| Google OAuth | Gratuit |
| **Total fixe** | **~$5/mois** + commissions Stripe |

### Support technique

- **Stripe**: https://support.stripe.com/
- **AWS**: https://aws.amazon.com/support/
- **Mailgun**: https://www.mailgun.com/contact/
- **Google Cloud**: https://cloud.google.com/support
