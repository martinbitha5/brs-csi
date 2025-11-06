import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps {
  onSearch: (tagFull?: string, pnr?: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'Numéro de bagage ou PNR',
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<'tag' | 'pnr'>('tag');

  const handleSearch = () => {
    if (searchValue.trim()) {
      if (searchType === 'tag') {
        onSearch(searchValue.trim(), undefined);
      } else {
        onSearch(undefined, searchValue.trim());
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, searchType === 'tag' && styles.tabActive]}
          onPress={() => setSearchType('tag')}>
          <ThemedText
            style={[styles.tabText, searchType === 'tag' && styles.tabTextActive]}>
            Numéro de bagage
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, searchType === 'pnr' && styles.tabActive]}
          onPress={() => setSearchType('pnr')}>
          <ThemedText
            style={[styles.tabText, searchType === 'pnr' && styles.tabTextActive]}>
            PNR
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name={searchType === 'tag' ? 'bag-outline' : 'ticket-outline'}
          size={24}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searchValue.length > 0 && (
          <TouchableOpacity onPress={() => setSearchValue('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.searchButton, !searchValue.trim() && styles.searchButtonDisabled]}
        onPress={handleSearch}
        disabled={!searchValue.trim()}>
        <Ionicons name="search" size={20} color="#FFF" />
        <ThemedText style={styles.searchButtonText}>Rechercher</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 5,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
    color: '#64748B',
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});

