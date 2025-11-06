import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { adminService, FlightStatistics } from '@/services/adminService';
import { apiService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Flight, UserRole } from '@/types';

export const FlightStatisticsView: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentUser = authService.getCurrentUser();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [flightStatsMap, setFlightStatsMap] = useState<Map<string, FlightStatistics>>(new Map());

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    let allFlights = await apiService.getFlights();
    
    // Filtrer les vols par station selon le rôle
    if (currentUser?.role === UserRole.SUPERVISOR && currentUser.station) {
      // Pour les superviseurs, ne montrer que les vols avec des bagages dans leur station
      const filteredFlights: Flight[] = [];
      for (const flight of allFlights) {
        const bagPieces = await apiService.advancedSearch({ 
          flightId: flight.id, 
          station: currentUser.station! 
        });
        if (bagPieces.length > 0) {
          filteredFlights.push(flight);
        }
      }
      allFlights = filteredFlights;
    }
    // Les admins voient tous les vols (pas de filtre)
    
    setFlights(allFlights);
    
    // Charger les statistiques pour tous les vols
    const statsMap = new Map<string, FlightStatistics>();
    for (const flight of allFlights) {
      const stats = await adminService.getFlightStatistics(flight.id);
      if (stats) {
        statsMap.set(flight.id, stats);
      }
    }
    setFlightStatsMap(statsMap);
  };

  const handleFlightSelect = async (flight: Flight) => {
    setLoading(true);
    const stats = await adminService.getFlightStatistics(flight.id);
    setSelectedFlight(stats);
    setLoading(false);
  };

  const FlightCard = ({ flight }: { flight: Flight }) => {
    const stats = flightStatsMap.get(flight.id) || null;
    const isSelected = selectedFlight?.flight.id === flight.id;

    return (
      <Pressable
        onPress={() => handleFlightSelect(flight)}
        style={({ pressed }) => [
          styles.flightCard,
          {
            backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
            borderColor: isSelected ? '#3B82F6' : isDark ? '#2A2A2A' : '#E5E7EB',
            borderWidth: isSelected ? 2 : 1,
          },
          pressed && styles.flightCardPressed,
        ]}>
        <View style={styles.flightHeader}>
          <ThemedText type="defaultSemiBold" style={styles.flightCode}>
            {flight.code}
          </ThemedText>
          <ThemedText style={styles.flightRoute}>{flight.route}</ThemedText>
        </View>
        {stats && (
          <View style={styles.flightStats}>
            <View style={styles.miniStat}>
              <Ionicons name="bag-outline" size={16} color="#10B981" />
              <ThemedText style={styles.miniStatText}>
                {stats.bagsLoaded}/{stats.bagsExpected}
              </ThemedText>
            </View>
            <View style={styles.miniStat}>
              <Ionicons name="pie-chart-outline" size={16} color="#3B82F6" />
              <ThemedText style={styles.miniStatText}>{stats.completionRate}%</ThemedText>
            </View>
            {stats.bagsMissing > 0 && (
              <View style={styles.miniStat}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <ThemedText style={styles.miniStatText}>{stats.bagsMissing}</ThemedText>
              </View>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Statistiques par vol</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Sélectionnez un vol pour voir les détails
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedView style={styles.section}>
          {flights.length === 0 ? (
            <ThemedText style={styles.emptyText}>Aucun vol disponible</ThemedText>
          ) : (
            flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))
          )}
        </ThemedView>

        {selectedFlight && (
          <ThemedView style={styles.detailsSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Détails du vol {selectedFlight.flight.code}
            </ThemedText>

            <View style={styles.detailsGrid}>
              <View style={styles.detailCard}>
                <ThemedText style={styles.detailLabel}>Passagers</ThemedText>
                <ThemedText style={styles.detailValue}>{selectedFlight.passengersCount}</ThemedText>
              </View>
              <View style={styles.detailCard}>
                <ThemedText style={styles.detailLabel}>Bagages attendus</ThemedText>
                <ThemedText style={styles.detailValue}>{selectedFlight.bagsExpected}</ThemedText>
              </View>
              <View style={styles.detailCard}>
                <ThemedText style={styles.detailLabel}>Bagages chargés</ThemedText>
                <ThemedText style={styles.detailValue}>{selectedFlight.bagsLoaded}</ThemedText>
              </View>
              <View style={styles.detailCard}>
                <ThemedText style={styles.detailLabel}>Bagages arrivés</ThemedText>
                <ThemedText style={styles.detailValue}>{selectedFlight.bagsArrived}</ThemedText>
              </View>
              <View style={styles.detailCard}>
                <ThemedText style={styles.detailLabel}>Bagages manquants</ThemedText>
                <ThemedText style={[styles.detailValue, { color: '#EF4444' }]}>
                  {selectedFlight.bagsMissing}
                </ThemedText>
              </View>
              <View style={styles.detailCard}>
                <ThemedText style={styles.detailLabel}>Lots incomplets</ThemedText>
                <ThemedText style={[styles.detailValue, { color: '#F59E0B' }]}>
                  {selectedFlight.incompleteSets}
                </ThemedText>
              </View>
              <View style={styles.detailCard}>
                <ThemedText style={styles.detailLabel}>Taux de complétude</ThemedText>
                <ThemedText
                  style={[
                    styles.detailValue,
                    {
                      color:
                        selectedFlight.completionRate >= 90
                          ? '#10B981'
                          : selectedFlight.completionRate >= 70
                            ? '#F59E0B'
                            : '#EF4444',
                    },
                  ]}>
                  {selectedFlight.completionRate}%
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        )}
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '600',
  },
  flightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  flightCardPressed: {
    opacity: 0.7,
  },
  flightHeader: {
    marginBottom: 8,
  },
  flightCode: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  flightRoute: {
    fontSize: 14,
    opacity: 0.7,
  },
  flightStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniStatText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsSection: {
    padding: 16,
    marginTop: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 32,
  },
});

