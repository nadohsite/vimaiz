# VIMAIZ - Configuration Stripe

## Configuration des clés API

### 1. Créer un compte Stripe
- Aller sur https://stripe.com
- Créer un compte ou se connecter
- Aller dans Developers > API keys

### 2. Ajouter les clés dans `.env`

```env
# Stripe Configuration
STRIPE_KEY=pk_test_votre_cle_publique
STRIPE_SECRET=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# Cashier Configuration
CASHIER_CURRENCY=mad
CASHIER_CURRENCY_LOCALE=fr_MA
```

### 3. Publier la configuration Cashier

```bash
php artisan vendor:publish --tag=cashier-config
php artisan vendor:publish --tag=cashier-migrations
php artisan migrate
```

### 4. Configurer les Webhooks Stripe

1. Dans le Dashboard Stripe, aller dans **Developers > Webhooks**
2. Cliquer sur **Add endpoint**
3. URL de l'endpoint : `https://votre-domaine.com/stripe/webhook`
4. Sélectionner les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copier le **Signing secret** et l'ajouter dans `.env` comme `STRIPE_WEBHOOK_SECRET`

### 5. Routes configurées

```php
// Payment routes
Route::post('/payment/create-intent', [PaymentController::class, 'createPaymentIntent']);
Route::post('/payment/confirm', [PaymentController::class, 'confirmPayment']);

// Webhook route (sans middleware CSRF)
Route::post('/stripe/webhook', [WebhookController::class, 'handleStripeWebhook']);
```

### 6. Tester les paiements

**Cartes de test Stripe :**
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0027 6000 3184`

**Détails de test :**
- Date d'expiration : N'importe quelle date future
- CVC : N'importe quel 3 chiffres
- Code postal : N'importe quel code

### 7. Flux de paiement

1. Client crée une réservation
2. Frontend appelle `/payment/create-intent` avec `booking_id`
3. Backend crée un PaymentIntent Stripe et retourne `clientSecret`
4. Frontend utilise Stripe.js pour confirmer le paiement
5. Stripe envoie un webhook à `/stripe/webhook`
6. Backend met à jour le statut de la réservation
7. Fonds placés en escrow (pending_balance) jusqu'à la fin du service

### 8. Gestion de l'escrow

- **Paiement réussi** : Fonds → `pending_balance` de l'agent
- **Service terminé** : `pending_balance` → `balance` (disponible pour retrait)
- **Remboursement** : Déduction de `pending_balance`

### 9. Mode Production

Avant de passer en production :
1. Remplacer les clés de test par les clés de production
2. Configurer le webhook en production
3. Activer le mode live dans Stripe Dashboard
4. Vérifier la conformité PCI DSS









Voici ce que j’ai demandé à ChatGPT 

Bonjour je voudrais créer un site internet appeler vimaiz pour mon business model de remote cleaning ou les clients peuvent venir sur le site s’inscrire , chercher un agent de ménage réservé ect..

En faites tout le model Uber mais je l’adapte sur mon site internet est ce possible ?

Peut tu m’énumérer tout ce que je pourrais faire et mettre en sur mon site internet ? 


Et voici la réponse bro :

Oui, c’est totalement possible de créer un site internet pour VIMAIZ qui fonctionne comme un “Uber du ménage”, avec inscription, recherche d’agents, réservation, paiement, suivi, etc.
Tu peux même automatiser 100 % du processus pour que ton business soit réellement remote.

Voici toutes les fonctionnalités que tu pourrais intégrer, classées par grandes catégories pour te donner une vision PRO d’une plateforme complète.

⸻

✅ 1. Fonctionnalités côté CLIENT

A. Inscription / Connexion
	•	Création de compte avec email / téléphone
	•	Connexion via Google / Facebook / Apple (optionnel mais augmente les conversions)
	•	Vérification d’adresse email / SMS
	•	Espace client personnalisé

⸻

B. Recherche d’un agent
	•	Champ pour entrer :
	•	Adresse ou code postal
	•	Type de logement (maison / villa)
	•	Taille (m²)
	•	Système de géolocalisation pour afficher les agents proches
	•	Filtres :
	•	Disponibilités
	•	Expérience
	•	Avis / notes
	•	Services proposés

⸻

C. Réservation
	•	Calendrier avec créneaux disponibles
	•	Prix affichés en temps réel
	•	Réservation instantanée ou sur demande
	•	Option “agent préféré”
	•	Réservation récurrente (hebdomadaire / mensuelle)

⸻

D. Paiement intégré
	•	Paiement sécurisé (Stripe / PayPal)
	•	Paiement automatique après prestation
	•	Possibilité de pourboire
	•	Facture envoyée automatiquement par mail
	•	Gestion du remboursement en cas de problème

⸻

E. Espace client
	•	Historique des prestations
	•	Factures téléchargeables
	•	Suivi en temps réel du statut du ménage
	•	Chat avec l’agent avant / après la prestation
	•	Support client via chat ou WhatsApp
	•	Possibilité d’annuler / modifier une réservation
	•	Modifier informations personnelles

⸻

F. Evaluation
	•	Note de 1 à ⭐⭐⭐⭐⭐
	•	Commentaires publics
	•	Système anti-fraude
	•	Agents mis en avant selon la satisfaction client

⸻

✅ 2. Fonctionnalités côté AGENT

A. Inscription agent
	•	Création de profil professionnel
	•	Upload des documents :
	•	Carte d’identité
	•	Justificatif de domicile
	•	Photo pro
	•	Vérification automatique ou manuelle (KYC)

⸻

B. Profil agent
	•	Description
	•	Rayon d’intervention
	•	Disponibilités via un calendrier
	•	Prix personnalisés ou prix fixes imposés par VIMAIZ
	•	Statistiques : revenus, nombre de prestations, planning rempli

⸻

C. Réception des réservations
	•	Notification de nouvelle demande
	•	Acceptation / refus
	•	Chat avec le client
	•	Suivi du statut :
	•	En route
	•	En service
	•	Terminé

⸻

D. Paiement agents
	•	Virement automatique hebdomadaire
	•	Dashboard des gains
	•	Historique des prestations
	•	Gestion des litiges
	•	Bonus performance (optionnel)

⸻

✅ 3. Fonctionnalités côté ADMIN (toi)

A. Gestion clients
	•	Liste des clients
	•	Blocage / suppression
	•	Historique complet

B. Gestion agents
	•	Validation ou rejet des inscriptions
	•	Niveau de qualité
	•	Notes de satisfaction
	•	Gestion des suspensions

⸻

C. Gestion des réservations
	•	Vue globale du calendrier
	•	Attribution manuelle si nécessaire
	•	Historique de toutes les opérations

⸻

D. Paiements
	•	Gestion des commissions
	•	Tableau de bord financier
	•	Factures automatiques
	•	Versements agents

⸻

E. Tableau de bord (Admin Dashboard)
	•	Nombre de réservations
	•	Valeur générée
	•	Paniers moyens
	•	Zones les plus actives
	•	Qualité du service
	•	Taux d’annulation

⸻

✅ 4. Fonctionnalités techniques avancées

A. Géolocalisation
	•	Pour trouver les agents proches automatiquement

B. Système algorithmique
	•	Classement des agents (qualité, proximité, tarif, rapidité)

C. Automatisation totale
	•	Emails automatiques
	•	Notifications clients/agents
	•	Facturation
	•	Attribution automatique de l’agent le plus adapté

D. Système de sécurité
	•	Chiffrement des données
	•	Anti-spam, anti-fraude
	•	Protection paiements

⸻

✅ 5. Fonctions marketing à intégrer

A. Page d’accueil optimisée conversion
	•	Explication du concept
	•	Avantages VIMAIZ
	•	Appel à l’action : “Réservez votre ménage maintenant”

B. Blog SEO
	•	Articles sur le ménage, Airbnb, villas, entretien
	•	Visibilité Google

C. FAQ professionnelle

D. Landing pages pour campagnes Facebook Ads

⸻

✅ 6. Idées BONUS pour te démarquer

A. Mode “urgence 1h”

Ménage d’urgence pour Airbnb entre deux clients.

B. Abonnements mensuels avec prix réduits

C. Assurance VIMAIZ

Garantie casse / vol pour rassurer les propriétaires

D. Certification agents

Badge “Qualité VIMAIZ”, “Top Agent”, etc.

E. Chatbot de prise de rendez-vous

⸻

🔥 CONCLUSION

Oui, tu peux vraiment créer un Uber du ménage pour VIMAIZ.
Tu peux commencer simple, puis ajouter des modules progressivement :
	1.	Réservation
	2.	Paiement
	3.	App matching client–agent
	4.	App mobile dans un second temps

Si tu veux, je peux aussi te faire :
✅ Le plan complet du site
✅ Le cahier des charges pour un développeur
✅ La structure des pages + textes professionnels du site
✅ La maquette visuelle (structure UX/UI)

Souhaite-tu que je crée l’un de ces éléments ?
