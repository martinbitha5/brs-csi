import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '@/services/adminService';
import { apiService } from '@/services/apiService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BagPiece, BagPieceStatus } from '@/types';
import { AIRPORTS } from '@/constants/airports';

export const ManualEditView: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchTag, setSearchTag] = useState('');
  const [bagPiece, setBagPiece] = useState<BagPiece | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<BagPieceStatus | null>(null);
  const [selectedStation, setSelectedStation] = useState<string>(AIRPORTS[0].code);
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (!searchTag.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de tag.');
      return;
    }

    const found = await apiService.getBagPieceByTag(searchTag.trim());
    if (found) {
      setBagPiece(found);
      setSelectedStatus(found.status);
    } else {
      Alert.alert('Erreur', 'Bagage non trouvé.');
      setBagPiece(null);
    }
  };

  const handleSave = async () => {
    if (!bagPiece || !selectedStatus) {
      Alert.alert('Erreur', 'Veuillez sélectionner un statut.');
      return;
    }

    setSaving(true);
    const result = await adminService.updateBagPieceStatusManually(
      bagPiece.id,
      selectedStatus,
      selectedStation
    );

    if (result.success) {
      Alert.alert('Succès', 'Statut mis à jour avec succès.');
      setBagPiece(result.bagPiece || null);
      if (result.bagPiece) {
        setSelectedStatus(result.bagPiece.status);
      }
    } else {
      Alert.alert('Erreur', result.error || 'Erreur lors de la mise à jour.');
    }
    setSaving(false);
  };

  const getStatusColor = (status: BagPieceStatus) => {
    switch (status) {
      case BagPieceStatus.CREATED:
        return '#6B7280';
      case BagPieceStatus.CHECKED_IN:
        return '#3B82F6';
      case BagPieceStatus.LOADED:
        return '#10B981';
      case BagPieceStatus.IN_TRANSIT:
        return '#8B5CF6';
      case BagPieceStatus.ARRIVED:
        return '#10B981';
      case BagPieceStatus.MISSING:
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: BagPieceStatus) => {
    switch (status) {
      case BagPieceStatus.CREATED:
        return 'Créé';
      case BagPieceStatus.CHECKED_IN:
        return 'Enregistré';
      case BagPieceStatus.LOADED:
        return 'Chargé';
      case BagPieceStatus.IN_TRANSIT:
        return 'En transit';
      case BagPieceStatus.ARRIVED:
        return 'Arrivé';
      case BagPieceStatus.MISSING:
        return 'Manquant';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Édition manuelle</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Corriger manuellement les statuts des bagages
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Rechercher un bagage
          </ThemedText>
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#2A2A2A' : '#FFF',
                  color: isDark ? '#FFF' : '#000',
                  borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                },
              ]}
              value={searchTag}
              onChangeText={setSearchTag}
              placeholder="Numéro de tag"
              autoCapitalize="none"
            />
            <Pressable
              onPress={handleSearch}
              style={({ pressed }) => [
                styles.searchButton,
                { backgroundColor: '#3B82F6', opacity: pressed ? 0.7 : 1 },
              ]}>
              <Ionicons name="search" size={24} color="#FFF" />
            </Pressable>
          </View>
        </ThemedView>

        {bagPiece && (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Informations du bagage
            </ThemedText>
            <View
              style={[
                styles.bagInfoCard,
                {
                  backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
                  borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
                },
              ]}>
              <View style={styles.bagInfoRow}>
                <ThemedText style={styles.bagInfoLabel}>Tag:</ThemedText>
                <ThemedText type="defaultSemiBold">{bagPiece.tag_full}</ThemedText>
              </View>
              <View style={styles.bagInfoRow}>
                <ThemedText style={styles.bagInfoLabel}>Statut actuel:</ThemedText>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(bagPiece.status)}15` },
                  ]}>
                  <ThemedText
                    style={[styles.statusText, { color: getStatusColor(bagPiece.status) }]}>
                    {getStatusLabel(bagPiece.status)}
                  </ThemedText>
                </View>
              </View>
              {bagPiece.station && (
                <View style={styles.bagInfoRow}>
                  <ThemedText style={styles.bagInfoLabel}>Station:</ThemedText>
                  <ThemedText>{bagPiece.station}</ThemedText>
                </View>
              )}
            </View>
          </ThemedView>
        )}

        {bagPiece && (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Nouveau statut
            </ThemedText>
            <View style={styles.statusButtons}>
              {Object.values(BagPieceStatus).map((status) => (
                <Pressable
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor:
                        selectedStatus === status
                          ? getStatusColor(status)
                          : isDark
                            ? '#1F1F1F'
                            : '#F9FAFB',
                      borderColor:
                        selectedStatus === status
                          ? getStatusColor(status)
                          : '#E5E7EB',
                    },
                  ]}>
                  <ThemedText
                    style={[
                      styles.statusButtonText,
                      {
                        color:
                          selectedStatus === status
                            ? '#FFF'
                            : isDark
                              ? '#FFF'
                              : '#000',
                      },
                    ]}>
                    {getStatusLabel(status)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ThemedView>
        )}

        {bagPiece && (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Station
            </ThemedText>
            <View style={styles.stationButtons}>
              {AIRPORTS.slice(0, 9).map((airport) => (
                <Pressable
                  key={airport.code}
                  onPress={() => setSelectedStation(airport.code)}
                  style={[
                    styles.stationButton,
                    {
                      backgroundColor:
                        selectedStation === airport.code
                          ? '#3B82F6'
                          : isDark
                            ? '#1F1F1F'
                            : '#F9FAFB',
                      borderColor:
                        selectedStation === airport.code
                          ? '#3B82F6'
                          : '#E5E7EB',
                    },
                  ]}>
                  <ThemedText
                    style={[
                      styles.stationButtonText,
                      {
                        color:
                          selectedStation === airport.code
                            ? '#FFF'
                            : isDark
                              ? '#FFF'
                              : '#000',
                      },
                    ]}>
                    {airport.code}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ThemedView>
        )}

        {bagPiece && (
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: saving ? '#9CA3AF' : '#3B82F6',
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" />
            <ThemedText style={styles.saveButtonText}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </ThemedText>
          </Pressable>
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
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagInfoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bagInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bagInfoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  stationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
  },
  stationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

