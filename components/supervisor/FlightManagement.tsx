import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '@/services/adminService';
import { apiService } from '@/services/apiService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Flight } from '@/types';

export const FlightManagementView: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [flights, setFlights] = useState<Flight[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    date: new Date().toISOString().split('T')[0],
    route: '',
  });

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    const allFlights = await apiService.getFlights();
    setFlights(allFlights);
  };

  const handleCreateFlight = () => {
    setFormData({
      code: '',
      date: new Date().toISOString().split('T')[0],
      route: '',
    });
    setModalVisible(true);
  };

  const handleSaveFlight = async () => {
    if (!formData.code || !formData.date || !formData.route) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    const result = await adminService.createFlight(formData);
    if (result.success) {
      Alert.alert('Succès', 'Vol créé avec succès.');
      setModalVisible(false);
      await loadFlights();
    } else {
      Alert.alert('Erreur', result.error || 'Erreur lors de la création.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Gestion des vols</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Créer et gérer les vols
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        <Pressable
          onPress={handleCreateFlight}
          style={({ pressed }) => [
            styles.createButton,
            {
              backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
              borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
            },
            pressed && styles.createButtonPressed,
          ]}>
          <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
          <ThemedText type="defaultSemiBold" style={styles.createButtonText}>
            Créer un vol
          </ThemedText>
        </Pressable>

        <ThemedView style={styles.section}>
          {flights.length === 0 ? (
            <ThemedText style={styles.emptyText}>Aucun vol disponible</ThemedText>
          ) : (
            flights.map((flight) => (
              <View
                key={flight.id}
                style={[
                  styles.flightCard,
                  {
                    backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
                    borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
                  },
                ]}>
                <View style={styles.flightHeader}>
                  <Ionicons name="airplane-outline" size={32} color="#3B82F6" />
                  <View style={styles.flightInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.flightCode}>
                      {flight.code}
                    </ThemedText>
                    <ThemedText style={styles.flightRoute}>{flight.route}</ThemedText>
                    <ThemedText style={styles.flightDate}>
                      {new Date(flight.date).toLocaleDateString('fr-FR')}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))
          )}
        </ThemedView>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Créer un vol</ThemedText>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Code du vol *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#FFF',
                      color: isDark ? '#FFF' : '#000',
                      borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                    },
                  ]}
                  value={formData.code}
                  onChangeText={(text) => setFormData({ ...formData, code: text })}
                  placeholder="Ex: FIH-FKI"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Date *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#FFF',
                      color: isDark ? '#FFF' : '#000',
                      borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                    },
                  ]}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Route *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#FFF',
                      color: isDark ? '#FFF' : '#000',
                      borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                    },
                  ]}
                  value={formData.route}
                  onChangeText={(text) => setFormData({ ...formData, route: text })}
                  placeholder="Ex: Kinshasa → Kisangani"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}>
                <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveFlight}
                style={[styles.modalButton, styles.saveButton]}>
                <ThemedText style={styles.saveButtonText}>Créer</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  createButtonPressed: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  flightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  flightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flightInfo: {
    marginLeft: 16,
    flex: 1,
  },
  flightCode: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  flightRoute: {
    fontSize: 16,
    marginBottom: 4,
  },
  flightDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalBody: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

