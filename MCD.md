# Modèle Conceptuel de Données (MCD) - VIMAIZ

Voici la structure actuelle de la base de données de l'application VIMAIZ.

```mermaid
erDiagram
    USERS ||--o| AGENT_PROFILES : has
    USERS ||--o{ BOOKINGS_AS_CLIENT : makes
    USERS ||--o{ BOOKINGS_AS_AGENT : receives
    USERS ||--o{ USER_ADDRESSES : has
    USERS ||--o{ WALLETS : owns
    USERS ||--o{ REVIEWS_GIVEN : writes
    USERS ||--o{ REVIEWS_RECEIVED : receives
    USERS ||--o{ MESSAGES_SENT : sends
    USERS ||--o{ MESSAGES_RECEIVED : receives

    AGENT_PROFILES ||--o{ AVAILABILITIES : has
    AGENT_PROFILES ||--o{ SERVICE_AREAS : covers

    SERVICE_CATEGORIES ||--o{ SERVICES : contains
    SERVICES ||--o{ BOOKINGS : includes

    BOOKINGS ||--o| REVIEWS : has
    BOOKINGS ||--o{ WALLET_TRANSACTIONS : generates
    BOOKINGS ||--o{ MESSAGES : related_to

    WALLETS ||--o{ WALLET_TRANSACTIONS : has

    USERS {
        bigint id PK
        string name
        string email
        string password
        string role "client, agent, admin"
        string phone
        string avatar
        boolean is_active
        timestamp email_verified_at
        timestamps created_at
    }

    AGENT_PROFILES {
        bigint id PK
        bigint user_id FK
        text bio
        decimal hourly_rate
        integer experience_years
        json specialties
        boolean is_verified
        json documents
        float rating
        integer review_count
        timestamps created_at
    }

    SERVICES {
        bigint id PK
        bigint category_id FK
        string name
        text description
        decimal base_price
        integer duration_minutes
        boolean is_active
        string icon
        timestamps created_at
    }

    SERVICE_CATEGORIES {
        bigint id PK
        string name
        string slug
        string description
        string icon
        integer sort_order
        boolean is_active
        timestamps created_at
    }

    BOOKINGS {
        bigint id PK
        string booking_number
        bigint client_id FK
        bigint agent_id FK
        bigint service_id FK
        bigint address_id FK
        datetime scheduled_at
        integer duration_minutes
        decimal total_price
        decimal commission_fee
        string status "pending, confirmed, in_progress, completed, cancelled"
        string payment_status "pending, paid, refunded"
        string payment_intent_id
        text special_instructions
        text cancellation_reason
        timestamps created_at
    }

    USER_ADDRESSES {
        bigint id PK
        bigint user_id FK
        string label
        string street_address
        string city
        string postal_code
        decimal latitude
        decimal longitude
        boolean is_default
        timestamps created_at
    }

    WALLETS {
        bigint id PK
        bigint user_id FK
        decimal balance
        decimal pending_balance
        decimal total_earned
        decimal total_withdrawn
        string currency
        timestamps created_at
    }

    WALLET_TRANSACTIONS {
        bigint id PK
        bigint wallet_id FK
        bigint booking_id FK
        string type "credit, debit, withdrawal, refund"
        decimal amount
        decimal balance_after
        string description
        string reference
        string status
        json metadata
        timestamps created_at
    }

    AVAILABILITIES {
        bigint id PK
        bigint agent_profile_id FK
        integer day_of_week
        time start_time
        time end_time
        boolean is_recurring
        date specific_date
        timestamps created_at
    }

    REVIEWS {
        bigint id PK
        bigint booking_id FK
        bigint client_id FK
        bigint agent_id FK
        integer rating
        text comment
        boolean is_verified
        timestamp moderated_at
        timestamps created_at
    }

    MESSAGES {
        bigint id PK
        bigint booking_id FK
        bigint sender_id FK
        bigint receiver_id FK
        text content
        string type "text, image, system"
        timestamp read_at
        timestamps created_at
    }
```

## Description des Entités

1.  **USERS** : Table centrale pour tous les utilisateurs (Clients, Agents, Admins).
2.  **AGENT_PROFILES** : Extension de la table Users pour les informations spécifiques aux agents (bio, tarif, expérience).
3.  **SERVICES & CATEGORIES** : Catalogue des services offerts (ex: Ménage standard, Nettoyage profond).
4.  **BOOKINGS** : Cœur du système, lie un Client, un Agent et un Service pour une date donnée.
5.  **WALLETS & TRANSACTIONS** : Système financier interne pour gérer les gains des agents et l'escrow.
6.  **USER_ADDRESSES** : Adresses des clients pour les interventions.
7.  **AVAILABILITIES** : Gestion des horaires de disponibilité des agents.
8.  **REVIEWS** : Système de notation et commentaires après prestation.
9.  **MESSAGES** : Communication interne entre Client et Agent liée à une réservation.
