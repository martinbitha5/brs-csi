// Service de gestion centralisée des erreurs
// Fournit des messages d'erreur utilisateur-friendly et gère les erreurs réseau

export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  AUTH_ERROR = 'auth_error',
  VALIDATION_ERROR = 'validation_error',
  NOT_FOUND = 'not_found',
  PERMISSION_DENIED = 'permission_denied',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  code?: string;
  statusCode?: number;
}

export class ErrorHandler {
  /**
   * Analyse une erreur et retourne un objet AppError structuré
   */
  static parseError(error: any): AppError {
    // Erreur réseau
    if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        originalError: error,
      };
    }

    // Erreur Supabase
    if (error?.code) {
      const supabaseError = this.parseSupabaseError(error);
      if (supabaseError) return supabaseError;
    }

    // Erreur HTTP
    if (error?.status || error?.statusCode) {
      return this.parseHttpError(error);
    }

    // Erreur de validation
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: error.message || 'Données invalides.',
        originalError: error,
      };
    }

    // Erreur inconnue
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error?.message || 'Une erreur inattendue est survenue.',
      originalError: error,
    };
  }

  /**
   * Parse les erreurs Supabase
   */
  private static parseSupabaseError(error: any): AppError | null {
    const code = error.code;
    const message = error.message || '';

    // Erreur d'authentification (mais pas pour l'inscription)
    // PGRST301 = JWT expired, 42501 = insufficient_privilege
    // On vérifie si c'est une erreur de permission lors d'une opération qui nécessite l'authentification
    if ((code === 'PGRST301' || (code === '42501' && !message.includes('new row violates'))) || 
        (message.includes('JWT') && !message.includes('registration') && !message.includes('register'))) {
      return {
        type: ErrorType.AUTH_ERROR,
        message: 'Session expirée. Veuillez vous reconnecter.',
        originalError: error,
        code,
      };
    }

    // Erreur de permission (mais pas pour l'inscription)
    // On vérifie si c'est une erreur de permission qui n'est pas liée à l'inscription
    if ((code === '42501' && !message.includes('new row violates')) || 
        (message.includes('permission') && !message.includes('registration') && !message.includes('register')) ||
        (message.includes('policy') && !message.includes('registration') && !message.includes('register'))) {
      return {
        type: ErrorType.PERMISSION_DENIED,
        message: 'Vous n\'avez pas la permission d\'effectuer cette action.',
        originalError: error,
        code,
      };
    }

    // Ressource non trouvée
    if (code === 'PGRST116' || message.includes('not found')) {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'Ressource non trouvée.',
        originalError: error,
        code,
      };
    }

    // Erreur de contrainte (doublon, etc.)
    if (code === '23505' || message.includes('duplicate') || message.includes('unique')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: 'Cette ressource existe déjà.',
        originalError: error,
        code,
      };
    }

    // Erreur serveur
    if (code?.startsWith('PGRST') || code?.startsWith('42')) {
      return {
        type: ErrorType.SERVER_ERROR,
        message: 'Erreur serveur. Veuillez réessayer plus tard.',
        originalError: error,
        code,
      };
    }

    return null;
  }

  /**
   * Parse les erreurs HTTP
   */
  private static parseHttpError(error: any): AppError {
    const status = error.status || error.statusCode;

    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: 'Requête invalide. Vérifiez les données saisies.',
          originalError: error,
          statusCode: status,
        };
      case 401:
        return {
          type: ErrorType.AUTH_ERROR,
          message: 'Non autorisé. Veuillez vous reconnecter.',
          originalError: error,
          statusCode: status,
        };
      case 403:
        return {
          type: ErrorType.PERMISSION_DENIED,
          message: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
          originalError: error,
          statusCode: status,
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: 'Ressource non trouvée.',
          originalError: error,
          statusCode: status,
        };
      case 500:
      case 502:
      case 503:
        return {
          type: ErrorType.SERVER_ERROR,
          message: 'Erreur serveur. Veuillez réessayer plus tard.',
          originalError: error,
          statusCode: status,
        };
      default:
        return {
          type: ErrorType.UNKNOWN_ERROR,
          message: error.message || 'Une erreur est survenue.',
          originalError: error,
          statusCode: status,
        };
    }
  }

  /**
   * Log une erreur pour le debugging
   */
  static logError(error: AppError, context?: string): void {
    const logMessage = context
      ? `[${context}] ${error.type}: ${error.message}`
      : `${error.type}: ${error.message}`;

    console.error(logMessage, {
      code: error.code,
      statusCode: error.statusCode,
      originalError: error.originalError,
    });
  }

  /**
   * Retourne un message d'erreur utilisateur-friendly
   */
  static getUserMessage(error: AppError): string {
    return error.message;
  }

  /**
   * Vérifie si une erreur est récupérable (peut être réessayée)
   */
  static isRetryable(error: AppError): boolean {
    return (
      error.type === ErrorType.NETWORK_ERROR ||
      error.type === ErrorType.SERVER_ERROR ||
      (error.statusCode && error.statusCode >= 500)
    );
  }

  /**
   * Retourne le délai recommandé avant un retry (en millisecondes)
   */
  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }
}

/**
 * Wrapper pour exécuter une fonction avec gestion d'erreur automatique
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const appError = ErrorHandler.parseError(error);
    ErrorHandler.logError(appError, context);
    throw appError;
  }
}

/**
 * Retry une fonction avec gestion d'erreur et backoff exponentiel
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  context?: string
): Promise<T> {
  let lastError: AppError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const appError = ErrorHandler.parseError(error);

      // Si l'erreur n'est pas récupérable, arrêter immédiatement
      if (!ErrorHandler.isRetryable(appError)) {
        throw appError;
      }

      lastError = appError;

      // Si ce n'est pas la dernière tentative, attendre avant de réessayer
      if (attempt < maxAttempts - 1) {
        const delay = ErrorHandler.getRetryDelay(attempt);
        ErrorHandler.logError(
          appError,
          `${context || 'Retry'} - Tentative ${attempt + 1}/${maxAttempts} dans ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Si toutes les tentatives ont échoué, lancer la dernière erreur
  if (lastError) {
    throw lastError;
  }

  throw ErrorHandler.parseError(new Error('Toutes les tentatives ont échoué'));
}
