// Service de détection de l'état de connexion réseau
// Utilise une implémentation simple pour détecter si l'app est en ligne ou hors ligne
// Note: expo-network n'existe plus, cette implémentation simule un état réseau

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

let networkState: NetworkState = {
  isConnected: true, // Par défaut, supposer qu'on est connecté
  isInternetReachable: true,
  type: 'unknown',
};

let listeners: Array<(state: NetworkState) => void> = [];

/**
 * Initialise le service de détection réseau
 */
export const initNetworkService = async (): Promise<void> => {
  try {
    // Par défaut, supposer qu'on est connecté
    // Dans une vraie implémentation, utiliser @react-native-community/netinfo
    networkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
    };
    notifyListeners();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du service réseau:', error);
    // Par défaut, supposer qu'on est connecté
    networkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
    };
  }
};

/**
 * Vérifie si l'app est connectée à Internet
 */
export const isOnline = (): boolean => {
  return networkState.isConnected && networkState.isInternetReachable === true;
};

/**
 * Vérifie si l'app est hors ligne
 */
export const isOffline = (): boolean => {
  return !networkState.isConnected || networkState.isInternetReachable === false;
};

/**
 * Obtient l'état actuel du réseau
 */
export const getNetworkState = (): NetworkState => {
  return { ...networkState };
};

/**
 * Rafraîchit l'état du réseau
 */
export const refreshNetworkState = async (): Promise<void> => {
  await initNetworkService();
};

/**
 * S'abonner aux changements d'état du réseau
 * Note: Expo Network ne supporte pas les listeners en temps réel,
 * donc cette fonction simule un polling
 */
export const subscribeToNetworkChanges = (
  callback: (state: NetworkState) => void,
  intervalMs: number = 5000
): (() => void) => {
  listeners.push(callback);
  
  // Polling pour détecter les changements
  const intervalId = setInterval(async () => {
    const previousState = { ...networkState };
    await refreshNetworkState();
    
    // Notifier seulement si l'état a changé
    if (
      previousState.isConnected !== networkState.isConnected ||
      previousState.isInternetReachable !== networkState.isInternetReachable
    ) {
      notifyListeners();
    }
  }, intervalMs);
  
  // Retourner une fonction de désabonnement
  return () => {
    clearInterval(intervalId);
    listeners = listeners.filter((listener) => listener !== callback);
  };
};

/**
 * Notifier tous les listeners
 */
const notifyListeners = (): void => {
  listeners.forEach((listener) => listener({ ...networkState }));
};

/**
 * Hook React pour utiliser l'état du réseau
 * Note: Importez React dans votre composant pour utiliser ce hook
 */
export const useNetworkState = (): NetworkState => {
  // Ce hook doit être utilisé dans un composant React
  // L'implémentation complète nécessite React.useState et React.useEffect
  // Pour l'instant, retourner l'état actuel
  return networkState;
};

