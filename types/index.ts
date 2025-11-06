// Types pour le modèle de données BRS-CSI

export enum BagPieceStatus {
  CREATED = 'created',
  CHECKED_IN = 'checked_in',
  LOADED = 'loaded',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  MISSING = 'missing',
}

export enum BagSetStatus {
  INCOMPLETE = 'incomplete',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export enum PassengerStatus {
  NO_CHECKED_BAG = 'no_checked_bag',
  BAGS_EXPECTED = 'bags_expected',
  BAGS_COMPLETE = 'bags_complete',
  BAGS_MISSING = 'bags_missing',
}

export enum ScanAction {
  CHECKED_IN = 'checked_in',
  LOADED = 'loaded',
  ARRIVED = 'arrived',
  ERROR = 'error',
  BOARDING_PASS_SCANNED = 'boarding_pass_scanned',
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING_SYNC = 'pending_sync',
}

export enum UserRole {
  AGENT = 'agent',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
}

export interface Flight {
  id: string;
  code: string;
  date: string; // ISO date string
  route: string;
  created_at: string;
  updated_at: string;
}

export interface Passenger {
  id: string;
  name: string;
  pnr: string;
  flight_id: string;
  pieces_declared: number;
  status: PassengerStatus;
  created_at: string;
  updated_at: string;
}

export interface BagSet {
  id: string;
  passenger_id: string;
  flight_id: string;
  base_tag: string;
  pieces_expected: number;
  status: BagSetStatus;
  created_at: string;
  updated_at: string;
}

export interface BagPiece {
  id: string;
  bag_set_id: string;
  tag_full: string;
  piece_index: number;
  status: BagPieceStatus;
  last_scan_at: string | null;
  station: string | null;
  boarding_pass_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScanLog {
  id: string;
  bag_piece_id: string;
  action: ScanAction;
  agent_id: string;
  station: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  station: string | null;
  language?: 'fr' | 'en' | 'lingala' | 'swahili';
  created_at: string;
  updated_at: string;
}

// Types pour les réponses API
export interface BaggageSearchResult {
  passenger: Passenger;
  flight: Flight;
  bagSet: BagSet | null;
  bagPieces: BagPiece[];
}

// Types pour les formulaires
export interface ScanFormData {
  tagFull: string;
  station: string;
}

export interface SearchFormData {
  tagFull?: string;
  pnr?: string;
  passengerName?: string;
}

export interface BoardingPass {
  id: string;
  passenger_name: string;
  pnr: string | null;
  barcode_data: string; // Données chiffrées du code-barres/QR
  flight_number: string;
  segment: number | null;
  origin: string; // Code IATA (3 caractères)
  destination: string; // Code IATA (3 caractères)
  seat: string | null;
  issued_at: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}

export interface BoardingPassScanResult {
  boardingPass: BoardingPass;
  associatedBagPieces: BagPiece[];
  passenger: Passenger | null;
  flight: Flight | null;
}

export interface BoardingPassFormData {
  barcodeData: string;
  station: string;
}

// Types pour les notifications
export enum NotificationType {
  FLIGHT_CLOSING_WITH_MISSING_BAGS = 'flight_closing_with_missing_bags',
  INCOMPLETE_BAG_SET = 'incomplete_bag_set',
  BAG_MISSING = 'bag_missing',
  FLIGHT_DEPARTING_SOON = 'flight_departing_soon',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  flight_id?: string;
  bag_set_id?: string;
  bag_piece_id?: string;
  station?: string;
  read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface FlightClosingNotification {
  flight: Flight;
  missingBagsCount: number;
  incompleteSetsCount: number;
  closingTime: string; // ISO date string
}

