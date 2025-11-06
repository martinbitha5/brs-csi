# Format d'import CSV/Excel

Ce document décrit le format attendu pour les fichiers CSV/Excel lors de l'import de données dans BRS-CSI.

## Colonnes requises

### Colonnes obligatoires

- **flight_code** : Code du vol (ex: "FIH-FKI", "FIH-GOM")
- **passenger_name** : Nom complet du passager
- **base_tag** : Tag de base du bagage (ex: "907136637")

### Colonnes optionnelles

- **flight_date** : Date du vol au format YYYY-MM-DD (par défaut: date du jour)
- **route** : Route du vol (ex: "Kinshasa → Kisangani")
- **pnr** : Numéro d'enregistrement du passager (PNR)
- **pieces_declared** : Nombre de bagages déclarés (par défaut: 1)
- **tag_full** : Tag complet du bagage (généré automatiquement si non fourni: base_tag + piece_index)
- **piece_index** : Index de la pièce dans le lot (par défaut: 1)

## Exemple de fichier CSV

```csv
flight_code,flight_date,route,passenger_name,pnr,pieces_declared,base_tag,piece_index
FIH-FKI,2024-01-15,Kinshasa → Kisangani,Jean Doe,ABC123,2,907136637,1
FIH-FKI,2024-01-15,Kinshasa → Kisangani,Jean Doe,ABC123,2,907136637,2
FIH-GOM,2024-01-15,Kinshasa → Goma,Marie Dupont,DEF456,1,907136638,1
```

## Exemple de fichier Excel

Le fichier Excel doit suivre le même format avec les mêmes colonnes en première ligne (en-têtes).

## Format des tags

- **base_tag** : Le tag de base sans le dernier chiffre (ex: "907136637")
- **tag_full** : Le tag complet avec l'index (ex: "9071366371", "9071366372")
- Si seulement `base_tag` est fourni, le système génère automatiquement `tag_full` = `base_tag` + `piece_index`

## Validation

L'import vérifie automatiquement :
- Présence des colonnes obligatoires
- Format des dates
- Cohérence des tags
- Doublons de bagages

## Gestion des erreurs

Les erreurs sont affichées dans le résultat de l'import :
- Erreurs critiques : empêchent l'import de la ligne
- Avertissements : bagages déjà existants (ignorés)

## Notes importantes

1. Les noms de colonnes sont insensibles à la casse et aux espaces
2. Les dates doivent être au format ISO (YYYY-MM-DD)
3. Les bagages existants ne sont pas dupliqués (avertissement affiché)
4. Les vols et passagers sont créés automatiquement s'ils n'existent pas
5. Les lots de bagages sont regroupés par passager et base_tag

