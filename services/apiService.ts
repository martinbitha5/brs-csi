// Service API utilisant Supabase - Remplace dataService.ts
// Ce service utilise apiClient pour communiquer avec Supabase

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
import { apiClient } from './apiClient';

export const apiService = {
  // ============ FLIGHTS ============
  async getFlight(id: string): Promise<Flight | undefined> {
    try {
      const flight = await apiClient.getFlight(id);
      return flight || undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération du vol:', error);
      return undefined;
    }
  },

  async getFlights(): Promise<Flight[]> {
    try {
      return await apiClient.getFlights();
    } catch (error) {
      console.error('Erreur lors de la récupération des vols:', error);
      return [];
    }
  },

  async createFlight(flight: Omit<Flight, 'id' | 'created_at' | 'updated_at'>): Promise<Flight> {
    try {
      return await apiClient.createFlight(flight);
    } catch (error) {
      console.error('Erreur lors de la création du vol:', error);
      throw error;
    }
  },

  // ============ PASSENGERS ============
  async getPassenger(id: string): Promise<Passenger | undefined> {
    try {
      const passenger = await apiClient.getPassenger(id);
      return passenger || undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération du passager:', error);
      return undefined;
    }
  },

  async getPassengersByFlight(flightId: string): Promise<Passenger[]> {
    try {
      return await apiClient.getPassengersByFlight(flightId);
    } catch (error) {
      console.error('Erreur lors de la récupération des passagers:', error);
      return [];
    }
  },

  async createPassenger(
    passenger: Omit<Passenger, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Passenger> {
    try {
      return await apiClient.createPassenger(passenger);
    } catch (error) {
      console.error('Erreur lors de la création du passager:', error);
      throw error;
    }
  },

  // ============ BAG SETS ============
  async getBagSet(id: string): Promise<BagSet | undefined> {
    try {
      const bagSet = await apiClient.getBagSet(id);
      return bagSet || undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération du lot:', error);
      return undefined;
    }
  },

  async getBagSetByPassenger(passengerId: string): Promise<BagSet | undefined> {
    try {
      const bagSet = await apiClient.getBagSetByPassenger(passengerId);
      return bagSet || undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération du lot:', error);
      return undefined;
    }
  },

  async createBagSet(bagSet: Omit<BagSet, 'id' | 'created_at' | 'updated_at'>): Promise<BagSet> {
    try {
      return await apiClient.createBagSet(bagSet);
    } catch (error) {
      console.error('Erreur lors de la création du lot:', error);
      throw error;
    }
  },

  // ============ BAG PIECES ============
  async getBagPiece(id: string): Promise<BagPiece | undefined> {
    try {
      const bagPiece = await apiClient.getBagPiece(id);
      return bagPiece || undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération de la pièce:', error);
      return undefined;
    }
  },

  async getBagPieceByTag(tagFull: string): Promise<BagPiece | undefined> {
    try {
      const bagPiece = await apiClient.getBagPieceByTag(tagFull);
      return bagPiece || undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération de la pièce:', error);
      return undefined;
    }
  },

  async getBagPiecesBySet(bagSetId: string): Promise<BagPiece[]> {
    try {
      return await apiClient.getBagPiecesBySet(bagSetId);
    } catch (error) {
      console.error('Erreur lors de la récupération des pièces:', error);
      return [];
    }
  },

  async createBagPiece(
    bagPiece: Omit<BagPiece, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BagPiece> {
    try {
      return await apiClient.createBagPiece(bagPiece);
    } catch (error) {
      console.error('Erreur lors de la création de la pièce:', error);
      throw error;
    }
  },

  async updateBagPieceStatus(
    bagPieceId: string,
    status: BagPieceStatus,
    station: string,
    agentId: string
  ): Promise<BagPiece | null> {
    try {
      const now = new Date().toISOString();
      const updatedBagPiece = await apiClient.updateBagPiece(bagPieceId, {
        status,
        last_scan_at: now,
        station,
      });

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
      
      await apiClient.createScanLog({
        bag_piece_id: bagPieceId,
        action: scanAction,
        agent_id: agentId,
        station,
      });

      return updatedBagPiece;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return null;
    }
  },

  // ============ SCAN ============
  async scanBaggage(
    tagFull: string,
    station: string,
    agentId: string,
    action: ScanAction
  ): Promise<{ success: boolean; bagPiece?: BagPiece; error?: string }> {
    try {
      const bagPiece = await apiClient.getBagPieceByTag(tagFull);

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

      const updatedBagPiece = await apiService.updateBagPieceStatus(
        bagPiece.id,
        newStatus,
        station,
        agentId
      );

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
    } catch (error: any) {
      console.error('Erreur lors du scan:', error);
      return {
        success: false,
        error: error?.message || 'Erreur lors du scan du bagage.',
      };
    }
  },

  // ============ RECHERCHE ============
  async searchBaggage(
    tagFull?: string,
    pnr?: string,
    passengerName?: string
  ): Promise<BaggageSearchResult | null> {
    try {
      let passenger: Passenger | null = null;

      if (tagFull) {
        const bagPiece = await apiClient.getBagPieceByTag(tagFull);
        if (bagPiece) {
          const bagSet = await apiClient.getBagSet(bagPiece.bag_set_id);
          if (bagSet) {
            passenger = await apiClient.getPassenger(bagSet.passenger_id);
          }
        }
      } else if (pnr) {
        // Recherche par PNR
        const passengersByPnr = await apiClient.getPassengersByPnr(pnr);
        if (passengersByPnr.length > 0) {
          passenger = passengersByPnr[0];
        }
      } else if (passengerName) {
        // Recherche par nom
        const passengersByName = await apiClient.getPassengersByName(passengerName);
        if (passengersByName.length > 0) {
          passenger = passengersByName[0];
        }
      }

      if (!passenger) {
        return null;
      }

      const flight = await apiClient.getFlight(passenger.flight_id);
      if (!flight) {
        return null;
      }

      const bagSet = await apiClient.getBagSetByPassenger(passenger.id);
      const bagPiecesList = bagSet ? await apiClient.getBagPiecesBySet(bagSet.id) : [];

      return {
        passenger,
        flight,
        bagSet: bagSet || null,
        bagPieces: bagPiecesList,
      };
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return null;
    }
  },

  // ============ HISTORIQUE DES SCANS ============
  async getScanLogs(
    bagPieceId?: string,
    agentId?: string,
    station?: string
  ): Promise<ScanLog[]> {
    try {
      return await apiClient.getScanLogs({
        bagPieceId,
        agentId,
        station,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      return [];
    }
  },

  async getScanLogsByBagPiece(bagPieceId: string): Promise<ScanLog[]> {
    try {
      return await apiClient.getScanLogs({ bagPieceId });
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      return [];
    }
  },

  // ============ LOTS INCOMPLETS ============
  async checkIncompleteBagSets(flightId?: string): Promise<BagSet[]> {
    try {
      const allFlights = flightId ? [await apiClient.getFlight(flightId)] : await apiClient.getFlights();
      const incompleteSets: BagSet[] = [];

      for (const flight of allFlights.filter(Boolean)) {
        if (!flight) continue;
        const passengers = await apiClient.getPassengersByFlight(flight.id);
        
        for (const passenger of passengers) {
          const bagSet = await apiClient.getBagSetByPassenger(passenger.id);
          if (!bagSet) continue;

          const pieces = await apiClient.getBagPiecesBySet(bagSet.id);
          const scannedPieces = pieces.filter(
            (bp) => bp.status !== BagPieceStatus.CREATED && bp.status !== BagPieceStatus.MISSING
          );

          // Vérifier les indices manquants
          const expectedIndices = Array.from(
            { length: bagSet.pieces_expected },
            (_, i) => i + 1
          );
          const existingIndices = pieces.map((p) => p.piece_index);
          const missingIndices = expectedIndices.filter((idx) => !existingIndices.includes(idx));

          // Un lot est incomplet si :
          // 1. Le nombre de pièces scannées < pièces attendues
          // 2. Des indices sont manquants
          if (scannedPieces.length < bagSet.pieces_expected || missingIndices.length > 0) {
            incompleteSets.push(bagSet);
          }
        }
      }

      return incompleteSets;
    } catch (error) {
      console.error('Erreur lors de la vérification des lots incomplets:', error);
      return [];
    }
  },

  // ============ RECHERCHE AVANCÉE ============
  async advancedSearch(filters: {
    flightId?: string;
    station?: string;
    status?: BagPieceStatus;
    dateFrom?: string;
    dateTo?: string;
    tagFull?: string;
    pnr?: string;
    passengerName?: string;
  }): Promise<BagPiece[]> {
    try {
      // Pour l'instant, implémentation simplifiée
      // TODO: Implémenter une recherche plus efficace avec des requêtes SQL optimisées
      const allFlights = filters.flightId
        ? [await apiClient.getFlight(filters.flightId)]
        : await apiClient.getFlights();
      
      let results: BagPiece[] = [];

      for (const flight of allFlights.filter(Boolean)) {
        if (!flight) continue;
        const passengers = await apiClient.getPassengersByFlight(flight.id);
        
        for (const passenger of passengers) {
          // Filtrer par PNR ou nom si nécessaire
          if (filters.pnr && passenger.pnr !== filters.pnr) continue;
          if (filters.passengerName && !passenger.name.toLowerCase().includes(filters.passengerName.toLowerCase())) {
            continue;
          }

          const bagSet = await apiClient.getBagSetByPassenger(passenger.id);
          if (!bagSet) continue;

          const pieces = await apiClient.getBagPiecesBySet(bagSet.id);
          
          // Appliquer les filtres
          let filteredPieces = pieces;
          
          if (filters.tagFull) {
            filteredPieces = filteredPieces.filter((bp) => bp.tag_full.includes(filters.tagFull!));
          }
          if (filters.status) {
            filteredPieces = filteredPieces.filter((bp) => bp.status === filters.status);
          }
          if (filters.station) {
            filteredPieces = filteredPieces.filter((bp) => bp.station === filters.station);
          }
          if (filters.dateFrom || filters.dateTo) {
            filteredPieces = filteredPieces.filter((bp) => {
              if (!bp.last_scan_at) return false;
              const scanDate = new Date(bp.last_scan_at);
              if (filters.dateFrom && scanDate < new Date(filters.dateFrom)) return false;
              if (filters.dateTo && scanDate > new Date(filters.dateTo)) return false;
              return true;
            });
          }

          results.push(...filteredPieces);
        }
      }

      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche avancée:', error);
      return [];
    }
  },

  // ============ BAGAGES MANQUANTS ============
  async getMissingBagPieces(flightId?: string, station?: string): Promise<BagPiece[]> {
    try {
      const allFlights = flightId ? [await apiClient.getFlight(flightId)] : await apiClient.getFlights();
      const missingPieces: BagPiece[] = [];

      for (const flight of allFlights.filter(Boolean)) {
        if (!flight) continue;
        const passengers = await apiClient.getPassengersByFlight(flight.id);
        
        for (const passenger of passengers) {
          const bagSet = await apiClient.getBagSetByPassenger(passenger.id);
          if (!bagSet) continue;

          const pieces = await apiClient.getBagPiecesBySet(bagSet.id);
          const missing = pieces.filter((bp) => bp.status === BagPieceStatus.MISSING);
          
          if (station) {
            missingPieces.push(...missing.filter((bp) => bp.station === station));
          } else {
            missingPieces.push(...missing);
          }
        }
      }

      return missingPieces;
    } catch (error) {
      console.error('Erreur lors de la récupération des bagages manquants:', error);
      return [];
    }
  },

  // ============ STATISTIQUES AGENT ============
  async getAgentStatistics(
    agentId: string,
    station?: string,
    date?: string
  ): Promise<{
    scansToday: number;
    scansTotal: number;
    bagsScanned: number;
    incompleteSets: number;
    missingBags: number;
  }> {
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const todayStart = new Date(today).toISOString();
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const logs = await apiClient.getScanLogs({ agentId, station });
      
      const scansToday = logs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= new Date(todayStart) && logDate <= todayEnd;
      }).length;

      const scansTotal = logs.length;
      const uniqueBagPieces = new Set(logs.map((log) => log.bag_piece_id));
      const bagsScanned = uniqueBagPieces.size;

      const incompleteSets = (await apiService.checkIncompleteBagSets()).length;
      const missingBags = (await apiService.getMissingBagPieces(undefined, station)).length;

      return {
        scansToday,
        scansTotal,
        bagsScanned,
        incompleteSets,
        missingBags,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        scansToday: 0,
        scansTotal: 0,
        bagsScanned: 0,
        incompleteSets: 0,
        missingBags: 0,
      };
    }
  },

  // ============ BOARDING PASSES ============
  async getBoardingPass(id: string): Promise<BoardingPass | undefined> {
    try {
      const boardingPass = await apiClient.getBoardingPass(id);
      return boardingPass || undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération du boarding pass:', error);
      return undefined;
    }
  },

  async getBoardingPassesByPnr(pnr: string): Promise<BoardingPass[]> {
    try {
      return await apiClient.getBoardingPassesByPnr(pnr);
    } catch (error) {
      console.error('Erreur lors de la récupération des boarding passes:', error);
      return [];
    }
  },

  async getBagPiecesByBoardingPass(boardingPassId: string): Promise<BagPiece[]> {
    try {
      return await apiClient.getBagPiecesByBoardingPass(boardingPassId);
    } catch (error) {
      console.error('Erreur lors de la récupération des pièces:', error);
      return [];
    }
  },

  async getPendingSyncBoardingPasses(): Promise<BoardingPass[]> {
    try {
      const allBoardingPasses = await apiClient.getAllBoardingPasses();
      return allBoardingPasses.filter((bp) => bp.sync_status === SyncStatus.PENDING_SYNC);
    } catch (error) {
      console.error('Erreur lors de la récupération des boarding passes:', error);
      return [];
    }
  },

  async createBoardingPass(
    boardingPass: Omit<BoardingPass, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BoardingPass> {
    try {
      return await apiClient.createBoardingPass(boardingPass);
    } catch (error) {
      console.error('Erreur lors de la création du boarding pass:', error);
      throw error;
    }
  },

  // Décoder les données du code-barres (même logique que dataService)
  decodeBarcodeData(barcodeData: string): Partial<BoardingPass> | null {
    try {
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

  async associateBagPiecesToBoardingPass(
    boardingPassId: string,
    pnr?: string | null,
    passengerName?: string,
    flightNumber?: string
  ): Promise<BagPiece[]> {
    try {
      const associated: BagPiece[] = [];

      // Priorité 1: Recherche par PNR exact
      if (pnr) {
        const allFlights = await apiClient.getFlights();
        for (const flight of allFlights) {
          const passengers = await apiClient.getPassengersByFlight(flight.id);
          const passenger = passengers.find((p) => p.pnr === pnr);
          if (passenger) {
            const bagSet = await apiClient.getBagSetByPassenger(passenger.id);
            if (bagSet) {
              const pieces = await apiClient.getBagPiecesBySet(bagSet.id);
              for (const piece of pieces) {
                if (!piece.boarding_pass_id) {
                  await apiClient.updateBagPiece(piece.id, { boarding_pass_id: boardingPassId });
                  associated.push({ ...piece, boarding_pass_id: boardingPassId });
                }
              }
              return associated;
            }
          }
        }
      }

      // Priorité 2: Recherche par nom + numéro de vol
      if (passengerName && flightNumber) {
        const allFlights = await apiClient.getFlights();
        const flight = allFlights.find((f) => f.code.includes(flightNumber));
        if (flight) {
          const passengers = await apiClient.getPassengersByFlight(flight.id);
          const passenger = passengers.find((p) =>
            p.name.toLowerCase().includes(passengerName.toLowerCase())
          );
          if (passenger) {
            const bagSet = await apiClient.getBagSetByPassenger(passenger.id);
            if (bagSet) {
              const pieces = await apiClient.getBagPiecesBySet(bagSet.id);
              for (const piece of pieces) {
                if (!piece.boarding_pass_id) {
                  await apiClient.updateBagPiece(piece.id, { boarding_pass_id: boardingPassId });
                  associated.push({ ...piece, boarding_pass_id: boardingPassId });
                }
              }
            }
          }
        }
      }

      return associated;
    } catch (error) {
      console.error('Erreur lors de l\'association:', error);
      return [];
    }
  },

  async associateBagPieceToBoardingPass(
    boardingPassId: string,
    tagFull: string
  ): Promise<{ success: boolean; bagPiece?: BagPiece; error?: string }> {
    try {
      const bagPiece = await apiClient.getBagPieceByTag(tagFull);

      if (!bagPiece) {
        return {
          success: false,
          error: 'Bagage non trouvé.',
        };
      }

      if (bagPiece.boarding_pass_id && bagPiece.boarding_pass_id !== boardingPassId) {
        return {
          success: false,
          error: 'Ce bagage est déjà associé à un autre boarding pass.',
        };
      }

      const updated = await apiClient.updateBagPiece(bagPiece.id, {
        boarding_pass_id: boardingPassId,
      });

      return {
        success: true,
        bagPiece: updated,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'association:', error);
      return {
        success: false,
        error: error?.message || 'Erreur lors de l\'association.',
      };
    }
  },

  async scanBoardingPass(
    barcodeData: string,
    station: string,
    agentId: string,
    isOnline: boolean = true
  ): Promise<{ success: true; result: BoardingPassScanResult } | { success: false; error: string }> {
    try {
      // Vérifier que la station est valide
      const airport = getAirportByCode(station);
      if (!airport) {
        return {
          success: false,
          error: 'Station invalide.',
        };
      }

      // Décoder les données du code-barres
      const decoded = apiService.decodeBarcodeData(barcodeData);
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
      
      // Chercher un boarding pass existant
      let boardingPass: BoardingPass | null = null;
      if (decoded.pnr) {
        const existing = await apiClient.getBoardingPassesByPnr(decoded.pnr);
        if (existing.length > 0) {
          boardingPass = existing[0];
          // Mettre à jour
          boardingPass = await apiClient.updateBoardingPass(boardingPass.id, {
            sync_status: syncStatus,
          });
        }
      }

      if (!boardingPass) {
        // Créer un nouveau boarding pass
        boardingPass = await apiClient.createBoardingPass({
          passenger_name: decoded.passenger_name,
          pnr: decoded.pnr || null,
          barcode_data: barcodeData,
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
      const associatedBagPieces = await apiService.associateBagPiecesToBoardingPass(
        boardingPass.id,
        decoded.pnr || null,
        decoded.passenger_name,
        decoded.flight_number
      );

      // Trouver le passager et le vol associés
      let passenger: Passenger | null = null;
      let flight: Flight | null = null;

      if (decoded.pnr) {
        const allFlights = await apiClient.getFlights();
        for (const f of allFlights) {
          const passengers = await apiClient.getPassengersByFlight(f.id);
          const found = passengers.find((p) => p.pnr === decoded.pnr);
          if (found) {
            passenger = found;
            flight = f;
            break;
          }
        }
      } else if (decoded.passenger_name && decoded.flight_number) {
        const allFlights = await apiClient.getFlights();
        const foundFlight = allFlights.find((f) => f.code.includes(decoded.flight_number || ''));
        if (foundFlight) {
          flight = foundFlight;
          const passengers = await apiClient.getPassengersByFlight(foundFlight.id);
          passenger =
            passengers.find((p) =>
              p.name.toLowerCase().includes(decoded.passenger_name?.toLowerCase() || '')
            ) || null;
        }
      }

      // Créer des logs de scan pour les bagages associés
      if (associatedBagPieces.length > 0) {
        for (const piece of associatedBagPieces) {
          await apiClient.createScanLog({
            bag_piece_id: piece.id,
            action: ScanAction.BOARDING_PASS_SCANNED,
            agent_id: agentId,
            station,
          });
        }
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
    } catch (error: any) {
      console.error('Erreur lors du scan du boarding pass:', error);
      return {
        success: false,
        error: error?.message || 'Erreur lors du scan du boarding pass.',
      };
    }
  },

  // ============ INITIALISATION DES DONNÉES DE TEST ============
  async initializeTestData(): Promise<void> {
    try {
      // Créer un vol de test
      const flight = await apiService.createFlight({
        code: 'FIH-FKI',
        date: new Date().toISOString().split('T')[0],
        route: 'Kinshasa → Kisangani',
      });

      // Créer un passager avec bagages
      const passenger = await apiService.createPassenger({
        name: 'Jean Doe',
        pnr: 'ABC123',
        flight_id: flight.id,
        pieces_declared: 2,
        status: PassengerStatus.BAGS_EXPECTED,
      });

      // Créer un lot de bagages
      const bagSet = await apiService.createBagSet({
        passenger_id: passenger.id,
        flight_id: flight.id,
        base_tag: '907136637',
        pieces_expected: 2,
        status: BagSetStatus.IN_PROGRESS,
      });

      // Créer les pièces de bagage
      await apiService.createBagPiece({
        bag_set_id: bagSet.id,
        tag_full: '9071366371',
        piece_index: 1,
        status: BagPieceStatus.CHECKED_IN,
        last_scan_at: null,
        station: null,
        boarding_pass_id: null,
      });

      await apiService.createBagPiece({
        bag_set_id: bagSet.id,
        tag_full: '9071366372',
        piece_index: 2,
        status: BagPieceStatus.CREATED,
        last_scan_at: null,
        station: null,
        boarding_pass_id: null,
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données de test:', error);
    }
  },

  // ============ RÉINITIALISATION (pour compatibilité) ============
  async resetData(): Promise<void> {
    // Cette fonction n'est plus nécessaire avec Supabase
    // Les données sont persistées dans la base de données
    console.warn('resetData() n\'est plus nécessaire avec Supabase');
  },
};

