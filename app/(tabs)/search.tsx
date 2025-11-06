import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { SearchInput } from '@/components/forms/SearchInput';
import { BaggageList } from '@/components/baggage/BaggageList';
import { apiService } from '@/services/apiService';
import { BaggageSearchResult } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [searchResult, setSearchResult] = useState<BaggageSearchResult | null>(null);
  const params = useLocalSearchParams<{ tag?: string; pnr?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Initialiser les données de test
    const initData = async () => {
      await apiService.initializeTestData();
    };
    initData();
  }, []);

  const handleSearch = useCallback(async (tagFull?: string, pnr?: string) => {
    const result = await apiService.searchBaggage(tagFull, pnr);
    setSearchResult(result);
  }, []);

  // Effectuer la recherche automatiquement si un paramètre est passé dans l'URL
  useEffect(() => {
    if (params.tag || params.pnr) {
      handleSearch(params.tag, params.pnr);
    }
  }, [params.tag, params.pnr, handleSearch]);

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
              name="search" 
              size={28} 
              color={isDark ? '#ECEDEE' : '#11181C'} 
              style={styles.titleIcon}
            />
            <ThemedText type="title" style={styles.title}>
              Rechercher
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Recherchez un bagage par tag ou PNR
          </ThemedText>
        </View>
      </ThemedView>
      <View style={styles.searchSection}>
        <SearchInput onSearch={handleSearch} />
      </View>

      {searchResult ? (
        <BaggageList
          bagPieces={searchResult.bagPieces}
          bagSet={searchResult.bagSet}
          passenger={searchResult.passenger}
          flightCode={searchResult.flight.code}
        />
      ) : (
        <ThemedView style={styles.emptyState}>
          <ThemedView style={styles.emptyContent}>
            {/* Le message sera affiché par BaggageList si nécessaire */}
          </ThemedView>
        </ThemedView>
      )}
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
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
});

