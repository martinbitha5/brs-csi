# Spécifications fonctionnelles – BRS‑CSI

Ce document présente les principales fonctionnalités et règles métier attendues pour l’application **BRS‑CSI**.  
Il sert de référence aux développeurs et aux équipes métier pour valider le périmètre du projet.

## 1. Gestion des bagages

- **Enregistrement initial** : à partir des données fournies par le système d’enregistrement (fichier Excel/CSV), chaque bagage est identifié par un numéro unique (`tag_full`). Les colonnes du fichier source sont mappées vers les champs du modèle de données (voir `DATA_MODEL.md`).
- **Lots de bagages** : lorsqu'un enregistrement contient plusieurs pièces, les tags partagent le même préfixe (`base_tag`) et se terminent par un indice (`1`, `2`, `3`…). Le système regroupe ces pièces sous un `bag_set` et calcule la progression (`pièces_scannées/pieces_expected`).
- **Cas zéro bagage** : si aucun bagage en soute (`pieces_declared = 0`), aucun `bag_set` n'est créé. L'interface doit afficher un badge « 0 bagage » et ne doit pas exiger de scan.
- **Scan des bagages** :
  - Au départ : l’agent scanne chaque `tag_full`. L’état passe à `checked_in` puis `loaded` lorsque la pièce est mise en soute.  
  - À l’arrivée : l’agent scanne à nouveau les pièces pour les marquer `arrived`.  
  - En cas de scan d’un tag inconnu ou d’un tag non attendu sur ce vol, l’app doit alerter l’agent.
- **États possibles** : `created`, `checked_in`, `loaded`, `in_transit`, `arrived`, `missing`. Les règles de transition sont strictes ; par exemple, une pièce ne peut pas passer à `arrived` sans avoir été `loaded`.
- **Recherche** : permettre la recherche par `tag_full`, `base_tag`, PNR (numéro de réservation) ou nom.
- **Historique** : conserver un journal horodaté de chaque scan (qui, où, quand) pour traçabilité et audit.

## 2. Gestion des utilisateurs et rôles

- **Agent** : peut scanner, rechercher un bagage, mettre à jour le statut et consulter les listes de vol. L’agent est associé à une station parmi les aéroports desservis (Kinshasa, Kisangani, Goma, Lubumbashi, Kolwezi, Kananga, Mbuji‑Mayi, Gemena ou Mbandaka)【870866945355886†L205-L215】 afin de filtrer les opérations.
- **Superviseur** : dispose des droits agent + accès aux statistiques, exports et éditions manuelles (correction de bagage mal enregistré).
- **Administrateur** : gère les utilisateurs, les vols, les paramètres système et dispose de tous les droits.

## 3. Importation et intégration de données

- **Import CSV/Excel** : l'application doit permettre d'importer régulièrement la liste des bagages issus du système de check‑in. Un script d'intégration lit les colonnes (numéro de bagage, nom, vol, etc.) et crée les entrées correspondantes.
- **Sécurité des données** : l’accès à l’importation et à l’exportation est réservé aux profils superviseur/administrateur.
- **Vérification de cohérence** : lors de l'import, vérifier que la somme des `pieces_declared` correspond aux indices des tags. Alerter en cas d'incohérence (ex. tags 3 et 4 existants alors que 1 et 2 manquants).

## 4. Interface utilisateur

### 4.1. Interface Agent

- **Scan** : champ de lecture pour le code‑barres/QR. En cas d’erreur de lecture, permettre la saisie manuelle.
- **Fiche bagage** : présentation des informations principales :  
  - `tag_full` et `piece_index`/`pieces_expected`  
  - Nom, PNR, vol, route  
  - Statut actuel et journal des scans  
  - Bouton pour marquer la pièce comme `loaded` ou `arrived` selon la station.
- **Recherche avancée** : filtres par vol, date, station et statut pour générer des listes (bagages en attente, bagages manquants).


## 5. Notifications et reporting

- **Notifications internes** : signaler aux agents si un vol est sur le point de clôturer alors que des bagages sont manquants.
- **Reporting** : fournir des statistiques clés au superviseur : nombre de bagages par vol, nombre d'enregistrements sans bagage, taux de bagages manquants, temps moyen entre check‑in et arrivée.

## 6. Sécurité et conformité

- Les données personnelles (noms, numéros de réservation) doivent être protégées conformément aux réglementations en vigueur.
- Les accès sont authentifiés et autorisés par rôle. Les actions sensibles (import/export, modification manuelle) sont journalisées.

## 7. Règles spécifiques à la numérotation des bagages

L’énumération des tags se base sur un préfixe commun et un indice de pièce (1, 2, 3, etc.).  
Les points suivants s’appliquent :

1. **Détection des indices manquants** : si un agent scanne une pièce se terminant par `…3` et `…4` alors que `…1` et `…2` sont absentes, l’application signale un lot incomplet.
2. **Comptage automatique** : si les indices sont 1 à N, le système déduit `pieces_expected = N`. En l’absence de certaines pièces, le statut du lot reste « incomplet ».
3. **Flexibilité** : certaines compagnies n’utilisent pas une numérotation stricte. Le système utilise donc un champ `pieces_declared` issu du check‑in pour déterminer le nombre de pièces attendues et garde la possibilité de créer des lots « ouverts  ».

## 8. Aéroports et stations

Pour refléter l’implantation réelle du service, l’application doit prendre en charge les aéroports où ATS opère.  
Au moment de la rédaction, les aéroports desservis sont :

- **Kinshasa**
- **Kisangani**
- **Goma**
- **Lubumbashi**
- **Kolwezi**
- **Kananga**
- **Mbuji‑Mayi**
- **Gemena**
- **Mbandaka**

Ces aéroports correspondent à autant de **stations** pour la base de données et les interfaces. Le champ `station` dans la table `bag_pieces` (voir `DATA_MODEL.md`) doit refléter l’un de ces points d’opérations.  
La liste pourra être mise à jour si ATS étend son réseau【870866945355886†L205-L215】.