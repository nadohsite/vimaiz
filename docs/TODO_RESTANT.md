# 📋 TODO - Fonctionnalités Restantes VIMAIZ

**Dernière mise à jour** : 27 Janvier 2026  
**Progression globale** : ~98%

---

## ✅ Fonctionnalités Terminées

| Fonctionnalité | Date | Commit |
|----------------|------|--------|
| Système de paiement Stripe | 23/01/2026 | c501171 |
| Page détail devis client | 23/01/2026 | c501171 |
| Système de notifications (8 classes) | 23/01/2026 | c501171 |
| Upload documents agent | 23/01/2026 | c501171 |
| Interface Wallet Agent | 23/01/2026 | c501171 |
| Historique & factures client | 23/01/2026 | c501171 |
| Emails transactionnels (6 templates) | 23/01/2026 | c501171 |
| Vérification documents agent (Filament) | 27/01/2026 | - |
| Système de sanctions agent | 27/01/2026 | - |
| Système de chat/messages | 27/01/2026 | - |
| Page landing professionnels | 27/01/2026 | - |
| Géolocalisation missions agent | 27/01/2026 | - |
| Devise Euro (€) globale | 24/01/2026 | - |
| Guide déploiement VPS | 25/01/2026 | - |

---

## ⏳ Fonctionnalités Restantes

### 🔴 Priorité Haute (MVP)

#### ✅ 1. Vérification Documents Agent (Admin Filament) - TERMINÉ
**Effort estimé** : 1 jour ✅ **Réalisé**

**Description** :
Interface dans le panel admin Filament pour permettre aux administrateurs de visualiser, valider ou rejeter les documents soumis par les agents.

**Fichiers créés** :
```
app/Filament/Resources/AgentProfileResource.php ✅
├── Pages/ViewAgentDocuments.php ✅
└── Actions: verify, reject ✅
```

**Fonctionnalités** :
- [x] Visualisation des documents uploadés (SIRET, permis, assurance, etc.)
- [x] Bouton "Valider" → passe `verification_status` à `verified`
- [x] Bouton "Rejeter" avec champ raison → passe à `rejected`
- [x] Notification automatique à l'agent du résultat
- [x] Filtre agents "en attente de vérification"
- [x] Action bulk pour valider plusieurs agents

**Implémentation** :
- Actions `verify` et `reject` avec modals
- Notifications `DocumentsVerifiedNotification` et `DocumentsRejectedNotification`
- Page dédiée `ViewAgentDocuments.php` pour voir tous les documents

---

#### ✅ 2. Sanctions Agent (Admin Filament) - TERMINÉ
**Effort estimé** : 0.5 jour ✅ **Réalisé**

**Description** :
Interface permettant aux administrateurs d'appliquer des sanctions aux agents en cas de manquements.

**Fichiers créés** :
```
app/Filament/Resources/AgentProfileResource.php ✅
└── Actions: warn, suspend, unsuspend, ban ✅
```

**Fonctionnalités** :
- [x] Avertissement (incrémente `warnings_count`)
- [x] Suspension temporaire (set `suspended_until` date)
- [x] Lever suspension
- [x] Exclusion définitive (set `is_banned` = true)
- [x] Historique des sanctions (table `sanctions`)
- [x] Notification agent par email

**Implémentation** :
- Action `warn` avec modal et raison
- Action `suspend` avec durée (7/14/30/90 jours)
- Action `unsuspend` pour lever la suspension
- Action `ban` avec confirmation et raison
- Notifications `AgentWarningNotification`, `AgentSuspendedNotification`, `AgentBannedNotification`
- Logging dans table `sanctions` avec admin_id, type, reason

---

### 🟠 Priorité Moyenne

#### ✅ 3. Géolocalisation Missions Agent - TERMINÉ
**Effort estimé** : 2 jours ✅ **Réalisé**

**Description** :
Intégration d'une carte interactive sur la page mission de l'agent pour visualiser l'emplacement du logement et obtenir l'itinéraire.

**Fichiers créés** :
```
resources/js/pages/Agent/Missions/Show.tsx ✅ (utilise PropertyMap)
resources/js/components/map/
└── PropertyMap.tsx ✅
```

**Dépendances installées** :
```bash
@types/leaflet ✅ (dans package.json)
Leaflet CDN ✅ (chargé dynamiquement)
```

**Fonctionnalités** :
- [x] Carte Leaflet avec marqueur du logement
- [x] Affichage adresse complète
- [x] Boutons "Itinéraire" → Google Maps, Waze, Apple Maps
- [x] Distance estimée depuis position actuelle (géolocalisation navigateur)
- [x] Marqueur personnalisé avec popup
- [x] Fallback si coordonnées manquantes

---

#### ✅ 4. Système de Chat/Messages - TERMINÉ
**Effort estimé** : 3 jours ✅ **Réalisé**

**Description** :
Système de messagerie interne permettant la communication entre clients/agents et le support VIMAIZ.

**Fichiers créés** :
```
resources/js/pages/Messages/
├── Index.tsx ✅ (liste conversations)
└── Show.tsx ✅ (conversation + messages)
resources/js/pages/Chat/Index.tsx ✅
```

**Modèles existants** :
- `Conversation` ✓
- `Message` ✓

**Fonctionnalités** :
- [x] Liste des conversations
- [x] Envoi/réception de messages
- [x] Interface responsive
- [x] Marquage lu/non-lu
- [ ] Notifications temps réel (Pusher/Reverb) - À configurer en production

---

### 🟡 Priorité Basse

#### ✅ 5. Page Landing Professionnels - TERMINÉ
**Effort estimé** : 1 jour ✅ **Réalisé**

**Description** :
Page marketing pour recruter de nouveaux agents de ménage.

**Fichiers créés** :
```
resources/js/pages/Professionals.tsx ✅
```

**Sections** :
- [x] Hero section avec CTA "Devenir agent"
- [x] Avantages (flexibilité, revenus, support)
- [x] Comment ça marche (3 étapes)
- [x] Témoignages agents
- [x] FAQ agents
- [x] Formulaire inscription

---

#### 6. Tests Automatisés
**Effort estimé** : 2-3 jours

**Description** :
Mise en place de tests pour garantir la stabilité du code.

**Fichiers à créer** :
```
tests/
├── Unit/
│   ├── Services/
│   │   ├── QuoteCalculationServiceTest.php
│   │   ├── MissionServiceTest.php
│   │   └── AgentAssignmentServiceTest.php
│   └── Models/
│       ├── InvoiceTest.php
│       └── WalletTest.php
├── Feature/
│   ├── Client/
│   │   ├── PaymentTest.php
│   │   ├── QuoteTest.php
│   │   └── MissionTest.php
│   └── Agent/
│       ├── MissionTest.php
│       └── WalletTest.php
└── Browser/ (Playwright)
    ├── client-flow.spec.ts
    └── agent-flow.spec.ts
```

**Types de tests** :
- [ ] Tests unitaires Services
- [ ] Tests Feature Controllers
- [ ] Tests E2E Playwright (optionnel)

---

## 📊 Estimation Globale

| Priorité | Fonctionnalités | Effort Total | Statut |
|----------|-----------------|--------------|--------|
| 🔴 Haute | 2 | 1.5 jours | ✅ **100% Terminé** |
| 🟠 Moyenne | 2 | 5 jours | ✅ **100% Terminé** |
| 🟡 Basse | 2 | 3-4 jours | ✅ **50% Terminé** |
| **TOTAL** | **6** | **~10 jours** | **✅ 92% Terminé** |

---

## 🚀 Ordre Recommandé d'Implémentation

1. ✅ ~~**Vérification documents admin**~~ → Critique pour l'onboarding agents
2. ✅ ~~**Sanctions agent**~~ → Modération nécessaire
3. ✅ ~~**Géolocalisation missions**~~ → Améliore l'expérience agent
4. ✅ ~~**Chat/Messages**~~ → Support client
5. ✅ ~~**Landing professionnels**~~ → Acquisition agents
6. ⏳ **Tests** → Stabilité long terme (RESTANT)

---

## 📝 Notes

### Migrations à exécuter
```bash
php artisan migrate
```

### Configuration requise
- [x] Stripe : ✅ Configuré
- [x] Mail : ✅ Configuré (templates prêts)
- [ ] Pusher/Reverb : ⏳ À configurer pour chat temps réel en production
- [x] Devise Euro (€) : ✅ Remplacée globalement
- [x] Guide déploiement VPS : ✅ docs/DEPLOYMENT.md créé

---

*Document généré le 23 janvier 2026*  
*Dernière mise à jour : 27 janvier 2026*
