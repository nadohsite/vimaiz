# Guide de Déploiement VIMAIZ sur VPS OVH Ubuntu

Ce guide détaille étape par étape le déploiement de l'application VIMAIZ sur un VPS OVH Ubuntu avec le domaine **vimaiz.com**.

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Connexion au VPS](#2-connexion-au-vps)
3. [Sécurisation du serveur](#3-sécurisation-du-serveur)
4. [Installation des dépendances](#4-installation-des-dépendances)
5. [Configuration de la base de données](#5-configuration-de-la-base-de-données)
6. [Déploiement du code](#6-déploiement-du-code)
7. [Configuration de l'application](#7-configuration-de-lapplication)
8. [Configuration Nginx](#8-configuration-nginx)
9. [Certificat SSL (HTTPS)](#9-certificat-ssl-https)
10. [Configuration du domaine OVH](#10-configuration-du-domaine-ovh)
11. [Configuration des tâches planifiées](#11-configuration-des-tâches-planifiées)
12. [Configuration des queues](#12-configuration-des-queues)
13. [Maintenance et mises à jour](#13-maintenance-et-mises-à-jour)

---

## 1. Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Un VPS OVH avec Ubuntu 22.04 ou 24.04
- ✅ Le nom de domaine **vimaiz.com** acheté chez OVH
- ✅ Le code source sur GitHub
- ✅ Les identifiants SSH de votre VPS (reçus par email OVH)
- ✅ Un compte Stripe pour les paiements (clés API)

**Informations à noter :**
- Adresse IP de votre VPS : `XXX.XXX.XXX.XXX` (visible dans l'espace client OVH)
- Mot de passe root : (reçu par email lors de la création du VPS)

---

## 2. Connexion au VPS

### Depuis macOS/Linux (Terminal)

```bash
ssh root@VOTRE_IP_VPS
```

Exemple :
```bash
ssh root@51.77.123.45
```

Tapez `yes` si on vous demande de confirmer la connexion, puis entrez votre mot de passe.

### Depuis Windows

Utilisez **PuTTY** ou **Windows Terminal** :
```bash
ssh root@VOTRE_IP_VPS
```

---

## 3. Sécurisation du serveur

### 3.1 Mettre à jour le système

```bash
apt update && apt upgrade -y
```

### 3.2 Créer un utilisateur non-root

```bash
# Créer l'utilisateur "deploy"
adduser deploy

# Ajouter aux sudoers
usermod -aG sudo deploy

# Permettre la connexion SSH
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

### 3.3 Configurer le pare-feu

```bash
# Installer UFW
apt install ufw -y

# Autoriser SSH, HTTP et HTTPS
ufw allow OpenSSH
ufw allow 80
ufw allow 443

# Activer le pare-feu
ufw --force enable

# Vérifier le statut
ufw status
```

### 3.4 (Optionnel) Désactiver la connexion root SSH

```bash
nano /etc/ssh/sshd_config
```

Modifier la ligne :
```
PermitRootLogin no
```

Puis redémarrer SSH :
```bash
systemctl restart sshd
```

> ⚠️ **Attention** : Testez d'abord la connexion avec l'utilisateur `deploy` avant de désactiver root !

---

## 4. Installation des dépendances

### 4.1 Installer PHP 8.2 et extensions

```bash
# Ajouter le repository PHP
apt install software-properties-common -y
add-apt-repository ppa:ondrej/php -y
apt update

# Installer PHP 8.2 et les extensions requises
apt install php8.2 php8.2-fpm php8.2-cli php8.2-mysql php8.2-pgsql \
    php8.2-sqlite3 php8.2-gd php8.2-curl php8.2-mbstring php8.2-xml \
    php8.2-zip php8.2-bcmath php8.2-intl php8.2-readline php8.2-redis -y

# Vérifier l'installation
php -v
```

### 4.2 Installer Composer

```bash
cd /tmp
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Vérifier
composer --version
```

### 4.3 Installer Node.js 20 et npm

```bash
# Installer Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y

# Vérifier
node -v
npm -v
```

### 4.4 Installer Nginx

```bash
apt install nginx -y

# Démarrer et activer Nginx
systemctl start nginx
systemctl enable nginx

# Vérifier
systemctl status nginx
```

### 4.5 Installer MySQL

```bash
apt install mysql-server -y

# Sécuriser l'installation
mysql_secure_installation
```

Répondez aux questions :
- **VALIDATE PASSWORD COMPONENT** : `N` (ou `Y` si vous voulez des mots de passe complexes)
- **Remove anonymous users** : `Y`
- **Disallow root login remotely** : `Y`
- **Remove test database** : `Y`
- **Reload privilege tables** : `Y`

### 4.6 Installer Redis (pour les queues et cache)

```bash
apt install redis-server -y

# Configurer Redis pour systemd
nano /etc/redis/redis.conf
```

Trouver et modifier la ligne `supervised` :
```
supervised systemd
```

Redémarrer Redis :
```bash
systemctl restart redis
systemctl enable redis

# Tester
redis-cli ping
# Doit répondre : PONG
```

### 4.7 Installer Git

```bash
apt install git -y
```

---

## 5. Configuration de la base de données

### 5.1 Créer la base de données et l'utilisateur

```bash
mysql -u root -p
```

Dans MySQL, exécuter :

```sql
-- Créer la base de données
CREATE DATABASE vimaiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer l'utilisateur
CREATE USER 'vimaiz'@'localhost' IDENTIFIED BY 'VotreMotDePasseSecurise123!';

-- Donner les permissions
GRANT ALL PRIVILEGES ON vimaiz.* TO 'vimaiz'@'localhost';
FLUSH PRIVILEGES;

-- Quitter
EXIT;
```

> 📝 **Notez** ces informations pour le fichier `.env` :
> - Base de données : `vimaiz`
> - Utilisateur : `vimaiz`
> - Mot de passe : `VotreMotDePasseSecurise123!`

---

## 6. Déploiement du code

### 6.1 Créer le répertoire de l'application

```bash
# Créer le répertoire
mkdir -p /var/www/vimaiz.com
chown -R deploy:deploy /var/www/vimaiz.com

# Se connecter en tant que deploy
su - deploy
cd /var/www/vimaiz.com
```

### 6.2 Cloner le repository GitHub

```bash
# Cloner le code (remplacez par votre URL GitHub)
git clone https://github.com/VOTRE_USERNAME/vimaiz.git .

# Si le repo est privé, utilisez un token personnel :
git clone https://VOTRE_TOKEN@github.com/VOTRE_USERNAME/vimaiz.git .
```

#### Créer un token GitHub (si repo privé)

1. Allez sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Sélectionnez `repo`
3. Copiez le token généré

### 6.3 Installer les dépendances PHP

```bash
composer install --no-dev --optimize-autoloader
```

### 6.4 Installer les dépendances Node.js et compiler les assets

```bash
npm ci
npm run build
```

---

## 7. Configuration de l'application

### 7.1 Créer le fichier .env

```bash
cp .env.example .env
nano .env
```

### 7.2 Configurer le fichier .env

```env
APP_NAME="VIMAIZ"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_TIMEZONE=Europe/Paris
APP_URL=https://vimaiz.com

# Logs
LOG_CHANNEL=daily
LOG_LEVEL=error

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vimaiz
DB_USERNAME=vimaiz
DB_PASSWORD=VotreMotDePasseSecurise123!

# Cache & Session
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail (exemple avec SMTP)
MAIL_MAILER=smtp
MAIL_HOST=ssl0.ovh.net
MAIL_PORT=465
MAIL_USERNAME=contact@vimaiz.com
MAIL_PASSWORD=VotreMotDePasseEmail
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=contact@vimaiz.com
MAIL_FROM_NAME="${APP_NAME}"

# Stripe
STRIPE_KEY=pk_live_VOTRE_CLE_PUBLIQUE
STRIPE_SECRET=sk_live_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET

# Filament (Admin)
FILAMENT_FILESYSTEM_DISK=public
```

### 7.3 Générer la clé de l'application

```bash
php artisan key:generate
```

### 7.4 Créer le lien symbolique pour le storage

```bash
php artisan storage:link
```

### 7.5 Exécuter les migrations

```bash
php artisan migrate --force
```

### 7.6 (Optionnel) Exécuter les seeders

```bash
php artisan db:seed --force
```

### 7.7 Optimiser l'application

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan icons:cache
```

### 7.8 Configurer les permissions

```bash
# Revenir en root
exit

# Permissions des répertoires
chown -R deploy:www-data /var/www/vimaiz.com
chmod -R 755 /var/www/vimaiz.com
chmod -R 775 /var/www/vimaiz.com/storage
chmod -R 775 /var/www/vimaiz.com/bootstrap/cache
```

---

## 8. Configuration Nginx

### 8.1 Créer le fichier de configuration

```bash
nano /etc/nginx/sites-available/vimaiz.com
```

Coller cette configuration :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name vimaiz.com www.vimaiz.com;
    root /var/www/vimaiz.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    # Gestion des fichiers statiques
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Bloquer l'accès aux fichiers sensibles
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Taille maximale des uploads (100MB)
    client_max_body_size 100M;
}
```

### 8.2 Activer le site

```bash
# Créer le lien symbolique
ln -s /etc/nginx/sites-available/vimaiz.com /etc/nginx/sites-enabled/

# Supprimer le site par défaut
rm /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Recharger Nginx
systemctl reload nginx
```

---

## 9. Certificat SSL (HTTPS)

### 9.1 Installer Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 9.2 Obtenir le certificat SSL

> ⚠️ **Important** : Le domaine doit déjà pointer vers votre VPS (voir section 10)

```bash
certbot --nginx -d vimaiz.com -d www.vimaiz.com
```

Répondez aux questions :
- Entrez votre email
- Acceptez les conditions (`A`)
- Choisissez de rediriger HTTP vers HTTPS (`2`)

### 9.3 Renouvellement automatique

Certbot configure automatiquement le renouvellement. Vérifiez :

```bash
certbot renew --dry-run
```

---

## 10. Configuration du domaine OVH

### 10.1 Accéder à l'espace client OVH

1. Connectez-vous à [www.ovh.com/manager](https://www.ovh.com/manager)
2. Allez dans **Web Cloud** → **Noms de domaine** → **vimaiz.com**
3. Cliquez sur l'onglet **Zone DNS**

### 10.2 Configurer les enregistrements DNS

Supprimez les enregistrements existants de type A et AAAA pour `@` et `www`, puis ajoutez :

| Type | Sous-domaine | Cible | TTL |
|------|--------------|-------|-----|
| A | @ (vide) | `VOTRE_IP_VPS` | 3600 |
| A | www | `VOTRE_IP_VPS` | 3600 |

**Pour ajouter un enregistrement :**

1. Cliquez sur **Ajouter une entrée**
2. Choisissez le type **A**
3. Sous-domaine : laissez vide pour `@` ou tapez `www`
4. Cible : l'adresse IP de votre VPS (ex: `51.77.123.45`)
5. TTL : 3600
6. Cliquez sur **Suivant** puis **Confirmer**

### 10.3 Attendre la propagation DNS

La propagation peut prendre de **5 minutes à 48 heures**. Vérifiez avec :

```bash
# Depuis votre ordinateur local
nslookup vimaiz.com
# ou
dig vimaiz.com
```

Le résultat doit afficher l'IP de votre VPS.

### 10.4 Tester l'accès

Une fois la propagation terminée :

1. Accédez à `http://vimaiz.com` dans votre navigateur
2. Si ça fonctionne, installez le certificat SSL (section 9)
3. Accédez ensuite à `https://vimaiz.com`

---

## 11. Configuration des tâches planifiées

Laravel utilise un planificateur de tâches pour les emails, nettoyages, etc.

### 11.1 Configurer le cron

```bash
crontab -e
```

Choisissez l'éditeur (1 pour nano), puis ajoutez à la fin :

```cron
* * * * * cd /var/www/vimaiz.com && php artisan schedule:run >> /dev/null 2>&1
```

Sauvegardez et quittez (`Ctrl+X`, `Y`, `Enter`).

---

## 12. Configuration des queues

Les queues permettent d'exécuter des tâches en arrière-plan (envoi d'emails, notifications...).

### 12.1 Installer Supervisor

```bash
apt install supervisor -y
```

### 12.2 Créer la configuration du worker

```bash
nano /etc/supervisor/conf.d/vimaiz-worker.conf
```

Coller :

```ini
[program:vimaiz-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/vimaiz.com/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=deploy
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/vimaiz.com/storage/logs/worker.log
stopwaitsecs=3600
```

### 12.3 Démarrer les workers

```bash
supervisorctl reread
supervisorctl update
supervisorctl start vimaiz-worker:*

# Vérifier le statut
supervisorctl status
```

---

## 13. Maintenance et mises à jour

### 13.1 Script de déploiement

Créez un script pour simplifier les mises à jour :

```bash
nano /var/www/vimaiz.com/deploy.sh
```

Coller :

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement VIMAIZ..."

cd /var/www/vimaiz.com

# Mode maintenance
php artisan down

# Récupérer les dernières modifications
git pull origin main

# Installer les dépendances PHP
composer install --no-dev --optimize-autoloader

# Installer les dépendances JS et compiler
npm ci
npm run build

# Migrations
php artisan migrate --force

# Vider et reconstruire les caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan icons:cache

# Redémarrer les queues
sudo supervisorctl restart vimaiz-worker:*

# Sortir du mode maintenance
php artisan up

echo "✅ Déploiement terminé !"
```

Rendre exécutable :

```bash
chmod +x /var/www/vimaiz.com/deploy.sh
```

### 13.2 Utilisation

Pour déployer une mise à jour :

```bash
su - deploy
cd /var/www/vimaiz.com
./deploy.sh
```

### 13.3 Commandes utiles

```bash
# Voir les logs Laravel
tail -f /var/www/vimaiz.com/storage/logs/laravel.log

# Voir les logs Nginx
tail -f /var/log/nginx/error.log

# Redémarrer PHP-FPM
sudo systemctl restart php8.2-fpm

# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -m
```

---

## 14. Configuration Stripe Webhook (Production)

### 14.1 Créer le webhook sur Stripe

1. Allez sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **Ajouter un point de terminaison**
3. URL : `https://vimaiz.com/stripe/webhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Cliquez sur **Ajouter le point de terminaison**
6. Copiez le **Secret de signature** (commence par `whsec_`)
7. Ajoutez-le dans votre `.env` :

```env
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET
```

Puis recachez la config :

```bash
php artisan config:cache
```

---

## 15. Checklist finale

- [ ] Le site est accessible sur `https://vimaiz.com`
- [ ] Le certificat SSL est valide (cadenas vert)
- [ ] L'inscription/connexion fonctionne
- [ ] Les emails sont envoyés
- [ ] Le paiement Stripe fonctionne
- [ ] L'espace admin `/admin` est accessible
- [ ] Les queues fonctionnent (`supervisorctl status`)
- [ ] Le cron est configuré (`crontab -l`)

---

## 16. Résolution des problèmes courants

### Erreur 500

```bash
# Vérifier les logs
tail -100 /var/www/vimaiz.com/storage/logs/laravel.log

# Vérifier les permissions
chown -R deploy:www-data /var/www/vimaiz.com/storage
chmod -R 775 /var/www/vimaiz.com/storage
```

### Page blanche

```bash
# Vérifier PHP-FPM
systemctl status php8.2-fpm

# Redémarrer
systemctl restart php8.2-fpm
```

### Erreur "Class not found"

```bash
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

### Assets non chargés (CSS/JS)

```bash
npm run build
php artisan view:clear
```

### Erreur de connexion à la base de données

```bash
# Tester la connexion
mysql -u vimaiz -p vimaiz

# Vérifier le .env
cat /var/www/vimaiz.com/.env | grep DB_
```

---

## Support

En cas de problème, vérifiez toujours les logs :

```bash
# Laravel
tail -f /var/www/vimaiz.com/storage/logs/laravel.log

# Nginx
tail -f /var/log/nginx/error.log

# PHP-FPM
tail -f /var/log/php8.2-fpm.log
```

---

**Document créé le** : Janvier 2026  
**Application** : VIMAIZ  
**Domaine** : vimaiz.com
