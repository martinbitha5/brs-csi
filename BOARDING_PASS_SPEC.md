# Spécifications – Intégration des cartes d’embarquement (Boarding Passes)

Ce document décrit la façon d'intégrer les cartes d'embarquement (boarding passes) au système **BRS‑CSI** pour lier les bagages, gérer les scans, et couvrir les cas d'usage courants et exceptionnels.

## 1. Objectifs

- **Lier rapidement les bagages** via le scan du boarding pass.
- **Faciliter la vérification automatique** lors du chargement/débarquement.
- **Supporter les cas d’usage suivants** :
  - 0 bagage
  - Bagages multiples
  - Vols multi-segments
  - Scans hors-ligne
  - Correction manuelle

## 2. Modèle de données

### 2.1 Table `boarding_passes`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Identifiant unique |
| `passenger_name` | texte | Nom |
| `pnr` | texte (nullable, indexé) | Code de réservation (Passenger Name Record) |
| `barcode_data` | texte | Données brutes du code-barres/QR (chiffré) |
| `flight_number` | texte | Numéro de vol (ex. AF123) |
| `segment` | entier | Optionnel, pour vols multi-segments |
| `origin` | char(3) | Code IATA d’origine (ex. FIH pour Kinshasa) |
| `destination` | char(3) | Code IATA de destination (ex. FKI pour Kisangani) |
| `seat` | texte (nullable) | Siège assigné |
| `issued_at` | timestamp (nullable) | Date d’émission si présente dans le code-barres |
| `sync_status` | enum | `synced`, `pending_sync` (pour scans hors-ligne) |
| `created_at` | timestamp | Date de création |
| `updated_at` | timestamp | Date de dernière mise à jour |

### 2.2 Relations

- `bag_pieces.boarding_pass_id` → `boarding_passes.id` (FK, nullable)

**Note** : La table `bag_pieces` doit être étendue pour inclure un champ `boarding_pass_id` (voir section 2.3 de `DATA_MODEL.md`).

## 3. Workflow et cas d’usage

### 3.1 Scan au check-in

1. L’agent scanne le QR ou le code-barres de la carte d’embarquement.
2. Le système décode le `barcode_data` → extrait PNR, nom, vol, origine, destination, siège.
3. Il recherche les bagages correspondants :
   - Priorité 1 : par PNR exact
   - Priorité 2 : par nom + numéro de vol
   - Priorité 3 : correspondance partielle + heuristique
4. Si trouvé → lie les `bag_pieces` au boarding pass via `boarding_pass_id`.
5. Si non trouvé → enregistre comme « aucun bagage trouvé », association manuelle possible.

### 3.2 Scan à l’embarquement

- Vérifier que les bagages associés sont bien `loaded`.
- Si non → alerter l’agent avec un message clair.
- Permettre le scan du tag bagage juste après le boarding pass pour lier rapidement.

### 3.3 Scan à l’arrivée

- Vérifie que tous les bagages liés sont bien `arrived`.
- En cas de bagage manquant → recherche via PNR dans la base de données.
- Afficher la progression : `pièces_arrivées / pièces_déclarées`.

### 3.4 Scan hors-ligne

- Stocke localement avec état `pending_sync`.
- Synchronisation automatique quand la connexion revient.
- L’agent peut consulter la liste des scans en attente dans l’interface.

## 4. Règles d’association

### 4.1 Priorité d’association

1. **PNR exact** : correspondance parfaite du code de réservation.
2. **Nom + numéro de vol** : correspondance du nom (tolérance aux variations de casse et accents) et du numéro de vol.
3. **Correspondance partielle + heuristique** : en cas d’échec, recherche par correspondance partielle du nom et du vol.

### 4.2 Bagages multiples

- Si le check-in indique 2 pièces → lier 2 tags automatiquement.
- Sinon → déduire à partir des numéros de tags (détection du `base_tag` et des indices).
- Afficher la progression : `1/2`, `2/2`, etc.

### 4.3 Cas zéro bagage

- Marquer `pieces_declared = 0` si aucun tag détecté.
- Afficher un badge « 0 bagage » dans l’interface.
- Ne pas exiger de scan de bagage.

### 4.4 Gestion des conflits

- Si un tag est déjà lié à un autre boarding pass → alerte + confirmation manuelle requise.
- L’agent peut choisir de :
  - Dissocier le tag de l’ancien boarding pass
  - Créer un nouveau tag
  - Signaler un conflit au superviseur

### 4.5 Validation des transitions

- Interdire de marquer un bagage `arrived` s’il n’a jamais été `loaded`, sauf justification manuelle par un superviseur.
- Les règles de transition d’état restent strictes (voir section 1 de `SPECIFICATIONS.md`).

## 5. Endpoints API (exemples)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/boarding_passes/scan` | Décode le code-barres/QR et associe automatiquement les bagages |
| `GET` | `/boarding_passes/:id` | Détails du boarding pass + bagages liés |
| `POST` | `/boarding_passes/:id/associate` | Associer manuellement des tags à un boarding pass |
| `GET` | `/boarding_passes/lookup?pnr=XXX` | Recherche rapide par PNR |
| `GET` | `/boarding_passes/pending_sync` | Récupère les scans hors-ligne en attente |
| `POST` | `/boarding_passes/:id/sync` | Force la synchronisation d’un boarding pass en attente |

## 6. Interface utilisateur

### 6.1 Écran de scan (agents et mobile)

- **Feedback visuel + sonore** lors du scan réussi ou en erreur.
- **Affichage des informations** :
  - Nom
  - Numéro de vol
  - Siège
  - PNR
  - Origine → Destination
- **Affichage des bagages liés** :
  - Progression : `1/2`, `2/2`, etc.
  - Statut de chaque pièce
  - Liste des tags associés
- **Boutons d’action** :
  - « Associer bagage » : permet de scanner un tag et le lier au boarding pass
  - « Créer nouveau tag » : crée un nouveau bagage et l’associe
  - « Signaler 0 bagage » : confirme qu’aucun bagage n’est enregistré
  - « Alerter supervision » : si bagage non chargé → notification au superviseur
- **Historique** : consultation des scans précédents pour ce boarding pass.
- **Mode hors-ligne** : liste de scans en attente de synchronisation.


## 7. Import CSV

### 7.1 Champs CSV recommandés

| Colonne | Description |
|---------|-------------|
| `passenger_name` | Nom |
| `pnr` | Code de réservation |
| `flight_number` | Numéro de vol |
| `origin` | Code IATA d’origine |
| `destination` | Code IATA de destination |
| `pieces_declared` | Nombre de bagages déclarés |
| `tag_full_1` | Numéro complet du premier tag (optionnel) |
| `tag_full_2` | Numéro complet du deuxième tag (optionnel) |

### 7.2 Traitement de l’import

- Crée un `boarding_pass` si PNR présent.
- Sinon, crée un enregistrement minimal basé sur nom + vol.
- Associe automatiquement les tags si `tag_full_1`, `tag_full_2`, etc. sont fournis.
- Vérifie la cohérence : `pieces_declared` doit correspondre au nombre de colonnes `tag_full_*`.

## 8. Sécurité

- **Chiffrement des données sensibles** : `barcode_data` doit être chiffré en base de données.
- **Protection des endpoints** : accès selon le rôle (agent, superviseur, admin).
- **Journalisation complète** :
  - Qui a scanné le boarding pass
  - Quand
  - Quels bagages ont été associés
  - Actions manuelles effectuées
- **Conformité RGPD** : les données personnelles (noms, PNR) doivent être protégées conformément aux réglementations en vigueur.

## 9. Tests et cas d’acceptation

| Cas | Attendu |
|-----|---------|
| Boarding pass avec 2 bagages | Les 2 sont liés automatiquement et marqués `loaded` |
| Boarding pass sans bagage | Message : « Aucun bagage en soute » |
| Scan hors-ligne | Synchronisation correcte après reconnexion |
| Conflit de tag | Alerte + validation manuelle requise |
| Vol multi-segments | Gestion correcte du champ `segment` |
| Association manuelle | Possibilité de lier un tag après scan initial |
| Recherche par PNR | Retourne tous les boarding passes et bagages associés |

## 10. Extensions possibles

- **OCR sur carte d’embarquement** : si le QR/code-barres est illisible, permettre la capture d’image et extraction par OCR.
- **Connexion avec GDS** : intégration avec Amadeus, Sabre, etc. pour récupérer automatiquement les `pieces_declared`.
- **Notifications SMS/Push** : aux agents lorsque les bagages sont marqués `arrived`.
- **Statistiques avancées** : taux de scans réussis, temps moyen de traitement, etc.

## 11. Intégration avec le modèle existant

Cette spécification s’intègre avec les tables existantes décrites dans `DATA_MODEL.md` :

- **`passengers`** : peut être liée via `pnr` ou `name` + `flight_number`.
- **`bag_pieces`** : doit être étendu avec `boarding_pass_id` (FK vers `boarding_passes.id`).
- **`scan_logs`** : peut enregistrer les scans de boarding passes avec `action = 'boarding_pass_scanned'`.

Les aéroports supportés sont ceux définis dans `constants/airports.ts` et correspondent aux codes IATA utilisés dans les champs `origin` et `destination`.

