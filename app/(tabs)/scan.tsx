import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ScanInput } from '@/components/forms/ScanInput';
import { BaggageCard } from '@/components/baggage/BaggageCard';
import { BoardingPassCard } from '@/components/boarding-pass/BoardingPassCard';
import { dataService } from '@/services/dataService';
import { BagPiece, ScanAction, BoardingPassScanResult } from '@/types';
import { AIRPORTS } from '@/constants/airports';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

type ScanMode = 'baggage' | 'boarding_pass';

export default function ScanScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode: ScanMode = params.mode === 'boarding_pass' ? 'boarding_pass' : 'baggage';
  const [scanMode, setScanMode] = useState<ScanMode>(initialMode);
  const [scannedBagPiece, setScannedBagPiece] = useState<BagPiece | null>(null);
  const [scannedBoardingPass, setScannedBoardingPass] = useState<BoardingPassScanResult | null>(null);
  const [currentStation] = useState<string>(AIRPORTS[0].code);
  const [agentId] = useState<string>('agent-1'); // À remplacer par l'ID réel de l'agent connecté

  useEffect(() => {
    // Initialiser les données de test
    dataService.initializeTestData();
  }, []);

  useEffect(() => {
    // Mettre à jour le mode si le paramètre change
    if (params.mode === 'boarding_pass') {
      setScanMode('boarding_pass');
    } else if (params.mode === 'baggage') {
      setScanMode('baggage');
    }
  }, [params.mode]);

  const handleBaggageScan = (tagFull: string) => {
    // Déterminer l'action selon le contexte (départ ou arrivée)
    // Pour simplifier, on utilise LOADED pour le moment
    const action = ScanAction.LOADED;
    
    const result = dataService.scanBaggage(tagFull, currentStation, agentId, action);

    if (result.success && result.bagPiece) {
      setScannedBagPiece(result.bagPiece);
      setScannedBoardingPass(null);
      // Récupérer les informations complètes
      const searchResult = dataService.searchBaggage(tagFull);
      if (searchResult) {
        Alert.alert(
          'Scan réussi',
          `Bagage ${tagFull} scanné avec succès.\nStatut: ${result.bagPiece.status}`,
          [{ text: 'OK' }]
        );
      }
    } else {
      Alert.alert('Erreur', result.error || 'Une erreur est survenue');
      setScannedBagPiece(null);
    }
  };

  const handleBoardingPassScan = (barcodeData: string) => {
    // Simuler le mode en ligne pour l'instant
    const isOnline = true;
    const result = dataService.scanBoardingPass(barcodeData, currentStation, agentId, isOnline);

    if (result.success && result.result) {
      setScannedBoardingPass(result.result);
      setScannedBagPiece(null);
      
      const bagCount = result.result.associatedBagPieces.length;
      const message = bagCount > 0
        ? `Boarding pass scanné avec succès.\n${bagCount} bagage${bagCount > 1 ? 's' : ''} associé${bagCount > 1 ? 's' : ''}.`
        : 'Boarding pass scanné avec succès.\nAucun bagage trouvé.';
      
      Alert.alert('Scan réussi', message, [{ text: 'OK' }]);
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de scanner le boarding pass');
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Scanner</ThemedText>
        <ThemedText style={styles.subtitle}>
          Station : {AIRPORTS.find((a) => a.code === currentStation)?.name || currentStation}
        </ThemedText>
        
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
      </View>

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
            <BaggageCard bagPiece={scannedBagPiece} />
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
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
});

