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
import { useTranslation } from '@/hooks/use-translation';
import * as Haptics from 'expo-haptics';

type ScanMode = 'baggage' | 'boarding_pass';

export default function ScanScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
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
          t('scan.success.title'),
          t('scan.success.baggage').replace('{tagFull}', tagFull).replace('{status}', result.bagPiece.status),
          [{ text: t('common.ok') }]
        );
      }
    } else {
      // Feedback haptique pour erreur
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), result.error || t('scan.error.generic'));
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
      const plural = bagCount > 1 ? 's' : '';
      const message = bagCount > 0
        ? t('scan.success.boardingPass').replace('{count}', bagCount.toString()).replace(/{plural}/g, plural)
        : t('scan.success.boardingPass.noBags');
      
      Alert.alert(t('scan.success.title'), message, [{ text: t('common.ok') }]);
    } else {
      // Feedback haptique pour erreur
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), ('error' in result ? result.error : t('scan.error.boardingPass')) || t('scan.error.boardingPass'));
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
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    },
    header: {
      ...styles.header,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    },
    headerContent: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
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
              {t('scan.title')}
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.subtitle}>
            {scanMode === 'baggage' ? t('home.scanBaggage') : t('home.scanBoardingPass')}
          </ThemedText>
          <View style={styles.stationSelectorContainer}>
            {/* Pour les agents, afficher la station en lecture seule */}
            <View style={[styles.stationDisplay, { 
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderColor: isDark ? '#334155' : '#E2E8F0',
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
              {t('scan.mode.baggage')}
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
              {t('scan.mode.boardingPass')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <View style={styles.scanSection}>
        <ScanInput 
          onScan={handleScan} 
          autoFocus 
          placeholder={scanMode === 'baggage' ? t('scan.baggage.placeholder') : t('scan.boardingPass.placeholder')}
        />
      </View>

      <ScrollView style={styles.resultContainer}>
        {scannedBagPiece && (
          <>
            <ThemedText type="subtitle" style={styles.resultTitle}>
              {t('scan.result.lastScanned')}
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
                    {showHistory ? t('scan.hideHistory') : t('scan.showHistory')}
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
              {t('scan.result.boardingPassScanned')}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 6,
    marginLeft: 40,
    fontSize: 15,
    opacity: 0.75,
    lineHeight: 22,
    fontWeight: '500',
  },
  stationSelectorContainer: {
    marginTop: 12,
  },
  stationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
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

