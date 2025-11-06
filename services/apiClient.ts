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
};

