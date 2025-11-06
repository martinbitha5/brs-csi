import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Pressable as RNPressable,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '@/services/adminService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { User, UserRole } from '@/types';
import { AIRPORTS } from '@/constants/airports';

export const UserManagementView: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.AGENT,
    station: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await adminService.getUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs.');
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: UserRole.AGENT,
      station: '',
    });
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      station: user.station || '',
    });
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      if (editingUser) {
        const result = await adminService.updateUser(editingUser.id, formData);
        if (result.success) {
          Alert.alert('Succès', 'Utilisateur mis à jour avec succès.');
          setModalVisible(false);
          await loadUsers();
        } else {
          Alert.alert('Erreur', result.error || 'Erreur lors de la mise à jour.');
        }
      } else {
        const result = await adminService.createUser(formData);
        if (result.success) {
          Alert.alert('Succès', 'Utilisateur créé avec succès.');
          setModalVisible(false);
          await loadUsers();
        } else {
          Alert.alert('Erreur', result.error || 'Erreur lors de la création.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await adminService.deleteUser(userId);
              if (result.success) {
                Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
                await loadUsers();
              } else {
                Alert.alert('Erreur', result.error || 'Erreur lors de la suppression.');
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
            }
          },
        },
      ]
    );
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'shield-outline';
      case UserRole.SUPERVISOR:
        return 'eye-outline';
      case UserRole.AGENT:
        return 'person-outline';
      default:
        return 'person-outline';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '#EC4899';
      case UserRole.SUPERVISOR:
        return '#8B5CF6';
      case UserRole.AGENT:
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrateur';
      case UserRole.SUPERVISOR:
        return 'Superviseur';
      case UserRole.AGENT:
        return 'Agent';
      default:
        return role;
    }
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Gestion des utilisateurs</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Créer et gérer les comptes utilisateurs
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        <Pressable
          onPress={handleCreateUser}
          style={({ pressed }) => [
            styles.createButton,
            {
              backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
              borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
            },
            pressed && styles.createButtonPressed,
          ]}>
          <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
          <ThemedText type="defaultSemiBold" style={styles.createButtonText}>
            Créer un utilisateur
          </ThemedText>
        </Pressable>

        <ThemedView style={styles.section}>
          {users.length === 0 ? (
            <ThemedText style={styles.emptyText}>Aucun utilisateur</ThemedText>
          ) : (
            users.map((user) => (
              <View
                key={user.id}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
                    borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
                  },
                ]}>
                <View style={styles.userHeader}>
                  <View style={[styles.roleIcon, { backgroundColor: `${getRoleColor(user.role)}15` }]}>
                    <Ionicons name={getRoleIcon(user.role)} size={24} color={getRoleColor(user.role)} />
                  </View>
                  <View style={styles.userInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.userName}>
                      {user.name}
                    </ThemedText>
                    <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
                    <View style={styles.userMeta}>
                      <ThemedText style={styles.userRole}>{getRoleLabel(user.role)}</ThemedText>
                      {user.station && (
                        <ThemedText style={styles.userStation}>• {user.station}</ThemedText>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.userActions}>
                  <Pressable
                    onPress={() => handleEditUser(user)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}>
                    <Ionicons name="create-outline" size={20} color="#3B82F6" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteUser(user.id)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ThemedView>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">
                {editingUser ? 'Modifier utilisateur' : 'Créer un utilisateur'}
              </ThemedText>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Nom *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#FFF',
                      color: isDark ? '#FFF' : '#000',
                      borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                    },
                  ]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Nom complet"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Email *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#FFF',
                      color: isDark ? '#FFF' : '#000',
                      borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                    },
                  ]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Rôle *</ThemedText>
                <View style={styles.roleButtons}>
                  {[UserRole.AGENT, UserRole.SUPERVISOR, UserRole.ADMIN].map((role) => (
                    <Pressable
                      key={role}
                      onPress={() => setFormData({ ...formData, role })}
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor:
                            formData.role === role
                              ? getRoleColor(role)
                              : isDark
                                ? '#2A2A2A'
                                : '#F9FAFB',
                          borderColor: formData.role === role ? getRoleColor(role) : '#E5E7EB',
                        },
                      ]}>
                      <ThemedText
                        style={[
                          styles.roleButtonText,
                          { color: formData.role === role ? '#FFF' : isDark ? '#FFF' : '#000' },
                        ]}>
                        {getRoleLabel(role)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Station</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#FFF',
                      color: isDark ? '#FFF' : '#000',
                      borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                    },
                  ]}
                  value={formData.station}
                  onChangeText={(text) => setFormData({ ...formData, station: text })}
                  placeholder="Code station (ex: FIH)"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}>
                <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveUser}
                style={[styles.modalButton, styles.saveButton]}>
                <ThemedText style={styles.saveButtonText}>
                  {editingUser ? 'Modifier' : 'Créer'}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
};

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
    flex: 1,
  },
  section: {
    padding: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  createButtonPressed: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  userStation: {
    fontSize: 12,
    opacity: 0.7,
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalBody: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

