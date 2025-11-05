# Modèle de données – BRS‑CSI

Ce document décrit la structure de base de données proposée pour l’application **BRS‑CSI**.  
Les tables et champs ci‑dessous peuvent être adaptés selon le SGBD utilisé (PostgreSQL, Supabase, etc.).

## 1. Tables principales

### 1.1 `flights`

| Champ | Type | Description |
|------|------|-------------|
| `id` | UUID | Identifiant unique du vol. |
| `code` | texte | Code du vol (ex. « FIH‑FKI »). |
| `date` | date | Date de départ du vol. |
| `route` | texte | Route (par ex. « Kinshasa → Kisangani »). |
| `created_at` | timestamp | Date de création de l’enregistrement. |
| `updated_at` | timestamp | Date de dernière mise à jour. |

### 1.2 `passengers`

| Champ | Type | Description |
|------|------|-------------|
| `id` | UUID | Identifiant unique. |
| `name` | texte | Nom complet. |
| `pnr` | texte | Numéro de réservation (Passenger Name Record). |
| `flight_id` | UUID (FK) | Référence au vol (`flights.id`). |
| `pieces_declared` | entier | Nombre de bagages enregistrés (peut être 0). |
| `status` | enum | Statut global : `no_checked_bag`, `bags_expected`, `bags_complete`, `bags_missing`. |
| `created_at` | timestamp | Date de création de l’enregistrement. |
| `updated_at` | timestamp | Date de dernière mise à jour. |

### 1.3 `bag_sets`

| Champ | Type | Description |
|------|------|-------------|
| `id` | UUID | Identifiant unique du lot de bagages. |
| `passenger_id` | UUID (FK) | Référence (`passengers.id`). |
| `flight_id` | UUID (FK) | Référence au vol (`flights.id`). |
| `base_tag` | texte | Préfixe commun des tags de ce lot (ex. `907136637`). |
| `pieces_expected` | entier | Nombre de pièces attendues (issu du check‑in ou calculé). |
| `status` | enum | Statut du lot : `incomplete`, `in_progress`, `complete`, `error`. |
| `created_at` | timestamp | Date de création de l’enregistrement. |
| `updated_at` | timestamp | Date de dernière mise à jour. |

### 1.4 `bag_pieces`

| Champ | Type | Description |
|------|------|-------------|
| `id` | UUID | Identifiant unique de la pièce de bagage. |
| `bag_set_id` | UUID (FK) | Référence au lot (`bag_sets.id`). |
| `tag_full` | texte | Numéro complet du bagage (code‑tag). |
| `piece_index` | entier | Position de la pièce dans le lot (1, 2, 3…). |
| `status` | enum | État actuel : `created`, `checked_in`, `loaded`, `in_transit`, `arrived`, `missing`. |
| `last_scan_at` | timestamp | Date/heure du dernier scan. |
| `station` | texte | Code de l’aéroport où le dernier scan a eu lieu. Les codes IATA utilisés sont : FIH pour Kinshasa, FKI pour Kisangani, GOM pour Goma, FBM pour Lubumbashi, KWZ pour Kolwezi, KGA pour Kananga, MJM pour Mbuji‑Mayi, GMA pour Gemena【926430856949698†L125-L131】 et MDK pour Mbandaka【170103862304744†L124-L129】. |
| `created_at` | timestamp | Date de création de l’enregistrement. |
| `updated_at` | timestamp | Date de dernière mise à jour. |

### 1.5 `scan_logs`

Pour assurer la traçabilité, on conserve un historique de chaque scan.

| Champ | Type | Description |
|------|------|-------------|
| `id` | UUID | Identifiant unique du log. |
| `bag_piece_id` | UUID (FK) | Référence à la pièce de bagage (`bag_pieces.id`). |
| `action` | enum | Action réalisée : `checked_in`, `loaded`, `arrived`, `error`, etc. |
| `agent_id` | UUID (FK) | Identifiant de l’agent qui a réalisé le scan (table `users`, non décrite ici). |
| `station` | texte | Station où l’action a été effectuée. |
| `timestamp` | timestamp | Date/heure de l’action. |

## 2. Relations entre tables

- `flights` possède plusieurs `passengers` (relation 1 → N).
- Un `passenger` peut avoir 0 ou 1 `bag_set`.  
  - Si `pieces_declared = 0`, aucun `bag_set` n'est créé.  
  - Sinon, un `bag_set` contient toutes les pièces de bagage liées.
- `bag_sets` a plusieurs `bag_pieces` (relation 1 → N).  
  Chaque `bag_piece` est une pièce individuelle (1/4, 2/4, etc.).
- `bag_pieces` a plusieurs `scan_logs`, enregistrant chaque changement de statut.

## 3. Enums et valeurs de statut

### 3.1 Statuts (`passengers.status`)

- `no_checked_bag` : aucun bagage enregistré en soute.
- `bags_expected` : bagages en attente de scan.
- `bags_complete` : toutes les pièces du lot ont été scannées à l'arrivée.
- `bags_missing` : une ou plusieurs pièces manquent (non scannées à l'arrivée).

### 3.2 Statuts du lot (`bag_sets.status`)

- `incomplete` : toutes les pièces attendues ne sont pas encore scannées.
- `in_progress` : scan en cours (certaines pièces scannées mais pas toutes).
- `complete` : toutes les pièces du lot sont marquées `arrived`.
- `error` : incohérence détectée (par exemple, indices manquants ou doublons).

### 3.3 Statuts de la pièce (`bag_pieces.status`)

- `created` : pièce créée lors de l’import initial.
- `checked_in` : pièce enregistrée au comptoir de départ.
- `loaded` : pièce chargée en soute ou en conteneur.
- `in_transit` : pièce en cours de transport (scan de départ effectué, arrivée pas encore scannée).
- `arrived` : pièce scannée à l’arrivée et livrée.
- `missing` : pièce manquante (n’a pas été scannée à l’arrivée dans le délai imparti).

Ces structures peuvent être étendues selon les besoins (champ supplémentaire pour la compagnie, la destination, etc.).