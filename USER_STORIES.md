# Histoires utilisateurs – BRS‑CSI

Ces histoires décrivent de manière concise les besoins des principaux utilisateurs de l’application **BRS‑CSI**. Chaque histoire suit le format « en tant que … je veux … afin de … » afin de faciliter la compréhension des objectifs métier.

## Agents (départ et arrivée)

1. **En tant qu’agent au comptoir d’enregistrement**, je veux importer la liste des bagages pour un vol au départ de mon aéroport (Kinshasa, Kisangani, Goma, Lubumbashi, Kolwezi, Kananga, Mbuji‑Mayi, Gemena ou Mbandaka) afin de disposer de toutes les références avant le départ.
2. **En tant qu'agent au comptoir**, je veux saisir le numéro de bagage ou le scanner pour créer ou mettre à jour un lot de bagages et vérifier que l'enregistrement correspond au bon vol.
3. **En tant qu’agent**, je veux voir la progression d’un lot (ex. 3/4) lors du scan afin de savoir combien de pièces restent à charger.
4. **En tant qu'agent**, je veux être alerté si un lot est incomplet (indices manquants) pour contacter rapidement mes collègues.
5. **En tant qu’agent à l’arrivée**, je veux scanner chaque bagage qui arrive, quel que soit l’aéroport d’arrivée, afin de mettre à jour automatiquement son statut à `arrived`.
6. **En tant qu'agent**, je veux rechercher un bagage par numéro, par nom ou par PNR afin de répondre rapidement aux demandes.
7. **En tant qu’agent superviseur**, je veux pouvoir corriger manuellement le statut d’une pièce en cas d’erreur de scan afin d’assurer la cohérence des données.
8. **En tant qu’agent**, je veux consulter la liste des bagages manquants pour un vol afin d’organiser les recherches ou les déclarations d’irrégularité.

## Superviseurs et administrateurs

1. **En tant que superviseur**, je veux importer le fichier des bagages et attribuer les vols aux agents afin de préparer les opérations.
2. **En tant que superviseur**, je veux visualiser des statistiques (vols, bagages manquants, taux de complétude) pour suivre la performance et identifier les problèmes récurrents.
3. **En tant qu'administrateur**, je veux créer et gérer les utilisateurs (agents, superviseurs) afin d'assurer des accès appropriés et sécurisés.
4. **En tant qu’administrateur**, je veux exporter des rapports de scans et de bagages pour répondre aux demandes de contrôle interne ou de la compagnie.

Ces histoires serviront de base à la définition des tâches de développement et aux scénarios de test.