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
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#334155' : '#E2E8F0',
      }
    ]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <ThemedText style={[styles.statValue, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: isDark ? '#94A3B8' : '#64748B', opacity: 1 }]}>{label}</ThemedText>
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
    padding: 0,
  },
  title: {
    marginBottom: 20,
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});

