// Service de synchronisation des données hors ligne
// Gère la file d'attente des actions hors ligne et la synchronisation quand la connexion revient

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncStatus } from '@/types';
import { isOnline, refreshNetworkState } from './offlineService';
import { errorHandler, ErrorType } from './errorHandler';

const SYNC_QUEUE_KEY = '@brs_csi_sync_queue';
const SYNC_IN_PROGRESS_KEY = '@brs_csi_sync_in_progress';

export interface SyncAction {
  id: string;
  type: 'scan' | 'scan_boarding_pass' | 'update_status' | 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retries: number;
  maxRetries: number;
}

export interface SyncResult {
  success: boolean;
  actionId: string;
  error?: string;
}

/**
 * Ajouter une action à la file de synchronisation
 */
export const addToSyncQueue = async (action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>): Promise<string> => {
  try {
    const queue = await getSyncQueue();
    const newAction: SyncAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    
    queue.push(newAction);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    
    return newAction.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la file de synchronisation:', error);
    throw error;
  }
};

/**
 * Obtenir la file de synchronisation
 */
export const getSyncQueue = async (): Promise<SyncAction[]> => {
  try {
    const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la file de synchronisation:', error);
    return [];
  }
};

/**
 * Retirer une action de la file de synchronisation
 */
export const removeFromSyncQueue = async (actionId: string): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    const filtered = queue.filter((action) => action.id !== actionId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erreur lors de la suppression de la file de synchronisation:', error);
  }
};

/**
 * Marquer une action comme en cours de synchronisation
 */
export const markSyncInProgress = async (actionId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(SYNC_IN_PROGRESS_KEY, actionId);
  } catch (error) {
    console.error('Erreur lors du marquage de la synchronisation en cours:', error);
  }
};

/**
 * Marquer la synchronisation comme terminée
 */
export const markSyncComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SYNC_IN_PROGRESS_KEY);
  } catch (error) {
    console.error('Erreur lors du marquage de la synchronisation terminée:', error);
  }
};

/**
 * Incrémenter le nombre de tentatives pour une action
 */
export const incrementRetry = async (actionId: string): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    const action = queue.find((a) => a.id === actionId);
    if (action) {
      action.retries += 1;
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des tentatives:', error);
  }
};

/**
 * Synchroniser une action avec le serveur
 * Cette fonction doit être implémentée avec les vrais appels API
 */
export const syncAction = async (action: SyncAction): Promise<SyncResult> => {
  // TODO: Implémenter les vrais appels API selon le type d'action
  // Pour l'instant, simuler une synchronisation réussie
  
  try {
    switch (action.type) {
      case 'scan':
        // Appel API pour scanner un bagage
        // await apiService.scanBaggage(action.data);
        console.log('Synchronisation scan:', action.data);
        break;
        
      case 'scan_boarding_pass':
        // Appel API pour scanner un boarding pass
        // await apiService.scanBoardingPass(action.data);
        console.log('Synchronisation boarding pass:', action.data);
        break;
        
      case 'update_status':
        // Appel API pour mettre à jour un statut
        // await apiService.updateBagPieceStatus(action.data);
        console.log('Synchronisation mise à jour:', action.data);
        break;
        
      default:
        console.log('Type d\'action non géré:', action.type);
    }
    
    return {
      success: true,
      actionId: action.id,
    };
  } catch (error) {
    const appError = errorHandler.createError(error, `Synchronisation ${action.type}`);
    return {
      success: false,
      actionId: action.id,
      error: appError.message,
    };
  }
};

/**
 * Synchroniser toutes les actions en attente
 */
export const syncAllPendingActions = async (): Promise<SyncResult[]> => {
  const results: SyncResult[] = [];
  
  // Vérifier si une synchronisation est déjà en cours
  const inProgress = await AsyncStorage.getItem(SYNC_IN_PROGRESS_KEY);
  if (inProgress) {
    console.log('Une synchronisation est déjà en cours');
    return results;
  }
  
  // Vérifier la connexion
  await refreshNetworkState();
  if (!isOnline()) {
    console.log('Pas de connexion réseau, synchronisation annulée');
    return results;
  }
  
  const queue = await getSyncQueue();
  if (queue.length === 0) {
    return results;
  }
  
  console.log(`Synchronisation de ${queue.length} action(s) en attente...`);
  
  for (const action of queue) {
    // Vérifier le nombre de tentatives
    if (action.retries >= action.maxRetries) {
      console.warn(`Action ${action.id} a dépassé le nombre maximum de tentatives`);
      await removeFromSyncQueue(action.id);
      results.push({
        success: false,
        actionId: action.id,
        error: 'Nombre maximum de tentatives dépassé',
      });
      continue;
    }
    
    try {
      await markSyncInProgress(action.id);
      const result = await syncAction(action);
      
      if (result.success) {
        await removeFromSyncQueue(action.id);
        await markSyncComplete();
        results.push(result);
      } else {
        await incrementRetry(action.id);
        await markSyncComplete();
        results.push(result);
      }
    } catch (error) {
      await incrementRetry(action.id);
      await markSyncComplete();
      results.push({
        success: false,
        actionId: action.id,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
  
  return results;
};

/**
 * Vérifier et synchroniser automatiquement si en ligne
 */
export const autoSync = async (): Promise<void> => {
  await refreshNetworkState();
  if (isOnline()) {
    await syncAllPendingActions();
  }
};

/**
 * Obtenir le nombre d'actions en attente
 */
export const getPendingActionsCount = async (): Promise<number> => {
  const queue = await getSyncQueue();
  return queue.length;
};

/**
 * Nettoyer les actions anciennes (plus de 7 jours)
 */
export const cleanOldActions = async (): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const filtered = queue.filter((action) => {
      const actionDate = new Date(action.timestamp);
      return actionDate > sevenDaysAgo;
    });
    
    if (filtered.length !== queue.length) {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
      console.log(`Nettoyage: ${queue.length - filtered.length} action(s) ancienne(s) supprimée(s)`);
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des actions anciennes:', error);
  }
};

