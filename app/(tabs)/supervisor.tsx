import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import {
  SupervisorDashboard,
  FlightStatisticsView,
  UserManagementView,
  FlightManagementView,
  ExportDataView,
  ManualEditView,
} from '@/components/supervisor';
import { authService } from '@/services/authService';
import { UserRole } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SupervisorView = 'dashboard' | 'statistics' | 'flights' | 'users' | 'export' | 'manual-edit';

export default function SupervisorScreen() {
  const [currentView, setCurrentView] = useState<SupervisorView>('dashboard');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Si l'utilisateur n'est pas superviseur ou admin, afficher un message
  if (!currentUser || (!authService.isSupervisorOrAdmin())) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top']}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="title">Accès non autorisé</ThemedText>
          <ThemedText style={styles.errorText}>
            Vous devez être superviseur ou administrateur pour accéder à cette section.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <SupervisorDashboard
            onNavigateToStatistics={() => setCurrentView('statistics')}
            onNavigateToFlights={() => setCurrentView('flights')}
            onNavigateToUsers={() => setCurrentView('users')}
            onNavigateToExport={() => setCurrentView('export')}
            onNavigateToManualEdit={() => setCurrentView('manual-edit')}
          />
        );
      case 'statistics':
        return <FlightStatisticsView />;
      case 'flights':
        return isAdmin ? <FlightManagementView /> : <FlightStatisticsView />;
      case 'users':
        return isAdmin ? <UserManagementView /> : null;
      case 'export':
        return <ExportDataView />;
      case 'manual-edit':
        return <ManualEditView />;
      default:
        return (
          <SupervisorDashboard
            onNavigateToStatistics={() => setCurrentView('statistics')}
            onNavigateToFlights={() => setCurrentView('flights')}
            onNavigateToUsers={() => setCurrentView('users')}
            onNavigateToExport={() => setCurrentView('export')}
            onNavigateToManualEdit={() => setCurrentView('manual-edit')}
          />
        );
    }
  };

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      ...styles.header,
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
      borderBottomColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
    headerContent: {
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      {currentView !== 'dashboard' && (
        <ThemedView style={dynamicStyles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <Pressable
                onPress={() => setCurrentView('dashboard')}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}>
                <Ionicons name="arrow-back" size={24} color={isDark ? '#ECEDEE' : '#11181C'} />
              </Pressable>
              <ThemedText type="title" style={styles.headerTitle}>
                {currentView === 'statistics' && 'Statistiques'}
                {currentView === 'flights' && 'Gestion des vols'}
                {currentView === 'users' && 'Gestion des utilisateurs'}
                {currentView === 'export' && 'Exporter les données'}
                {currentView === 'manual-edit' && 'Édition manuelle'}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      )}
      {renderView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

