# 📋 Guide de Configuration VIMAIZ

## 🔧 Variables d'Environnement

### Application
```env
APP_NAME="VIMAIZ"
APP_ENV=production
APP_KEY=base64:... # Générer avec: php artisan key:generate
APP_DEBUG=false
APP_URL=https://votre-domaine.com
```

### Base de Données
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vimaiz
DB_USERNAME=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
```

### Email (Mailgun Recommandé)
```env
MAIL_MAILER=mailgun
MAIL_FROM_ADDRESS=noreply@vimaiz.com
MAIL_FROM_NAME="${APP_NAME}"

MAILGUN_DOMAIN=mg.vimaiz.com
MAILGUN_SECRET=votre_api_key_mailgun
MAILGUN_ENDPOINT=api.eu.mailgun.net  # api.mailgun.net pour US
```

**Alternative SMTP (ex: Gmail, SendGrid):**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_app
MAIL_ENCRYPTION=tls
```

### Notifications Temps Réel (WebSocket + Database + Mail)
```env
# Les notifications sont stockées en base, envoyées par email ET en temps réel
QUEUE_CONNECTION=database  # Important pour traiter les emails en arrière-plan
BROADCAST_CONNECTION=reverb  # WebSocket pour temps réel
```

### Laravel Reverb (WebSocket)
```env
REVERB_APP_ID=vimaiz-local
REVERB_APP_KEY=vimaiz-key
REVERB_APP_SECRET=vimaiz-secret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

# Variables Vite pour le frontend
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Stripe (Paiements)
```env
STRIPE_KEY=pk_test_... # ou pk_live_... en production
STRIPE_SECRET=sk_test_... # ou sk_live_... en production
STRIPE_WEBHOOK_SECRET=whsec_... # Depuis Dashboard Stripe > Webhooks
```

### Google OAuth (Connexion)
```env
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

### Stockage Fichiers
```env
FILESYSTEM_DISK=public  # local pour dev, s3 pour production
```

**Pour Amazon S3 (Production):**
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=votre_access_key
AWS_SECRET_ACCESS_KEY=votre_secret_key
AWS_DEFAULT_REGION=eu-west-3
AWS_BUCKET=vimaiz-photos
AWS_USE_PATH_STYLE_ENDPOINT=false
```

---

## 📧 Configuration Emails

### 1. Installer Mailgun (Recommandé)
```bash
composer require symfony/mailgun-mailer symfony/http-client
```

### 2. Créer compte Mailgun
1. Aller sur https://www.mailgun.com/
2. Créer un compte (gratuit jusqu'à 5000 emails/mois)
3. Ajouter votre domaine (ex: mg.vimaiz.com)
4. Configurer DNS (TXT, CNAME records)
5. Récupérer votre API Key dans Settings > API Keys

### 3. Vérifier Configuration
```bash
php artisan tinker
```
```php
Mail::raw('Test email', function($msg) {
    $msg->to('votre-email@exemple.com')->subject('Test VIMAIZ');
});
```

---

## 🔔 Configuration Notifications

### Démarrer Reverb (WebSocket Server)

**⚠️ IMPORTANT EN PRODUCTION:**
Reverb doit tourner en continu pour les notifications en temps réel et le chat.

**Développement:**
```bash
# Terminal dédié - doit rester ouvert
php artisan reverb:start
```

**Production (Supervisor - Obligatoire):**

1. **Créer le fichier de configuration:**
```bash
sudo nano /etc/supervisor/conf.d/vimaiz-reverb.conf
```

2. **Contenu du fichier:**
```ini
[program:vimaiz-reverb]
command=php /var/www/vimaiz/artisan reverb:start --host=0.0.0.0 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/vimaiz/storage/logs/reverb.log
stopwaitsecs=10
startretries=10
```

3. **Activer et démarrer:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start vimaiz-reverb
```

4. **Vérifier le statut:**
```bash
sudo supervisorctl status vimaiz-reverb
# Doit afficher: RUNNING
```

5. **Configuration Nginx pour WebSocket:**
```nginx
# Dans votre server block
location /reverb {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Types de Notifications Implémentées

**Admin:**
- ✅ `NewCleaningRequestNotification` - Nouvelle demande de ménage
- ✅ `QuoteAcceptedNotification` - Devis accepté par client
- ✅ `PaymentReceivedNotification` - Paiement reçu
- ✅ `MissionCompletedNotification` - Mission terminée

**Client:**
- ✅ `NewQuoteNotification` - Nouveau devis reçu
- ✅ `PaymentReceivedNotification` - Paiement confirmé
- ✅ `MissionAssignedNotification` - Agent attribué
- ✅ `MissionStartedNotification` - Mission démarrée
- ✅ `MissionCompletedNotification` - Mission terminée
- ✅ `NewMessageNotification` - Nouveau message reçu

**Agent:**
- ✅ `MissionAssignedNotification` - Nouvelle mission
- ✅ `AgentPayoutNotification` - Paiement reçu dans portefeuille
- ✅ `DocumentsVerifiedNotification` - Documents approuvés
- ✅ `DocumentsRejectedNotification` - Documents refusés
- ✅ `AgentWarningNotification` - Avertissement admin
- ✅ `AgentSuspendedNotification` - Compte suspendu
- ✅ `AgentBannedNotification` - Compte banni
- ✅ `NewMessageNotification` - Nouveau message reçu

### Configuration Base de Données
Les notifications sont stockées dans la table `notifications`:
```bash
php artisan notifications:table
php artisan migrate
```

### Traitement Asynchrone (Queue)

**⚠️ IMPORTANT EN PRODUCTION:**
Les notifications emails et temps réel nécessitent un worker de queue actif en permanence.

**Développement:**
```bash
# Terminal dédié - doit rester ouvert
php artisan queue:work --tries=3 --timeout=90
```

**Production (Supervisor - Obligatoire):**
Supervisor garantit que le worker tourne en continu et redémarre automatiquement en cas d'erreur.

1. **Installer Supervisor:**
```bash
# Ubuntu/Debian
sudo apt-get install supervisor

# CentOS/RHEL
sudo yum install supervisor
```

2. **Créer le fichier de configuration:**
```bash
sudo nano /etc/supervisor/conf.d/vimaiz-worker.conf
```

3. **Contenu du fichier:**
```ini
[program:vimaiz-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/vimaiz/artisan queue:work database --sleep=3 --tries=3 --max-time=3600 --max-jobs=1000
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/vimaiz/storage/logs/worker.log
stopwaitsecs=3600
startretries=10
```

4. **Activer et démarrer:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start vimaiz-worker:*
```

5. **Commandes utiles:**
```bash
# Voir le statut
sudo supervisorctl status vimaiz-worker:*

# Redémarrer (après déploiement)
sudo supervisorctl restart vimaiz-worker:*

# Arrêter
sudo supervisorctl stop vimaiz-worker:*

# Voir les logs
sudo tail -f /var/www/vimaiz/storage/logs/worker.log
```

### Vérifier Notifications
```bash
php artisan tinker
```
```php
// Voir les notifications d'un utilisateur
$user = User::find(1);
$user->notifications; // Toutes
$user->unreadNotifications; // Non lues

// Marquer comme lue
$notification = $user->unreadNotifications->first();
$notification->markAsRead();
```

---

## 💰 Configuration Portefeuille Agent

### Fonctionnement
1. **Mission complétée** → Crédit automatique du wallet
2. **Montant** = `agent_payout` de la mission
3. **Retrait minimum** = 100 €
4. **Statut** = `pending` jusqu'à validation admin

### Tables Nécessaires
```bash
php artisan migrate
# Crée: wallets, wallet_transactions
```

### Créditer Manuellement (Admin)
```php
$agent = User::find(1);
$wallet = $agent->wallet ?? $agent->wallet()->create([
    'balance' => 0,
    'pending_balance' => 0,
    'total_earned' => 0,
    'total_withdrawn' => 0,
]);

$wallet->credit(50.00, 'Bonus admin');
```

### Process Retrait
1. Agent demande retrait (min 100€)
2. Transaction créée avec `status = pending`
3. Admin valide dans Filament
4. Transaction passe à `completed`
5. Notification envoyée à l'agent

---

## 🔐 Configuration Stripe

### Mode Test
Voir `docs/STRIPE_SETUP.md` pour configuration détaillée.

**Cartes de test:**
- Succès: `4242 4242 4242 4242`
- 3DS requis: `4000 0027 6000 3184`
- Refusée: `4000 0000 0000 0002`

### Mode Production
1. Activer compte Stripe (vérification identité)
2. Remplacer clés test par clés live
3. Configurer webhook en production: `https://votre-domaine.com/stripe/webhook`
4. Activer méthodes de paiement (Dashboard > Settings > Payment methods)
5. Tester avec vraie carte (petit montant)

### Webhooks (Important)
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```
**Events écoutés:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## 🗄️ Configuration Storage

### Développement (Local)
```env
FILESYSTEM_DISK=public
```
```bash
php artisan storage:link
```
Photos stockées dans `storage/app/public/`

### Production (S3)
```env
FILESYSTEM_DISK=s3
AWS_BUCKET=vimaiz-production
```
```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

---

## 🚀 Déploiement Production

### Checklist Complète
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` généré
- [ ] Base de données configurée
- [ ] Emails configurés et testés (Mailgun recommandé)
- [ ] Stripe en mode live avec webhook
- [ ] Storage S3 configuré
- [ ] **Supervisor installé et configuré (Queue + Reverb)**
- [ ] HTTPS activé (SSL/TLS)
- [ ] Cron configuré pour scheduler
- [ ] Permissions fichiers correctes
- [ ] Nginx/Apache configuré
- [ ] Logs configurés
- [ ] Monitoring mis en place

### 1. Cron (Laravel Scheduler)
**⚠️ OBLIGATOIRE** - Sans cron, les tâches planifiées ne s'exécutent pas.

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne
* * * * * cd /var/www/vimaiz && php artisan schedule:run >> /dev/null 2>&1
```

**Vérifier que le cron tourne:**
```bash
# Voir les logs
grep CRON /var/log/syslog
```

### 2. Permissions Fichiers
```bash
cd /var/www/vimaiz

# Propriétaire
sudo chown -R www-data:www-data .

# Permissions
sudo chmod -R 755 .
sudo chmod -R 775 storage bootstrap/cache
sudo chmod -R 775 storage/logs
```

### 3. Configuration Nginx
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name vimaiz.com www.vimaiz.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vimaiz.com www.vimaiz.com;
    root /var/www/vimaiz/public;

    # SSL
    ssl_certificate /etc/letsencrypt/live/vimaiz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vimaiz.com/privkey.pem;

    index index.php;

    charset utf-8;

    # Logs
    access_log /var/log/nginx/vimaiz-access.log;
    error_log /var/log/nginx/vimaiz-error.log;

    # Laravel
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # WebSocket (Reverb)
    location /reverb {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location /broadcasting/auth {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

**Activer le site:**
```bash
sudo ln -s /etc/nginx/sites-available/vimaiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL avec Let's Encrypt
```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir certificat
sudo certbot --nginx -d vimaiz.com -d www.vimaiz.com

# Auto-renouvellement (déjà configuré par défaut)
sudo certbot renew --dry-run
```

### 5. Optimisations Laravel
```bash
cd /var/www/vimaiz

# Vider les caches existants
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Créer les caches optimisés
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Après chaque déploiement
php artisan migrate --force
php artisan storage:link
npm run build
```

### 6. Script de Déploiement
Créer `deploy.sh` à la racine:
```bash
#!/bin/bash
set -e

echo "🚀 Déploiement VIMAIZ..."

# Git pull
echo "📥 Récupération du code..."
git pull origin main

# Composer
echo "📦 Installation dépendances PHP..."
composer install --no-dev --optimize-autoloader

# NPM
echo "🎨 Build assets..."
npm ci
npm run build

# Laravel
echo "⚙️ Configuration Laravel..."
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Permissions
echo "🔐 Permissions..."
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Restart services
echo "🔄 Redémarrage services..."
sudo supervisorctl restart vimaiz-worker:*
sudo supervisorctl restart vimaiz-reverb
sudo systemctl reload php8.2-fpm
sudo systemctl reload nginx

echo "✅ Déploiement terminé!"
```

**Rendre exécutable:**
```bash
chmod +x deploy.sh
```

### 7. Monitoring & Logs
```bash
# Voir logs Laravel
tail -f storage/logs/laravel.log

# Voir logs Queue Worker
sudo tail -f /var/www/vimaiz/storage/logs/worker.log

# Voir logs Reverb
sudo tail -f /var/www/vimaiz/storage/logs/reverb.log

# Voir logs Nginx
sudo tail -f /var/log/nginx/vimaiz-error.log

# Voir jobs échoués
php artisan queue:failed

# Relancer un job échoué
php artisan queue:retry {id}

# Vider les jobs échoués
php artisan queue:flush
```

---

## 🧪 Tester Configuration

### Emails
```bash
php artisan tinker
Mail::raw('Test', fn($m) => $m->to('test@example.com')->subject('Test'));
```

### Notifications
```bash
php artisan tinker
$user = User::first();
$user->notify(new \App\Notifications\NewQuoteNotification(\App\Models\Quote::first()));
```

### Stripe
Utiliser cartes test dans interface client.

### Queue
```bash
php artisan queue:work --once
```

---

## 📚 Ressources

- Mailgun: https://www.mailgun.com/
- Stripe Docs: https://stripe.com/docs
- Laravel Notifications: https://laravel.com/docs/11.x/notifications
- Laravel Queue: https://laravel.com/docs/11.x/queues
- AWS S3: https://aws.amazon.com/s3/

---

## ⚠️ Problèmes Courants

### Emails ne partent pas
1. Vérifier `.env` : `MAIL_MAILER`, `MAIL_FROM_ADDRESS`
2. Tester: `php artisan tinker` puis `Mail::raw(...)`
3. Vérifier logs: `storage/logs/laravel.log`
4. Si Mailgun: vérifier DNS records validés

### Notifications pas reçues
1. Vérifier table `notifications` en DB
2. Vérifier queue worker actif: `php artisan queue:work`
3. Check `failed_jobs` table

### Wallet pas crédité
1. Mission doit être `completed`
2. Vérifier `MissionService::completeMission()`
3. Check table `wallet_transactions`

### Photos pas affichées
1. Dev: `php artisan storage:link`
2. Prod: Vérifier config S3 et permissions bucket
