// Labels pour les différents statuts en français

import { BagPieceStatus, BagSetStatus, PassengerStatus, ScanAction } from '@/types';

export const BAG_PIECE_STATUS_LABELS: Record<BagPieceStatus, string> = {
  [BagPieceStatus.CREATED]: 'Créé',
  [BagPieceStatus.CHECKED_IN]: 'Enregistré',
  [BagPieceStatus.LOADED]: 'Chargé',
  [BagPieceStatus.IN_TRANSIT]: 'En transit',
  [BagPieceStatus.ARRIVED]: 'Arrivé',
  [BagPieceStatus.MISSING]: 'Manquant',
};

export const BAG_SET_STATUS_LABELS: Record<BagSetStatus, string> = {
  [BagSetStatus.INCOMPLETE]: 'Incomplet',
  [BagSetStatus.IN_PROGRESS]: 'En cours',
  [BagSetStatus.COMPLETE]: 'Complet',
  [BagSetStatus.ERROR]: 'Erreur',
};

export const PASSENGER_STATUS_LABELS: Record<PassengerStatus, string> = {
  [PassengerStatus.NO_CHECKED_BAG]: 'Aucun bagage',
  [PassengerStatus.BAGS_EXPECTED]: 'Bagages attendus',
  [PassengerStatus.BAGS_COMPLETE]: 'Bagages complets',
  [PassengerStatus.BAGS_MISSING]: 'Bagages manquants',
};

export const getBagPieceStatusColor = (status: BagPieceStatus): string => {
  const colors: Record<BagPieceStatus, string> = {
    [BagPieceStatus.CREATED]: '#6B7280', // gris
    [BagPieceStatus.CHECKED_IN]: '#3B82F6', // bleu
    [BagPieceStatus.LOADED]: '#10B981', // vert
    [BagPieceStatus.IN_TRANSIT]: '#F59E0B', // orange
    [BagPieceStatus.ARRIVED]: '#059669', // vert foncé
    [BagPieceStatus.MISSING]: '#EF4444', // rouge
  };
  return colors[status] || '#6B7280';
};

export const getBagSetStatusColor = (status: BagSetStatus): string => {
  const colors: Record<BagSetStatus, string> = {
    [BagSetStatus.INCOMPLETE]: '#F59E0B', // orange
    [BagSetStatus.IN_PROGRESS]: '#3B82F6', // bleu
    [BagSetStatus.COMPLETE]: '#10B981', // vert
    [BagSetStatus.ERROR]: '#EF4444', // rouge
  };
  return colors[status] || '#6B7280';
};

export const SCAN_ACTION_LABELS: Record<ScanAction, { label: string; color: string }> = {
  [ScanAction.CHECKED_IN]: { label: 'Enregistré', color: '#3B82F6' },
  [ScanAction.LOADED]: { label: 'Chargé', color: '#10B981' },
  [ScanAction.ARRIVED]: { label: 'Arrivé', color: '#059669' },
  [ScanAction.ERROR]: { label: 'Erreur', color: '#EF4444' },
  [ScanAction.BOARDING_PASS_SCANNED]: { label: 'Carte d\'embarquement scannée', color: '#8B5CF6' },
};

export const STATUS_LABELS = {
  ...SCAN_ACTION_LABELS,
  ...Object.fromEntries(
    Object.entries(BAG_PIECE_STATUS_LABELS).map(([key, value]) => [
      key,
      { label: value, color: getBagPieceStatusColor(key as BagPieceStatus) },
    ])
  ),
};

