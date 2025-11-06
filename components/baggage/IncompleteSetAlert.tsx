import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BagSet, BagPiece } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface IncompleteSetAlertProps {
  bagSet: BagSet;
  bagPieces: BagPiece[];
  onPress?: () => void;
}

export const IncompleteSetAlert: React.FC<IncompleteSetAlertProps> = ({
  bagSet,
  bagPieces,
  onPress,
}) => {
  const scannedPieces = bagPieces.filter(
    (bp) => bp.status !== 'created' && bp.status !== 'missing'
  ).length;
  
  const expectedIndices = Array.from(
    { length: bagSet.pieces_expected },
    (_, i) => i + 1
  );
  const existingIndices = bagPieces.map((p) => p.piece_index);
  const missingIndices = expectedIndices.filter((idx) => !existingIndices.includes(idx));
  
  const isIncomplete = scannedPieces < bagSet.pieces_expected || missingIndices.length > 0;

  if (!isIncomplete) {
    return null;
  }

  const content = (
    <ThemedView style={styles.alert}>
      <View style={styles.alertHeader}>
        <Ionicons name="warning" size={24} color="#F59E0B" />
        <ThemedText type="defaultSemiBold" style={styles.alertTitle}>
          Lot incomplet
        </ThemedText>
      </View>
      <ThemedText style={styles.alertMessage}>
        Progression : {scannedPieces}/{bagSet.pieces_expected} pièces scannées
      </ThemedText>
      {missingIndices.length > 0 && (
        <ThemedText style={styles.alertDetails}>
          Indices manquants : {missingIndices.join(', ')}
        </ThemedText>
      )}
      <ThemedText style={styles.alertAction}>
        Contactez vos collègues pour vérifier les pièces manquantes
      </ThemedText>
    </ThemedView>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  alert: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginVertical: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    color: '#92400E',
  },
  alertMessage: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  alertDetails: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 8,
    fontWeight: '500',
  },
  alertAction: {
    fontSize: 12,
    color: '#78350F',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

