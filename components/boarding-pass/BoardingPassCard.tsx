import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BoardingPass, BagPiece, SyncStatus, BagPieceStatus } from '@/types';
import { getAirportByCode } from '@/constants/airports';

interface BoardingPassCardProps {
  boardingPass: BoardingPass;
  bagPieces?: BagPiece[];
  passengerName?: string;
  flightNumber?: string;
}

export const BoardingPassCard: React.FC<BoardingPassCardProps> = ({
  boardingPass,
  bagPieces = [],
  passengerName,
  flightNumber,
}) => {
  const originAirport = getAirportByCode(boardingPass.origin);
  const destinationAirport = getAirportByCode(boardingPass.destination);
  const piecesCount = bagPieces.length;
  const piecesArrived = bagPieces.filter((bp) => bp.status === BagPieceStatus.ARRIVED).length;
  const piecesLoaded = bagPieces.filter((bp) => bp.status === BagPieceStatus.LOADED || bp.status === BagPieceStatus.ARRIVED).length;

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.passengerName}>
          {boardingPass.passenger_name || passengerName || 'Inconnu'}
        </ThemedText>
        {boardingPass.sync_status === SyncStatus.PENDING_SYNC && (
          <View style={styles.offlineBadge}>
            <ThemedText style={styles.offlineBadgeText}>Hors-ligne</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <ThemedText style={styles.label}>Vol</ThemedText>
          <ThemedText type="defaultSemiBold">{boardingPass.flight_number || flightNumber || 'N/A'}</ThemedText>
        </View>
        {boardingPass.seat && (
          <View style={styles.infoItem}>
            <ThemedText style={styles.label}>Siège</ThemedText>
            <ThemedText type="defaultSemiBold">{boardingPass.seat}</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeItem}>
          <ThemedText style={styles.routeCode}>{boardingPass.origin}</ThemedText>
          <ThemedText style={styles.routeName}>
            {originAirport?.name || boardingPass.origin}
          </ThemedText>
        </View>
        <View style={styles.arrow}>
          <ThemedText style={styles.arrowText}>→</ThemedText>
        </View>
        <View style={styles.routeItem}>
          <ThemedText style={styles.routeCode}>{boardingPass.destination}</ThemedText>
          <ThemedText style={styles.routeName}>
            {destinationAirport?.name || boardingPass.destination}
          </ThemedText>
        </View>
      </View>

      {boardingPass.pnr && (
        <View style={styles.pnrRow}>
          <ThemedText style={styles.label}>PNR</ThemedText>
          <ThemedText type="defaultSemiBold">{boardingPass.pnr}</ThemedText>
        </View>
      )}

      {piecesCount > 0 && (
        <View style={styles.baggageSection}>
          <ThemedText type="subtitle" style={styles.baggageTitle}>
            Bagages associés
          </ThemedText>
          <View style={styles.baggageStats}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{piecesCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Pièce{piecesCount > 1 ? 's' : ''}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{piecesLoaded}/{piecesCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Chargé{piecesCount > 1 ? 's' : ''}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{piecesArrived}/{piecesCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Arrivé{piecesCount > 1 ? 's' : ''}</ThemedText>
            </View>
          </View>
        </View>
      )}

      {piecesCount === 0 && (
        <View style={styles.noBaggageSection}>
          <ThemedText style={styles.noBaggageText}>Aucun bagage enregistré</ThemedText>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passengerName: {
    flex: 1,
    fontSize: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  routeItem: {
    flex: 1,
    alignItems: 'center',
  },
  routeCode: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  routeName: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  arrow: {
    paddingHorizontal: 12,
  },
  arrowText: {
    fontSize: 20,
    opacity: 0.5,
  },
  pnrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  baggageSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  baggageTitle: {
    marginBottom: 12,
  },
  baggageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  noBaggageSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  noBaggageText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  offlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  offlineBadgeText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
});

