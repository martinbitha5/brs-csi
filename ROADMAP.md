# Feuille de route – BRS‑CSI

Cette feuille de route donne une vue d’ensemble des phases de développement de l’application **BRS‑CSI** et des jalons clés.  
Les dates indiquées sont à titre indicatif et pourront être ajustées en fonction de l’avancement réel.

## Phase 1 : Conception et planification (Semaine 1 – 04 novembre 2025)

- Analyser le processus actuel de gestion des bagages dans l’ensemble des aéroports desservis par ATS (Kinshasa, Kisangani, Goma, Lubumbashi, Kolwezi, Kananga, Mbuji‑Mayi, Gemena et Mbandaka). Cette analyse servira de base pour modéliser les flux multi‑sites.
- Valider les exigences avec les parties prenantes (Ir Aviation, agents de comptoir, responsables IT).
- Définir les grandes lignes de l’architecture (base de données, API, application mobile/web).
- Établir la liste des fonctionnalités prioritaires (scan, suivi des lots, gestion du « 0 bagage », etc.).
- Créer la documentation initiale (`README.md`, `SPECIFICATIONS.md`, `DATA_MODEL.md`, `USER_STORIES.md`).

## Phase 2 : Modélisation des données et mise en place du back‑end (Semaines 2–3)

- Concevoir le schéma de la base de données : tables `flights`, `passengers`, `bag_sets`, `bag_pieces`, etc.  
  Voir `DATA_MODEL.md` pour le détail.
- Choisir l’infrastructure (par ex. PostgreSQL + Supabase ou Firebase) et configurer l’environnement de développement.
- Implémenter les API nécessaires :
  - Enregistrement et récupération des données de vol.
  - Création et mise à jour des lots de bagages (`bag_sets`).
  - Mise à jour des statuts des pièces (`bag_pieces`) au scan.
- Intégrer l’import automatique du fichier Excel/CSV provenant du système d’enregistrement (mapping des colonnes vers les champs de la base).

## Phase 3 : Développement des interfaces (Semaines 4–5)

- **Interface agent** :
  - Écran de recherche/scan de bagage (lecture du code‑tag via QR ou saisie manuelle).  
  - Affichage des informations du bagage (vol, numéro de lot, progression X/N).  
  - Avertissement si des pièces manquent ou si le bagage n’est pas attendu sur ce vol.
- Préparer la version mobile (React Native/Flutter) et/ou web responsif selon le choix retenu.
- Mettre en place l'authentification et les rôles (agent, superviseur, admin).

## Phase 4 : Intégration et tests (Semaine 6)

- Relier les interfaces au back‑end et valider tous les appels API.
- Simuler des scans multiples afin de vérifier la gestion des lots (cas de plusieurs pièces et de zéro bagage).
- Tester les performances et la robustesse (débit de scan élevé, déconnexion réseau, etc.).
- Écrire des tests unitaires et fonctionnels pour sécuriser le code.

## Phase 5 : Déploiement et formation (Semaine 7)

- Déployer l’application sur l’environnement de production (serveur cloud ou local).
- Assurer la migration des données existantes, le cas échéant.
- Former les agents et les équipes d’Ir Aviation à l’utilisation de l’outil.
- Récolter les retours d’expérience et planifier les améliorations.

## Phases ultérieures (au‑delà de la Semaine 7)

- Support de nouveaux aéroports ou de routes supplémentaires au‑delà du réseau ATS actuel.  
- Intégration avec les systèmes de réservation et de gestion de l’aéroport.  
- Tableau de bord statistique (nombre de bagages par vol, taux de bagages manquants, temps moyen de livraison).  
- Gestion des notifications push/SMS pour les agents (informations sur les bagages).

La feuille de route pourra évoluer en fonction des besoins et des priorités identifiés au cours du développement.