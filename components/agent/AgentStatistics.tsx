import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AgentStatisticsProps {
  scansToday: number;
  scansTotal: number;
  bagsScanned: number;
  incompleteSets: number;
  missingBags: number;
}

export const AgentStatistics: React.FC<AgentStatisticsProps> = ({
  scansToday,
  scansTotal,
  bagsScanned,
  incompleteSets,
  missingBags,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    color = '#3B82F6' 
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    label: string; 
    value: number | string;
    color?: string;
  }) => (
    <ThemedView style={[
      styles.statCard,
      {
        backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
        borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
      }
    ]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <ThemedText style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: isDark ? '#D1D5DB' : '#4B5563', opacity: 1 }]}>{label}</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Statistiques
      </ThemedText>
      <View style={styles.grid}>
        <StatCard 
          icon="scan-outline" 
          label="Scans aujourd'hui" 
          value={scansToday}
          color="#3B82F6"
        />
        <StatCard 
          icon="bag-outline" 
          label="Bagages scannés" 
          value={bagsScanned}
          color="#10B981"
        />
        <StatCard 
          icon="warning-outline" 
          label="Lots incomplets" 
          value={incompleteSets}
          color="#F59E0B"
        />
        <StatCard 
          icon="alert-circle-outline" 
          label="Bagages manquants" 
          value={missingBags}
          color="#EF4444"
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});

