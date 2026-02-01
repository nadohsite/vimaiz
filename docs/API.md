# 🔌 API DOCUMENTATION – VIMAIZ

## Vue d'ensemble

L'API VIMAIZ utilise **Inertia.js** pour la communication frontend-backend. Les routes web servent des pages Inertia avec les données nécessaires.

Pour les fonctionnalités temps réel et mobiles, une API REST est également disponible.

---

## Authentification

### Routes Auth (Laravel Fortify)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/register` | GET/POST | Inscription utilisateur |
| `/login` | GET/POST | Connexion |
| `/logout` | POST | Déconnexion |
| `/forgot-password` | GET/POST | Mot de passe oublié |
| `/reset-password` | GET/POST | Réinitialisation |
| `/email/verify` | GET | Vérification email |

---

## Espace Client

### Logements (Properties)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/properties` | GET | Liste des logements |
| `/properties/create` | GET | Formulaire création |
| `/properties` | POST | Créer un logement |
| `/properties/{id}` | GET | Détails logement |
| `/properties/{id}/edit` | GET | Formulaire édition |
| `/properties/{id}` | PUT | Modifier logement |
| `/properties/{id}` | DELETE | Supprimer logement |

**Payload création/modification :**
```json
{
  "type": "maison|villa|chalet",
  "surface_m2": 120,
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postal_code": "75001",
  "additional_info": "Portail code 1234"
}
```

### Demandes de Ménage (Service Requests)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/requests` | GET | Liste des demandes |
| `/requests/create` | GET | Formulaire demande |
| `/requests` | POST | Créer une demande |
| `/requests/{id}` | GET | Détails demande |
| `/requests/{id}/cancel` | POST | Annuler demande |

**Payload création :**
```json
{
  "property_id": 1,
  "scheduled_date": "2025-02-15",
  "scheduled_time": "09:00",
  "requested_hours": 3,
  "special_instructions": "Attention au chat"
}
```

### Devis (Quotes)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/quotes/{id}` | GET | Voir le devis |
| `/quotes/{id}/accept` | POST | Accepter le devis |
| `/quotes/{id}/refuse` | POST | Refuser le devis |

### Paiement

| Route | Méthode | Description |
|-------|---------|-------------|
| `/payment/{quote_id}` | GET | Page paiement |
| `/payment/{quote_id}/process` | POST | Traiter paiement Stripe |
| `/payment/{quote_id}/confirm` | POST | Confirmer paiement |

### Missions (Client View)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/bookings` | GET | Liste des missions |
| `/bookings/{id}` | GET | Détails mission |

---

## Espace Agent

### Profil Professionnel

| Route | Méthode | Description |
|-------|---------|-------------|
| `/agent/profile` | GET | Voir profil |
| `/agent/profile/edit` | GET | Formulaire édition |
| `/agent/profile` | PUT | Modifier profil |

**Payload profil :**
```json
{
  "siret": "12345678901234",
  "company_type": "auto_entrepreneur|societe",
  "company_name": "Clean Pro",
  "has_own_equipment": true,
  "has_driving_license": true,
  "has_vehicle": true,
  "vehicle_type": "Renault Clio",
  "covered_zones": ["75001", "75002", "75003"]
}
```

### Missions (Agent)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/agent/missions` | GET | Missions attribuées |
| `/agent/missions/{id}` | GET | Détails mission |
| `/agent/missions/{id}/accept` | POST | Accepter mission |
| `/agent/missions/{id}/refuse` | POST | Refuser mission |
| `/agent/missions/{id}/start` | POST | Démarrer mission |
| `/agent/missions/{id}/complete` | POST | Terminer mission |

### Photos Mission

| Route | Méthode | Description |
|-------|---------|-------------|
| `/agent/missions/{id}/photos/before` | POST | Upload photos avant |
| `/agent/missions/{id}/photos/after` | POST | Upload photos après |

**Payload upload (multipart/form-data) :**
```
photos[]: File[]
descriptions[]: string[]
```

### Wallet Agent

| Route | Méthode | Description |
|-------|---------|-------------|
| `/agent/wallet` | GET | Voir solde et transactions |
| `/agent/wallet/withdraw` | POST | Demander retrait |

---

## API REST (pour mobile/externe)

Base URL : `/api/v1`

### Headers requis

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Endpoints principaux

```
GET    /api/v1/user                    # Profil utilisateur
GET    /api/v1/properties              # Logements client
POST   /api/v1/properties              # Créer logement
GET    /api/v1/requests                # Demandes client
POST   /api/v1/requests                # Créer demande
GET    /api/v1/quotes/{id}             # Voir devis
POST   /api/v1/quotes/{id}/accept      # Accepter devis
GET    /api/v1/agent/missions          # Missions agent
POST   /api/v1/agent/missions/{id}/photos  # Upload photos
```

---

## Webhooks Stripe

| Endpoint | Événement | Action |
|----------|-----------|--------|
| `/webhooks/stripe` | `payment_intent.succeeded` | Marquer paiement réussi |
| `/webhooks/stripe` | `payment_intent.failed` | Marquer paiement échoué |
| `/webhooks/stripe` | `payout.paid` | Confirmer versement agent |

---

## Codes de Statut

### Service Requests
- `pending` : En attente de devis
- `quote_sent` : Devis envoyé
- `quote_accepted` : Devis accepté
- `quote_refused` : Devis refusé
- `paid` : Payé, en attente attribution
- `assigned` : Agent attribué
- `in_progress` : Mission en cours
- `completed` : Terminée
- `cancelled` : Annulée

### Bookings
- `pending_agent` : En attente réponse agent
- `agent_accepted` : Agent a accepté
- `agent_refused` : Agent a refusé (réattribution)
- `in_progress` : Mission en cours
- `photos_before` : Photos avant uploadées
- `photos_after` : Photos après uploadées
- `completed` : Terminée
- `cancelled` : Annulée

### Quotes
- `draft` : Brouillon
- `sent` : Envoyé au client
- `accepted` : Accepté
- `refused` : Refusé
- `expired` : Expiré

### Payment
- `pending` : En attente
- `paid` : Payé
- `refunded` : Remboursé
