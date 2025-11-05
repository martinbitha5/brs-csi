import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BagPiece, BagSet, Passenger, BagPieceStatus } from '@/types';
import { BaggageCard } from './BaggageCard';
import { StatusBadge } from './StatusBadge';
import { BAG_SET_STATUS_LABELS, getBagSetStatusColor } from '@/constants/statusLabels';

interface BaggageListProps {
  bagPieces: BagPiece[];
  bagSet: BagSet | null;
  passenger: Passenger;
  flightCode?: string;
}

export const BaggageList: React.FC<BaggageListProps> = ({
  bagPieces,
  bagSet,
  passenger,
  flightCode,
}) => {
  if (passenger.pieces_declared === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          Aucun bagage enregistré
        </ThemedText>
        <View style={styles.badgeContainer}>
          <StatusBadge status={BagPieceStatus.CREATED} size="large" />
        </View>
        <ThemedText style={styles.emptyText}>
          Aucun bagage enregistré en soute.
        </ThemedText>
      </ThemedView>
    );
  }

  if (!bagSet || bagPieces.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          Aucun bagage trouvé
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Les bagages n&apos;ont pas encore été enregistrés.
        </ThemedText>
      </ThemedView>
    );
  }

  const piecesScanned = bagPieces.filter(
    (bp) => bp.status !== BagPieceStatus.CREATED && bp.status !== BagPieceStatus.MISSING
  ).length;
  const progress = `${piecesScanned}/${bagSet.pieces_expected}`;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.passengerName}>
            {passenger.name}
          </ThemedText>
          {flightCode && (
            <ThemedText style={styles.flightCode}>Vol : {flightCode}</ThemedText>
          )}
        </View>
        <View style={styles.progressContainer}>
          <ThemedText type="defaultSemiBold" style={styles.progressText}>
            Progression : {progress}
          </ThemedText>
          {bagSet && (
            <View style={styles.progressBadgeContainer}>
              <View
                style={[
                  styles.setStatusBadge,
                  {
                    backgroundColor: `${getBagSetStatusColor(bagSet.status)}20`,
                    borderColor: getBagSetStatusColor(bagSet.status),
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.setStatusText,
                    { color: getBagSetStatusColor(bagSet.status) },
                  ]}>
                  {BAG_SET_STATUS_LABELS[bagSet.status]}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </ThemedView>

      <View style={styles.list}>
        {bagPieces.map((bagPiece) => (
          <BaggageCard
            key={bagPiece.id}
            bagPiece={bagPiece}
            bagSet={bagSet}
            showPassengerInfo={false}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    marginBottom: 12,
  },
  passengerName: {
    marginBottom: 4,
  },
  flightCode: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressText: {
    fontSize: 16,
  },
  progressBadgeContainer: {
    marginLeft: 8,
  },
  setStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  setStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginBottom: 16,
  },
  badgeContainer: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
});

