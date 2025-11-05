import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { dataService } from '@/services/dataService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  useEffect(() => {
    // Initialiser les données de test au démarrage
    dataService.initializeTestData();
  }, []);

  const dynamicStyles = {
    header: {
      ...styles.header,
      borderBottomColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
    actionCard: {
      ...styles.actionCard,
      backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
      borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={dynamicStyles.header}>
        <ThemedText type="title">BRS-CSI</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Système de suivi des bagages
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Actions rapides
          </ThemedText>

          <Pressable
            onPress={() => router.push('/scan')}
            style={({ pressed }) => [
              dynamicStyles.actionCard,
              pressed && styles.actionCardPressed,
            ]}>
            <Ionicons name="qr-code-outline" size={32} color="#3B82F6" />
            <View style={styles.actionContent}>
              <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                Scanner un bagage
              </ThemedText>
              <ThemedText style={styles.actionDescription}>
                Scannez ou saisissez le numéro de bagage pour mettre à jour son statut
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/scan?mode=boarding_pass')}
            style={({ pressed }) => [
              dynamicStyles.actionCard,
              pressed && styles.actionCardPressed,
            ]}>
            <Ionicons name="ticket-outline" size={32} color="#8B5CF6" />
            <View style={styles.actionContent}>
              <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                Scanner une carte d'embarquement
              </ThemedText>
              <ThemedText style={styles.actionDescription}>
                Scannez le QR code d'une carte d'embarquement pour lier les bagages
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/search')}
            style={({ pressed }) => [
              dynamicStyles.actionCard,
              pressed && styles.actionCardPressed,
            ]}>
            <Ionicons name="search-outline" size={32} color="#10B981" />
            <View style={styles.actionContent}>
              <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                Rechercher un bagage
              </ThemedText>
              <ThemedText style={styles.actionDescription}>
                Recherchez un bagage par numéro ou PNR pour voir son statut
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            À propos
          </ThemedText>
          <ThemedText style={styles.description}>
            BRS-CSI (Baggage Reconciliation System – Cargo System Integration) est une solution
            de suivi des bagages pour les aéroports d&apos;African Transport Systems (ATS) en RDC.
          </ThemedText>
          <ThemedText style={styles.description}>
            L&apos;application permet de tracer chaque bagage depuis l&apos;enregistrement jusqu&apos;à la
            livraison, avec gestion des lots de bagages et suivi en temps réel.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

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
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 17,
    marginBottom: 6,
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    opacity: 0.9,
  },
  actionCardPressed: {
    opacity: 0.7,
  },
});
