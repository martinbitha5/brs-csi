import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ScanLog } from '@/types';
import { getAirportName } from '@/constants/airports';
import { STATUS_LABELS } from '@/constants/statusLabels';
import { Ionicons } from '@expo/vector-icons';

interface ScanHistoryProps {
  scanLogs: ScanLog[];
  bagTagFull?: string;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({ scanLogs, bagTagFull }) => {
  if (scanLogs.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={48} color="#9CA3AF" />
        <ThemedText style={styles.emptyText}>
          Aucun historique de scan disponible
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Historique des scans {bagTagFull && `- ${bagTagFull}`}
      </ThemedText>
      <ScrollView style={styles.scrollView}>
        {scanLogs.map((log) => (
          <ThemedView key={log.id} style={styles.logItem}>
            <View style={styles.logHeader}>
              <View style={styles.logIcon}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={STATUS_LABELS[log.action]?.color || '#3B82F6'} 
                />
              </View>
              <View style={styles.logInfo}>
                <ThemedText type="defaultSemiBold" style={styles.logAction}>
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
                <ThemedText style={styles.logDetailLabel}>Station :</ThemedText>
                <ThemedText style={styles.logDetailValue}>
                  {getAirportName(log.station)}
                </ThemedText>
              </View>
              <View style={styles.logDetailRow}>
                <ThemedText style={styles.logDetailLabel}>Agent :</ThemedText>
                <ThemedText style={styles.logDetailValue}>
                  {log.agent_id}
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 400,
  },
  logItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    backgroundColor: '#F9FAFB',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logIcon: {
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 12,
    opacity: 0.7,
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
});

