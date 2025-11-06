import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '@/services/adminService';
import { apiService } from '@/services/apiService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Flight } from '@/types';

export const ExportDataView: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadFlights = async () => {
      const allFlights = await apiService.getFlights();
      setFlights(allFlights);
    };
    loadFlights();
  }, []);

  const handleExport = async () => {
    setExporting(true);

    try {
      const result = await adminService.exportData(exportFormat, {
        flightId: selectedFlight?.id,
      });

      if (!result.success || !result.data) {
        Alert.alert('Erreur', result.error || 'Erreur lors de l\'export.');
        setExporting(false);
        return;
      }

      // Partager les données (simple approche de partage)
      try {
        if (Platform.OS === 'web') {
          // Pour le web, télécharger le fichier
          const blob = new Blob([result.data], {
            type: exportFormat === 'json' ? 'application/json' : 'text/csv',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `export-${selectedFlight?.code || 'all'}-${Date.now()}.${exportFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          Alert.alert('Succès', 'Données exportées avec succès.');
        } else {
          // Pour mobile, utiliser Share API
          await Share.share({
            message: result.data,
            title: `Export ${exportFormat.toUpperCase()}`,
          });
        }
      } catch (shareError) {
        // Fallback: afficher les données dans une alerte pour copier
        Alert.alert(
          'Données exportées',
          'Les données sont prêtes. Vous pouvez les copier depuis la console ou les partager.',
          [
            {
              text: 'Copier',
              onPress: () => {
                // Note: Pour copier réellement, il faudrait installer @react-native-clipboard/clipboard
                console.log('Export data:', result.data);
              },
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'export des données.');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const FlightCard = ({ flight }: { flight: Flight }) => {
    const isSelected = selectedFlight?.id === flight.id;

    return (
      <Pressable
        onPress={() => setSelectedFlight(flight)}
        style={({ pressed }) => [
          styles.flightCard,
          {
            backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
            borderColor: isSelected ? '#3B82F6' : isDark ? '#2A2A2A' : '#E5E7EB',
            borderWidth: isSelected ? 2 : 1,
          },
          pressed && styles.flightCardPressed,
        ]}>
        <Ionicons
          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color={isSelected ? '#3B82F6' : isDark ? '#9CA3AF' : '#6B7280'}
        />
        <View style={styles.flightInfo}>
          <ThemedText type="defaultSemiBold" style={styles.flightCode}>
            {flight.code}
          </ThemedText>
          <ThemedText style={styles.flightRoute}>{flight.route}</ThemedText>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Exporter les données</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Exporter les données en CSV ou JSON
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Format d'export
          </ThemedText>
          <View style={styles.formatButtons}>
            <Pressable
              onPress={() => setExportFormat('csv')}
              style={[
                styles.formatButton,
                {
                  backgroundColor:
                    exportFormat === 'csv'
                      ? '#3B82F6'
                      : isDark
                        ? '#1F1F1F'
                        : '#F9FAFB',
                  borderColor: exportFormat === 'csv' ? '#3B82F6' : '#E5E7EB',
                },
              ]}>
              <ThemedText
                style={[
                  styles.formatButtonText,
                  { color: exportFormat === 'csv' ? '#FFF' : isDark ? '#FFF' : '#000' },
                ]}>
                CSV
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setExportFormat('json')}
              style={[
                styles.formatButton,
                {
                  backgroundColor:
                    exportFormat === 'json'
                      ? '#3B82F6'
                      : isDark
                        ? '#1F1F1F'
                        : '#F9FAFB',
                  borderColor: exportFormat === 'json' ? '#3B82F6' : '#E5E7EB',
                },
              ]}>
              <ThemedText
                style={[
                  styles.formatButtonText,
                  { color: exportFormat === 'json' ? '#FFF' : isDark ? '#FFF' : '#000' },
                ]}>
                JSON
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Sélectionner un vol (optionnel)
          </ThemedText>
          <Pressable
            onPress={() => setSelectedFlight(null)}
            style={({ pressed }) => [
              styles.flightCard,
              {
                backgroundColor: !selectedFlight
                  ? '#3B82F6'
                  : isDark
                    ? '#1F1F1F'
                    : '#F9FAFB',
                borderColor: !selectedFlight ? '#3B82F6' : '#E5E7EB',
              },
              pressed && styles.flightCardPressed,
            ]}>
            <Ionicons
              name={!selectedFlight ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={!selectedFlight ? '#FFF' : isDark ? '#9CA3AF' : '#6B7280'}
            />
            <View style={styles.flightInfo}>
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.flightCode,
                  { color: !selectedFlight ? '#FFF' : undefined },
                ]}>
                Tous les vols
              </ThemedText>
            </View>
          </Pressable>
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </ThemedView>

        <Pressable
          onPress={handleExport}
          disabled={exporting}
          style={({ pressed }) => [
            styles.exportButton,
            {
              backgroundColor: exporting ? '#9CA3AF' : '#3B82F6',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <Ionicons name="download-outline" size={24} color="#FFF" />
          <ThemedText style={styles.exportButtonText}>
            {exporting ? 'Export en cours...' : 'Exporter'}
          </ThemedText>
        </Pressable>
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '600',
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formatButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  formatButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  flightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  flightCardPressed: {
    opacity: 0.7,
  },
  flightInfo: {
    flex: 1,
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

