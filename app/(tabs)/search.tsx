import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { SearchInput } from '@/components/forms/SearchInput';
import { BaggageList } from '@/components/baggage/BaggageList';
import { dataService } from '@/services/dataService';
import { BaggageSearchResult } from '@/types';

export default function SearchScreen() {
  const [searchResult, setSearchResult] = useState<BaggageSearchResult | null>(null);

  useEffect(() => {
    // Initialiser les données de test
    dataService.initializeTestData();
  }, []);

  const handleSearch = (tagFull?: string, pnr?: string) => {
    const result = dataService.searchBaggage(tagFull, pnr);
    setSearchResult(result);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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

