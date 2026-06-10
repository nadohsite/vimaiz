#!/bin/bash
set -e

cd /var/www/vimaiz

# Pull latest changes
git reset --hard
git pull origin main

# PHP dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Node dependencies & build React frontend
npm install
npm run build

# Clear cache, optimize, restart workers & bring app up
php artisan optimize:clear
php artisan optimize
php artisan queue:restart || true
php artisan up

# Restart PHP-FPM
sudo systemctl restart php8.4-fpm

echo "Deployment finished successfully."
