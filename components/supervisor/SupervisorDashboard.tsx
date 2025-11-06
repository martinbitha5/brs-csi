import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { adminService, SupervisorStatistics } from '@/services/adminService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { UserRole } from '@/types';

interface SupervisorDashboardProps {
  onNavigateToStatistics?: () => void;
  onNavigateToFlights?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToExport?: () => void;
  onNavigateToManualEdit?: () => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  onNavigateToStatistics,
  onNavigateToFlights,
  onNavigateToUsers,
  onNavigateToExport,
  onNavigateToManualEdit,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const [statistics, setStatistics] = useState<SupervisorStatistics>({
    totalFlights: 0,
    totalPassengers: 0,
    totalBagPieces: 0,
    bagsScanned: 0,
    incompleteSets: 0,
    missingBags: 0,
    completionRate: 0,
    flightsWithMissingBags: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    // Passer la station de l'utilisateur pour filtrer les statistiques
    const userStation = currentUser?.station || undefined;
    const stats = await adminService.getSupervisorStatistics(undefined, userStation);
    setStatistics(stats);
  };

  const StatCard = ({
    icon,
    label,
    value,
    color = '#3B82F6',
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: number | string;
    color?: string;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCard,
        {
          backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
          borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
        },
        pressed && styles.statCardPressed,
      ]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </Pressable>
  );

  const ActionCard = ({
    icon,
    title,
    description,
    color,
    onPress,
    adminOnly = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    color: string;
    onPress: () => void;
    adminOnly?: boolean;
  }) => {
    if (adminOnly && !isAdmin) return null;

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.actionCard,
          {
            backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
            borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
          },
          pressed && styles.actionCardPressed,
        ]}>
        <Ionicons name={icon} size={32} color={color} />
        <View style={styles.actionContent}>
          <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
            {title}
          </ThemedText>
          <ThemedText style={styles.actionDescription}>{description}</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Tableau de bord</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          {isAdmin ? 'Administrateur' : 'Superviseur'}
        </ThemedText>
        {currentUser && (
          <ThemedText style={styles.userInfo}>
            {currentUser.name} • {currentUser.email}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Statistiques globales
          </ThemedText>
          <View style={styles.statsGrid}>
            <StatCard
              icon="airplane-outline"
              label="Vols"
              value={statistics.totalFlights}
              color="#3B82F6"
              onPress={onNavigateToFlights}
            />
            <StatCard
              icon="bag-outline"
              label="Bagages"
              value={statistics.totalBagPieces}
              color="#10B981"
            />
            <StatCard
              icon="pie-chart-outline"
              label="Complétude"
              value={`${statistics.completionRate}%`}
              color={statistics.completionRate >= 90 ? '#10B981' : '#F59E0B'}
            />
            <StatCard
              icon="warning-outline"
              label="Lots incomplets"
              value={statistics.incompleteSets}
              color="#F59E0B"
              onPress={onNavigateToManualEdit}
            />
            <StatCard
              icon="alert-circle-outline"
              label="Bagages manquants"
              value={statistics.missingBags}
              color="#EF4444"
              onPress={onNavigateToManualEdit}
            />
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Actions
          </ThemedText>

          <ActionCard
            icon="stats-chart-outline"
            title="Statistiques détaillées"
            description="Voir les statistiques par vol et par station"
            color="#3B82F6"
            onPress={() => onNavigateToStatistics?.()}
          />

          <ActionCard
            icon="airplane-outline"
            title="Gestion des vols"
            description="Créer et gérer les vols"
            color="#8B5CF6"
            onPress={() => onNavigateToFlights?.()}
            adminOnly={true}
          />

          <ActionCard
            icon="people-outline"
            title="Gestion des utilisateurs"
            description="Créer et gérer les comptes agents et superviseurs"
            color="#EC4899"
            onPress={() => onNavigateToUsers?.()}
            adminOnly={true}
          />

          <ActionCard
            icon="download-outline"
            title="Exporter les données"
            description="Exporter les données en CSV ou JSON"
            color="#10B981"
            onPress={() => onNavigateToExport?.()}
          />

          <ActionCard
            icon="create-outline"
            title="Édition manuelle"
            description="Corriger manuellement les statuts des bagages"
            color="#F59E0B"
            onPress={() => onNavigateToManualEdit?.()}
          />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.85,
  },
  userInfo: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '600',
  },
  statsGrid: {
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
  statCardPressed: {
    opacity: 0.7,
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  actionCardPressed: {
    opacity: 0.7,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 17,
    marginBottom: 6,
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
});

