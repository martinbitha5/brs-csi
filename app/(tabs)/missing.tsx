import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BaggageCard } from '@/components/baggage/BaggageCard';
import { StationSelector } from '@/components/agent/StationSelector';
import { apiService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { BagPiece, Flight, UserRole, BagSet } from '@/types';
import { AIRPORTS } from '@/constants/airports';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MissingBaggageScreen() {
  const currentUser = authService.getCurrentUser();
  const isAgent = currentUser?.role === UserRole.AGENT;
  const [currentStation, setCurrentStation] = useState<string>(
    currentUser?.station || AIRPORTS[0].code
  );
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [missingBagPieces, setMissingBagPieces] = useState<BagPiece[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bagSets, setBagSets] = useState<Map<string, BagSet>>(new Map());
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // S'assurer que la station reste celle de l'utilisateur pour les agents
  useEffect(() => {
    if (isAgent && currentUser?.station) {
      setCurrentStation(currentUser.station);
    }
  }, [currentUser, isAgent]);

  useEffect(() => {
    const initData = async () => {
      await apiService.initializeTestData();
      await loadData();
    };
    initData();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentStation, selectedFlightId]);

  const loadData = async () => {
    const allFlights = await apiService.getFlights();
    setFlights(allFlights);
    
    const missing = await apiService.getMissingBagPieces(
      selectedFlightId || undefined,
      currentStation
    );
    setMissingBagPieces(missing);
    
    // Charger les bagSets pour les bagages manquants
    const bagSetsMap = new Map<string, BagSet>();
    for (const bagPiece of missing) {
      if (bagPiece.bag_set_id && !bagSetsMap.has(bagPiece.bag_set_id)) {
        const bagSet = await apiService.getBagSet(bagPiece.bag_set_id);
        if (bagSet) {
          bagSetsMap.set(bagPiece.bag_set_id, bagSet);
        }
      }
    }
    setBagSets(bagSetsMap);
  };

  // Filtrer les vols pour ne montrer que ceux qui ont des bagages manquants dans la station actuelle
  const relevantFlights = useMemo(() => {
    const flightIdsWithMissing = new Set(
      missingBagPieces
        .map(bp => {
          const bagSet = bp.bag_set_id ? bagSets.get(bp.bag_set_id) : null;
          return bagSet?.flight_id;
        })
        .filter((id): id is string => !!id)
    );
    return flights.filter(f => flightIdsWithMissing.has(f.id));
  }, [flights, missingBagPieces, bagSets]);

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
      <ThemedView style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Ionicons 
              name="warning" 
              size={28} 
              color={isDark ? '#ECEDEE' : '#11181C'} 
              style={styles.titleIcon}
            />
            <ThemedText type="title" style={styles.title}>
              Bagages manquants
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Liste des bagages manquants par vol
          </ThemedText>
          <View style={styles.stationSelectorContainer}>
            {isAgent ? (
              // Pour les agents, afficher la station en lecture seule
              <View style={[styles.stationDisplay, { 
                backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6' 
              }]}>
                <Ionicons name="location" size={20} color="#3B82F6" />
                <ThemedText style={[styles.stationDisplayText, {
                  color: isDark ? '#ECEDEE' : '#111827'
                }]}>
                  {AIRPORTS.find(a => a.code === currentStation)?.name || currentStation}
                </ThemedText>
                <Ionicons name="lock-closed" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
            ) : (
              // Pour les superviseurs et admins, permettre le changement
              <StationSelector
                currentStation={currentStation}
                onStationChange={(station) => {
                  setCurrentStation(station);
                  setSelectedFlightId(null); // Réinitialiser le filtre de vol quand on change de station
                }}
              />
            )}
          </View>
        </View>
      </ThemedView>

      <View style={styles.filtersContainer}>
        <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
          Filtrer par vol
        </ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
          style={styles.filtersScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFlightId === null && styles.filterButtonActive,
            ]}
            onPress={() => {
              setSelectedFlightId(null);
            }}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.filterButtonText,
                selectedFlightId === null && styles.filterButtonTextActive,
              ]}
            >
              Tous les vols
            </ThemedText>
          </TouchableOpacity>
          {relevantFlights.map((flight) => (
            <TouchableOpacity
              key={flight.id}
              style={[
                styles.filterButton,
                selectedFlightId === flight.id && styles.filterButtonActive,
              ]}
              onPress={() => {
                setSelectedFlightId(flight.id);
              }}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  selectedFlightId === flight.id && styles.filterButtonTextActive,
                ]}
              >
                {flight.code}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {missingBagPieces.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
            <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
              Aucun bagage manquant
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {selectedFlightId
                ? 'Aucun bagage manquant pour ce vol.'
                : 'Aucun bagage manquant dans cette station.'}
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedText type="subtitle" style={styles.countText}>
              {missingBagPieces.length} bagage{missingBagPieces.length > 1 ? 's' : ''} manquant{missingBagPieces.length > 1 ? 's' : ''}
            </ThemedText>
            {missingBagPieces.map((bagPiece) => {
              const bagSet = bagPiece.bag_set_id
                ? bagSets.get(bagPiece.bag_set_id) || null
                : null;
              return (
                <BaggageCard
                  key={bagPiece.id}
                  bagPiece={bagPiece}
                  bagSet={bagSet || undefined}
                />
              );
            })}
          </>
        )}
      </ScrollView>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    marginLeft: 40,
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 20,
  },
  stationSelectorContainer: {
    marginTop: 12,
  },
  stationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  stationDisplayText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  filtersContainer: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  filtersScroll: {
    maxHeight: 60,
  },
  filtersScrollContent: {
    paddingRight: 16,
    paddingBottom: 4,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    alignSelf: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  countText: {
    marginBottom: 16,
    color: '#EF4444',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

