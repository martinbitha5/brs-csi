import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BagPieceStatus } from '@/types';
import { BAG_PIECE_STATUS_LABELS, getBagPieceStatusColor } from '@/constants/statusLabels';

interface StatusBadgeProps {
  status: BagPieceStatus;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const color = getBagPieceStatusColor(status);
  const label = BAG_PIECE_STATUS_LABELS[status];

  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 14 },
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}20`,
          borderColor: color,
          ...sizeStyles[size],
        },
      ]}>
      <Text style={[styles.text, { color, fontSize: sizeStyles[size].fontSize }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

