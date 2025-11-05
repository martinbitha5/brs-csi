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
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    marginRight: 8,
    color: '#6B7280',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#111827',
  },
  clearButton: {
    marginLeft: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

