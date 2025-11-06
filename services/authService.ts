// Service d'authentification et de gestion des utilisateurs

import { User, UserRole } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { languageService, Language } from './languageService';
import { apiClient } from './apiClient';

let currentUser: User | null = null;

const STORAGE_KEY = '@brs_csi_current_user';

export const authService = {
  // Charger l'utilisateur depuis le stockage
  loadStoredUser: async (): Promise<void> => {
    try {
      const storedUserJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUserJson) {
        const storedUserId = JSON.parse(storedUserJson);
        // Charger l'utilisateur depuis Supabase
        const user = await apiClient.getUser(storedUserId);
        if (user) {
          currentUser = user;
          // Charger la langue depuis le profil utilisateur ou utiliser celle stockée
          if (user.language) {
            await languageService.setLanguage(user.language);
          } else {
            // Si l'utilisateur n'a pas de langue définie, charger celle stockée
            await languageService.loadStoredLanguage();
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    }
  },

  // Connexion
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Récupérer l'utilisateur depuis Supabase
      const user = await apiClient.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect.',
        };
      }

      // Vérifier le mot de passe depuis Supabase
      const storedPassword = await apiClient.getUserPassword(user.id);
      if (!storedPassword || storedPassword !== password) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect.',
        };
      }

      currentUser = user;
      
      // Charger la langue depuis le profil utilisateur ou utiliser celle stockée
      if (user.language) {
        await languageService.setLanguage(user.language);
      } else {
        // Si l'utilisateur n'a pas de langue définie, charger celle stockée
        await languageService.loadStoredLanguage();
      }
      
      // Sauvegarder dans AsyncStorage
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user.id));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
      }

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la connexion.',
      };
    }
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    currentUser = null;
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: (): User | null => {
    return currentUser;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    return currentUser !== null;
  },

  // Vérifier les permissions
  hasRole: (role: UserRole): boolean => {
    if (!currentUser) return false;
    return currentUser.role === role;
  },

  // Vérifier si l'utilisateur est superviseur ou admin
  isSupervisorOrAdmin: (): boolean => {
    if (!currentUser) return false;
    return currentUser.role === UserRole.SUPERVISOR || currentUser.role === UserRole.ADMIN;
  },

  // Vérifier si l'utilisateur est admin
  isAdmin: (): boolean => {
    if (!currentUser) return false;
    return currentUser.role === UserRole.ADMIN;
  },

  // Obtenir la route par défaut selon le rôle de l'utilisateur
  getDefaultRouteForRole: (): string => {
    if (!currentUser) return '/(tabs)';
    
    switch (currentUser.role) {
      case UserRole.AGENT:
        // Les agents sont redirigés vers l'écran de scan (leur interface principale)
        return '/(tabs)/scan';
      case UserRole.SUPERVISOR:
        // Les superviseurs sont redirigés vers leur interface de supervision
        return '/(tabs)/supervisor';
      case UserRole.ADMIN:
        // Les admins sont redirigés vers l'interface de supervision (qui inclut la gestion des utilisateurs)
        return '/(tabs)/supervisor';
      default:
        return '/(tabs)';
    }
  },

  // Définir l'utilisateur actuel (pour les tests)
  setCurrentUser: (user: User | null): void => {
    currentUser = user;
  },

  // Gestion des utilisateurs (admin uniquement)
  getUsers: async (): Promise<User[]> => {
    try {
      return await apiClient.getUsers();
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  },

  getUser: async (id: string): Promise<User | undefined> => {
    try {
      return await apiClient.getUser(id) || undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return undefined;
    }
  },

  // Inscription publique (pour les nouveaux utilisateurs)
  register: async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    station: string | null,
    language?: Language
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Vérifier si l'email existe déjà dans Supabase
      const existingUser = await apiClient.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé.',
        };
      }

      // Validation: les agents et superviseurs doivent avoir une station
      if ((role === UserRole.AGENT || role === UserRole.SUPERVISOR) && !station) {
        return {
          success: false,
          error: 'Les agents et superviseurs doivent avoir une station assignée.',
        };
      }

      // Validation: les admins ne doivent pas avoir de station
      if (role === UserRole.ADMIN && station) {
        return {
          success: false,
          error: 'Les administrateurs ne peuvent pas avoir de station assignée.',
        };
      }

      // Récupérer la langue actuelle si non fournie
      let userLanguage: Language | undefined = language;
      if (!userLanguage) {
        userLanguage = await languageService.loadStoredLanguage();
      }

      // Créer l'utilisateur dans Supabase
      const newUser = await apiClient.createUser({
        name,
        email,
        role,
        station,
        language: userLanguage,
      });

      // Sauvegarder le mot de passe dans Supabase
      await apiClient.setUserPassword(newUser.id, password);

      // Sauvegarder la langue dans AsyncStorage
      if (userLanguage) {
        await languageService.setLanguage(userLanguage);
      }

      return {
        success: true,
        user: newUser,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Gérer spécifiquement les erreurs d'inscription
      let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
      
      if (error.message) {
        // Si le message contient "Session expirée", c'est probablement une erreur RLS
        if (error.message.includes('Session expirée') || error.message.includes('JWT') || 
            error.code === 'PGRST301' || error.code === '42501') {
          errorMessage = 'Erreur de configuration serveur. Veuillez contacter l\'administrateur.';
        } else if (error.message.includes('duplicate') || error.message.includes('unique') || 
                   error.code === '23505') {
          errorMessage = 'Cet email est déjà utilisé.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Création d'utilisateur par admin (pour la gestion)
  createUser: async (
    user: Omit<User, 'id' | 'created_at' | 'updated_at'>,
    password?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'Accès non autorisé. Seuls les administrateurs peuvent créer des utilisateurs.',
      };
    }

    try {
      // Vérifier si l'email existe déjà dans Supabase
      const existingUser = await apiClient.getUserByEmail(user.email);
      if (existingUser) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé.',
        };
      }

      // Créer l'utilisateur dans Supabase
      const newUser = await apiClient.createUser(user);
      
      // Ajouter le mot de passe si fourni
      if (password) {
        await apiClient.setUserPassword(newUser.id, password);
      }

      return {
        success: true,
        user: newUser,
      };
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la création de l\'utilisateur.',
      };
    }
  },

  updateUser: async (
    id: string,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'Accès non autorisé. Seuls les administrateurs peuvent modifier les utilisateurs.',
      };
    }

    try {
      const user = await apiClient.getUser(id);
      if (!user) {
        return {
          success: false,
          error: 'Utilisateur non trouvé.',
        };
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (updates.email && updates.email !== user.email) {
        const existingUser = await apiClient.getUserByEmail(updates.email);
        if (existingUser && existingUser.id !== id) {
          return {
            success: false,
            error: 'Cet email est déjà utilisé.',
          };
        }
      }

      // Mettre à jour l'utilisateur dans Supabase
      const updatedUser = await apiClient.updateUser(id, updates);

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.',
      };
    }
  },

  deleteUser: async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'Accès non autorisé. Seuls les administrateurs peuvent supprimer des utilisateurs.',
      };
    }

    if (currentUser.id === id) {
      return {
        success: false,
        error: 'Vous ne pouvez pas supprimer votre propre compte.',
      };
    }

    try {
      const user = await apiClient.getUser(id);
      if (!user) {
        return {
          success: false,
          error: 'Utilisateur non trouvé.',
        };
      }

      // Supprimer l'utilisateur dans Supabase (le mot de passe sera supprimé automatiquement grâce à CASCADE)
      await apiClient.deleteUser(id);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la suppression de l\'utilisateur.',
      };
    }
  },

  // Mettre à jour la langue de l'utilisateur actuel
  updateUserLanguage: async (language: Language): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return {
        success: false,
        error: 'Aucun utilisateur connecté.',
      };
    }

    try {
      // Mettre à jour la langue dans Supabase
      const updatedUser = await apiClient.updateUser(currentUser.id, { language });
      
      // Mettre à jour l'utilisateur actuel
      currentUser.language = language;
      currentUser = updatedUser;

      // Mettre à jour la langue dans le service de langue
      await languageService.setLanguage(language);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la langue:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la mise à jour de la langue.',
      };
    }
  },

  // Réinitialiser les données (pour les tests)
  resetData: async (): Promise<void> => {
    // Cette fonction n'est plus nécessaire avec Supabase
    // Les données sont persistées dans la base de données
    currentUser = null;
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    }
  },
};

