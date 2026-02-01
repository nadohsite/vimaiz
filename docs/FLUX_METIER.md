# 🔄 FLUX MÉTIER – VIMAIZ

## Vue d'Ensemble

Ce document décrit les flux métier principaux de la plateforme VIMAIZ.

---

## 1. Flux Client : Demande de Ménage

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PARCOURS CLIENT                               │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │ INSCRIPTION │
    │ (email,     │
    │ téléphone)  │
    └─────┬──────┘
          │
          ▼
    ┌──────────────┐
    │ AJOUT LOGEMENT│     Types autorisés:
    │ (obligatoire) │◄──── • Maison
    └─────┬────────┘      • Villa
          │               • Chalet
          ▼
    ┌──────────────┐
    │ CRÉATION      │     Informations:
    │ DEMANDE       │◄──── • Logement sélectionné
    │ MÉNAGE        │      • Date + Heure
    └─────┬────────┘      • Nombre d'heures
          │
          ▼
    ┌──────────────┐
    │ ATTENTE       │
    │ DEVIS         │ ◄──── Statut: "pending"
    └─────┬────────┘
          │
          │ (Admin valide et envoie devis)
          ▼
    ┌──────────────┐
    │ RÉCEPTION     │
    │ DEVIS         │ ◄──── Statut: "quote_sent"
    └─────┬────────┘
          │
          ├────────────────┐
          ▼                ▼
    ┌──────────┐     ┌──────────┐
    │ ACCEPTER │     │ REFUSER  │
    └─────┬────┘     └────┬─────┘
          │               │
          ▼               ▼
    ┌──────────────┐ ┌───────────┐
    │ PAGE         │ │ FIN       │
    │ PAIEMENT     │ │ (Demande  │
    │ (Stripe)     │ │ annulée)  │
    └─────┬────────┘ └───────────┘
          │
          ▼
    ┌──────────────┐
    │ PAIEMENT     │
    │ EFFECTUÉ     │ ◄──── Statut: "paid"
    └─────┬────────┘
          │
          │ (Attribution automatique agent)
          ▼
    ┌──────────────┐
    │ MISSION      │
    │ EN COURS     │ ◄──── Statut: "assigned"
    └─────┬────────┘
          │
          ▼
    ┌──────────────┐
    │ MISSION      │
    │ TERMINÉE     │ ◄──── Statut: "completed"
    └──────────────┘
```

---

## 2. Flux Agent : Traitement Mission

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PARCOURS AGENT                                │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ INSCRIPTION PRO   │     Informations obligatoires:
    │ (professionnel    │◄──── • SIRET
    │  uniquement)      │      • Permis de conduire
    └─────┬────────────┘      • Véhicule
          │                   • Équipement propre
          ▼
    ┌──────────────────┐
    │ VALIDATION ADMIN  │
    │ (vérification     │ ◄──── Admin vérifie SIRET + documents
    │  documents)       │
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ COMPTE ACTIF      │
    │ (disponible pour  │
    │  missions)        │
    └─────┬────────────┘
          │
          │ (VIMAIZ attribue une mission)
          ▼
    ┌──────────────────┐
    │ NOTIFICATION      │
    │ NOUVELLE MISSION  │ ◄──── Push + Email
    └─────┬────────────┘
          │
          ├────────────────────┐
          ▼                    ▼
    ┌──────────────┐     ┌──────────────┐
    │ ACCEPTER     │     │ REFUSER      │
    └─────┬────────┘     └─────┬────────┘
          │                    │
          │                    ▼
          │              ┌───────────────┐
          │              │ RÉATTRIBUTION │
          │              │ (autre agent) │
          │              └───────────────┘
          ▼
    ┌──────────────────┐
    │ CONSULTATION     │     Accès à:
    │ DÉTAILS MISSION  │◄──── • Adresse logement
    └─────┬────────────┘      • Géolocalisation
          │                   • Instructions
          ▼
    ┌──────────────────┐
    │ DÉMARRAGE        │
    │ MISSION          │ ◄──── Statut: "in_progress"
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ 📷 PHOTOS AVANT  │
    │ (OBLIGATOIRE)    │ ◄──── Minimum 3 photos
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ RÉALISATION      │
    │ DU MÉNAGE        │
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ 📷 PHOTOS APRÈS  │
    │ (OBLIGATOIRE)    │ ◄──── Minimum 3 photos
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ CLÔTURE MISSION  │ ◄──── Statut: "completed"
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ CRÉDIT WALLET    │ ◄──── Montant agent crédité
    │ (paiement agent) │
    └──────────────────┘
```

---

## 3. Flux Admin : Gestion Devis

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PROCESSUS DEVIS                               │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ NOUVELLE DEMANDE │
    │ CLIENT           │
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ CALCUL AUTO      │     Paramètres:
    │ ESTIMATION       │◄──── • Type logement
    └─────┬────────────┘      • Surface m²
          │                   • Nb heures
          │                   • Zone géographique
          │                   • Date/heure
          ▼
    ┌──────────────────┐
    │ REVUE ADMIN      │
    │                  │
    │ Estimation: 150€ │
    │ [Ajuster?]       │
    └─────┬────────────┘
          │
          ├────────────────────┐
          ▼                    ▼
    ┌──────────────┐     ┌──────────────┐
    │ VALIDER      │     │ AJUSTER      │
    │ TEL QUEL     │     │ PRIX         │
    └─────┬────────┘     └─────┬────────┘
          │                    │
          │                    ▼
          │              ┌───────────────┐
          │              │ NOUVEAU PRIX  │
          │              │ + NOTE ADMIN  │
          │              └───────┬───────┘
          │                      │
          ▼◄─────────────────────┘
    ┌──────────────────┐
    │ ENVOI DEVIS      │
    │ AU CLIENT        │ ◄──── Email + Notification
    └──────────────────┘
```

---

## 4. Flux Attribution Automatique Agent

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ALGORITHME ATTRIBUTION                            │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ PAIEMENT CLIENT  │
    │ CONFIRMÉ         │
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ RECHERCHE AGENTS │     Critères:
    │ DISPONIBLES      │◄──── • Zone géographique
    └─────┬────────────┘      • Disponibilité horaire
          │                   • Compte actif
          ▼
    ┌──────────────────┐
    │ FILTRAGE         │     Critères:
    │ ÉLIGIBLES        │◄──── • Équipement vérifié
    └─────┬────────────┘      • Documents validés
          │                   • Note interne > seuil
          ▼
    ┌──────────────────┐
    │ SCORING AGENTS   │     Score basé sur:
    │                  │◄──── • Proximité (40%)
    └─────┬────────────┘      • Note interne (30%)
          │                   • Charge actuelle (20%)
          │                   • Ancienneté (10%)
          ▼
    ┌──────────────────┐
    │ SÉLECTION        │
    │ MEILLEUR AGENT   │
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ NOTIFICATION     │
    │ AGENT            │ ◄──── Délai réponse: 30 min
    └─────┬────────────┘
          │
          ├──────────────────────┐
          ▼                      ▼
    ┌──────────────┐       ┌──────────────┐
    │ ACCEPTE      │       │ REFUSE/DÉLAI │
    │              │       │ DÉPASSÉ      │
    └─────┬────────┘       └─────┬────────┘
          │                      │
          ▼                      ▼
    ┌──────────────┐       ┌───────────────┐
    │ MISSION      │       │ AGENT SUIVANT │
    │ CONFIRMÉE    │       │ DANS LISTE    │
    └──────────────┘       └───────────────┘
```

---

## 5. Flux Contrôle Qualité

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CONTRÔLE QUALITÉ INTERNE                          │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ MISSION          │
    │ TERMINÉE         │
    └─────┬────────────┘
          │
          ▼
    ┌──────────────────┐
    │ REVUE PHOTOS     │     Admin examine:
    │ AVANT/APRÈS      │◄──── • Qualité photos
    └─────┬────────────┘      • Travail effectué
          │                   • Conformité
          ▼
    ┌──────────────────┐
    │ ATTRIBUTION      │
    │ NOTE INTERNE     │ ◄──── Score 1-5
    └─────┬────────────┘
          │
          ├───────────────────────┬─────────────────┐
          ▼                       ▼                 ▼
    ┌──────────────┐       ┌───────────┐     ┌───────────┐
    │ NOTE 4-5     │       │ NOTE 3    │     │ NOTE 1-2  │
    │ EXCELLENT    │       │ CORRECT   │     │ PROBLÈME  │
    └─────┬────────┘       └─────┬─────┘     └─────┬─────┘
          │                      │                 │
          ▼                      ▼                 ▼
    ┌──────────────┐       ┌───────────┐     ┌───────────┐
    │ PAIEMENT     │       │ PAIEMENT  │     │ ENQUÊTE   │
    │ AGENT        │       │ AGENT     │     │ + SANCTION│
    │ LIBÉRÉ       │       │ LIBÉRÉ    │     │ POSSIBLE  │
    └──────────────┘       └───────────┘     └───────────┘
```

---

## États et Transitions

### ServiceRequest (Demande)

```
pending ──────────► quote_sent ──────────► quote_accepted
    │                   │                      │
    │                   ▼                      ▼
    │              quote_refused              paid
    │                   │                      │
    ▼                   ▼                      ▼
cancelled           cancelled             assigned
                                              │
                                              ▼
                                         in_progress
                                              │
                                              ▼
                                          completed
```

### Booking (Mission)

```
pending_agent ──────► agent_accepted ──────► in_progress
      │                                          │
      ▼                                          ▼
agent_refused ──────► (réattribution)      photos_before
                                                 │
                                                 ▼
                                           photos_after
                                                 │
                                                 ▼
                                             completed
```

---

## Notifications

| Événement | Destinataire | Canal |
|-----------|--------------|-------|
| Nouveau devis | Client | Email + Push |
| Devis accepté | Admin | Dashboard |
| Paiement reçu | Admin + Client | Email |
| Mission attribuée | Agent | Email + Push |
| Agent accepte | Admin | Dashboard |
| Mission démarrée | Client | Push |
| Mission terminée | Client + Admin | Email |
| Nouveau retrait | Admin | Dashboard |
