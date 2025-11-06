import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { pickAndImportFile, ImportResult } from '@/services/importService';

interface ImportDataModalProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  visible,
  onClose,
  onImportComplete,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await pickAndImportFile();

      if (result.success && result.result) {
        setImportResult(result.result);
        
        // Afficher un message de succès
        if (result.result.bagPiecesCreated > 0) {
          Alert.alert(
            'Import réussi',
            `${result.result.bagPiecesCreated} bagage(s) importé(s) avec succès.\n\n` +
              `Vols créés: ${result.result.flightsCreated}\n` +
              `Passagers créés: ${result.result.passengersCreated}\n` +
              `Lots créés: ${result.result.bagSetsCreated}\n` +
              `Pièces créées: ${result.result.bagPiecesCreated}` +
              (result.result.warnings.length > 0
                ? `\n\nAvertissements: ${result.result.warnings.length}`
                : ''),
            [
              {
                text: 'OK',
                onPress: () => {
                  onImportComplete?.();
                  handleClose();
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Import terminé',
            'Aucun nouveau bagage importé. Les données existent peut-être déjà.',
            [{ text: 'OK', onPress: handleClose }]
          );
        }
      } else {
        Alert.alert(
          'Erreur d\'import',
          result.error || 'Une erreur est survenue lors de l\'import',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue',
        [{ text: 'OK' }]
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setImportResult(null);
    onClose();
  };

  const dynamicStyles = {
    modalContent: {
      ...styles.modalContent,
      backgroundColor: isDark ? '#1F1F1F' : '#FFF',
    },
    modalHeader: {
      ...styles.modalHeader,
      borderBottomColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
    section: {
      ...styles.section,
      backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
      borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
    },
    text: {
      color: isDark ? '#FFF' : '#000',
    },
    secondaryText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <ThemedView style={dynamicStyles.modalContent}>
          <View style={dynamicStyles.modalHeader}>
            <ThemedText type="title">Importer des données</ThemedText>
            <Pressable onPress={handleClose} disabled={isImporting}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#FFF' : '#000'}
              />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <ThemedView style={styles.content}>
              <ThemedText style={styles.description}>
                Importez des données depuis un fichier CSV ou Excel pour charger
                les informations de vols, passagers et bagages depuis le système
                de check-in.
              </ThemedText>

              <ThemedView style={dynamicStyles.section}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Format de fichier attendu
                </ThemedText>
                <ThemedText style={styles.formatText}>
                  Le fichier doit contenir les colonnes suivantes :
                </ThemedText>
                <View style={styles.columnsList}>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">flight_code</ThemedText>{' '}
                    (requis)
                  </ThemedText>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">flight_date</ThemedText>{' '}
                    (optionnel)
                  </ThemedText>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">route</ThemedText>{' '}
                    (optionnel)
                  </ThemedText>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">passenger_name</ThemedText>{' '}
                    (requis)
                  </ThemedText>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">pnr</ThemedText>{' '}
                    (optionnel)
                  </ThemedText>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">pieces_declared</ThemedText>{' '}
                    (optionnel)
                  </ThemedText>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">base_tag</ThemedText>{' '}
                    (requis)
                  </ThemedText>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">tag_full</ThemedText>{' '}
                    (optionnel, généré automatiquement)
                  </ThemedText>
                  <ThemedText style={styles.columnItem}>
                    • <ThemedText type="defaultSemiBold">piece_index</ThemedText>{' '}
                    (optionnel)
                  </ThemedText>
                </View>
              </ThemedView>

              {importResult && (
                <ThemedView style={dynamicStyles.section}>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                    Résultat de l'import
                  </ThemedText>
                  <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Vols créés:</ThemedText>
                    <ThemedText style={styles.resultValue}>
                      {importResult.flightsCreated}
                    </ThemedText>
                  </View>
                  <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>
                      Passagers créés:
                    </ThemedText>
                    <ThemedText style={styles.resultValue}>
                      {importResult.passengersCreated}
                    </ThemedText>
                  </View>
                  <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Lots créés:</ThemedText>
                    <ThemedText style={styles.resultValue}>
                      {importResult.bagSetsCreated}
                    </ThemedText>
                  </View>
                  <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>
                      Pièces créées:
                    </ThemedText>
                    <ThemedText style={styles.resultValue}>
                      {importResult.bagPiecesCreated}
                    </ThemedText>
                  </View>
                  {importResult.errors.length > 0 && (
                    <View style={styles.errorsSection}>
                      <ThemedText type="defaultSemiBold" style={styles.errorTitle}>
                        Erreurs ({importResult.errors.length})
                      </ThemedText>
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <ThemedText key={index} style={styles.errorText}>
                          • {error}
                        </ThemedText>
                      ))}
                      {importResult.errors.length > 5 && (
                        <ThemedText style={styles.errorText}>
                          ... et {importResult.errors.length - 5} autre(s)
                        </ThemedText>
                      )}
                    </View>
                  )}
                  {importResult.warnings.length > 0 && (
                    <View style={styles.warningsSection}>
                      <ThemedText type="defaultSemiBold" style={styles.warningTitle}>
                        Avertissements ({importResult.warnings.length})
                      </ThemedText>
                      {importResult.warnings.slice(0, 5).map((warning, index) => (
                        <ThemedText key={index} style={styles.warningText}>
                          • {warning}
                        </ThemedText>
                      ))}
                      {importResult.warnings.length > 5 && (
                        <ThemedText style={styles.warningText}>
                          ... et {importResult.warnings.length - 5} autre(s)
                        </ThemedText>
                      )}
                    </View>
                  )}
                </ThemedView>
              )}

              <Pressable
                onPress={handleImport}
                disabled={isImporting}
                style={({ pressed }) => [
                  styles.importButton,
                  {
                    backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                    opacity: pressed || isImporting ? 0.7 : 1,
                  },
                ]}>
                {isImporting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="document-text-outline" size={24} color="#FFF" />
                    <ThemedText style={styles.importButtonText}>
                      Sélectionner un fichier
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalBody: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.9,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 17,
    marginBottom: 12,
    fontWeight: '600',
  },
  formatText: {
    fontSize: 15,
    marginBottom: 12,
    opacity: 0.9,
  },
  columnsList: {
    marginTop: 8,
  },
  columnItem: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
    opacity: 0.9,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 15,
    opacity: 0.9,
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EF4444',
  },
  errorTitle: {
    fontSize: 15,
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    lineHeight: 20,
    marginBottom: 4,
  },
  warningsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 15,
    color: '#F59E0B',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 20,
    marginBottom: 4,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  importButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

