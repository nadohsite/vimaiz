# 💰 Wallet Agent - Documentation

## Vue d'ensemble

Le **Wallet Agent** est un système de portefeuille numérique intégré à la plateforme VIMAIZ, permettant aux agents de ménage de gérer leurs revenus de manière centralisée et sécurisée.

---

## 🎯 Rôle du Wallet Agent

Le Wallet Agent remplit plusieurs fonctions essentielles :

### 1. **Centralisation des revenus**
- Tous les paiements des missions terminées sont automatiquement crédités sur le portefeuille de l'agent
- L'agent dispose d'une vue consolidée de tous ses gains

### 2. **Gestion des flux financiers**
- Suivi en temps réel du solde disponible
- Historique complet des transactions (crédits et débits)
- Demandes de retrait vers compte bancaire

### 3. **Transparence financière**
- Chaque transaction est tracée et horodatée
- Les agents peuvent consulter le détail de chaque crédit (mission associée, montant, date)

---

## 💳 Fonctionnalités

### Tableau de bord Wallet

| Métrique | Description |
|----------|-------------|
| **Solde disponible** | Montant actuellement disponible pour retrait |
| **En attente** | Paiements en cours de traitement (missions en cours) |
| **Total gagné** | Cumul de tous les revenus depuis l'inscription |
| **Total retiré** | Cumul de tous les retraits effectués |

### Crédits automatiques

Lorsqu'une mission est marquée comme **terminée** :
1. Le système calcule la rémunération de l'agent (`agent_payout`)
2. Le montant est crédité automatiquement sur le Wallet
3. Une notification est envoyée à l'agent (email + in-app)
4. La transaction apparaît dans l'historique

### Demandes de retrait

Les agents peuvent demander un virement vers leur compte bancaire :

- **Montant minimum** : 100 €
- **Délai de traitement** : 2-5 jours ouvrés
- **Statuts possibles** :
  - `pending` : En attente de traitement
  - `processing` : En cours de virement
  - `completed` : Virement effectué
  - `failed` : Échec du virement

---

## 🔧 Architecture technique

### Modèles concernés

```
app/Models/
├── Wallet.php          # Portefeuille de l'agent
├── WalletTransaction.php  # Historique des transactions
└── AgentPayout.php     # Demandes de retrait
```

### Contrôleur

```php
app/Http/Controllers/Agent/WalletController.php
```

| Méthode | Route | Description |
|---------|-------|-------------|
| `index()` | `GET /agent/wallet` | Affiche le tableau de bord |
| `withdraw()` | `POST /agent/wallet/withdraw` | Soumet une demande de retrait |

### Page Frontend

```
resources/js/pages/Agent/Wallet/Index.tsx
```

---

## 📊 Calcul de la rémunération agent

La rémunération de l'agent est calculée selon la formule :

```
agent_payout = total_price × agent_commission_rate
```

Où :
- `total_price` : Prix TTC payé par le client
- `agent_commission_rate` : Taux de commission agent (généralement 70-80%)

### Exemple

| Client paie | Commission agent (75%) | Rémunération agent |
|-------------|------------------------|-------------------|
| 100 € | 75% | 75 € |
| 150 € | 75% | 112,50 € |
| 200 € | 75% | 150 € |

---

## 🔔 Notifications

Le système envoie des notifications aux agents dans les cas suivants :

| Événement | Canal | Template |
|-----------|-------|----------|
| Crédit wallet | Email + App | `agent-payout.blade.php` |
| Retrait demandé | App | - |
| Retrait traité | Email + App | - |

---

## 🛡️ Sécurité

### Règles de sécurité implémentées

1. **Authentification** : Seul l'agent propriétaire peut accéder à son wallet
2. **Validation** : Vérification du solde avant tout retrait
3. **Audit trail** : Toutes les transactions sont tracées avec timestamps
4. **Rate limiting** : Limitation des demandes de retrait

### Middleware appliqués

```php
Route::middleware(['auth', 'verified', 'role:agent'])
    ->prefix('agent')
    ->group(function () {
        Route::get('/wallet', [WalletController::class, 'index']);
        Route::post('/wallet/withdraw', [WalletController::class, 'withdraw']);
    });
```

---

## 📱 Interface utilisateur

### Composants UI

L'interface Wallet comprend :

1. **Cartes statistiques** : Affichage des 4 métriques principales
2. **Formulaire de retrait** : Modal avec validation du montant
3. **Historique des transactions** : Liste paginée avec filtres
4. **Indicateurs visuels** : Badges de statut colorés

### Statuts et couleurs

| Statut | Couleur | Signification |
|--------|---------|---------------|
| `credit` | 🟢 Vert | Crédit reçu |
| `debit` | 🔴 Rouge | Retrait effectué |
| `pending` | 🟡 Jaune | En attente |
| `completed` | 🟢 Vert | Terminé |

---

## 🔄 Flux de fonctionnement

```
┌─────────────────┐
│ Mission terminée │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Calcul agent_payout     │
│ (total_price × 0.75)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Crédit Wallet Agent     │
│ + Notification envoyée  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Agent consulte Wallet   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Demande retrait (min 100€)      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Admin traite le virement        │
│ (2-5 jours ouvrés)              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Virement bancaire OK    │
│ + Notification agent    │
└─────────────────────────┘
```

---

## 📋 Prochaines évolutions (Roadmap)

- [ ] Intégration Stripe Connect pour virements automatiques
- [ ] Export des relevés en PDF
- [ ] Graphiques d'évolution des revenus
- [ ] Prévisions de revenus basées sur missions planifiées
- [ ] Multi-devises (EUR, CHF)

---

## 📞 Support

Pour toute question concernant le Wallet Agent :
- **Email** : support@vimaiz.fr
- **Documentation API** : `/docs/API.md`

---

*Document mis à jour le 23 janvier 2026*
