import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ScanHistory } from '@/components/baggage/ScanHistory';
import { apiService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { ScanLog, UserRole, BagPiece } from '@/types';
import { getAirportName } from '@/constants/airports';
import { STATUS_LABELS } from '@/constants/statusLabels';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ActivityHistoryProps {
  agentId?: string;
  station?: string;
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ agentId, station }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentUser = authService.getCurrentUser();
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [selectedBagPiece, setSelectedBagPiece] = useState<BagPiece | null>(null);
  const [bagPieces, setBagPieces] = useState<Map<string, BagPiece>>(new Map());
  const [selectedBagPieceLogs, setSelectedBagPieceLogs] = useState<ScanLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadScanLogs();
  }, [agentId, station, filter]);

  useEffect(() => {
    if (selectedBagPiece) {
      const loadSelectedBagPieceLogs = async () => {
        const logs = await apiService.getScanLogsByBagPiece(selectedBagPiece.id);
        setSelectedBagPieceLogs(logs);
      };
      loadSelectedBagPieceLogs();
    } else {
      setSelectedBagPieceLogs([]);
    }
  }, [selectedBagPiece]);

  const loadScanLogs = async () => {
    // Déterminer les filtres selon le rôle
    let filterAgentId: string | undefined = agentId;
    let filterStation: string | undefined = station;

    if (!filterAgentId && currentUser) {
      if (currentUser.role === UserRole.AGENT) {
        // Les agents voient uniquement leurs propres scans
        filterAgentId = currentUser.id;
      }
      // Les superviseurs et admins voient tous les scans (pas de filtre agent)
    }

    if (!filterStation && currentUser) {
      if (currentUser.role === UserRole.AGENT && currentUser.station) {
        // Les agents voient uniquement leur station
        filterStation = currentUser.station;
      } else if (currentUser.role === UserRole.SUPERVISOR && currentUser.station) {
        // Les superviseurs voient uniquement leur station
        filterStation = currentUser.station;
      }
      // Les admins voient toutes les stations (pas de filtre)
    }

    let logs = await apiService.getScanLogs(undefined, filterAgentId, filterStation);

    // Appliquer le filtre temporel
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    logs = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      switch (filter) {
        case 'today':
          return logDate >= today;
        case 'week':
          return logDate >= weekAgo;
        case 'month':
          return logDate >= monthAgo;
        default:
          return true;
      }
    });

    setScanLogs(logs);
    
    // Charger les bagPieces pour les logs
    const bagPiecesMap = new Map<string, BagPiece>();
    for (const log of logs) {
      if (!bagPiecesMap.has(log.bag_piece_id)) {
        const bagPiece = await apiService.getBagPiece(log.bag_piece_id);
        if (bagPiece) {
          bagPiecesMap.set(log.bag_piece_id, bagPiece);
        }
      }
    }
    setBagPieces(bagPiecesMap);
  };

  const getRoleLabel = () => {
    if (!currentUser) return '';
    switch (currentUser.role) {
      case UserRole.AGENT:
        return 'Mes activités';
      case UserRole.SUPERVISOR:
        return currentUser.station 
          ? `Activités - ${getAirportName(currentUser.station)}`
          : 'Activités';
      case UserRole.ADMIN:
        return 'Toutes les activités';
      default:
        return 'Activités';
    }
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'today':
        return "Aujourd'hui";
      case 'week':
        return '7 derniers jours';
      case 'month':
        return '30 derniers jours';
      default:
        return 'Tout';
    }
  };

  const handleLogPress = async (log: ScanLog) => {
    const bagPiece = bagPieces.get(log.bag_piece_id) || await apiService.getBagPiece(log.bag_piece_id);
    if (bagPiece) {
      setSelectedBagPiece(bagPiece);
      // Ajouter au cache si pas déjà présent
      if (!bagPieces.has(log.bag_piece_id)) {
        setBagPieces(new Map(bagPieces).set(log.bag_piece_id, bagPiece));
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {getRoleLabel()}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Historique des scans
        </ThemedText>
      </View>

      {/* Filtres temporels */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {(['today', 'week', 'month', 'all'] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.filterButtonActive,
                {
                  backgroundColor: filter === filterOption 
                    ? '#3B82F6' 
                    : isDark ? '#1F1F1F' : '#F3F4F6',
                },
              ]}
              onPress={() => setFilter(filterOption)}>
              <ThemedText
                style={[
                  styles.filterButtonText,
                  filter === filterOption && styles.filterButtonTextActive,
                ]}>
                {filterOption === 'today' && "Aujourd'hui"}
                {filterOption === 'week' && '7 jours'}
                {filterOption === 'month' && '30 jours'}
                {filterOption === 'all' && 'Tout'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Statistiques rapides */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB' }]}>
          <Ionicons name="scan-outline" size={24} color="#3B82F6" />
          <ThemedText style={styles.statValue}>{scanLogs.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Scans ({getFilterLabel()})</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB' }]}>
          <Ionicons name="bag-outline" size={24} color="#10B981" />
          <ThemedText style={styles.statValue}>
            {new Set(scanLogs.map((log) => log.bag_piece_id)).size}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Bagages uniques</ThemedText>
        </View>
      </View>

      {/* Liste des scans */}
      <ScrollView style={styles.logsContainer}>
        {scanLogs.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>
              Aucun scan enregistré pour cette période
            </ThemedText>
          </ThemedView>
        ) : (
          scanLogs.map((log) => {
            const bagPiece = bagPieces.get(log.bag_piece_id);
            return (
              <TouchableOpacity
                key={log.id}
                onPress={() => handleLogPress(log)}
                style={[
                  styles.logCard,
                  {
                    backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
                    borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
                  },
                ]}>
                <View style={styles.logHeader}>
                  <View style={styles.logIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={STATUS_LABELS[log.action]?.color || '#3B82F6'}
                    />
                  </View>
                  <View style={styles.logInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.logTag}>
                      {bagPiece?.tag_full || 'Tag inconnu'}
                    </ThemedText>
                    <ThemedText style={styles.logAction}>
                      {STATUS_LABELS[log.action]?.label || log.action}
                    </ThemedText>
                    <ThemedText style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.logDetails}>
                  <View style={styles.logDetailRow}>
                    <ThemedText style={styles.logDetailLabel}>Station:</ThemedText>
                    <ThemedText style={styles.logDetailValue}>
                      {getAirportName(log.station)}
                    </ThemedText>
                  </View>
                  {currentUser?.role !== UserRole.AGENT && (
                    <View style={styles.logDetailRow}>
                      <ThemedText style={styles.logDetailLabel}>Agent:</ThemedText>
                      <ThemedText style={styles.logDetailValue}>{log.agent_id}</ThemedText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Détails du bagage sélectionné */}
      {selectedBagPiece && (
        <View style={styles.detailsModal}>
          <ThemedView style={[styles.detailsContent, { backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF' }]}>
            <View style={styles.detailsHeader}>
              <ThemedText type="defaultSemiBold" style={styles.detailsTitle}>
                Historique du bagage {selectedBagPiece.tag_full}
              </ThemedText>
              <TouchableOpacity onPress={() => setSelectedBagPiece(null)}>
                <Ionicons name="close" size={24} color={isDark ? '#ECEDEE' : '#11181C'} />
              </TouchableOpacity>
            </View>
            <ScanHistory
              scanLogs={selectedBagPieceLogs}
              bagTagFull={selectedBagPiece.tag_full}
            />
          </ThemedView>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersScroll: {
    paddingRight: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  logsContainer: {
    flex: 1,
    padding: 16,
  },
  logCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logIcon: {
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logTag: {
    fontSize: 16,
    marginBottom: 4,
  },
  logAction: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  logDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  logDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logDetailLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  logDetailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  detailsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  detailsContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    flex: 1,
  },
});

