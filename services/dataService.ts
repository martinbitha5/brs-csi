// Service de gestion des données (simulation locale pour commencer)
// À remplacer par des appels API réels plus tard

import {
  BagPiece,
  BagPieceStatus,
  BagSet,
  BagSetStatus,
  BaggageSearchResult,
  BoardingPass,
  BoardingPassScanResult,
  Flight,
  Passenger,
  PassengerStatus,
  ScanAction,
  ScanLog,
  SyncStatus,
} from '@/types';
import { getAirportByCode } from '@/constants/airports';

// Simulation de données en mémoire (à remplacer par une vraie base de données)
let flights: Flight[] = [];
let passengers: Passenger[] = [];
let bagSets: BagSet[] = [];
let bagPieces: BagPiece[] = [];
let scanLogs: ScanLog[] = [];
let boardingPasses: BoardingPass[] = [];

// Génération d'ID UUID simple
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const dataService = {
  // Flights
  getFlight: (id: string): Flight | undefined => {
    return flights.find((f) => f.id === id);
  },

  getFlights: (): Flight[] => {
    return flights;
  },

  createFlight: (flight: Omit<Flight, 'id' | 'created_at' | 'updated_at'>): Flight => {
    const now = new Date().toISOString();
    const newFlight: Flight = {
      ...flight,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    flights.push(newFlight);
    return newFlight;
  },

  // Passengers
  getPassenger: (id: string): Passenger | undefined => {
    return passengers.find((p) => p.id === id);
  },

  getPassengersByFlight: (flightId: string): Passenger[] => {
    return passengers.filter((p) => p.flight_id === flightId);
  },

  createPassenger: (
    passenger: Omit<Passenger, 'id' | 'created_at' | 'updated_at'>
  ): Passenger => {
    const now = new Date().toISOString();
    const newPassenger: Passenger = {
      ...passenger,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    passengers.push(newPassenger);
    return newPassenger;
  },

  // Bag Sets
  getBagSet: (id: string): BagSet | undefined => {
    return bagSets.find((bs) => bs.id === id);
  },

  getBagSetByPassenger: (passengerId: string): BagSet | undefined => {
    return bagSets.find((bs) => bs.passenger_id === passengerId);
  },

  createBagSet: (bagSet: Omit<BagSet, 'id' | 'created_at' | 'updated_at'>): BagSet => {
    const now = new Date().toISOString();
    const newBagSet: BagSet = {
      ...bagSet,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    bagSets.push(newBagSet);
    return newBagSet;
  },

  // Bag Pieces
  getBagPiece: (id: string): BagPiece | undefined => {
    return bagPieces.find((bp) => bp.id === id);
  },

  getBagPieceByTag: (tagFull: string): BagPiece | undefined => {
    return bagPieces.find((bp) => bp.tag_full === tagFull);
  },

  getBagPiecesBySet: (bagSetId: string): BagPiece[] => {
    return bagPieces.filter((bp) => bp.bag_set_id === bagSetId).sort((a, b) => a.piece_index - b.piece_index);
  },

  createBagPiece: (
    bagPiece: Omit<BagPiece, 'id' | 'created_at' | 'updated_at'>
  ): BagPiece => {
    const now = new Date().toISOString();
    const newBagPiece: BagPiece = {
      ...bagPiece,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    bagPieces.push(newBagPiece);
    return newBagPiece;
  },

  updateBagPieceStatus: (
    bagPieceId: string,
    status: BagPieceStatus,
    station: string,
    agentId: string
  ): BagPiece | null => {
    const bagPiece = bagPieces.find((bp) => bp.id === bagPieceId);
    if (!bagPiece) return null;

    const now = new Date().toISOString();
    bagPiece.status = status;
    bagPiece.last_scan_at = now;
    bagPiece.station = station;
    bagPiece.updated_at = now;

    // Créer un log de scan
    // Convertir BagPieceStatus en ScanAction
    let scanAction: ScanAction;
    switch (status) {
      case BagPieceStatus.CHECKED_IN:
        scanAction = ScanAction.CHECKED_IN;
        break;
      case BagPieceStatus.LOADED:
        scanAction = ScanAction.LOADED;
        break;
      case BagPieceStatus.ARRIVED:
        scanAction = ScanAction.ARRIVED;
        break;
      default:
        scanAction = ScanAction.ERROR;
    }
    
    const scanLog: ScanLog = {
      id: generateId(),
      bag_piece_id: bagPieceId,
      action: scanAction,
      agent_id: agentId,
      station,
      timestamp: now,
    };
    scanLogs.push(scanLog);

    return bagPiece;
  },

  // Scan
  scanBaggage: (
    tagFull: string,
    station: string,
    agentId: string,
    action: ScanAction
  ): { success: boolean; bagPiece?: BagPiece; error?: string } => {
    const bagPiece = bagPieces.find((bp) => bp.tag_full === tagFull);
    
    if (!bagPiece) {
      return {
        success: false,
        error: 'Bagage non trouvé. Vérifiez le numéro de tag.',
      };
    }

    // Vérifier que la station est valide
    const airport = getAirportByCode(station);
    if (!airport) {
      return {
        success: false,
        error: 'Station invalide.',
      };
    }

    // Mettre à jour le statut selon l'action
    let newStatus: BagPieceStatus;
    switch (action) {
      case ScanAction.CHECKED_IN:
        newStatus = BagPieceStatus.CHECKED_IN;
        break;
      case ScanAction.LOADED:
        newStatus = BagPieceStatus.LOADED;
        break;
      case ScanAction.ARRIVED:
        newStatus = BagPieceStatus.ARRIVED;
        break;
      default:
        newStatus = bagPiece.status;
    }

    const updatedBagPiece = dataService.updateBagPieceStatus(bagPiece.id, newStatus, station, agentId);
    
    if (!updatedBagPiece) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du bagage.',
      };
    }

    return {
      success: true,
      bagPiece: updatedBagPiece,
    };
  },

  // Recherche
  searchBaggage: (
    tagFull?: string,
    pnr?: string,
    passengerName?: string
  ): BaggageSearchResult | null => {
    let passenger: Passenger | undefined;

    if (tagFull) {
      const bagPiece = bagPieces.find((bp) => bp.tag_full === tagFull);
      if (bagPiece) {
        const bagSet = bagSets.find((bs) => bs.id === bagPiece.bag_set_id);
        if (bagSet) {
          passenger = passengers.find((p) => p.id === bagSet.passenger_id);
        }
      }
    } else if (pnr) {
      passenger = passengers.find((p) => p.pnr === pnr);
    } else if (passengerName) {
      passenger = passengers.find(
        (p) => p.name.toLowerCase().includes(passengerName.toLowerCase())
      );
    }

    if (!passenger) {
      return null;
    }

    const flight = flights.find((f) => f.id === passenger!.flight_id);
    if (!flight) {
      return null;
    }

    const bagSet = bagSets.find((bs) => bs.passenger_id === passenger!.id);
    const bagPiecesList = bagSet
      ? bagPieces.filter((bp) => bp.bag_set_id === bagSet.id)
      : [];

    return {
      passenger,
      flight,
      bagSet: bagSet || null,
      bagPieces: bagPiecesList,
    };
  },

  // Initialisation avec des données de test
  initializeTestData: () => {
    // Créer un vol de test
    const flight = dataService.createFlight({
      code: 'FIH-FKI',
      date: new Date().toISOString().split('T')[0],
      route: 'Kinshasa → Kisangani',
    });

    // Créer un passager avec bagages
    const passenger = dataService.createPassenger({
      name: 'Jean Doe',
      pnr: 'ABC123',
      flight_id: flight.id,
      pieces_declared: 2,
      status: PassengerStatus.BAGS_EXPECTED,
    });

    // Créer un lot de bagages
    const bagSet = dataService.createBagSet({
      passenger_id: passenger.id,
      flight_id: flight.id,
      base_tag: '907136637',
      pieces_expected: 2,
      status: BagSetStatus.IN_PROGRESS,
    });

    // Créer les pièces de bagage
    dataService.createBagPiece({
      bag_set_id: bagSet.id,
      tag_full: '9071366371',
      piece_index: 1,
      status: BagPieceStatus.CHECKED_IN,
      last_scan_at: null,
      station: null,
      boarding_pass_id: null,
    });

    dataService.createBagPiece({
      bag_set_id: bagSet.id,
      tag_full: '9071366372',
      piece_index: 2,
      status: BagPieceStatus.CREATED,
      last_scan_at: null,
      station: null,
      boarding_pass_id: null,
    });
  },

  // Réinitialiser les données
  resetData: () => {
    flights = [];
    passengers = [];
    bagSets = [];
    bagPieces = [];
    scanLogs = [];
    boardingPasses = [];
  },

  // Historique des scans
  getScanLogs: (bagPieceId?: string, agentId?: string, station?: string): ScanLog[] => {
    let logs = [...scanLogs];
    
    if (bagPieceId) {
      logs = logs.filter((log) => log.bag_piece_id === bagPieceId);
    }
    if (agentId) {
      logs = logs.filter((log) => log.agent_id === agentId);
    }
    if (station) {
      logs = logs.filter((log) => log.station === station);
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getScanLogsByBagPiece: (bagPieceId: string): ScanLog[] => {
    return scanLogs
      .filter((log) => log.bag_piece_id === bagPieceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Détection des lots incomplets
  checkIncompleteBagSets: (flightId?: string): BagSet[] => {
    let sets = [...bagSets];
    
    if (flightId) {
      sets = sets.filter((bs) => bs.flight_id === flightId);
    }
    
    return sets.filter((bagSet) => {
      const pieces = bagPieces.filter((bp) => bp.bag_set_id === bagSet.id);
      const scannedPieces = pieces.filter((bp) => 
        bp.status !== BagPieceStatus.CREATED && bp.status !== BagPieceStatus.MISSING
      );
      
      // Vérifier les indices manquants
      const expectedIndices = Array.from({ length: bagSet.pieces_expected }, (_, i) => i + 1);
      const existingIndices = pieces.map((p) => p.piece_index);
      const missingIndices = expectedIndices.filter((idx) => !existingIndices.includes(idx));
      
      // Un lot est incomplet si :
      // 1. Le nombre de pièces scannées < pièces attendues
      // 2. Des indices sont manquants
      return scannedPieces.length < bagSet.pieces_expected || missingIndices.length > 0;
    });
  },

  // Recherche avancée avec filtres
  advancedSearch: (filters: {
    flightId?: string;
    station?: string;
    status?: BagPieceStatus;
    dateFrom?: string;
    dateTo?: string;
    tagFull?: string;
    pnr?: string;
    passengerName?: string;
  }): BagPiece[] => {
    let results = [...bagPieces];
    
    if (filters.tagFull) {
      results = results.filter((bp) => bp.tag_full.includes(filters.tagFull!));
    }
    
    if (filters.status) {
      results = results.filter((bp) => bp.status === filters.status);
    }
    
    if (filters.station) {
      results = results.filter((bp) => bp.station === filters.station);
    }
    
    if (filters.dateFrom || filters.dateTo) {
      results = results.filter((bp) => {
        if (!bp.last_scan_at) return false;
        const scanDate = new Date(bp.last_scan_at);
        if (filters.dateFrom && scanDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && scanDate > new Date(filters.dateTo)) return false;
        return true;
      });
    }
    
    if (filters.flightId || filters.pnr || filters.passengerName) {
      const matchingPassengers: string[] = [];
      
      if (filters.flightId) {
        passengers
          .filter((p) => p.flight_id === filters.flightId)
          .forEach((p) => matchingPassengers.push(p.id));
      }
      
      if (filters.pnr) {
        passengers
          .filter((p) => p.pnr === filters.pnr)
          .forEach((p) => matchingPassengers.push(p.id));
      }
      
      if (filters.passengerName) {
        passengers
          .filter((p) => p.name.toLowerCase().includes(filters.passengerName!.toLowerCase()))
          .forEach((p) => matchingPassengers.push(p.id));
      }
      
      const matchingBagSets = bagSets
        .filter((bs) => matchingPassengers.includes(bs.passenger_id))
        .map((bs) => bs.id);
      
      results = results.filter((bp) => matchingBagSets.includes(bp.bag_set_id));
    }
    
    return results;
  },

  // Liste des bagages manquants
  getMissingBagPieces: (flightId?: string, station?: string): BagPiece[] => {
    let missing = bagPieces.filter((bp) => bp.status === BagPieceStatus.MISSING);
    
    if (flightId) {
      const flightBagSets = bagSets
        .filter((bs) => bs.flight_id === flightId)
        .map((bs) => bs.id);
      missing = missing.filter((bp) => flightBagSets.includes(bp.bag_set_id));
    }
    
    if (station) {
      missing = missing.filter((bp) => bp.station === station);
    }
    
    return missing;
  },

  // Statistiques pour les agents
  getAgentStatistics: (agentId: string, station?: string, date?: string): {
    scansToday: number;
    scansTotal: number;
    bagsScanned: number;
    incompleteSets: number;
    missingBags: number;
  } => {
    const today = date || new Date().toISOString().split('T')[0];
    const todayStart = new Date(today).toISOString();
    const todayEnd = new Date(today).setHours(23, 59, 59, 999).toString();
    
    let logs = scanLogs.filter((log) => log.agent_id === agentId);
    
    if (station) {
      logs = logs.filter((log) => log.station === station);
    }
    
    const scansToday = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= new Date(todayStart) && logDate <= new Date(todayEnd);
    }).length;
    
    const scansTotal = logs.length;
    
    const uniqueBagPieces = new Set(logs.map((log) => log.bag_piece_id));
    const bagsScanned = uniqueBagPieces.size;
    
    const incompleteSets = dataService.checkIncompleteBagSets().length;
    
    const missingBags = dataService.getMissingBagPieces(undefined, station).length;
    
    return {
      scansToday,
      scansTotal,
      bagsScanned,
      incompleteSets,
      missingBags,
    };
  },

  // Helper: Décoder les données du code-barres (simulation)
  // Dans un vrai système, il faudrait utiliser une bibliothèque de décodage IATA/BCBP
  decodeBarcodeData: (barcodeData: string): Partial<BoardingPass> | null => {
    try {
      // Format simulé: JSON avec les données du boarding pass
      // En production, cela devrait décoder le format IATA BCBP (PDF417 ou Aztec)
      const decoded = JSON.parse(barcodeData);
      
      return {
        passenger_name: decoded.passenger_name || decoded.name || '',
        pnr: decoded.pnr || decoded.record_locator || null,
        flight_number: decoded.flight_number || decoded.flight || '',
        segment: decoded.segment || null,
        origin: decoded.origin || decoded.from || '',
        destination: decoded.destination || decoded.to || '',
        seat: decoded.seat || null,
        issued_at: decoded.issued_at || decoded.date || null,
      };
    } catch {
      // Si ce n'est pas du JSON, essayer de parser un format simple
      // Format simulé: "PNR|NAME|FLIGHT|ORIGIN|DEST|SEAT"
      const parts = barcodeData.split('|');
      if (parts.length >= 5) {
        return {
          pnr: parts[0] || null,
          passenger_name: parts[1] || '',
          flight_number: parts[2] || '',
          origin: parts[3] || '',
          destination: parts[4] || '',
          seat: parts[5] || null,
        };
      }
      return null;
    }
  },

  // Boarding Passes
  getBoardingPass: (id: string): BoardingPass | undefined => {
    return boardingPasses.find((bp) => bp.id === id);
  },

  getBoardingPassesByPnr: (pnr: string): BoardingPass[] => {
    return boardingPasses.filter((bp) => bp.pnr === pnr);
  },

  getBagPiecesByBoardingPass: (boardingPassId: string): BagPiece[] => {
    return bagPieces.filter((bp) => bp.boarding_pass_id === boardingPassId);
  },

  getPendingSyncBoardingPasses: (): BoardingPass[] => {
    return boardingPasses.filter((bp) => bp.sync_status === SyncStatus.PENDING_SYNC);
  },

  createBoardingPass: (
    boardingPass: Omit<BoardingPass, 'id' | 'created_at' | 'updated_at'>
  ): BoardingPass => {
    const now = new Date().toISOString();
    const newBoardingPass: BoardingPass = {
      ...boardingPass,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    boardingPasses.push(newBoardingPass);
    return newBoardingPass;
  },

  // Association automatique des bagages selon les règles de priorité
  associateBagPiecesToBoardingPass: (
    boardingPassId: string,
    pnr?: string | null,
    passengerName?: string,
    flightNumber?: string
  ): BagPiece[] => {
    const associated: BagPiece[] = [];
    
    // Priorité 1: Recherche par PNR exact
    if (pnr) {
      const passenger = passengers.find((p) => p.pnr === pnr);
      if (passenger) {
        const bagSet = bagSets.find((bs) => bs.passenger_id === passenger.id);
        if (bagSet) {
          const pieces = bagPieces.filter((bp) => bp.bag_set_id === bagSet.id);
          pieces.forEach((piece) => {
            if (!piece.boarding_pass_id) {
              piece.boarding_pass_id = boardingPassId;
              piece.updated_at = new Date().toISOString();
              associated.push(piece);
            }
          });
          return associated;
        }
      }
    }

    // Priorité 2: Recherche par nom + numéro de vol
    if (passengerName && flightNumber) {
      const flight = flights.find((f) => f.code.includes(flightNumber));
      if (flight) {
        const passenger = passengers.find(
          (p) =>
            p.flight_id === flight.id &&
            p.name.toLowerCase().includes(passengerName.toLowerCase())
        );
        if (passenger) {
          const bagSet = bagSets.find((bs) => bs.passenger_id === passenger.id);
          if (bagSet) {
            const pieces = bagPieces.filter((bp) => bp.bag_set_id === bagSet.id);
            pieces.forEach((piece) => {
              if (!piece.boarding_pass_id) {
                piece.boarding_pass_id = boardingPassId;
                piece.updated_at = new Date().toISOString();
                associated.push(piece);
              }
            });
          }
        }
      }
    }

    return associated;
  },

  // Associer manuellement un tag à un boarding pass
  associateBagPieceToBoardingPass: (
    boardingPassId: string,
    tagFull: string
  ): { success: boolean; bagPiece?: BagPiece; error?: string } => {
    const bagPiece = bagPieces.find((bp) => bp.tag_full === tagFull);
    
    if (!bagPiece) {
      return {
        success: false,
        error: 'Bagage non trouvé.',
      };
    }

    // Vérifier si le tag est déjà associé à un autre boarding pass
    if (bagPiece.boarding_pass_id && bagPiece.boarding_pass_id !== boardingPassId) {
      return {
        success: false,
        error: 'Ce bagage est déjà associé à un autre boarding pass.',
      };
    }

    bagPiece.boarding_pass_id = boardingPassId;
    bagPiece.updated_at = new Date().toISOString();

    return {
      success: true,
      bagPiece,
    };
  },

  // Scanner un boarding pass
  scanBoardingPass: (
    barcodeData: string,
    station: string,
    agentId: string,
    isOnline: boolean = true
  ): { success: true; result: BoardingPassScanResult } | { success: false; error: string } => {
    // Vérifier que la station est valide
    const airport = getAirportByCode(station);
    if (!airport) {
      return {
        success: false,
        error: 'Station invalide.',
      };
    }

    // Décoder les données du code-barres
    const decoded = dataService.decodeBarcodeData(barcodeData);
    if (!decoded) {
      return {
        success: false,
        error: 'Impossible de décoder les données du code-barres.',
      };
    }

    // Vérifier que les champs requis sont présents
    if (!decoded.passenger_name || !decoded.flight_number || !decoded.origin || !decoded.destination) {
      return {
        success: false,
        error: 'Données du boarding pass incomplètes.',
      };
    }

    // Créer ou retrouver le boarding pass
    const syncStatus = isOnline ? SyncStatus.SYNCED : SyncStatus.PENDING_SYNC;
    const existingPass = boardingPasses.find(
      (bp) => bp.barcode_data === barcodeData || (bp.pnr === decoded.pnr && decoded.pnr)
    );

    let boardingPass: BoardingPass;
    if (existingPass) {
      // Mettre à jour le boarding pass existant
      existingPass.updated_at = new Date().toISOString();
      existingPass.sync_status = syncStatus;
      boardingPass = existingPass;
    } else {
      // Créer un nouveau boarding pass
      boardingPass = dataService.createBoardingPass({
        passenger_name: decoded.passenger_name,
        pnr: decoded.pnr || null,
        barcode_data: barcodeData, // En production, cela devrait être chiffré
        flight_number: decoded.flight_number,
        segment: decoded.segment || null,
        origin: decoded.origin,
        destination: decoded.destination,
        seat: decoded.seat || null,
        issued_at: decoded.issued_at || new Date().toISOString(),
        sync_status: syncStatus,
      });
    }

    // Associer automatiquement les bagages
    const associatedBagPieces = dataService.associateBagPiecesToBoardingPass(
      boardingPass.id,
      decoded.pnr || null,
      decoded.passenger_name,
      decoded.flight_number
    );

    // Trouver le passager et le vol associés
    let passenger: Passenger | null = null;
    let flight: Flight | null = null;

    if (decoded.pnr) {
      passenger = passengers.find((p) => p.pnr === decoded.pnr) || null;
    } else if (decoded.passenger_name && decoded.flight_number) {
      const foundFlight = flights.find((f) => f.code.includes(decoded.flight_number || ''));
      if (foundFlight) {
        flight = foundFlight;
        passenger =
          passengers.find(
            (p) =>
              p.flight_id === foundFlight.id &&
              p.name.toLowerCase().includes(decoded.passenger_name?.toLowerCase() || '')
          ) || null;
      }
    }

    // Créer un log de scan
    if (associatedBagPieces.length > 0) {
      associatedBagPieces.forEach((piece) => {
        const scanLog: ScanLog = {
          id: generateId(),
          bag_piece_id: piece.id,
          action: ScanAction.BOARDING_PASS_SCANNED,
          agent_id: agentId,
          station,
          timestamp: new Date().toISOString(),
        };
        scanLogs.push(scanLog);
      });
    }

    return {
      success: true,
      result: {
        boardingPass,
        associatedBagPieces,
        passenger,
        flight,
      },
    };
  },
};

