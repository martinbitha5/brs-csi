import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BagPiece, BagSet } from '@/types';
import { StatusBadge } from './StatusBadge';
import { getAirportName } from '@/constants/airports';

interface BaggageCardProps {
  bagPiece: BagPiece;
  bagSet?: BagSet;
  showPassengerInfo?: boolean;
  passengerName?: string;
}

export const BaggageCard: React.FC<BaggageCardProps> = ({
  bagPiece,
  bagSet,
  showPassengerInfo = false,
  passengerName,
}) => {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <View>
          <ThemedText type="defaultSemiBold" style={styles.tagFull}>
            {bagPiece.tag_full}
          </ThemedText>
          {bagSet && (
            <ThemedText style={styles.pieceIndex}>
              Pièce {bagPiece.piece_index}/{bagSet.pieces_expected}
            </ThemedText>
          )}
        </View>
        <StatusBadge status={bagPiece.status} />
      </View>

      {showPassengerInfo && passengerName && (
        <View style={styles.passengerInfo}>
          <ThemedText style={styles.passengerName}>{passengerName}</ThemedText>
        </View>
      )}

      <View style={styles.details}>
        {bagPiece.station && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Station :</ThemedText>
            <ThemedText style={styles.detailValue}>
              {getAirportName(bagPiece.station)}
            </ThemedText>
          </View>
        )}
        {bagPiece.last_scan_at && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Dernier scan :</ThemedText>
            <ThemedText style={styles.detailValue}>
              {new Date(bagPiece.last_scan_at).toLocaleString('fr-FR')}
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tagFull: {
    fontSize: 18,
    marginBottom: 4,
  },
  pieceIndex: {
    fontSize: 14,
    opacity: 0.7,
  },
  passengerInfo: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

