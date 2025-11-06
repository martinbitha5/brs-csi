// Service d'authentification et de gestion des utilisateurs

import { User, UserRole } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { languageService, Language } from './languageService';

// Interface pour stocker les mots de passe (en production, utiliser un hash)
interface UserPassword {
  userId: string;
  password: string; // En production, stocker un hash
}

// Simulation de données utilisateurs en mémoire
let users: User[] = [
  {
    id: 'admin-1',
    name: 'Administrateur',
    email: 'admin@ats.cd',
    role: UserRole.ADMIN,
    station: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'supervisor-1',
    name: 'Superviseur',
    email: 'supervisor@ats.cd',
    role: UserRole.SUPERVISOR,
    station: 'FIH',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'agent-1',
    name: 'Agent',
    email: 'agent@ats.cd',
    role: UserRole.AGENT,
    station: 'FIH',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Stockage des mots de passe (simulation)
let userPasswords: UserPassword[] = [
  { userId: 'admin-1', password: 'admin123' },
  { userId: 'supervisor-1', password: 'supervisor123' },
  { userId: 'agent-1', password: 'agent123' },
];

let currentUser: User | null = null;

const STORAGE_KEY = '@brs_csi_current_user';

// Génération d'ID UUID simple
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const authService = {
  // Charger l'utilisateur depuis le stockage
  loadStoredUser: async (): Promise<void> => {
    try {
      const storedUserJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUserJson) {
        const storedUserId = JSON.parse(storedUserJson);
        const user = users.find((u) => u.id === storedUserId);
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
    const user = users.find((u) => u.email === email);
    if (!user) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect.',
      };
    }

    // Vérifier le mot de passe
    const userPassword = userPasswords.find((up) => up.userId === user.id);
    if (!userPassword || userPassword.password !== password) {
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
  getUsers: (): User[] => {
    return [...users];
  },

  getUser: (id: string): User | undefined => {
    return users.find((u) => u.id === id);
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
    // Vérifier si l'email existe déjà
    if (users.find((u) => u.email === email)) {
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

    const now = new Date().toISOString();
    const newUser: User = {
      id: generateId(),
      name,
      email,
      role,
      station,
      language: userLanguage,
      created_at: now,
      updated_at: now,
    };

    users.push(newUser);
    userPasswords.push({ userId: newUser.id, password });

    // Sauvegarder la langue dans AsyncStorage
    if (userLanguage) {
      await languageService.setLanguage(userLanguage);
    }

    return {
      success: true,
      user: newUser,
    };
  },

  // Création d'utilisateur par admin (pour la gestion)
  createUser: (
    user: Omit<User, 'id' | 'created_at' | 'updated_at'>,
    password?: string
  ): { success: boolean; user?: User; error?: string } => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'Accès non autorisé. Seuls les administrateurs peuvent créer des utilisateurs.',
      };
    }

    // Vérifier si l'email existe déjà
    if (users.find((u) => u.email === user.email)) {
      return {
        success: false,
        error: 'Cet email est déjà utilisé.',
      };
    }

    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    users.push(newUser);
    
    // Ajouter le mot de passe si fourni
    if (password) {
      userPasswords.push({ userId: newUser.id, password });
    }

    return {
      success: true,
      user: newUser,
    };
  },

  updateUser: (
    id: string,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ): { success: boolean; user?: User; error?: string } => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'Accès non autorisé. Seuls les administrateurs peuvent modifier les utilisateurs.',
      };
    }

    const user = users.find((u) => u.id === id);
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non trouvé.',
      };
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (updates.email && updates.email !== user.email) {
      if (users.find((u) => u.email === updates.email && u.id !== id)) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé.',
        };
      }
    }

    Object.assign(user, updates, {
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      user,
    };
  },

  deleteUser: (id: string): { success: boolean; error?: string } => {
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

    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return {
        success: false,
        error: 'Utilisateur non trouvé.',
      };
    }

    users.splice(index, 1);
    return {
      success: true,
    };
  },

  // Mettre à jour la langue de l'utilisateur actuel
  updateUserLanguage: async (language: Language): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return {
        success: false,
        error: 'Aucun utilisateur connecté.',
      };
    }

    const user = users.find((u) => u.id === currentUser?.id);
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non trouvé.',
      };
    }

    user.language = language;
    user.updated_at = new Date().toISOString();
    currentUser.language = language;

    // Mettre à jour la langue dans le service de langue
    await languageService.setLanguage(language);

    return {
      success: true,
    };
  },

  // Réinitialiser les données (pour les tests)
  resetData: (): void => {
    users = [
      {
        id: 'admin-1',
        name: 'Administrateur',
        email: 'admin@ats.cd',
        role: UserRole.ADMIN,
        station: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'supervisor-1',
        name: 'Superviseur',
        email: 'supervisor@ats.cd',
        role: UserRole.SUPERVISOR,
        station: 'FIH',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'agent-1',
        name: 'Agent',
        email: 'agent@ats.cd',
        role: UserRole.AGENT,
        station: 'FIH',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    currentUser = null;
  },
};

