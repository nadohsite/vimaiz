# 📚 Documentation Technique – VIMAIZ

Bienvenue dans la documentation technique de VIMAIZ.

## Documents Disponibles

| Document | Description |
|----------|-------------|
| [CAHIER_DES_CHARGES.md](./CAHIER_DES_CHARGES.md) | Cahier des charges complet du projet |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture technique et stack |
| [MCD.md](./MCD.md) | Modèle Conceptuel de Données |
| [API.md](./API.md) | Documentation des routes et API |
| [FLUX_METIER.md](./FLUX_METIER.md) | Flux métier et diagrammes |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Guide de design et UI |

## Résumé du Projet

**VIMAIZ** est une plateforme de type Uber pour les services de ménage à domicile.

### Concept Clé

> Le client ne choisit pas un agent.
> L'agent ne cherche pas un client.
> **VIMAIZ orchestre la relation.**

### Les 3 Espaces

1. **Admin** : Contrôle total (Filament)
2. **Client** : Demande de ménage + paiement
3. **Agent** : Réception et exécution des missions

### Stack Technique

- **Backend** : Laravel 12 + Filament 3
- **Frontend** : React 19 + Inertia.js + Tailwind CSS 4
- **Paiement** : Stripe
- **Maps** : Leaflet

### Règles Fondamentales

- ❌ Aucun profil public
- ❌ Aucun avis visible
- ✅ Paiement obligatoire avant mission
- ✅ Photos avant/après obligatoires
- ✅ Attribution automatique des agents

---

## Démarrage Rapide

```bash
# Installation des dépendances
composer install
npm install

# Configuration
cp .env.example .env
php artisan key:generate

# Base de données
php artisan migrate
php artisan db:seed

# Lancement
composer dev
```

## Contact

Pour toute question technique, consultez cette documentation ou contactez l'équipe de développement.
