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

# Clear cache & optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Node dependencies & build React frontend
npm install
npm run build

# Restart PHP-FPM
sudo systemctl restart php8.4-fpm

echo "Deployment finished successfully."
