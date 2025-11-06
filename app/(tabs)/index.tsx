import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AgentStatistics } from '@/components/agent/AgentStatistics';
import { StationSelector } from '@/components/agent/StationSelector';
import { NotificationBadge, NotificationCard } from '@/components/notifications';
import { ImportDataModal } from '@/components/import';
import { apiService } from '@/services/apiService';
import { notificationService } from '@/services/notificationService';
import { authService } from '@/services/authService';
import { Notification, NotificationPriority, UserRole } from '@/types';
import { AIRPORTS } from '@/constants/airports';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();
  const currentUser = authService.getCurrentUser();
  const agentId = currentUser?.id || '';
  // Pour les agents, la station est fixe (celle choisie à l'inscription)
  // Pour les admins/superviseurs, on permet le changement
  const isAgent = currentUser?.role === UserRole.AGENT;
  const [currentStation, setCurrentStation] = useState<string>(
    currentUser?.station || AIRPORTS[0].code
  );
  
  // S'assurer que la station reste celle de l'utilisateur pour les agents
  useEffect(() => {
    if (isAgent && currentUser?.station) {
      setCurrentStation(currentUser.station);
    }
  }, [currentUser, isAgent]);
  const [statistics, setStatistics] = useState({
    scansToday: 0,
    scansTotal: 0,
    bagsScanned: 0,
    incompleteSets: 0,
    missingBags: 0,
  });
  const [urgentNotifications, setUrgentNotifications] = useState<Notification[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    // Initialiser les données de test au démarrage
    const initData = async () => {
      await apiService.initializeTestData();
      // Charger les statistiques
      await updateStatistics();
      // Charger les notifications urgentes
      updateUrgentNotifications();
    };
    initData();
  }, [currentStation]);

  useEffect(() => {
    // Recharger les notifications toutes les 30 secondes
    const interval = setInterval(() => {
      updateUrgentNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentStation]);

  const updateStatistics = async () => {
    const stats = await apiService.getAgentStatistics(agentId, currentStation);
    setStatistics(stats);
  };

  const updateUrgentNotifications = async () => {
    // Pour les admins, ne pas filtrer par station (undefined = toutes les stations)
    const stationForNotifications = isAgent ? currentStation : (authService.isAdmin() ? undefined : currentStation);
    const notifications = await notificationService.generateNotifications(stationForNotifications);
    const filtered = notificationService.filterExpired(notifications);
    // Afficher seulement les notifications urgentes et importantes sur l'écran d'accueil
    const urgent = filtered.filter(
      (n) =>
        n.priority === NotificationPriority.URGENT ||
        n.priority === NotificationPriority.HIGH
    );
    setUrgentNotifications(urgent.slice(0, 3)); // Maximum 3 notifications
  };

  const handleImportComplete = () => {
    // Recharger les statistiques après l'import
    updateStatistics();
    updateUrgentNotifications();
  };

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
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
    actionCard: {
      ...styles.actionCard,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <ThemedView style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Ionicons 
                  name="airplane" 
                  size={28} 
                  color={isDark ? '#ECEDEE' : '#11181C'} 
                  style={styles.titleIcon}
                />
                <ThemedText type="title" style={styles.title}>
                  BRS-CSI
                </ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.subtitle}>
                {currentUser ? `${currentUser.name} • ${currentUser.role}` : t('home.subtitle')}
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push('/notifications')}
                style={styles.notificationButton}>
                <NotificationBadge station={currentStation} />
              </Pressable>
              <Pressable
                onPress={handleLogout}
                style={styles.logoutButton}>
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color={isDark ? '#ECEDEE' : '#11181C'}
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.stationSelectorContainer}>
            {isAgent ? (
              // Pour les agents, afficher la station en lecture seule
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
            ) : (
              // Pour les superviseurs et admins, permettre le changement
              <StationSelector
                currentStation={currentStation}
                onStationChange={(station) => {
                  setCurrentStation(station);
                  updateStatistics();
                  updateUrgentNotifications();
                }}
              />
            )}
          </View>
        </View>
      </ThemedView>
      <ScrollView style={styles.scrollContent}>

      <ThemedView style={styles.content}>
        {urgentNotifications.length > 0 && (
          <ThemedView style={styles.section}>
            <View style={styles.notificationsHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {t('home.urgentAlerts')}
              </ThemedText>
              <Pressable onPress={() => router.push('/notifications')}>
                <ThemedText style={styles.seeAllLink}>{t('home.seeAll')}</ThemedText>
              </Pressable>
            </View>
            {urgentNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => router.push('/notifications')}
              />
            ))}
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <AgentStatistics {...statistics} />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {t('home.quickActions')}
          </ThemedText>

          {isAgent && (
            <>
              <Pressable
                onPress={() => router.push('/scan')}
                style={({ pressed }) => [
                  dynamicStyles.actionCard,
                  pressed && styles.actionCardPressed,
                ]}>
                <Ionicons name="qr-code-outline" size={32} color="#3B82F6" />
                <View style={styles.actionContent}>
                  <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                    {t('home.scanBaggage')}
                  </ThemedText>
                  <ThemedText style={styles.actionDescription}>
                    {t('home.scanBaggage.description')}
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
                    {t('home.scanBoardingPass')}
                  </ThemedText>
                  <ThemedText style={styles.actionDescription}>
                    {t('home.scanBoardingPass.description')}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </>
          )}

          <Pressable
            onPress={() => router.push('/search')}
            style={({ pressed }) => [
              dynamicStyles.actionCard,
              pressed && styles.actionCardPressed,
            ]}>
            <Ionicons name="search-outline" size={32} color="#10B981" />
            <View style={styles.actionContent}>
              <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                {t('home.searchBaggage')}
              </ThemedText>
              <ThemedText style={styles.actionDescription}>
                {t('home.searchBaggage.description')}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/missing')}
            style={({ pressed }) => [
              dynamicStyles.actionCard,
              pressed && styles.actionCardPressed,
            ]}>
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            <View style={styles.actionContent}>
              <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                {t('home.missingBags')}
              </ThemedText>
              <ThemedText style={styles.actionDescription}>
                {t('home.missingBags.description')}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/activity')}
            style={({ pressed }) => [
              dynamicStyles.actionCard,
              pressed && styles.actionCardPressed,
            ]}>
            <Ionicons name="time-outline" size={32} color="#6366F1" />
            <View style={styles.actionContent}>
              <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                {t('home.activityHistory')}
              </ThemedText>
              <ThemedText style={styles.actionDescription}>
                {t('home.activityHistory.description')}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </Pressable>

          {authService.isSupervisorOrAdmin() && (
            <Pressable
              onPress={() => setShowImportModal(true)}
              style={({ pressed }) => [
                dynamicStyles.actionCard,
                pressed && styles.actionCardPressed,
              ]}>
              <Ionicons name="document-text-outline" size={32} color="#F59E0B" />
              <View style={styles.actionContent}>
                <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                  {t('home.importData')}
                </ThemedText>
                <ThemedText style={styles.actionDescription}>
                  {t('home.importData.description')}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </Pressable>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {t('home.about')}
          </ThemedText>
          <ThemedText style={styles.description}>
            {t('home.about.description1')}
          </ThemedText>
          <ThemedText style={styles.description}>
            {t('home.about.description2')}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ImportDataModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
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
  scrollContent: {
    flex: 1,
  },
  stationSelectorContainer: {
    marginTop: 16,
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  actionDescription: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    fontWeight: '400',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    padding: 8,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    marginTop: 4,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
