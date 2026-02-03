# Guide Utilisateur Vimaiz

> Documentation complète pour l'utilisation de la plateforme Vimaiz.

---

## Table des matières

1. [Guide Client](#1-guide-client)
2. [Guide Agent](#2-guide-agent)
3. [Guide Administrateur](#3-guide-administrateur)

---

# 1. Guide Client

## 1.1 Inscription et Connexion

### Créer un compte
1. Rendez-vous sur la page d'accueil
2. Cliquez sur **"S'inscrire"**
3. Remplissez : nom, email, mot de passe
4. Acceptez les CGU et validez
5. Confirmez votre email via le lien reçu

### Se connecter
1. Cliquez sur **"Connexion"**
2. Entrez email et mot de passe
3. Accédez à votre tableau de bord

---

## 1.2 Gestion des Logements

### Ajouter un logement
1. Menu **"Mes logements"** > **"+ Ajouter"**
2. Remplissez : nom, type, adresse, surface, pièces, salles de bain
3. Ajoutez des photos (optionnel)
4. Cliquez **"Enregistrer"**

### Modifier / Supprimer
- Cliquez sur le logement > **"Modifier"** ou **"Supprimer"**
- ⚠️ Impossible de supprimer un logement avec missions en cours

---

## 1.3 Demander une Prestation

### Créer une demande
1. Cliquez **"Nouvelle demande"**
2. Sélectionnez le logement
3. Choisissez date, heure et durée
4. Consultez l'estimation de prix
5. Ajoutez des instructions (optionnel)
6. Validez la demande

### Statuts de mission
| Statut | Description |
|--------|-------------|
| En attente | Recherche d'agent |
| Acceptée | Agent assigné |
| En cours | Prestation en cours |
| Terminée | Prestation finie |
| Annulée | Mission annulée |

---

## 1.4 Paiement

### Ajouter une carte
1. **"Paramètres"** > **"Paiement"** > **"Ajouter une carte"**
2. Entrez les informations (sécurisé via Stripe)

### Facturation
- Paiement préautorisé à la validation
- Débit effectif après confirmation
- Factures disponibles dans **"Mes factures"**

---

## 1.5 Avis et Messagerie

### Laisser un avis
1. Après une prestation, cliquez **"Donner mon avis"**
2. Notez de 1 à 5 étoiles + commentaire
3. Publiez

### Messagerie
- Menu **"Conversations"** pour échanger avec l'agent
- Disponible uniquement pour missions acceptées/en cours

---

# 2. Guide Agent

## 2.1 Inscription Agent

### Créer un compte agent
1. Page **"Devenir Agent"** > **"S'inscrire"**
2. Remplissez : nom, email, téléphone, adresse
3. Type : Particulier ou Entreprise (+ SIRET si entreprise)
4. Créez votre mot de passe et validez

### Compléter le profil
1. **"Mon profil"** : photo, description, zones d'intervention, disponibilités

---

## 2.2 Documents Requis

| Document | Obligatoire |
|----------|-------------|
| Pièce d'identité | ✅ Oui |
| Justificatif de domicile | ✅ Oui |
| Document SIRET | Si entreprise |
| Permis de conduire | Optionnel |
| Attestation assurance | Optionnel |

### Soumettre les documents
1. **"Mes documents"** > Téléchargez chaque fichier
2. Cliquez **"Soumettre pour vérification"**
3. Validation sous 24-48h par l'équipe Vimaiz

---

## 2.3 Disponibilités

1. **"Disponibilités"** > Définissez vos créneaux par jour
2. Bloquez des dates si indisponible

---

## 2.4 Missions

### Accepter une mission
1. **"Missions disponibles"** : consultez les demandes
2. Vérifiez : adresse, date, durée, rémunération
3. Cliquez **"Accepter"** ou **"Refuser"**

### Réaliser une mission
1. Consultez les détails et instructions
2. Arrivé sur place : **"Démarrer la mission"**
3. Effectuez le ménage
4. Terminez : **"Terminer la mission"**

---

## 2.5 Portefeuille (Wallet)

### Consulter le solde
- Visible sur le tableau de bord et **"Mon portefeuille"**

### Demander un retrait
1. **"Demander un retrait"**
2. Montant minimum : 50€
3. Configurez votre IBAN dans **"Paramètres"** > **"Compte bancaire"**
4. Virement traité sous 3-5 jours ouvrés

---

# 3. Guide Administrateur

## 3.1 Accès Panel Admin

1. URL : `/admin`
2. Connectez-vous avec vos identifiants admin
3. Dashboard : stats utilisateurs, missions, revenus

---

## 3.2 Gestion Utilisateurs

### Liste et recherche
- **"Gestion Utilisateurs"** > **"Utilisateurs"**
- Filtres disponibles pour rechercher

### Actions
| Action | Description |
|--------|-------------|
| Créer | Nouveau utilisateur avec rôle |
| Modifier | Changer les informations |
| Suspendre | Bloquer l'accès |
| Activer | Réactiver un compte |

---

## 3.3 Validation des Agents

### Vérifier les documents
1. **"Profils Agents"** > Sélectionnez un agent
2. Cliquez **"Documents"**
3. Examinez chaque document (cliquez pour agrandir)

### Valider ou Rejeter
- **"Valider tous les documents"** : agent vérifié, peut travailler
- **"Rejeter"** : indiquez la raison, l'agent doit resoumettre

---

## 3.4 Gestion des Missions

### Consultation
- **"Missions"** avec filtres par statut, date, agent, client

### Actions possibles
- Voir les détails complets
- Annuler une mission (avec raison)
- Intervenir sur un litige

---

## 3.5 Gestion des Avis

1. **"Avis clients"** : liste de tous les avis
2. Modérer : supprimer ou masquer si inapproprié
3. Répondre officiellement si nécessaire

---

## 3.6 Gestion des Retraits

1. Consultez les demandes de retrait en attente
2. Vérifiez le compte bancaire et le solde
3. **"Approuver"** ou **"Refuser"**
4. Retraits approuvés = virement automatique

---

## 3.7 Configuration

### Tarification
- Prix de base/heure, prix/m²
- Majorations (week-end, jours fériés)
- Taux de commission plateforme

### Paramètres généraux
- Nom plateforme, email contact
- Intégrations (Stripe, emails)

---

## 3.8 Communication

- **"Messages de contact"** : messages du formulaire public
- **"Conversations"** : échanges clients/agents (modération)

---

## Support

Pour toute question :
- Email : support@vimaiz.fr
- Formulaire de contact sur le site

---

*Document mis à jour le {{ date('d/m/Y') }}*
