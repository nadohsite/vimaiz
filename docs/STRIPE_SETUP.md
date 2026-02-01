# 💳 Configuration Stripe - VIMAIZ

Ce guide explique comment configurer Stripe pour le système de paiement VIMAIZ.

---

## 1. Créer un compte Stripe

1. Rendez-vous sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Créez votre compte avec un email professionnel
3. Vérifiez votre email

---

## 2. Récupérer les clés API

### Mode Test (Développement)

1. Connectez-vous au [Dashboard Stripe](https://dashboard.stripe.com)
2. Assurez-vous d'être en **mode Test** (toggle en haut à droite)
3. Allez dans **Développeurs** → **Clés API**
4. Copiez :
   - **Clé publiable** : `pk_test_...`
   - **Clé secrète** : `sk_test_...`

### Mode Live (Production)

1. Passez en **mode Live** dans le dashboard
2. Récupérez les clés de production :
   - **Clé publiable** : `pk_live_...`
   - **Clé secrète** : `sk_live_...`

⚠️ **IMPORTANT** : Ne jamais exposer la clé secrète côté client !

---

## 3. Configurer Laravel (.env)

Ajoutez ces variables dans votre fichier `.env` :

```env
# Stripe Configuration
STRIPE_KEY=pk_test_VOTRE_CLE_PUBLIABLE
STRIPE_SECRET=sk_test_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK

# Monnaie par défaut
STRIPE_CURRENCY=eur
```

---

## 4. Configurer config/services.php

Vérifiez que le fichier `config/services.php` contient :

```php
'stripe' => [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    'currency' => env('STRIPE_CURRENCY', 'eur'),
],
```

---

## 5. Configurer les Webhooks

Les webhooks permettent à Stripe de notifier votre application des événements de paiement.

### 5.1 Créer un endpoint webhook

1. Dans le Dashboard Stripe : **Développeurs** → **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL de l'endpoint :
   - **Local (test)** : Utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli) ou ngrok
   - **Production** : `https://votre-domaine.com/stripe/webhook`

4. Sélectionnez les événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

5. Copiez le **Secret de signature** → Mettez-le dans `STRIPE_WEBHOOK_SECRET`

### 5.2 Route webhook Laravel

La route est déjà configurée dans `routes/web.php` :

```php
Route::post('/stripe/webhook', [WebhookController::class, 'handleWebhook']);
```

---

## 6. Test en local avec Stripe CLI

### 6.1 Installer Stripe CLI

**macOS (Homebrew)** :
```bash
brew install stripe/stripe-cli/stripe
```

**Linux** :
```bash
# Télécharger depuis https://github.com/stripe/stripe-cli/releases
```

**Windows** :
```bash
scoop install stripe
```

### 6.2 Se connecter

```bash
stripe login
```

### 6.3 Écouter les webhooks en local

```bash
stripe listen --forward-to localhost:8000/stripe/webhook
```

Cela affichera un webhook secret temporaire à utiliser pour les tests.

---

## 7. Cartes de test

Utilisez ces cartes pour tester les paiements :

| Scénario | Numéro de carte | CVC | Date |
|----------|-----------------|-----|------|
| ✅ Paiement réussi | `4242 4242 4242 4242` | N'importe | Future |
| ❌ Carte refusée | `4000 0000 0000 0002` | N'importe | Future |
| ❌ Fonds insuffisants | `4000 0000 0000 9995` | N'importe | Future |
| 🔐 Authentification 3D Secure | `4000 0025 0000 3155` | N'importe | Future |
| ⚠️ Carte expirée | `4000 0000 0000 0069` | N'importe | Future |

---

## 8. Flux de paiement VIMAIZ

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUX DE PAIEMENT                             │
└─────────────────────────────────────────────────────────────────┘

1. CLIENT CRÉE DEMANDE
   └─> ServiceRequest créé (status: pending)

2. ADMIN CRÉE & ENVOIE DEVIS
   └─> Quote créé (status: sent)
   └─> Client notifié

3. CLIENT VOIT LE DEVIS
   └─> Route: GET /client/quotes/{quote}
   └─> Page: client/quotes/show.tsx

4. CLIENT ACCEPTE LE DEVIS
   └─> Route: POST /client/quotes/{quote}/accept
   └─> Quote (status: accepted)
   └─> Redirection vers paiement

5. PAGE DE PAIEMENT
   └─> Route: GET /client/payment/{quote}
   └─> PaymentController::show()
   └─> Création PaymentIntent Stripe
   └─> Page: client/payment/show.tsx (Stripe Elements)

6. CLIENT PAIE
   └─> Stripe Elements collecte la carte
   └─> stripe.confirmPayment()
   └─> Route: POST /client/payment/{quote}/process
   └─> PaymentController::process()

7. PAIEMENT CONFIRMÉ
   └─> Mission créée
   └─> Agent assigné automatiquement
   └─> Redirection vers mission
```

---

## 9. Structure du code

### Backend

| Fichier | Description |
|---------|-------------|
| `app/Http/Controllers/Client/PaymentController.php` | Gestion paiement client |
| `app/Http/Controllers/WebhookController.php` | Réception webhooks Stripe |
| `app/Services/MissionService.php` | Création mission après paiement |
| `config/services.php` | Configuration Stripe |

### Frontend

| Fichier | Description |
|---------|-------------|
| `resources/js/pages/client/payment/show.tsx` | Page paiement Stripe Elements |
| `resources/js/pages/client/quotes/show.tsx` | Page détail devis |

---

## 10. Dépannage

### Erreur "No such PaymentIntent"

- Vérifiez que `STRIPE_SECRET` correspond au mode (test/live)
- Vérifiez que le PaymentIntent n'a pas expiré

### Webhook non reçu

- Vérifiez l'URL du webhook dans le dashboard Stripe
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- En local, utilisez `stripe listen --forward-to`

### Paiement échoue sans erreur

- Vérifiez les logs Laravel : `storage/logs/laravel.log`
- Vérifiez les logs Stripe : Dashboard → Développeurs → Logs

### CORS errors

Ajoutez dans `config/cors.php` :
```php
'paths' => ['api/*', 'stripe/*'],
```

---

## 11. Passage en Production

### Checklist avant mise en production

- [ ] Passer en mode Live dans Stripe Dashboard
- [ ] Mettre à jour `STRIPE_KEY` et `STRIPE_SECRET` avec les clés live
- [ ] Créer un webhook de production avec l'URL HTTPS
- [ ] Mettre à jour `STRIPE_WEBHOOK_SECRET`
- [ ] Tester un paiement réel avec une petite somme
- [ ] Configurer les notifications email de paiement
- [ ] Activer les alertes de fraude Stripe Radar

### Variables de production (.env)

```env
STRIPE_KEY=pk_live_VOTRE_CLE_PUBLIABLE_LIVE
STRIPE_SECRET=sk_live_VOTRE_CLE_SECRETE_LIVE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK_LIVE
```

---

## 12. Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Elements React](https://stripe.com/docs/stripe-js/react)
- [API PaymentIntent](https://stripe.com/docs/api/payment_intents)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

## 13. Support

Pour toute question sur l'intégration Stripe :
- Support Stripe : [support.stripe.com](https://support.stripe.com)
- Documentation API : [stripe.com/docs/api](https://stripe.com/docs/api)
