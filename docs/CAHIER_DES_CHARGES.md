# 📘 CAHIER DES CHARGES – PLATEFORME VIMAIZ

**Version** : Uber-Like – OS du Logement (Contrôle Centralisé Total)

---

## 📨 MESSAGE D'INTRODUCTION

VIMAIZ n'est pas une simple plateforme de prestations de ménage.
VIMAIZ est un **OS du logement**, inspiré du modèle Uber, dans lequel la plateforme garde le **contrôle total** :

- Le client ne choisit pas un agent
- L'agent ne se met pas en concurrence
- Aucun profil, aucune note, aucun avis ne sont visibles publiquement

---

## 1. VISION GÉNÉRALE DE VIMAIZ

VIMAIZ est une plateforme centralisée qui permet aux clients de confier leur logement pour un service de ménage, et à VIMAIZ d'orchestrer l'ensemble du processus :

- Structuration de la demande
- Calcul du prix
- Validation du devis
- Encaissement du paiement
- Attribution de l'agent
- Contrôle qualité interne

👉 **VIMAIZ décide.**

---

## 2. STRUCTURE GLOBALE DE LA PLATEFORME

La plateforme est composée de **trois espaces distincts** :

1. **Espace Admin** (cœur et cerveau du système)
2. **Espace Client**
3. **Espace Agent de ménage**

⚠️ Aucun espace ne permet la visibilité des profils des autres utilisateurs.

---

## 3. ESPACE ADMIN – FONCTIONNALITÉS COMPLÈTES

L'espace Admin est le **poste de pilotage total** de VIMAIZ.

### 3.1 Gestion des utilisateurs

- Voir tous les comptes clients
- Voir tous les comptes agents
- Activer / suspendre / supprimer un compte
- Accéder à l'historique complet de chaque utilisateur

### 3.2 Gestion des logements

- Voir tous les logements enregistrés
- Filtrer par :
  - Type de logement
  - Surface
  - Zone géographique
- Modifier ou suspendre un logement

### 3.3 Gestion des demandes de ménage

- Voir toutes les demandes clients
- Accéder aux détails complets :
  - Type de logement
  - Surface en m²
  - Date et heure
  - Nombre d'heures souhaitées
  - Informations spécifiques
- **Statuts** :
  - Demande envoyée
  - Devis envoyé
  - Devis accepté / refusé
  - Paiement effectué
  - Mission attribuée
  - Mission terminée

### 3.4 Système de devis (clé du modèle)

- Système de calcul interne basé sur :
  - Type de logement
  - Surface
  - Durée
  - Date / heure
  - Complexité
  - Zone géographique
- L'Admin :
  - Valide
  - Ajuste si nécessaire
  - Envoie le devis au client

⚠️ **Le devis final est toujours validé par l'Admin.**

### 3.5 Paiement (OBLIGATOIRE AVANT MISSION)

- Une fois le devis accepté :
  - Le client doit effectuer le paiement AVANT le début de la mission
- Paiement effectué exclusivement sur la plateforme VIMAIZ
- Le montant est :
  - Encaissé
  - Sécurisé (séquestre / wallet interne)
- Tant que le paiement n'est pas effectué :
  - Aucun agent n'est attribué
  - La mission ne peut pas démarrer

### 3.6 Attribution des agents

- Une fois le paiement confirmé :
  - VIMAIZ attribue automatiquement un agent
- Le client :
  - Ne choisit pas l'agent
  - Ne voit pas l'agent

### 3.7 Qualité & feedback interne

- Notes internes visibles uniquement par l'Admin
- Signalements internes
- Sanctions possibles :
  - Avertissement
  - Suspension
  - Exclusion définitive

❌ **Aucun avis ou note publique.**

---

## 4. ESPACE CLIENT – PARCOURS UTILISATEUR

### 4.1 Inscription

- Nom
- Prénom
- Email
- Téléphone
- Mot de passe

### 4.2 Ajout d'un logement (OBLIGATOIRE)

**Types de logements exclusivement autorisés :**

- ✅ Maison
- ✅ Villa
- ✅ Chalet

**Exclus :**

- ❌ Appartement
- ❌ Bureau
- ❌ Autres

**Informations demandées :**

- Type de logement
- Surface en m² (champ libre)
- Adresse complète
- Informations complémentaires

### 4.3 Demande de service

**Service unique proposé : Ménage**

Le client renseigne :

- Le logement
- La date
- L'heure
- Le nombre d'heures souhaitées

Le client valide sa demande.

### 4.4 Devis & paiement

- Le système calcule une estimation interne
- L'Admin envoie un devis
- Le client accepte ou refuse
- En cas d'acceptation :
  - Paiement immédiat sur VIMAIZ
  - Mission validée

**Le client ne voit jamais :**

- Profils d'agents
- Notes
- Avis
- Tarifs horaires

---

## 5. ESPACE AGENT DE MÉNAGE

### 5.1 Conditions d'inscription (professionnels uniquement)

- Auto-entrepreneur ou société
- **Numéro de SIRET obligatoire**
- Dispose de son propre matériel
- **Permis de conduire obligatoire**
- **Véhicule obligatoire**

### 5.2 Fonctionnement agent

- L'agent reçoit une mission attribuée par VIMAIZ
- Il peut accepter ou refuser
- Accès à :
  - Adresse du logement
  - Géolocalisation / Maps
- Aucun profil public
- Aucun accès aux autres agents
- Aucune négociation tarifaire (VIMAIZ fixe les prix)

### 5.3 Photos obligatoires AVANT / APRÈS (INTERNE)

Pour chaque mission :

- Photos AVANT intervention obligatoires
- Photos APRÈS intervention obligatoires

Les photos sont :

- Visibles uniquement par l'Admin
- Utilisées pour le contrôle qualité
- Utilisées en cas de litige

⚠️ **Une mission ne peut pas être clôturée sans photos.**

---

## 6. RÈGLES DE VISIBILITÉ (NON NÉGOCIABLE)

- ❌ Aucun profil client visible
- ❌ Aucun profil agent visible
- ❌ Aucun agent ne voit d'autres agents
- ❌ Aucun client ne voit d'agents
- ❌ Aucun avis ou note publique

👉 **Seul l'Admin a une vision globale.**

---

## 7. NAVIGATION & TEXTES INTERFACE

### Menu principal

- Faire le ménage avec VIMAIZ
- Professionnels

### Section "À propos" (style Uber)

- À propos de VIMAIZ
- Service
- Fonctionnement

### Texte d'accueil (Hero section)

> **Planifiez votre ménage.**
> **VIMAIZ s'occupe du reste.**

---

## 8. PHILOSOPHIE FINALE À RESPECTER

> Le client ne cherche pas un agent.
> L'agent ne cherche pas un client.
>
> **VIMAIZ orchestre la relation, comme Uber.**
