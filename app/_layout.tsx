import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SplashScreen } from '@/components/splash-screen';
import { authService } from '@/services/authService';
import { languageService } from '@/services/languageService';
import { pushNotificationService } from '@/services/pushNotificationService';
import { Notification } from '@/types';
import { apiService } from '@/services/apiService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLanguage, setHasLanguage] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Charger l'utilisateur et la langue stockés au démarrage
    const loadData = async () => {
      try {
        await authService.loadStoredUser();
        await languageService.loadStoredLanguage();
        const languageSelected = await languageService.hasLanguageSelected();
        setHasLanguage(languageSelected);
        
        // Initialiser les notifications push si l'utilisateur est authentifié
        if (authService.isAuthenticated()) {
          await pushNotificationService.registerForPushNotifications();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Gérer les notifications push
  useEffect(() => {
    if (!isLoading && authService.isAuthenticated()) {
      // Configurer les listeners pour les notifications
      const notificationListeners = pushNotificationService.setupNotificationListeners(
        // Notification reçue en foreground
        (notification: Notification) => {
          console.log('Notification reçue:', notification);
          // La notification sera affichée automatiquement par le système
        },
        // Notification tapée par l'utilisateur
        (notification: Notification) => {
          // Naviguer vers la page appropriée selon le type de notification
          const navigateToNotification = async () => {
            if (notification.bag_piece_id) {
              const bagPiece = await apiService.getBagPiece(notification.bag_piece_id);
              if (bagPiece) {
                router.push(`/(tabs)/search?tag=${encodeURIComponent(bagPiece.tag_full)}`);
              }
            } else if (notification.bag_set_id) {
              const bagSet = await apiService.getBagSet(notification.bag_set_id);
              if (bagSet) {
                const bagPieces = await apiService.getBagPiecesBySet(bagSet.id);
                if (bagPieces.length > 0) {
                  router.push(`/(tabs)/search?tag=${encodeURIComponent(bagPieces[0].tag_full)}`);
                }
              }
            } else if (notification.flight_id) {
              router.push('/(tabs)/supervisor');
            } else {
              // Par défaut, naviguer vers l'écran de notifications
              router.push('/(tabs)/notifications');
            }
          };
          navigateToNotification();
        }
      );

      // Nettoyer les listeners lors du démontage
      return () => {
        notificationListeners.remove();
      };
    }
  }, [isLoading, router]);

  useEffect(() => {
    if (!isLoading && !showSplash) {
      const checkLanguageAndNavigate = async () => {
        const isAuthenticated = authService.isAuthenticated();
        const currentSegment = segments[0];
        const inAuthGroup = currentSegment === 'login' || currentSegment === 'register' || currentSegment === 'language-selection';
        
        // Vérifier si une langue a été sélectionnée
        const languageSelected = await languageService.hasLanguageSelected();
        setHasLanguage(languageSelected);

        // Si aucune langue n'a été sélectionnée, rediriger vers la sélection de langue
        if (!languageSelected && currentSegment !== 'language-selection') {
          router.replace('/language-selection');
          return;
        }

        // Si la langue est sélectionnée mais pas encore authentifié, rediriger vers login
        if (languageSelected && !isAuthenticated && !inAuthGroup) {
          router.replace('/login');
        } else if (isAuthenticated && (inAuthGroup && currentSegment !== 'language-selection')) {
          // Rediriger vers l'interface appropriée selon le rôle de l'utilisateur
          const defaultRoute = authService.getDefaultRouteForRole();
          router.replace(defaultRoute as any);
        }
      };

      checkLanguageAndNavigate();
    }
  }, [isLoading, showSplash, segments]);

  const handleSplashFinish = async () => {
    setShowSplash(false);
    // Vérifier la langue après le splash
    const languageSelected = await languageService.hasLanguageSelected();
    setHasLanguage(languageSelected);
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="language-selection" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
    </ThemeProvider>
  );
}
