import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Notification, NotificationType, NotificationPriority } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type NotificationFilter = {
  type?: NotificationType;
  priority?: NotificationPriority;
  flightId?: string;
};

export type NotificationSort = 'date' | 'priority' | 'type';

interface NotificationFiltersProps {
  notifications: Notification[];
  onFilterChange: (filtered: Notification[]) => void;
  onFilterReset: () => void;
}

export function NotificationFilters({
  notifications,
  onFilterChange,
  onFilterReset,
}: NotificationFiltersProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [filter, setFilter] = useState<NotificationFilter>({});
  const [sort, setSort] = useState<NotificationSort>('priority');
  const [showFilters, setShowFilters] = useState(false);

  // Appliquer les filtres et le tri
  const applyFiltersAndSort = (
    newFilter: NotificationFilter,
    newSort: NotificationSort
  ) => {
    let filtered = [...notifications];

    // Appliquer les filtres
    if (newFilter.type) {
      filtered = filtered.filter((n) => n.type === newFilter.type);
    }
    if (newFilter.priority) {
      filtered = filtered.filter((n) => n.priority === newFilter.priority);
    }
    if (newFilter.flightId) {
      filtered = filtered.filter((n) => n.flight_id === newFilter.flightId);
    }

    // Appliquer le tri
    filtered.sort((a, b) => {
      switch (newSort) {
        case 'priority':
          const priorityOrder = {
            [NotificationPriority.URGENT]: 4,
            [NotificationPriority.HIGH]: 3,
            [NotificationPriority.MEDIUM]: 2,
            [NotificationPriority.LOW]: 1,
          };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        case 'type':
          const typeDiff = a.type.localeCompare(b.type);
          if (typeDiff !== 0) return typeDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        default:
          return 0;
      }
    });

    onFilterChange(filtered);
  };

  const handleFilterChange = (newFilter: NotificationFilter) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    applyFiltersAndSort(updatedFilter, sort);
  };

  const handleSortChange = (newSort: NotificationSort) => {
    setSort(newSort);
    applyFiltersAndSort(filter, newSort);
  };

  const handleReset = () => {
    setFilter({});
    setSort('priority');
    onFilterReset();
  };

  const hasActiveFilters = filter.type || filter.priority || filter.flightId;

  // Obtenir les vols uniques pour le filtre
  const uniqueFlights = Array.from(
    new Set(notifications.map((n) => n.flight_id).filter(Boolean))
  );

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
      borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
    filterButton: {
      backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
      borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
    },
    filterButtonActive: {
      backgroundColor: isDark ? '#3B82F6' : '#3B82F6',
      borderColor: '#3B82F6',
    },
    filterButtonText: {
      color: isDark ? '#ECEDEE' : '#111827',
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
    },
  };

  return (
    <ThemedView style={[styles.container, dynamicStyles.container]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.toggleButton}>
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDark ? '#ECEDEE' : '#11181C'}
          />
          <ThemedText type="defaultSemiBold" style={styles.toggleText}>
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </ThemedText>
        </TouchableOpacity>
        {hasActiveFilters && (
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <ThemedText style={styles.resetText}>Réinitialiser</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}>
          {/* Filtre par type */}
          <View style={styles.filterGroup}>
            <ThemedText style={styles.filterLabel}>Type</ThemedText>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                onPress={() =>
                  handleFilterChange({ type: filter.type === NotificationType.FLIGHT_CLOSING_WITH_MISSING_BAGS ? undefined : NotificationType.FLIGHT_CLOSING_WITH_MISSING_BAGS })
                }
                style={[
                  styles.filterButton,
                  dynamicStyles.filterButton,
                  filter.type === NotificationType.FLIGHT_CLOSING_WITH_MISSING_BAGS &&
                    dynamicStyles.filterButtonActive,
                ]}>
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    dynamicStyles.filterButtonText,
                    filter.type === NotificationType.FLIGHT_CLOSING_WITH_MISSING_BAGS &&
                      dynamicStyles.filterButtonTextActive,
                  ]}>
                  Vols
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  handleFilterChange({ type: filter.type === NotificationType.INCOMPLETE_BAG_SET ? undefined : NotificationType.INCOMPLETE_BAG_SET })
                }
                style={[
                  styles.filterButton,
                  dynamicStyles.filterButton,
                  filter.type === NotificationType.INCOMPLETE_BAG_SET &&
                    dynamicStyles.filterButtonActive,
                ]}>
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    dynamicStyles.filterButtonText,
                    filter.type === NotificationType.INCOMPLETE_BAG_SET &&
                      dynamicStyles.filterButtonTextActive,
                  ]}>
                  Lots
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtre par priorité */}
          <View style={styles.filterGroup}>
            <ThemedText style={styles.filterLabel}>Priorité</ThemedText>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                onPress={() =>
                  handleFilterChange({ priority: filter.priority === NotificationPriority.URGENT ? undefined : NotificationPriority.URGENT })
                }
                style={[
                  styles.filterButton,
                  dynamicStyles.filterButton,
                  filter.priority === NotificationPriority.URGENT &&
                    dynamicStyles.filterButtonActive,
                ]}>
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    dynamicStyles.filterButtonText,
                    filter.priority === NotificationPriority.URGENT &&
                      dynamicStyles.filterButtonTextActive,
                  ]}>
                  Urgent
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  handleFilterChange({ priority: filter.priority === NotificationPriority.HIGH ? undefined : NotificationPriority.HIGH })
                }
                style={[
                  styles.filterButton,
                  dynamicStyles.filterButton,
                  filter.priority === NotificationPriority.HIGH &&
                    dynamicStyles.filterButtonActive,
                ]}>
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    dynamicStyles.filterButtonText,
                    filter.priority === NotificationPriority.HIGH &&
                      dynamicStyles.filterButtonTextActive,
                  ]}>
                  Haute
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  handleFilterChange({ priority: filter.priority === NotificationPriority.MEDIUM ? undefined : NotificationPriority.MEDIUM })
                }
                style={[
                  styles.filterButton,
                  dynamicStyles.filterButton,
                  filter.priority === NotificationPriority.MEDIUM &&
                    dynamicStyles.filterButtonActive,
                ]}>
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    dynamicStyles.filterButtonText,
                    filter.priority === NotificationPriority.MEDIUM &&
                      dynamicStyles.filterButtonTextActive,
                  ]}>
                  Moyenne
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tri */}
          <View style={styles.filterGroup}>
            <ThemedText style={styles.filterLabel}>Trier par</ThemedText>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                onPress={() => handleSortChange('priority')}
                style={[
                  styles.filterButton,
                  dynamicStyles.filterButton,
                  sort === 'priority' && dynamicStyles.filterButtonActive,
                ]}>
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    dynamicStyles.filterButtonText,
                    sort === 'priority' && dynamicStyles.filterButtonTextActive,
                  ]}>
                  Priorité
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSortChange('date')}
                style={[
                  styles.filterButton,
                  dynamicStyles.filterButton,
                  sort === 'date' && dynamicStyles.filterButtonActive,
                ]}>
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    dynamicStyles.filterButtonText,
                    sort === 'date' && dynamicStyles.filterButtonTextActive,
                  ]}>
                  Date
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSortChange('type')}
                style={[
                  styles.filterButton,
                  dynamicStyles.filterButton,
                  sort === 'type' && dynamicStyles.filterButtonActive,
                ]}>
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    dynamicStyles.filterButtonText,
                    sort === 'type' && dynamicStyles.filterButtonTextActive,
                  ]}>
                  Type
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterGroup: {
    marginRight: 16,
    minWidth: 120,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

