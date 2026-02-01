# 🚀 Guide de Mise en Production VIMAIZ

## ⚠️ Prérequis Absolus

### Services qui doivent tourner en permanence

1. **Queue Worker** (Supervisor) - Pour les emails et notifications
2. **Reverb** (Supervisor) - Pour le temps réel (chat, notifications)
3. **Cron** - Pour les tâches planifiées Laravel
4. **Nginx/Apache** - Serveur web
5. **PHP-FPM** - Traitement PHP
6. **MySQL/MariaDB** - Base de données

---

## 📋 Checklist de Déploiement

### Avant le déploiement

- [ ] Serveur configuré (Ubuntu 20.04+ recommandé)
- [ ] Domaine configuré avec DNS pointant vers le serveur
- [ ] PHP 8.2+ installé
- [ ] Composer installé
- [ ] Node.js 20+ et NPM installés
- [ ] MySQL/MariaDB installé
- [ ] Nginx installé
- [ ] Supervisor installé
- [ ] Certbot installé (pour SSL)

### Configuration .env

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` généré
- [ ] `APP_URL` avec HTTPS
- [ ] Base de données configurée
- [ ] `MAIL_MAILER=mailgun` (ou smtp)
- [ ] Stripe clés LIVE
- [ ] `FILESYSTEM_DISK=s3` (recommandé)
- [ ] `QUEUE_CONNECTION=database`
- [ ] `BROADCAST_CONNECTION=reverb`

### Services à configurer

- [ ] Supervisor pour Queue Worker
- [ ] Supervisor pour Reverb
- [ ] Cron pour Laravel Scheduler
- [ ] Nginx avec SSL
- [ ] Permissions fichiers correctes

---

## 🔧 Installation Étape par Étape

### 1. Préparer le Serveur

```bash
# Mise à jour
sudo apt update && sudo apt upgrade -y

#PRÉPARATION DU SERVEUR (BASE PRO)
apt install -y software-properties-common ca-certificates lsb-release apt-transport-https

#INSTALLER PHP 8.2 (LARAVEL PROD)
add-apt-repository ppa:ondrej/php
apt update


# Installer les dépendances
sudo apt install -y nginx mysql-server php8.2 php8.2-fpm php8.2-mysql \
    php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip php8.2-gd \
    php8.2-bcmath php8.2-redis supervisor git curl unzip

# Installer Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Installer Node.js (via nvm recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
```

### 2. Configurer l'Accès GitHub (SSH)

**⚠️ Pour éviter de saisir login/mot de passe à chaque git pull**

```bash
# Générer une clé SSH sur le serveur
ssh-keygen -t ed25519 -C "production-server@vimaiz.com"
# Appuyez sur Entrée pour accepter le chemin par défaut
# Pas de passphrase (appuyez 2x Entrée)

# Copier la clé publique
cat ~/.ssh/id_ed25519.pub
# Copiez la sortie complète
```

**Ajouter la clé SSH sur GitHub :**
1. Aller sur https://github.com/settings/keys
2. Cliquer "New SSH key"
3. Titre : `VPS Production VIMAIZ`
4. Coller la clé publique
5. Cliquer "Add SSH key"

**Tester la connexion :**
```bash
ssh -T git@github.com
# Doit afficher : "Hi username! You've successfully authenticated..."
```

### 3. Cloner et Installer VIMAIZ

```bash
# Créer le répertoire
sudo mkdir -p /var/www/vimaiz
sudo chown -R $USER:$USER /var/www/vimaiz
cd /var/www/vimaiz

# Cloner le projet (SSH - recommandé)
git clone git@github.com:votre-username/vimaiz.git .

# Alternative HTTPS avec Personal Access Token (moins sécurisé)
# git clone https://github.com/votre-username/vimaiz.git .
# Puis configurer le credential helper :
# git config --global credential.helper store

# Installer dépendances PHP
composer install --no-dev --optimize-autoloader

# Installer dépendances JS
npm ci

# Copier .env
cp .env.example .env
```

### 3.1. Configurer MySQL

**⚠️ À faire AVANT d'éditer le .env**

```bash
# Se connecter à MySQL en root
sudo mysql
```

**Dans la console MySQL, exécuter :**

```sql
-- Créer la base de données
CREATE DATABASE vimaiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer un utilisateur dédié (CHANGEZ le mot de passe !)
CREATE USER 'vimaiz_user'@'localhost' IDENTIFIED BY 'VotreMotDePasseSecurise123!';

-- Donner tous les privilèges sur la base vimaiz
GRANT ALL PRIVILEGES ON vimaiz.* TO 'vimaiz_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;

-- Vérifier
SHOW DATABASES;

-- Quitter MySQL
EXIT;
```

**Tester la connexion :**

```bash
mysql -u vimaiz_user -p vimaiz
# Entrez le mot de passe, puis tapez EXIT si ça fonctionne
```

### 3.2. Configurer le fichier .env

```bash
nano .env  # Éditer les valeurs
```

**Variables essentielles à modifier :**

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com

# Base de données MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vimaiz
DB_USERNAME=vimaiz_user
DB_PASSWORD=VotreMotDePasseSecurise123!  # MÊME mot de passe que CREATE USER

# Mail (configurez avec vos identifiants)
MAIL_MAILER=smtp
MAIL_HOST=votre-smtp.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@example.com
MAIL_PASSWORD=votre-password-mail
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@vimaiz.com
MAIL_FROM_NAME="${APP_NAME}"

# Stripe (clés LIVE en production)
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Reverb (WebSocket)
REVERB_APP_ID=vimaiz
REVERB_APP_KEY=votre-cle-reverb
REVERB_APP_SECRET=votre-secret-reverb
REVERB_HOST=votre-domaine.com
REVERB_PORT=443
REVERB_SCHEME=https
```

**Sauvegarder :** `Ctrl+O`, `Entrée`, `Ctrl+X`

### 3.3. Finaliser l'installation

```bash
# Générer la clé
php artisan key:generate

# Créer le lien symbolique
php artisan storage:link

# Lancer les migrations
php artisan migrate --force

# Build des assets
npm run build

# Permissions
sudo chown -R www-data:www-data /var/www/vimaiz
sudo chmod -R 755 /var/www/vimaiz
sudo chmod -R 775 /var/www/vimaiz/storage
sudo chmod -R 775 /var/www/vimaiz/bootstrap/cache
```

### 3. Configurer Supervisor

**⚠️ CRITIQUE - Sans Supervisor, les notifications ne fonctionneront pas !**

#### Queue Worker

```bash
# Copier le fichier de config
sudo cp docs/supervisor/vimaiz-worker.conf /etc/supervisor/conf.d/

# Éditer si nécessaire (changer le chemin)
sudo nano /etc/supervisor/conf.d/vimaiz-worker.conf

# Activer
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start vimaiz-worker:*

# Vérifier
sudo supervisorctl status vimaiz-worker:*
```

**Le statut doit afficher `RUNNING` !**

#### Reverb (WebSocket)

```bash
# Copier le fichier de config
sudo cp docs/supervisor/vimaiz-reverb.conf /etc/supervisor/conf.d/

# Éditer si nécessaire
sudo nano /etc/supervisor/conf.d/vimaiz-reverb.conf

# Activer
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start vimaiz-reverb

# Vérifier
sudo supervisorctl status vimaiz-reverb
```

**Le statut doit afficher `RUNNING` !**

### 4. Configurer le Cron

**⚠️ OBLIGATOIRE - Pour les tâches planifiées**

```bash
# Éditer le crontab de www-data
sudo crontab -u www-data -e

# Ajouter cette ligne
* * * * * cd /var/www/vimaiz && php artisan schedule:run >> /dev/null 2>&1
```

**Vérifier :**
```bash
# Attendre 1 minute puis vérifier les logs
tail -f /var/www/vimaiz/storage/logs/laravel.log
```

### 5. Configurer Nginx

```bash
# Copier le contenu de `docs/nginx/vimaiz.conf` ou voir CONFIGURATION.md
sudo cp /var/www/vimaiz/docs/nginx/vimaiz.conf /etc/nginx/sites-available/vimaiz
```

```bash
# ⚠️ Modifier le domaine avant d'activer
sudo nano /etc/nginx/sites-available/vimaiz
# Remplacer "vimaiz.com" par votre vrai domaine
```
<!-- ```bash
# Créer le fichier de config
sudo nano /etc/nginx/sites-available/vimaiz
``` -->


```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/vimaiz /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Supprimer le site par défaut

# Tester la config
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

### 6. Configurer SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d vimaiz.com -d www.vimaiz.com

# Vérifier le renouvellement auto
sudo certbot renew --dry-run
```

Le certificat se renouvelle automatiquement tous les 90 jours.

### 7. Optimiser Laravel

```bash
cd /var/www/vimaiz

# Créer les caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

## 🔄 Processus de Déploiement

### Script Automatique

Un script `deploy.sh` est fourni à la racine du projet :

```bash
# Première fois
chmod +x deploy.sh

# Déployer
./deploy.sh
```

### Déploiement Manuel

```bash
cd /var/www/vimaiz

# 1. Maintenance mode
php artisan down

# 2. Git pull
git pull origin main

# 3. Dépendances
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# 4. Laravel
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 5. Permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 6. Redémarrer les services
sudo supervisorctl restart vimaiz-worker:*
sudo supervisorctl restart vimaiz-reverb
sudo systemctl reload php8.2-fpm
sudo systemctl reload nginx

# 7. Sortir du mode maintenance
php artisan up
```

---

## 🔍 Vérifications Post-Déploiement

### 1. Services Supervisor

```bash
sudo supervisorctl status

# Doit afficher :
# vimaiz-reverb                    RUNNING   pid 12345, uptime 0:05:23
# vimaiz-worker:vimaiz-worker_00   RUNNING   pid 12346, uptime 0:05:23
# vimaiz-worker:vimaiz-worker_01   RUNNING   pid 12347, uptime 0:05:23
```

**Si un service est STOPPED ou FATAL** :
```bash
# Voir les logs
sudo tail -f /var/www/vimaiz/storage/logs/worker.log
sudo tail -f /var/www/vimaiz/storage/logs/reverb.log

# Redémarrer
sudo supervisorctl restart vimaiz-worker:*
sudo supervisorctl restart vimaiz-reverb
```

### 2. Cron

```bash
# Vérifier que le cron tourne
sudo grep CRON /var/log/syslog | tail -n 20

# Doit voir des lignes comme :
# CRON[12345]: (www-data) CMD (cd /var/www/vimaiz && php artisan schedule:run)
```

### 3. Queue Worker

```bash
# Tester l'envoi d'un email
php artisan tinker

# Dans tinker :
Mail::raw('Test production', fn($m) => $m->to('votre@email.com')->subject('Test'));

# Vérifier les logs
tail -f storage/logs/worker.log
```

### 4. Reverb (Temps Réel)

```bash
# Vérifier que le port 8080 écoute
sudo netstat -tlnp | grep 8080

# Doit afficher :
# tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      12345/php
```

Depuis le navigateur, ouvrir la console (F12) et vérifier :
- `[Echo] Subscribed to...` apparaît
- Pas d'erreur 419 sur `/broadcasting/auth`

### 5. Base de Données

```bash
php artisan tinker

# Vérifier connexion
DB::table('users')->count();
```

### 6. Storage

```bash
# Si S3
php artisan tinker
Storage::disk('s3')->put('test.txt', 'Hello Production');
Storage::disk('s3')->get('test.txt');

# Si local
ls -la storage/app/public/
```

### 7. Stripe

- Tester un paiement avec une vraie carte (montant faible)
- Vérifier dans Dashboard Stripe > Paiements
- Vérifier les webhooks reçus

---

## 📊 Monitoring et Logs

### Commandes Essentielles

```bash
# Laravel
tail -f /var/www/vimaiz/storage/logs/laravel.log

# Queue Worker
sudo tail -f /var/www/vimaiz/storage/logs/worker.log

# Reverb
sudo tail -f /var/www/vimaiz/storage/logs/reverb.log

# Nginx Access
sudo tail -f /var/log/nginx/vimaiz-access.log

# Nginx Errors
sudo tail -f /var/log/nginx/vimaiz-error.log

# PHP-FPM
sudo tail -f /var/log/php8.2-fpm.log

# Supervisor
sudo tail -f /var/log/supervisor/supervisord.log
```

### Jobs Échoués

```bash
# Voir les jobs en échec
php artisan queue:failed

# Relancer un job
php artisan queue:retry {id}

# Relancer tous les jobs échoués
php artisan queue:retry all

# Vider les jobs échoués
php artisan queue:flush
```

### Espace Disque

```bash
# Vérifier l'espace
df -h

# Nettoyer les logs Laravel (garder 7 jours)
cd /var/www/vimaiz/storage/logs
find . -name "*.log" -mtime +7 -delete
```

---

## 🆘 Dépannage

### Queue Worker ne traite pas les jobs

1. Vérifier que Supervisor tourne :
```bash
sudo supervisorctl status vimaiz-worker:*
```

2. Si STOPPED, voir les erreurs :
```bash
sudo tail -f /var/www/vimaiz/storage/logs/worker.log
```

3. Redémarrer :
```bash
sudo supervisorctl restart vimaiz-worker:*
```

4. Vérifier la table `jobs` :
```bash
php artisan tinker
DB::table('jobs')->count();  # Nombre de jobs en attente
```

### Reverb ne se connecte pas

1. Vérifier que Reverb tourne :
```bash
sudo supervisorctl status vimaiz-reverb
```

2. Vérifier le port :
```bash
sudo netstat -tlnp | grep 8080
```

3. Vérifier .env :
```bash
grep REVERB .env
# REVERB_HOST doit être votre domaine en production
# REVERB_SCHEME doit être https
```

4. Vérifier Nginx config pour WebSocket proxy

### Emails ne partent pas

1. Vérifier .env :
```bash
grep MAIL .env
```

2. Tester manuellement :
```bash
php artisan tinker
Mail::raw('Test', fn($m) => $m->to('test@email.com')->subject('Test'));
```

3. Vérifier les logs :
```bash
tail -f storage/logs/laravel.log
```

4. Vérifier que le worker traite les jobs

### Erreur 500

1. Activer debug temporairement :
```bash
# .env
APP_DEBUG=true
```

2. Voir les erreurs dans le navigateur

3. Désactiver debug :
```bash
APP_DEBUG=false
```

4. Vérifier les logs Laravel

### Permissions

Si erreurs de permissions :
```bash
cd /var/www/vimaiz
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod -R 775 storage bootstrap/cache
```

---

## 🔐 Sécurité

### Firewall

```bash
# Installer UFW
sudo apt install ufw

# Règles de base
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Activer
sudo ufw enable

# Vérifier
sudo ufw status
```

### Fail2Ban (Protection SSH)

```bash
# Installer
sudo apt install fail2ban

# Créer config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Activer
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Permissions Base de Données

```bash
mysql -u root -p

CREATE DATABASE vimaiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vimaiz_user'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT ALL PRIVILEGES ON vimaiz.* TO 'vimaiz_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📈 Performance

### OPcache (PHP)

```bash
sudo nano /etc/php/8.2/fpm/php.ini

# Ajouter/modifier
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
opcache.fast_shutdown=1

# Redémarrer
sudo systemctl restart php8.2-fpm
```

### Redis (Cache)

```bash
# Installer
sudo apt install redis-server

# .env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis  # Alternative à database

# Config Laravel
php artisan config:cache
```

### CDN pour Assets

Utiliser un CDN pour servir les assets statiques (CSS, JS, images).

---

## 📝 Maintenance

### Sauvegarde Base de Données

```bash
# Script de backup automatique
sudo nano /usr/local/bin/backup-vimaiz.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/vimaiz"
mkdir -p $BACKUP_DIR

# MySQL
mysqldump -u vimaiz_user -p'mot_de_passe' vimaiz | gzip > $BACKUP_DIR/vimaiz_$DATE.sql.gz

# Fichiers (si storage local)
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /var/www/vimaiz/storage

# Garder 30 jours
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/backup-vimaiz.sh

# Cron quotidien à 2h du matin
sudo crontab -e
0 2 * * * /usr/local/bin/backup-vimaiz.sh >> /var/log/vimaiz-backup.log 2>&1
```

### Mise à Jour PHP

```bash
# Sauvegarder d'abord !
# Installer nouvelle version
sudo apt install php8.3 php8.3-fpm php8.3-mysql ...

# Mettre à jour Nginx config
sudo nano /etc/nginx/sites-available/vimaiz
# Changer: fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;

# Redémarrer
sudo systemctl reload nginx
sudo systemctl restart php8.3-fpm
```

---

## 📞 Support et Ressources

- **Laravel Docs**: https://laravel.com/docs
- **Supervisor Docs**: http://supervisord.org/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/

---

## ✅ Checklist Finale

Avant de mettre en production :

- [ ] Tous les services Supervisor affichent RUNNING
- [ ] Cron configuré et qui tourne
- [ ] SSL actif (cadenas vert dans le navigateur)
- [ ] Email de test reçu
- [ ] Notification temps réel testée (chat)
- [ ] Paiement Stripe testé en live
- [ ] Logs accessibles et pas d'erreurs
- [ ] Sauvegarde automatique configurée
- [ ] Firewall actif
- [ ] Monitoring configuré
- [ ] APP_DEBUG=false
- [ ] Documentation d'exploitation remise au client
