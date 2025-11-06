import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NotificationList } from '@/components/notifications/NotificationList';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Notification, UserRole } from '@/types';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { apiService } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const handleNotificationPress = async (notification: Notification) => {
    // Naviguer vers le vol ou le bagage concerné
    if (notification.bag_piece_id) {
      // Si on a un bag_piece_id, récupérer le tag et naviguer vers search
      const bagPiece = await apiService.getBagPiece(notification.bag_piece_id);
      if (bagPiece) {
        router.push(`/search?tag=${encodeURIComponent(bagPiece.tag_full)}`);
      }
    } else if (notification.bag_set_id) {
      // Si on a un bag_set_id, récupérer le premier bagage du set
      const bagSet = await apiService.getBagSet(notification.bag_set_id);
      if (bagSet) {
        const bagPieces = await apiService.getBagPiecesBySet(bagSet.id);
        if (bagPieces.length > 0) {
          router.push(`/search?tag=${encodeURIComponent(bagPieces[0].tag_full)}`);
        }
      }
    } else if (notification.flight_id) {
      // Pour les vols, naviguer vers supervisor (statistiques)
      router.push('/supervisor');
    }
  };

  // Obtenir la station de l'utilisateur connecté
  // Pour les admins, on ne filtre pas par station (undefined = toutes les stations)
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const station = isAdmin ? undefined : (currentUser?.station || undefined);

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      ...styles.header,
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
      borderBottomColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <ThemedView style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Ionicons 
                  name="notifications" 
                  size={28} 
                  color={isDark ? '#ECEDEE' : '#11181C'} 
                  style={styles.titleIcon}
                />
                <ThemedText type="title" style={styles.title}>
                  Notifications
                </ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.subtitle}>
                Alertes et avertissements en temps réel
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
      <View style={styles.content}>
        <NotificationList station={station} onNotificationPress={handleNotificationPress} />
      </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
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
  content: {
    flex: 1,
  },
});

