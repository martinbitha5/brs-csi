// Service pour les fonctionnalités administratives et de supervision

import {
  Flight,
  BagPiece,
  BagPieceStatus,
  BagSet,
  BagSetStatus,
  Passenger,
  ScanLog,
  User,
  UserRole,
} from '@/types';
import { apiService } from './apiService';
import { authService } from './authService';

export interface SupervisorStatistics {
  totalFlights: number;
  totalPassengers: number;
  totalBagPieces: number;
  bagsScanned: number;
  incompleteSets: number;
  missingBags: number;
  completionRate: number;
  flightsWithMissingBags: number;
}

export interface FlightStatistics {
  flight: Flight;
  passengersCount: number;
  bagsExpected: number;
  bagsScanned: number;
  bagsLoaded: number;
  bagsArrived: number;
  bagsMissing: number;
  incompleteSets: number;
  completionRate: number;
}

export interface StationStatistics {
  station: string;
  flightsCount: number;
  bagsScanned: number;
  bagsMissing: number;
  incompleteSets: number;
}

export const adminService = {
  // Statistiques générales pour superviseur/admin (filtrées par rôle et station)
  getSupervisorStatistics: async (date?: string, station?: string): Promise<SupervisorStatistics> => {
    const currentUser = authService.getCurrentUser();
    
    // Déterminer la station à utiliser selon le rôle
    let filterStation: string | undefined = station;
    if (!filterStation && currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        // Les admins voient toutes les stations (undefined = toutes)
        filterStation = undefined;
      } else if (currentUser.role === UserRole.SUPERVISOR && currentUser.station) {
        // Les superviseurs voient uniquement leur station
        filterStation = currentUser.station;
      }
    }

    const flights = await apiService.getFlights();
    const allBagPieces = await apiService.advancedSearch({ station: filterStation });
    const incompleteSetsAll = await apiService.checkIncompleteBagSets();
    
    // Filtrer les sets incomplets par station si nécessaire
    let incompleteSets = incompleteSetsAll;
    if (filterStation) {
      const filteredSets: BagSet[] = [];
      for (const bs of incompleteSetsAll) {
        const pieces = await apiService.getBagPiecesBySet(bs.id);
        if (pieces.some((bp) => bp.station === filterStation)) {
          filteredSets.push(bs);
        }
      }
      incompleteSets = filteredSets;
    }
    const missingBags = await apiService.getMissingBagPieces(undefined, filterStation);

    const scannedBags = allBagPieces.filter(
      (bp) =>
        bp.status !== BagPieceStatus.CREATED &&
        bp.status !== BagPieceStatus.MISSING &&
        bp.last_scan_at !== null
    );

    const totalBags = allBagPieces.length;
    const completionRate =
      totalBags > 0 ? Math.round((scannedBags.length / totalBags) * 100) : 0;

    // Compter les vols avec bagages manquants (filtrés par station si nécessaire)
    const flightsWithMissingBagsSet = new Set<string>();
    for (const bp of missingBags) {
      const bagSet = await apiService.getBagSet(bp.bag_set_id);
      if (bagSet?.flight_id) {
        flightsWithMissingBagsSet.add(bagSet.flight_id);
      }
    }
    const flightsWithMissingBags = flightsWithMissingBagsSet.size;

    // Filtrer les vols par station si nécessaire
    let filteredFlights = flights;
    if (filterStation) {
      const filteredFlightsList: Flight[] = [];
      for (const flight of flights) {
        const bagPieces = await apiService.advancedSearch({ flightId: flight.id, station: filterStation });
        if (bagPieces.length > 0) {
          filteredFlightsList.push(flight);
        }
      }
      filteredFlights = filteredFlightsList;
    }

    return {
      totalFlights: filteredFlights.length,
      totalPassengers: 0, // À calculer si nécessaire
      totalBagPieces: totalBags,
      bagsScanned: scannedBags.length,
      incompleteSets: incompleteSets.length,
      missingBags: missingBags.length,
      completionRate,
      flightsWithMissingBags,
    };
  },

  // Statistiques par vol
  getFlightStatistics: async (flightId: string): Promise<FlightStatistics | null> => {
    const flight = await apiService.getFlight(flightId);
    if (!flight) return null;

    const passengers = await apiService.getPassengersByFlight(flightId);
    const bagPiecesAll = await apiService.advancedSearch({ flightId });
    
    // Récupérer les bagSets uniques
    const bagSetsMap = new Map<string, BagSet>();
    for (const bp of bagPiecesAll) {
      if (!bagSetsMap.has(bp.bag_set_id)) {
        const bagSet = await apiService.getBagSet(bp.bag_set_id);
        if (bagSet) {
          bagSetsMap.set(bp.bag_set_id, bagSet);
        }
      }
    }
    const bagSets = Array.from(bagSetsMap.values());

    const bagPieces = bagPiecesAll;
    const bagsScanned = bagPieces.filter((bp) => bp.last_scan_at !== null).length;
    const bagsLoaded = bagPieces.filter((bp) => bp.status === BagPieceStatus.LOADED).length;
    const bagsArrived = bagPieces.filter((bp) => bp.status === BagPieceStatus.ARRIVED).length;
    const bagsMissing = bagPieces.filter((bp) => bp.status === BagPieceStatus.MISSING).length;
    const incompleteSets = await apiService.checkIncompleteBagSets(flightId);

    const expectedBags = bagPieces.length;
    const completionRate =
      expectedBags > 0 ? Math.round((bagsScanned / expectedBags) * 100) : 0;

    return {
      flight,
      passengersCount: passengers.length,
      bagsExpected: expectedBags,
      bagsScanned,
      bagsLoaded,
      bagsArrived,
      bagsMissing,
      incompleteSets: incompleteSets.length,
      completionRate,
    };
  },

  // Statistiques par station (filtrées par rôle)
  getStationStatistics: async (station?: string): Promise<StationStatistics[]> => {
    const currentUser = authService.getCurrentUser();
    const airports = ['FIH', 'FKI', 'GOM', 'FBM', 'KWZ', 'KGA', 'MJM', 'GMA', 'MDK'];
    
    // Déterminer les stations à afficher selon le rôle
    let stations: string[];
    if (station) {
      stations = [station];
    } else if (currentUser?.role === UserRole.ADMIN) {
      // Les admins voient toutes les stations
      stations = airports;
    } else if (currentUser?.role === UserRole.SUPERVISOR && currentUser.station) {
      // Les superviseurs voient uniquement leur station
      stations = [currentUser.station];
    } else {
      stations = airports;
    }

    const statsPromises = stations.map(async (stat) => {
      const bagPieces = await apiService.advancedSearch({ station: stat });
      const flightsSet = new Set<string>();
      for (const bp of bagPieces) {
        const bagSet = await apiService.getBagSet(bp.bag_set_id);
        if (bagSet?.flight_id) {
          flightsSet.add(bagSet.flight_id);
        }
      }

      const incompleteSetsAll = await apiService.checkIncompleteBagSets();
      let incompleteCount = 0;
      for (const bs of incompleteSetsAll) {
        const pieces = await apiService.getBagPiecesBySet(bs.id);
        if (pieces.some((bp) => bp.station === stat)) {
          incompleteCount++;
        }
      }

      return {
        station: stat,
        flightsCount: flightsSet.size,
        bagsScanned: bagPieces.filter((bp) => bp.last_scan_at !== null).length,
        bagsMissing: bagPieces.filter((bp) => bp.status === BagPieceStatus.MISSING).length,
        incompleteSets: incompleteCount,
      };
    });

    return Promise.all(statsPromises);
  },

  // Mise à jour manuelle du statut d'un bagage (superviseur/admin)
  updateBagPieceStatusManually: async (
    bagPieceId: string,
    newStatus: BagPieceStatus,
    station: string
  ): Promise<{ success: boolean; bagPiece?: BagPiece; error?: string }> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.isSupervisorOrAdmin()) {
      return {
        success: false,
        error: 'Accès non autorisé. Seuls les superviseurs et administrateurs peuvent modifier les statuts.',
      };
    }

    const bagPiece = await apiService.getBagPiece(bagPieceId);
    if (!bagPiece) {
      return {
        success: false,
        error: 'Bagage non trouvé.',
      };
    }

    const updatedBagPiece = await apiService.updateBagPieceStatus(
      bagPieceId,
      newStatus,
      station,
      currentUser.id
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
  },

  // Export de données (superviseur/admin)
  exportData: async (format: 'csv' | 'json', filters?: {
    flightId?: string;
    station?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ success: boolean; data?: string; error?: string }> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.isSupervisorOrAdmin()) {
      return {
        success: false,
        error: 'Accès non autorisé.',
      };
    }

    const bagPieces = await apiService.advancedSearch(filters || {});
    const flights = await apiService.getFlights();

    if (format === 'json') {
      const exportDataObj = {
        exported_at: new Date().toISOString(),
        exported_by: currentUser.email,
        filters: filters || {},
        flights: flights.filter((f) => {
          if (filters?.flightId) return f.id === filters.flightId;
          return true;
        }),
        bagPieces: await Promise.all(bagPieces.map(async (bp) => {
          const bagSet = await apiService.getBagSet(bp.bag_set_id);
          const passenger = bagSet
            ? await apiService.getPassenger(bagSet.passenger_id)
            : undefined;
          const flight = passenger ? await apiService.getFlight(passenger.flight_id) : undefined;

          return {
            tag_full: bp.tag_full,
            piece_index: bp.piece_index,
            status: bp.status,
            station: bp.station,
            last_scan_at: bp.last_scan_at,
            passenger_name: passenger?.name,
            passenger_pnr: passenger?.pnr,
            flight_code: flight?.code,
            flight_route: flight?.route,
            flight_date: flight?.date,
          };
        })),
      };
      return {
        success: true,
        data: JSON.stringify(exportDataObj, null, 2),
      };
    } else {
      // Format CSV
      const headers = [
        'Tag',
        'Indice',
        'Statut',
        'Station',
        'Dernier scan',
        'Passager',
        'PNR',
        'Vol',
        'Route',
        'Date vol',
      ];
      const rows = await Promise.all(bagPieces.map(async (bp) => {
        const bagSet = await apiService.getBagSet(bp.bag_set_id);
        const passenger = bagSet ? await apiService.getPassenger(bagSet.passenger_id) : undefined;
        const flight = passenger ? await apiService.getFlight(passenger.flight_id) : undefined;

        return [
          bp.tag_full,
          bp.piece_index.toString(),
          bp.status,
          bp.station || '',
          bp.last_scan_at || '',
          passenger?.name || '',
          passenger?.pnr || '',
          flight?.code || '',
          flight?.route || '',
          flight?.date || '',
        ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',');
      }));

      const csv = [headers.join(','), ...rows].join('\n');
      return {
        success: true,
        data: csv,
      };
    }
  },

  // Gestion des utilisateurs (admin uniquement)
  getUsers: (): User[] => {
    if (!authService.isAdmin()) {
      return [];
    }
    return authService.getUsers();
  },

  createUser: (
    user: Omit<User, 'id' | 'created_at' | 'updated_at'>
  ): { success: boolean; user?: User; error?: string } => {
    return authService.createUser(user);
  },

  updateUser: (
    id: string,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ): { success: boolean; user?: User; error?: string } => {
    return authService.updateUser(id, updates);
  },

  deleteUser: (id: string): { success: boolean; error?: string } => {
    return authService.deleteUser(id);
  },

  // Gestion des vols (admin uniquement)
  createFlight: async (
    flight: Omit<Flight, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; flight?: Flight; error?: string }> => {
    if (!authService.isAdmin()) {
      return {
        success: false,
        error: 'Accès non autorisé. Seuls les administrateurs peuvent créer des vols.',
      };
    }

    const newFlight = await apiService.createFlight(flight);
    return {
      success: true,
      flight: newFlight,
    };
  },

  updateFlight: (
    id: string,
    updates: Partial<Omit<Flight, 'id' | 'created_at' | 'updated_at'>>
  ): { success: boolean; flight?: Flight; error?: string } => {
    if (!authService.isAdmin()) {
      return {
        success: false,
        error: 'Accès non autorisé. Seuls les administrateurs peuvent modifier les vols.',
      };
    }

    // Note: Cette fonctionnalité nécessiterait une méthode updateFlight dans dataService
    // Pour l'instant, on retourne une erreur
    return {
      success: false,
      error: 'Fonctionnalité de mise à jour des vols non implémentée.',
    };
  },
};

