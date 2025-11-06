import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { UserRole } from '@/types';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const currentUser = authService.getCurrentUser();
  const isSupervisorOrAdmin = currentUser ? authService.isSupervisorOrAdmin() : false;
  const isAdmin = currentUser ? authService.isAdmin() : false;
  const isAgent = currentUser?.role === UserRole.AGENT;
  // L'onglet supervisor ne doit être visible que pour les superviseurs et admins, pas pour les agents
  const showSupervisorTab = currentUser && (currentUser.role === UserRole.SUPERVISOR || currentUser.role === UserRole.ADMIN);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode.viewfinder" color={color} />,
          href: isAgent ? undefined : null, // Masquer complètement pour les superviseurs et admins
        }}
      />
      <Tabs.Screen
        name="missing"
        options={{
          title: 'Manquants',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="exclamationmark.triangle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activités',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="supervisor"
        options={{
          title: 'Supervision',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          href: showSupervisorTab ? undefined : null, // Masquer complètement pour les agents
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
