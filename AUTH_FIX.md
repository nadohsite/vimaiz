# 🔧 Fix Auth Guard Error

## Problème
```
Auth driver [sanctum] for guard [sanctum] is not defined.
```

## Solution Appliquée

### 1. Configuration Auth (`config/auth.php`)
Le guard `sanctum` a été configuré pour utiliser le driver `session` au lieu d'un driver `sanctum` inexistant :

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'sanctum' => [
        'driver' => 'session',  // Utilise session, pas sanctum
        'provider' => 'users',
    ],
],
```

### 2. Routes (`routes/web.php`)
Simplifié le middleware pour utiliser le guard par défaut :

**Avant :**
```php
Route::middleware(['auth:sanctum', config('jetstream.auth_session'), 'verified'])
```

**Après :**
```php
Route::middleware(['auth', config('jetstream.auth_session'), 'verified'])
```

### 3. Cache Cleared
```bash
php artisan config:clear
php artisan route:clear
```

## Explication

Laravel Sanctum dans Jetstream utilise l'authentification basée sur les sessions pour les applications web (pas les tokens API). Le middleware `auth:sanctum` n'est pas nécessaire pour les routes web - le simple middleware `auth` suffit.

Le guard `sanctum` personnalisé a été ajouté pour compatibilité, mais il utilise le même driver `session` que le guard `web` par défaut.

## Résultat

✅ L'erreur est résolue
✅ L'authentification fonctionne normalement
✅ Les routes protégées sont accessibles après login
