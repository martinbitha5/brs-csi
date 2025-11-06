import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ScanInput } from '@/components/forms/ScanInput';
import { BaggageCard, ScanHistory, IncompleteSetAlert } from '@/components/baggage';
import { BoardingPassCard } from '@/components/boarding-pass/BoardingPassCard';
import { apiService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { BagPiece, ScanAction, BoardingPassScanResult, BagSet, UserRole, ScanLog } from '@/types';
import { AIRPORTS } from '@/constants/airports';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';

type ScanMode = 'baggage' | 'boarding_pass';

export default function ScanScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const router = useRouter();
  const initialMode: ScanMode = params.mode === 'boarding_pass' ? 'boarding_pass' : 'baggage';
  const [scanMode, setScanMode] = useState<ScanMode>(initialMode);
  const [scannedBagPiece, setScannedBagPiece] = useState<BagPiece | null>(null);
  const [scannedBoardingPass, setScannedBoardingPass] = useState<BoardingPassScanResult | null>(null);
  const currentUser = authService.getCurrentUser();
  const agentId = currentUser?.id || '';
  const isAgent = currentUser?.role === UserRole.AGENT;
  const [currentStation, setCurrentStation] = useState<string>(
    currentUser?.station || AIRPORTS[0].code
  );
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [bagSet, setBagSet] = useState<BagSet | null>(null);
  const [bagPieces, setBagPieces] = useState<BagPiece[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Restreindre l'accès aux agents uniquement
  useEffect(() => {
    if (!isAgent) {
      router.replace('/(tabs)/' as any);
      return;
    }
  }, [isAgent, router]);

  // S'assurer que la station reste celle de l'utilisateur pour les agents
  useEffect(() => {
    if (isAgent && currentUser?.station) {
      setCurrentStation(currentUser.station);
    }
  }, [currentUser, isAgent]);

  useEffect(() => {
    // Initialiser les données de test
    const initData = async () => {
      await apiService.initializeTestData();
    };
    initData();
  }, []);

  useEffect(() => {
    // Mettre à jour le mode si le paramètre change
    if (params.mode === 'boarding_pass') {
      setScanMode('boarding_pass');
    } else if (params.mode === 'baggage') {
      setScanMode('baggage');
    }
  }, [params.mode]);

  const handleBaggageScan = async (tagFull: string) => {
    // Déterminer l'action selon le contexte (départ ou arrivée)
    // Pour simplifier, on utilise LOADED pour le moment
    const action = ScanAction.LOADED;
    
    const result = await apiService.scanBaggage(tagFull, currentStation, agentId, action);

    if (result.success && result.bagPiece) {
      // Feedback haptique pour succès
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setScannedBagPiece(result.bagPiece);
      setScannedBoardingPass(null);
      setShowHistory(false);
      
      // Récupérer les informations complètes
      const searchResult = await apiService.searchBaggage(tagFull);
      if (searchResult) {
        setBagSet(searchResult.bagSet);
        
        // Charger les pièces et les logs
        if (searchResult.bagSet) {
          const pieces = await apiService.getBagPiecesBySet(searchResult.bagSet.id);
          setBagPieces(pieces);
          
          // Charger les logs pour la pièce scannée
          const logs = await apiService.getScanLogsByBagPiece(result.bagPiece.id);
          setScanLogs(logs);
          
          const incompleteSets = await apiService.checkIncompleteBagSets(searchResult.bagSet.flight_id);
          const isIncomplete = incompleteSets.some((bs) => bs.id === searchResult.bagSet!.id);
          
          if (isIncomplete) {
            // Feedback haptique pour avertissement
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
        
        Alert.alert(
          'Scan réussi',
          `Bagage ${tagFull} scanné avec succès.\nStatut: ${result.bagPiece.status}`,
          [{ text: 'OK' }]
        );
      }
    } else {
      // Feedback haptique pour erreur
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', result.error || 'Une erreur est survenue');
      setScannedBagPiece(null);
      setBagSet(null);
    }
  };

  const handleBoardingPassScan = async (barcodeData: string) => {
    // Simuler le mode en ligne pour l'instant
    const isOnline = true;
    const result = await apiService.scanBoardingPass(barcodeData, currentStation, agentId, isOnline);

    if (result.success && result.result) {
      // Feedback haptique pour succès
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setScannedBoardingPass(result.result);
      setScannedBagPiece(null);
      setShowHistory(false);
      
      const bagCount = result.result.associatedBagPieces.length;
      const message = bagCount > 0
        ? `Boarding pass scanné avec succès.\n${bagCount} bagage${bagCount > 1 ? 's' : ''} associé${bagCount > 1 ? 's' : ''}.`
        : 'Boarding pass scanné avec succès.\nAucun bagage trouvé.';
      
      Alert.alert('Scan réussi', message, [{ text: 'OK' }]);
    } else {
      // Feedback haptique pour erreur
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', ('error' in result ? result.error : 'Impossible de scanner le boarding pass') || 'Impossible de scanner le boarding pass');
      setScannedBoardingPass(null);
    }
  };

  const handleScan = (data: string) => {
    if (scanMode === 'baggage') {
      handleBaggageScan(data);
    } else {
      handleBoardingPassScan(data);
    }
  };

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
              name="qr-code-outline" 
              size={28} 
              color={isDark ? '#ECEDEE' : '#11181C'} 
              style={styles.titleIcon}
            />
            <ThemedText type="title" style={styles.title}>
              Scanner
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Scannez un bagage ou une carte d'embarquement
          </ThemedText>
          <View style={styles.stationSelectorContainer}>
            {/* Pour les agents, afficher la station en lecture seule */}
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
          </View>
        </View>
        
        {/* Sélecteur de mode */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, scanMode === 'baggage' && styles.modeButtonActive]}
            onPress={() => {
              setScanMode('baggage');
              setScannedBagPiece(null);
              setScannedBoardingPass(null);
            }}>
            <Ionicons 
              name="bag-outline" 
              size={20} 
              color={scanMode === 'baggage' ? '#FFF' : '#6B7280'} 
            />
            <ThemedText style={[styles.modeButtonText, scanMode === 'baggage' && styles.modeButtonTextActive]}>
              Bagage
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeButton, scanMode === 'boarding_pass' && styles.modeButtonActive]}
            onPress={() => {
              setScanMode('boarding_pass');
              setScannedBagPiece(null);
              setScannedBoardingPass(null);
            }}>
            <Ionicons 
              name="ticket-outline" 
              size={20} 
              color={scanMode === 'boarding_pass' ? '#FFF' : '#6B7280'} 
            />
            <ThemedText style={[styles.modeButtonText, scanMode === 'boarding_pass' && styles.modeButtonTextActive]}>
              Carte d'embarquement
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <View style={styles.scanSection}>
        <ScanInput 
          onScan={handleScan} 
          autoFocus 
          placeholder={scanMode === 'baggage' ? 'Scanner un tag bagage' : 'Scanner une carte d\'embarquement'}
        />
      </View>

      <ScrollView style={styles.resultContainer}>
        {scannedBagPiece && (
          <>
            <ThemedText type="subtitle" style={styles.resultTitle}>
              Dernier bagage scanné
            </ThemedText>
            <BaggageCard bagPiece={scannedBagPiece} bagSet={bagSet || undefined} />
            
            {bagSet && (
              <>
                <IncompleteSetAlert
                  bagSet={bagSet}
                  bagPieces={bagPieces}
                />
                
                <TouchableOpacity
                  style={styles.historyToggle}
                  onPress={() => setShowHistory(!showHistory)}
                >
                  <Ionicons 
                    name={showHistory ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#3B82F6" 
                  />
                  <ThemedText style={styles.historyToggleText}>
                    {showHistory ? 'Masquer' : 'Afficher'} l'historique
                  </ThemedText>
                </TouchableOpacity>
                
                {showHistory && (
                  <ScanHistory
                    scanLogs={scanLogs}
                    bagTagFull={scannedBagPiece.tag_full}
                  />
                )}
              </>
            )}
          </>
        )}

        {scannedBoardingPass && (
          <>
            <ThemedText type="subtitle" style={styles.resultTitle}>
              Carte d'embarquement scannée
            </ThemedText>
            <BoardingPassCard
              boardingPass={scannedBoardingPass.boardingPass}
              bagPieces={scannedBoardingPass.associatedBagPieces}
              passengerName={scannedBoardingPass.passenger?.name}
              flightNumber={scannedBoardingPass.flight?.code}
            />
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
  modeSelector: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#FFF',
  },
  scanSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  resultTitle: {
    marginBottom: 12,
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  historyToggleText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
});

