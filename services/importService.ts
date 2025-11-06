// Service d'import de données depuis CSV/Excel
// Format attendu: données depuis le système de check-in

import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Flight,
  Passenger,
  BagSet,
  BagPiece,
  BagPieceStatus,
  BagSetStatus,
  PassengerStatus,
} from '@/types';
import { apiService } from './apiService';

// Interface pour les données importées depuis CSV/Excel
export interface ImportRow {
  // Informations du vol
  flight_code?: string;
  flight_date?: string;
  route?: string;
  
  // Informations du passager
  passenger_name?: string;
  pnr?: string;
  pieces_declared?: number | string;
  
  // Informations du bagage
  base_tag?: string;
  tag_full?: string;
  piece_index?: number | string;
}

export interface ImportResult {
  success: boolean;
  flightsCreated: number;
  passengersCreated: number;
  bagSetsCreated: number;
  bagPiecesCreated: number;
  errors: string[];
  warnings: string[];
}

// Générer un ID unique
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Parser un fichier CSV
const parseCSV = async (uri: string): Promise<ImportRow[]> => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: 'utf8',
    });

    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normaliser les noms de colonnes (supprimer espaces, convertir en minuscules)
          return header.trim().toLowerCase().replace(/\s+/g, '_');
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('Erreurs de parsing CSV:', results.errors);
          }
          resolve(results.data as ImportRow[]);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    throw new Error(`Erreur lors de la lecture du fichier CSV: ${error}`);
  }
};

// Parser un fichier Excel
const parseExcel = async (uri: string): Promise<ImportRow[]> => {
  try {
    // Lire le fichier en base64 pour XLSX
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Parser le workbook Excel
    const workbook = XLSX.read(fileContent, { 
      type: 'base64',
      cellDates: false,
      cellNF: false,
      cellText: false,
    });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Le fichier Excel ne contient aucune feuille');
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (!worksheet) {
      throw new Error('Impossible de lire la première feuille du fichier Excel');
    }

    // Convertir en tableau de tableaux (lignes x colonnes)
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false, // Convertir les dates en strings
    }) as any[][];

    if (!data || data.length === 0) {
      throw new Error('Le fichier Excel est vide');
    }

    // Prendre la première ligne comme en-têtes
    const headers = (data[0] as string[]).map((h) =>
      String(h || '').trim().toLowerCase().replace(/\s+/g, '_')
    ).filter(h => h !== ''); // Filtrer les en-têtes vides

    if (headers.length === 0) {
      throw new Error('Aucun en-tête de colonne trouvé dans le fichier Excel');
    }

    // Convertir en objets
    const rows: ImportRow[] = [];
    for (let i = 1; i < data.length; i++) {
      const rowData = data[i];
      if (!rowData || rowData.length === 0) continue;

      const row: ImportRow = {};
      let hasData = false;
      
      for (let j = 0; j < headers.length && j < rowData.length; j++) {
        const value = rowData[j];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          row[headers[j] as keyof ImportRow] = String(value).trim();
          hasData = true;
        }
      }
      
      if (hasData) {
        rows.push(row);
      }
    }

    return rows;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Erreur lors de la lecture du fichier Excel: ${errorMessage}`);
  }
};

// Valider et normaliser une ligne de données
const validateAndNormalizeRow = (row: ImportRow, index: number): {
  isValid: boolean;
  normalized?: {
    flight: Omit<Flight, 'id' | 'created_at' | 'updated_at'>;
    passenger: Omit<Passenger, 'id' | 'created_at' | 'updated_at'>;
    bagSet: Omit<BagSet, 'id' | 'created_at' | 'updated_at'>;
    bagPiece: Omit<BagPiece, 'id' | 'created_at' | 'updated_at'>;
  };
  errors: string[];
} => {
  const errors: string[] = [];

  // Vérifier les champs requis
  if (!row.flight_code) {
    errors.push(`Ligne ${index + 1}: flight_code manquant`);
  }
  if (!row.passenger_name) {
    errors.push(`Ligne ${index + 1}: passenger_name manquant`);
  }
  if (!row.base_tag && !row.tag_full) {
    errors.push(`Ligne ${index + 1}: base_tag ou tag_full manquant`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Normaliser les données
  const flightDate = row.flight_date
    ? new Date(row.flight_date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const route = row.route || row.flight_code || '';

  const piecesDeclared = row.pieces_declared
    ? parseInt(String(row.pieces_declared), 10)
    : 1;

  const pieceIndex = row.piece_index
    ? parseInt(String(row.piece_index), 10)
    : 1;

  // Construire le tag_full si nécessaire
  const tagFull = row.tag_full || `${row.base_tag}${pieceIndex}`;

  // Créer les objets normalisés
  const flight: Omit<Flight, 'id' | 'created_at' | 'updated_at'> = {
    code: row.flight_code!,
    date: flightDate,
    route,
  };

  const passenger: Omit<Passenger, 'id' | 'created_at' | 'updated_at'> = {
    name: row.passenger_name!,
    pnr: row.pnr || '',
    flight_id: '', // Sera rempli après création du vol
    pieces_declared: piecesDeclared,
    status: PassengerStatus.BAGS_EXPECTED,
  };

  const bagSet: Omit<BagSet, 'id' | 'created_at' | 'updated_at'> = {
    passenger_id: '', // Sera rempli après création du passager
    flight_id: '', // Sera rempli après création du vol
    base_tag: row.base_tag || tagFull.substring(0, tagFull.length - 1),
    pieces_expected: piecesDeclared,
    status: BagSetStatus.IN_PROGRESS,
  };

  const bagPiece: Omit<BagPiece, 'id' | 'created_at' | 'updated_at'> = {
    bag_set_id: '', // Sera rempli après création du lot
    tag_full: tagFull,
    piece_index: pieceIndex,
    status: BagPieceStatus.CREATED,
    last_scan_at: null,
    station: null,
    boarding_pass_id: null,
  };

  return {
    isValid: true,
    normalized: {
      flight,
      passenger,
      bagSet,
      bagPiece,
    },
    errors: [],
  };
};

// Importer les données depuis un fichier
export const importDataFromFile = async (
  fileUri: string,
  fileType: 'csv' | 'xlsx' | 'xls'
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    flightsCreated: 0,
    passengersCreated: 0,
    bagSetsCreated: 0,
    bagPiecesCreated: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Parser le fichier selon son type
    let rows: ImportRow[];
    if (fileType === 'csv') {
      rows = await parseCSV(fileUri);
    } else {
      rows = await parseExcel(fileUri);
    }

    if (rows.length === 0) {
      result.errors.push('Le fichier ne contient aucune donnée');
      return result;
    }

    // Grouper les données par vol et passager
    const flightMap = new Map<string, Flight>();
    const passengerMap = new Map<string, Passenger>();
    const bagSetMap = new Map<string, BagSet>();

    // Traiter chaque ligne
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validation = validateAndNormalizeRow(row, i);

      if (!validation.isValid) {
        result.errors.push(...validation.errors);
        continue;
      }

      const { normalized } = validation;
      if (!normalized) continue;

      // Créer ou récupérer le vol
      let flight = flightMap.get(normalized.flight.code);
      if (!flight) {
        // Vérifier si le vol existe déjà
        const existingFlights = await apiService.getFlights();
        const existingFlight = existingFlights.find(
          (f) => f.code === normalized.flight.code && f.date === normalized.flight.date
        );

        if (existingFlight) {
          flight = existingFlight;
        } else {
          flight = await apiService.createFlight(normalized.flight);
          result.flightsCreated++;
        }
        flightMap.set(normalized.flight.code, flight);
      }

      // Créer ou récupérer le passager
      const passengerKey = `${flight.id}-${normalized.passenger.pnr}-${normalized.passenger.name}`;
      let passenger = passengerMap.get(passengerKey);
      if (!passenger) {
        // Vérifier si le passager existe déjà
        const existingPassengers = await apiService.getPassengersByFlight(flight.id);
        const existingPassenger = existingPassengers.find(
          (p) => p.pnr === normalized.passenger.pnr && p.name === normalized.passenger.name
        );

        if (existingPassenger) {
          passenger = existingPassenger;
        } else {
          passenger = await apiService.createPassenger({
            ...normalized.passenger,
            flight_id: flight.id,
          });
          result.passengersCreated++;
        }
        passengerMap.set(passengerKey, passenger);
      }

      // Créer ou récupérer le lot de bagages
      const bagSetKey = `${passenger.id}-${normalized.bagSet.base_tag}`;
      let bagSet = bagSetMap.get(bagSetKey);
      if (!bagSet) {
        // Vérifier si le lot existe déjà
        const existingBagSet = await apiService.getBagSetByPassenger(passenger.id);

        if (existingBagSet && existingBagSet.base_tag === normalized.bagSet.base_tag) {
          bagSet = existingBagSet;
        } else {
          bagSet = await apiService.createBagSet({
            ...normalized.bagSet,
            passenger_id: passenger.id,
            flight_id: flight.id,
          });
          result.bagSetsCreated++;
        }
        bagSetMap.set(bagSetKey, bagSet);
      }

      // Créer la pièce de bagage
      const existingBagPiece = await apiService.getBagPieceByTag(normalized.bagPiece.tag_full);
      if (!existingBagPiece) {
        await apiService.createBagPiece({
          ...normalized.bagPiece,
          bag_set_id: bagSet.id,
        });
        result.bagPiecesCreated++;
      } else {
        result.warnings.push(
          `Ligne ${i + 1}: Le bagage ${normalized.bagPiece.tag_full} existe déjà`
        );
      }
    }

    result.success = result.errors.length === 0 || result.bagPiecesCreated > 0;
    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : 'Erreur inconnue lors de l\'import'
    );
    return result;
  }
};

// Sélectionner un fichier et l'importer
export const pickAndImportFile = async (): Promise<{
  success: boolean;
  result?: ImportResult;
  error?: string;
}> => {
  try {
    // Ouvrir le sélecteur de fichiers
    const document = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true,
    });

    if (document.canceled) {
      return { success: false, error: 'Import annulé' };
    }

    const file = document.assets[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      return {
        success: false,
        error: 'Format de fichier non supporté. Utilisez CSV ou Excel (.xlsx, .xls)',
      };
    }

    // Déterminer le type de fichier
    const fileType = fileExtension === 'csv' ? 'csv' : 'xlsx';

    // Importer les données
    const importResult = await importDataFromFile(file.uri, fileType);

    return {
      success: importResult.success,
      result: importResult,
      error: importResult.errors.length > 0 ? importResult.errors.join('\n') : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la sélection du fichier',
    };
  }
};

