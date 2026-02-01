# 🏗️ ARCHITECTURE TECHNIQUE – VIMAIZ

## Stack Technologique

### Backend

- **Framework** : Laravel 12
- **PHP** : 8.2+
- **Base de données** : MySQL / PostgreSQL
- **Authentication** : Laravel Fortify
- **Admin Panel** : Filament 3
- **Paiement** : Stripe (Laravel Cashier)
- **Permissions** : Spatie Laravel Permission
- **Real-time** : Laravel Reverb (WebSockets)

### Frontend

- **Framework** : React 19
- **Bridge** : Inertia.js 2.0
- **Routing** : Ziggy
- **Styling** : Tailwind CSS 4
- **Components** : Radix UI + shadcn/ui
- **Icons** : Lucide React
- **Maps** : Leaflet / React-Leaflet
- **Charts** : Recharts
- **Animations** : Motion (Framer Motion)

---

## Structure des Dossiers

```
vimaiz/
├── app/
│   ├── Actions/              # Actions métier (Fortify, etc.)
│   ├── Filament/             # Panel Admin Filament
│   │   ├── Resources/        # Gestion CRUD des entités
│   │   ├── Pages/            # Pages custom admin
│   │   └── Widgets/          # Widgets dashboard
│   ├── Http/
│   │   ├── Controllers/      # Contrôleurs API et Web
│   │   ├── Middleware/       # Middlewares custom
│   │   └── Requests/         # Form Requests validation
│   ├── Models/               # Modèles Eloquent
│   ├── Providers/            # Service Providers
│   └── Services/             # Services métier
├── database/
│   ├── migrations/           # Migrations DB
│   ├── seeders/              # Seeders
│   └── factories/            # Factories pour tests
├── resources/
│   └── js/
│       ├── components/       # Composants React réutilisables
│       │   ├── ui/           # Composants UI (shadcn)
│       │   └── ...           # Composants métier
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Layouts (App, Guest, Admin)
│       ├── lib/              # Utilitaires (cn, utils)
│       ├── pages/            # Pages Inertia
│       │   ├── auth/         # Pages authentification
│       │   ├── client/       # Pages espace client
│       │   ├── agent/        # Pages espace agent
│       │   └── admin/        # Pages admin (si non Filament)
│       └── types/            # Types TypeScript
├── routes/
│   ├── web.php               # Routes web principales
│   ├── api.php               # Routes API
│   └── console.php           # Commandes Artisan
├── docs/                     # Documentation technique
└── public/                   # Assets publics
```

---

## Les 3 Espaces de la Plateforme

### 1. Espace Admin (Filament)

- **URL** : `/admin`
- **Accès** : Utilisateurs avec rôle `admin`
- **Fonctionnalités** :
  - Dashboard avec KPIs
  - Gestion utilisateurs (clients/agents)
  - Gestion logements (properties)
  - Gestion demandes et missions
  - Système de devis
  - Suivi paiements
  - Attribution agents
  - Contrôle qualité (photos, notes internes)

### 2. Espace Client

- **URL** : `/` (public) + `/dashboard` (connecté)
- **Accès** : Utilisateurs avec rôle `client`
- **Fonctionnalités** :
  - Inscription/Connexion
  - Gestion des logements
  - Création demande de ménage
  - Réception et validation devis
  - Paiement sécurisé
  - Suivi des missions
  - Historique

### 3. Espace Agent

- **URL** : `/agent`
- **Accès** : Utilisateurs avec rôle `agent`
- **Fonctionnalités** :
  - Inscription professionnelle (SIRET)
  - Réception missions
  - Acceptation/Refus missions
  - Upload photos avant/après
  - Géolocalisation missions
  - Historique missions
  - Wallet (gains)

---

## Modèle de Données Principal

### Entités Clés

| Entité | Description |
|--------|-------------|
| `User` | Utilisateur (client, agent, admin) |
| `AgentProfile` | Profil professionnel agent (SIRET, etc.) |
| `Property` | Logement client (Maison/Villa/Chalet) |
| `ServiceRequest` | Demande de ménage client |
| `Quote` | Devis généré/validé par admin |
| `Booking` | Mission confirmée après paiement |
| `MissionPhoto` | Photos avant/après mission |
| `Wallet` | Portefeuille agent |
| `Transaction` | Transactions financières |

---

## Flux Principal

```
1. Client s'inscrit et ajoute un logement
           ↓
2. Client crée une demande de ménage
           ↓
3. Système calcule estimation → Admin valide/ajuste → Devis envoyé
           ↓
4. Client accepte le devis
           ↓
5. Client effectue le paiement (Stripe)
           ↓
6. Mission créée → Agent attribué automatiquement
           ↓
7. Agent accepte la mission
           ↓
8. Agent prend photos AVANT
           ↓
9. Agent effectue le ménage
           ↓
10. Agent prend photos APRÈS
           ↓
11. Mission clôturée → Paiement agent libéré
```

---

## Sécurité & Règles Métier

### Authentification

- Email + mot de passe
- Connexion sociale (Google) optionnelle
- 2FA optionnel

### Autorisation

- Rôles : `admin`, `client`, `agent`
- Permissions gérées via Spatie

### Règles de Visibilité

- Client ne voit JAMAIS les agents
- Agent ne voit JAMAIS les autres agents
- Seul l'admin a une vision globale

### Paiement

- Obligatoire AVANT attribution agent
- Séquestre sur Stripe Connect
- Libération après mission terminée
