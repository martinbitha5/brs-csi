# BRS‑CSI – Suivi des bagages

Ce dépôt contient la documentation et les fichiers de suivi pour le projet **BRS‑CSI**.  
Il s’agit d’une application de suivi de bagages qui sera déployée sur plusieurs aéroports de la République démocratique du Congo.  
L'objectif est d'offrir aux agents ATS une solution moderne pour tracer et gérer les bagages enregistrés, depuis l'enregistrement jusqu'à la livraison.

## Résumé du projet

**BRS‑CSI** (Baggage Reconciliation System – Cargo System Integration) est une solution de suivi des bagages visant à :

- **Tracer chaque bagage dès l'enregistrement** en associant un code‑tag unique à un vol.
- **Gérer les lots de bagages** : plusieurs pièces peuvent être enregistrées. La numérotation du tag de base (ex. `907136637`) est enrichie d'une position (`…6371`, `…6372`, etc.) pour identifier chaque pièce.
- **Mettre à jour l'état des bagages en temps réel** : départ, en transit, arrivé, manquant, etc.
- **Gérer les cas sans bagage** : certains enregistrements peuvent n'avoir aucun bagage en soute. L'application doit afficher un badge « 0 bagage » et ne pas bloquer la clôture du vol.

## Aéroports desservis

Le service **BRS‑CSI** n’est pas limité à la liaison Kinshasa ↔ Kisangani ; il couvre l’ensemble des aéroports où African Transport Systems (ATS) opère en RDC.  
Selon le site officiel d’ATS, les aéroports desservis sont :

- **Kinshasa**
- **Kisangani**
- **Goma**
- **Lubumbashi**
- **Kolwezi**
- **Kananga**
- **Mbuji‑Mayi**
- **Gemena**
- **Mbandaka**

Ces aéroports doivent être pris en compte dans la conception de l’application et dans la configuration des stations (champs `station` ou `location` dans la base de données)【870866945355886†L205-L215】.

## Contenu du dépôt

| Fichier | Description |
|---|---|
| `ROADMAP.md` | Feuille de route, phases de développement et jalons principaux. |
| `SPECIFICATIONS.md` | Détails fonctionnels : fonctionnalités attendues, flux d’utilisateurs, règles métier. |
| `DATA_MODEL.md` | Modèle de données : description des tables, champs et relations. |
| `USER_STORIES.md` | Histoires utilisateurs décrivant les besoins des différents acteurs (agents, superviseurs, administrateurs). |

Ces fichiers servent de référence aux développeurs et aux parties prenantes pour suivre l’avancement et comprendre l’architecture du projet.