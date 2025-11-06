import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { AIRPORTS } from '@/constants/airports';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StationSelectorProps {
  currentStation: string;
  onStationChange: (stationCode: string) => void;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  currentStation,
  onStationChange,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const currentAirport = AIRPORTS.find((a) => a.code === currentStation);

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="location-outline" size={20} color="#3B82F6" />
        <ThemedText style={styles.selectorText}>
          {currentAirport?.name || currentStation}
        </ThemedText>
        <Ionicons name="chevron-down-outline" size={16} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={{ fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827' }}>Sélectionner la station</ThemedText>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.stationListContainer} showsVerticalScrollIndicator={true}>
              <View style={styles.stationList}>
                {AIRPORTS.map((airport) => (
                  <TouchableOpacity
                    key={airport.code}
                    style={[
                      styles.stationItem,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        borderColor: currentStation === airport.code 
                          ? '#2563EB' 
                          : (isDark ? '#334155' : '#E2E8F0'),
                      },
                      currentStation === airport.code && {
                        backgroundColor: isDark ? '#1E3A5F' : '#EBF4FF',
                      },
                    ]}
                    onPress={() => {
                      onStationChange(airport.code);
                      setIsModalVisible(false);
                    }}
                  >
                    <View style={styles.stationInfo}>
                      <ThemedText
                        type={currentStation === airport.code ? "defaultSemiBold" : "default"}
                        style={[
                          styles.stationName,
                          { color: isDark ? '#FFFFFF' : '#111827', fontWeight: currentStation === airport.code ? '600' : '400' }
                        ]}
                      >
                        {airport.name}
                      </ThemedText>
                      <ThemedText style={[
                        styles.stationCode,
                        { color: isDark ? '#9CA3AF' : '#6B7280', opacity: 1 }
                      ]}>
                        {airport.code}
                      </ThemedText>
                    </View>
                    {currentStation === airport.code && (
                      <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  stationListContainer: {
    maxHeight: '100%',
  },
  stationList: {
    gap: 8,
    paddingBottom: 10,
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    marginBottom: 4,
  },
  stationCode: {
    fontSize: 13,
    fontWeight: '500',
  },
});

