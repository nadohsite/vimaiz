# 🔄 Gestion des Retours Mécontentement

Cette fonctionnalité permet aux clients de demander un retour gratuit de l'agent s'ils ne sont pas satisfaits de la prestation.

---

## Workflow Complet

```
CLIENT                    AGENT                     ADMIN
   │                         │                         │
   │ 1. Demande retour       │                         │
   │ (dans les 7 jours)      │                         │
   │────────────────────────>│                         │
   │                         │                         │
   │                         │ 2. Démarre le retour    │
   │                         │<───────────────────────>│
   │                         │                         │
   │                         │ 3. Termine le retour    │
   │<────────────────────────│                         │
   │                         │                         │
   │ 4. Valide ou Refuse     │                         │
   │────────────────────────>│                         │
   │                         │                         │
   │                         │    Si refusé:           │
   │                         │    5. Examen dossier    │
   │                         │<───────────────────────>│
```

---

## Étapes Détaillées

### 1. Client : Demande de Retour

**Où** : Page de détail d'une mission terminée (`/client/missions/{id}`)

**Conditions** :
- Mission terminée (`completed`)
- Dans les **7 jours** suivant la fin de mission
- Pas déjà de retour en cours

**Comment** :
1. Aller sur "Mes missions" dans le menu
2. Cliquer sur une mission terminée
3. Trouver la section **"Pas satisfait ?"** (encadré orange)
4. Cliquer sur **"Demander un retour"**
5. Décrire le problème (minimum 10 caractères)
6. Cliquer sur **"Envoyer la demande"**

**Statut après** : `En attente` (pending)

---

### 2. Agent : Prendre en Charge le Retour

**Où** : Page des retours agent (`/agent/returns`)

**Accès** : Menu latéral → **"Retours clients"** (icône ↩️)

**Comment** :
1. Voir la liste des demandes de retour
2. Trouver la demande avec statut **"En attente"**
3. Lire le motif du client
4. Cliquer sur **"Démarrer le retour"**

**Statut après** : `En cours` (in_progress)

---

### 3. Agent : Terminer le Retour

**Où** : Page des retours agent (`/agent/returns`)

**Comment** :
1. Une fois le retour effectué sur place
2. Retourner sur la page des retours
3. Cliquer sur **"Terminer le retour"**
4. Ajouter des **notes** (ce qui a été fait)
5. Valider

**Statut après** : `Terminé` (completed) - en attente de validation client

---

### 4. Client : Valider le Retour

**Où** : Page de détail de la mission (`/client/missions/{id}`)

**Comment** :
1. Retourner sur la mission concernée
2. La section retour affiche **"L'agent a terminé le retour"**
3. Ajouter un commentaire (optionnel)
4. Cliquer sur :
   - ✅ **"Oui, je suis satisfait"** → Retour validé
   - ❌ **"Non"** → Retour refusé (escalade admin)

**Statut après** : `Validé` (validated) ou `Refusé` (rejected)

---

## Statuts Possibles

| Statut | Label | Couleur | Description |
|--------|-------|---------|-------------|
| `pending` | En attente | 🟡 Orange | Demande reçue, agent notifié |
| `in_progress` | En cours | 🔵 Bleu | Agent en train de faire le retour |
| `completed` | Terminé | 🟣 Violet | Agent a fini, attente validation client |
| `validated` | Validé | 🟢 Vert | Client satisfait, dossier clos |
| `rejected` | Refusé | 🔴 Rouge | Client non satisfait, examen admin |

---

## Pour l'Administrateur

Si un retour est **refusé** par le client :

1. Consulter le dossier dans le panel admin Filament (`/admin`)
2. Examiner :
   - Le motif initial du client
   - Les notes de l'agent
   - Le feedback du client
3. Contacter le client pour résoudre le litige
4. Proposer une solution (remboursement partiel, nouveau passage, etc.)

---

## Référence Technique

### Base de Données

Champs ajoutés à la table `missions` :

| Champ | Type | Description |
|-------|------|-------------|
| `return_requested` | boolean | Retour demandé ? |
| `return_status` | enum | Statut actuel |
| `return_reason` | text | Motif du client |
| `return_requested_at` | datetime | Date de demande |
| `return_started_at` | datetime | Date début retour |
| `return_completed_at` | datetime | Date fin retour |
| `return_agent_notes` | text | Notes de l'agent |
| `return_client_feedback` | text | Feedback client |

### Routes API

| Méthode | Route | Action |
|---------|-------|--------|
| POST | `/client/missions/{id}/return-request` | Client demande retour |
| POST | `/client/missions/{id}/return-validate` | Client valide/refuse |
| POST | `/agent/returns/{id}/start` | Agent démarre |
| POST | `/agent/returns/{id}/complete` | Agent termine |
| GET | `/agent/returns` | Liste des retours agent |

### Fichiers Concernés

- `app/Models/Mission.php` - Modèle avec champs et méthodes retour
- `app/Http/Controllers/MissionReturnController.php` - Contrôleur retours
- `resources/js/pages/Client/Missions/Show.tsx` - Interface client
- `resources/js/pages/Agent/Returns/Index.tsx` - Interface agent
- `database/migrations/2026_02_02_010000_add_return_fields_to_missions_table.php` - Migration
