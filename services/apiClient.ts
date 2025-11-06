// Client API pour Supabase - Wrapper autour du client Supabase
import { supabase } from '@/config/supabase';
import {
  Flight,
  Passenger,
  BagSet,
  BagPiece,
  ScanLog,
  BoardingPass,
  BaggageSearchResult,
  ScanAction,
  BagPieceStatus,
  Notification,
  User,
} from '@/types';
import { ErrorHandler, withErrorHandling, AppError } from './errorHandler';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fonction helper pour gérer les erreurs Supabase
const handleSupabaseError = (error: any, context?: string): never => {
  const appError = ErrorHandler.parseError(error);
  ErrorHandler.logError(appError, context);
  
  // Convertir AppError en ApiError pour compatibilité
  throw new ApiError(
    ErrorHandler.getUserMessage(appError),
    appError.statusCode,
    appError.code
  );
};

// Fonction helper pour convertir les dates PostgreSQL en ISO strings
const formatDate = (date: string | null): string | null => {
  if (!date) return null;
  return new Date(date).toISOString();
};

export const apiClient = {
  // ============ FLIGHTS ============
  async getFlight(id: string): Promise<Flight | null> {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleSupabaseError(error, 'getFlight');
    }

    return data ? {
      ...data,
      date: data.date,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async getFlights(): Promise<Flight[]> {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .order('date', { ascending: false });

    if (error) handleSupabaseError(error, 'getFlights');

    return (data || []).map((flight) => ({
      ...flight,
      date: flight.date,
      created_at: formatDate(flight.created_at) || new Date().toISOString(),
      updated_at: formatDate(flight.updated_at) || new Date().toISOString(),
    }));
  },

  async createFlight(flight: Omit<Flight, 'id' | 'created_at' | 'updated_at'>): Promise<Flight> {
    const { data, error } = await supabase
      .from('flights')
      .insert({
        code: flight.code,
        date: flight.date,
        route: flight.route,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      date: data.date,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async updateFlight(
    id: string,
    updates: Partial<Omit<Flight, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Flight> {
    const { data, error } = await supabase
      .from('flights')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      date: data.date,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async deleteFlight(id: string): Promise<void> {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error, 'createFlight');
  },

  // ============ PASSENGERS ============
  async getPassenger(id: string): Promise<Passenger | null> {
    const { data, error } = await supabase
      .from('passengers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error);
    }

    return data ? {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async getPassengersByFlight(flightId: string): Promise<Passenger[]> {
    const { data, error } = await supabase
      .from('passengers')
      .select('*')
      .eq('flight_id', flightId)
      .order('name');

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((passenger) => ({
      ...passenger,
      created_at: formatDate(passenger.created_at) || new Date().toISOString(),
      updated_at: formatDate(passenger.updated_at) || new Date().toISOString(),
    }));
  },

  async createPassenger(
    passenger: Omit<Passenger, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Passenger> {
    const { data, error } = await supabase
      .from('passengers')
      .insert({
        name: passenger.name,
        pnr: passenger.pnr,
        flight_id: passenger.flight_id,
        pieces_declared: passenger.pieces_declared,
        status: passenger.status,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async updatePassenger(
    id: string,
    updates: Partial<Omit<Passenger, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Passenger> {
    const { data, error } = await supabase
      .from('passengers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async getPassengersByPnr(pnr: string): Promise<Passenger[]> {
    const { data, error } = await supabase
      .from('passengers')
      .select('*')
      .eq('pnr', pnr)
      .order('name');

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((passenger) => ({
      ...passenger,
      created_at: formatDate(passenger.created_at) || new Date().toISOString(),
      updated_at: formatDate(passenger.updated_at) || new Date().toISOString(),
    }));
  },

  async getPassengersByName(name: string): Promise<Passenger[]> {
    const { data, error } = await supabase
      .from('passengers')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('name');

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((passenger) => ({
      ...passenger,
      created_at: formatDate(passenger.created_at) || new Date().toISOString(),
      updated_at: formatDate(passenger.updated_at) || new Date().toISOString(),
    }));
  },

  // ============ BAG SETS ============
  async getBagSet(id: string): Promise<BagSet | null> {
    const { data, error } = await supabase
      .from('bag_sets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error);
    }

    return data ? {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async getBagSetByPassenger(passengerId: string): Promise<BagSet | null> {
    const { data, error } = await supabase
      .from('bag_sets')
      .select('*')
      .eq('passenger_id', passengerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error);
    }

    return data ? {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async createBagSet(
    bagSet: Omit<BagSet, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BagSet> {
    const { data, error } = await supabase
      .from('bag_sets')
      .insert({
        passenger_id: bagSet.passenger_id,
        flight_id: bagSet.flight_id,
        base_tag: bagSet.base_tag,
        pieces_expected: bagSet.pieces_expected,
        status: bagSet.status,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async updateBagSet(
    id: string,
    updates: Partial<Omit<BagSet, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<BagSet> {
    const { data, error } = await supabase
      .from('bag_sets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  // ============ BAG PIECES ============
  async getBagPiece(id: string): Promise<BagPiece | null> {
    const { data, error } = await supabase
      .from('bag_pieces')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error);
    }

    return data ? {
      ...data,
      last_scan_at: formatDate(data.last_scan_at),
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async getBagPieceByTag(tagFull: string): Promise<BagPiece | null> {
    const { data, error } = await supabase
      .from('bag_pieces')
      .select('*')
      .eq('tag_full', tagFull)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error);
    }

    return data ? {
      ...data,
      last_scan_at: formatDate(data.last_scan_at),
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async getBagPiecesBySet(bagSetId: string): Promise<BagPiece[]> {
    const { data, error } = await supabase
      .from('bag_pieces')
      .select('*')
      .eq('bag_set_id', bagSetId)
      .order('piece_index');

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((piece) => ({
      ...piece,
      last_scan_at: formatDate(piece.last_scan_at),
      created_at: formatDate(piece.created_at) || new Date().toISOString(),
      updated_at: formatDate(piece.updated_at) || new Date().toISOString(),
    }));
  },

  async createBagPiece(
    bagPiece: Omit<BagPiece, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BagPiece> {
    const { data, error } = await supabase
      .from('bag_pieces')
      .insert({
        bag_set_id: bagPiece.bag_set_id,
        tag_full: bagPiece.tag_full,
        piece_index: bagPiece.piece_index,
        status: bagPiece.status,
        last_scan_at: bagPiece.last_scan_at,
        station: bagPiece.station,
        boarding_pass_id: bagPiece.boarding_pass_id,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      last_scan_at: formatDate(data.last_scan_at),
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async updateBagPiece(
    id: string,
    updates: Partial<Omit<BagPiece, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<BagPiece> {
    const { data, error } = await supabase
      .from('bag_pieces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      last_scan_at: formatDate(data.last_scan_at),
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  // ============ SCAN LOGS ============
  async createScanLog(scanLog: Omit<ScanLog, 'id' | 'timestamp'>): Promise<ScanLog> {
    const { data, error } = await supabase
      .from('scan_logs')
      .insert({
        bag_piece_id: scanLog.bag_piece_id,
        action: scanLog.action,
        agent_id: scanLog.agent_id,
        station: scanLog.station,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      timestamp: formatDate(data.timestamp) || new Date().toISOString(),
    };
  },

  async getScanLogs(filters?: {
    bagPieceId?: string;
    agentId?: string;
    station?: string;
  }): Promise<ScanLog[]> {
    let query = supabase
      .from('scan_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters?.bagPieceId) {
      query = query.eq('bag_piece_id', filters.bagPieceId);
    }
    if (filters?.agentId) {
      query = query.eq('agent_id', filters.agentId);
    }
    if (filters?.station) {
      query = query.eq('station', filters.station);
    }

    const { data, error } = await query;

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((log) => ({
      ...log,
      timestamp: formatDate(log.timestamp) || new Date().toISOString(),
    }));
  },

  // ============ BOARDING PASSES ============
  async getBoardingPass(id: string): Promise<BoardingPass | null> {
    const { data, error } = await supabase
      .from('boarding_passes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error);
    }

    return data ? {
      ...data,
      issued_at: formatDate(data.issued_at),
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async getBoardingPassesByPnr(pnr: string): Promise<BoardingPass[]> {
    const { data, error } = await supabase
      .from('boarding_passes')
      .select('*')
      .eq('pnr', pnr)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((pass) => ({
      ...pass,
      issued_at: formatDate(pass.issued_at),
      created_at: formatDate(pass.created_at) || new Date().toISOString(),
      updated_at: formatDate(pass.updated_at) || new Date().toISOString(),
    }));
  },

  async getAllBoardingPasses(): Promise<BoardingPass[]> {
    const { data, error } = await supabase
      .from('boarding_passes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((pass) => ({
      ...pass,
      issued_at: formatDate(pass.issued_at),
      created_at: formatDate(pass.created_at) || new Date().toISOString(),
      updated_at: formatDate(pass.updated_at) || new Date().toISOString(),
    }));
  },

  async createBoardingPass(
    boardingPass: Omit<BoardingPass, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BoardingPass> {
    const { data, error } = await supabase
      .from('boarding_passes')
      .insert({
        passenger_name: boardingPass.passenger_name,
        pnr: boardingPass.pnr,
        barcode_data: boardingPass.barcode_data,
        flight_number: boardingPass.flight_number,
        segment: boardingPass.segment,
        origin: boardingPass.origin,
        destination: boardingPass.destination,
        seat: boardingPass.seat,
        issued_at: boardingPass.issued_at,
        sync_status: boardingPass.sync_status,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      issued_at: formatDate(data.issued_at),
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async updateBoardingPass(
    id: string,
    updates: Partial<Omit<BoardingPass, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<BoardingPass> {
    const { data, error } = await supabase
      .from('boarding_passes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      issued_at: formatDate(data.issued_at),
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async getBagPiecesByBoardingPass(boardingPassId: string): Promise<BagPiece[]> {
    const { data, error } = await supabase
      .from('bag_pieces')
      .select('*')
      .eq('boarding_pass_id', boardingPassId)
      .order('piece_index');

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((piece) => ({
      ...piece,
      last_scan_at: formatDate(piece.last_scan_at),
      created_at: formatDate(piece.created_at) || new Date().toISOString(),
      updated_at: formatDate(piece.updated_at) || new Date().toISOString(),
    }));
  },

  // ============ NOTIFICATIONS ============
  async createNotification(
    notification: Omit<Notification, 'id' | 'created_at'>
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        flight_id: notification.flight_id,
        bag_set_id: notification.bag_set_id,
        bag_piece_id: notification.bag_piece_id,
        station: notification.station,
        read: notification.read,
        expires_at: notification.expires_at,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      expires_at: formatDate(data.expires_at || null),
    };
  },

  async getNotifications(filters?: {
    station?: string;
    read?: boolean;
    type?: string;
  }): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.station) {
      query = query.eq('station', filters.station);
    }
    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) handleSupabaseError(error, 'createFlight');

    return (data || []).map((notif) => ({
      ...notif,
      created_at: formatDate(notif.created_at) || new Date().toISOString(),
      expires_at: formatDate(notif.expires_at || null),
    }));
  },

  async updateNotification(
    id: string,
    updates: Partial<Omit<Notification, 'id' | 'created_at'>>
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createFlight');

    return {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      expires_at: formatDate(data.expires_at || null),
    };
  },

  // ============ USERS ============
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleSupabaseError(error, 'getUser');
    }

    return data ? {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleSupabaseError(error, 'getUserByEmail');
    }

    return data ? {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    } : null;
  },

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, 'getUsers');

    return (data || []).map((user) => ({
      ...user,
      created_at: formatDate(user.created_at) || new Date().toISOString(),
      updated_at: formatDate(user.updated_at) || new Date().toISOString(),
    }));
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        role: user.role,
        station: user.station,
        language: user.language,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createUser');

    return {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  // Fonction pour l'inscription publique (utilise une fonction PostgreSQL qui bypass RLS)
  async registerUser(
    name: string,
    email: string,
    password: string,
    role: string,
    station: string | null,
    language: string | undefined
  ): Promise<User> {
    try {
      const { data, error } = await supabase.rpc('register_user', {
        p_name: name,
        p_email: email,
        p_password: password,
        p_role: role,
        p_station: station,
        p_language: language || null,
      });

      if (error) {
        // Si la fonction n'existe pas, utiliser la méthode classique
        if (error.message?.includes('function') || 
            error.message?.includes('does not exist') ||
            error.code === '42883' ||
            error.code === 'P0001') {
          console.warn('Fonction register_user non trouvée, utilisation de la méthode classique');
          // Fallback vers la méthode classique
          try {
            const newUser = await this.createUser({
              name,
              email,
              role: role as any,
              station,
              language: language as any,
            });
            await this.setUserPassword(newUser.id, password);
            return newUser;
          } catch (fallbackError: any) {
            // Si le fallback échoue aussi, propager l'erreur originale de la fonction RPC
            throw new ApiError(
              error.message || 'Erreur lors de l\'inscription. Veuillez vérifier que la migration SQL a été appliquée.',
              error.code ? parseInt(error.code) : 500,
              error.code
            );
          }
        }
        
        // Extraire le message d'erreur PostgreSQL si disponible
        let errorMessage = error.message || 'Erreur lors de l\'inscription';
        
        // Les erreurs PostgreSQL personnalisées sont souvent dans error.details ou error.hint
        if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        }
        
        // Gérer les erreurs spécifiques de la fonction register_user
        if (errorMessage.includes('déjà utilisé') || 
            errorMessage.includes('duplicate') || 
            errorMessage.includes('unique') ||
            error.code === '23505') {
          throw new ApiError('Cet email est déjà utilisé.', 400, error.code);
        }
        
        if (errorMessage.includes('Rôle invalide') || 
            errorMessage.includes('rôle invalide')) {
          throw new ApiError(errorMessage, 400, error.code);
        }
        
        if (errorMessage.includes('station assignée') || 
            errorMessage.includes('station')) {
          throw new ApiError(errorMessage, 400, error.code);
        }
        
        // Autres erreurs de la fonction RPC
        throw new ApiError(errorMessage, error.code ? parseInt(error.code) : 500, error.code);
      }

      // La fonction RPC retourne un objet JSON
      if (!data || typeof data !== 'object') {
        throw new ApiError('Aucune donnée retournée lors de l\'inscription. Veuillez réessayer.', 500);
      }

      const userData = data as any;
      if (!userData.id) {
        throw new ApiError('Données invalides retournées lors de l\'inscription. Veuillez réessayer.', 500);
      }

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as any,
        station: userData.station,
        language: userData.language as any,
        created_at: formatDate(userData.created_at) || new Date().toISOString(),
        updated_at: formatDate(userData.updated_at) || new Date().toISOString(),
      };
    } catch (error: any) {
      // Si c'est une erreur ApiError, la relancer
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Si c'est une erreur de permission RLS, donner un message plus clair
      if (error?.code === '42501' || 
          error?.message?.includes('permission') ||
          error?.message?.includes('policy') ||
          error?.message?.includes('RLS')) {
        throw new ApiError(
          'Erreur de configuration serveur. Veuillez contacter l\'administrateur ou vérifier que la migration SQL a été appliquée.',
          500,
          error.code
        );
      }
      
      // Sinon, essayer le fallback seulement si ce n'est pas une erreur critique
      console.warn('Erreur lors de l\'appel à register_user:', error);
      
      // Ne pas utiliser le fallback si c'est une erreur de validation ou de contrainte
      if (error?.code === '23505' || 
          error?.message?.includes('duplicate') ||
          error?.message?.includes('unique') ||
          error?.message?.includes('déjà utilisé')) {
        throw new ApiError('Cet email est déjà utilisé.', 400, error.code);
      }
      
      // Propager l'erreur avec un message clair
      throw new ApiError(
        error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer plus tard.',
        error?.code ? parseInt(error.code) : 500,
        error?.code
      );
    }
  },

  async updateUser(
    id: string,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        role: updates.role,
        station: updates.station,
        language: updates.language,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'updateUser');

    return {
      ...data,
      created_at: formatDate(data.created_at) || new Date().toISOString(),
      updated_at: formatDate(data.updated_at) || new Date().toISOString(),
    };
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error, 'deleteUser');
  },

  // ============ USER PASSWORDS ============
  async getUserPassword(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_passwords')
      .select('password')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleSupabaseError(error, 'getUserPassword');
    }

    return data?.password || null;
  },

  async setUserPassword(userId: string, password: string): Promise<void> {
    // Vérifier si un mot de passe existe déjà
    const { data: existing, error: checkError } = await supabase
      .from('user_passwords')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    // Si l'erreur est "not found", on crée un nouveau mot de passe
    // Sinon, si une erreur autre se produit, on la gère
    if (checkError && checkError.code !== 'PGRST116') {
      handleSupabaseError(checkError, 'setUserPassword');
    }

    if (existing) {
      // Mettre à jour le mot de passe existant
      const { error } = await supabase
        .from('user_passwords')
        .update({ password })
        .eq('user_id', userId);

      if (error) handleSupabaseError(error, 'setUserPassword');
    } else {
      // Créer un nouveau mot de passe
      const { error } = await supabase
        .from('user_passwords')
        .insert({
          user_id: userId,
          password,
        });

      if (error) handleSupabaseError(error, 'setUserPassword');
    }
  },

  async deleteUserPassword(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_passwords')
      .delete()
      .eq('user_id', userId);

    if (error) handleSupabaseError(error, 'deleteUserPassword');
  },
};

