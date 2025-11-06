// Service de gestion centralisée des erreurs
// Fournit des fonctions utilitaires pour gérer les erreurs de manière cohérente

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  code?: string;
  retryable?: boolean;
}

export class ErrorHandler {
  /**
   * Crée une erreur formatée à partir d'une erreur inconnue
   */
  static createError(error: any, context?: string): AppError {
    // Erreur réseau
    if (error?.message?.includes('network') || error?.message?.includes('Network')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
        originalError: error,
        retryable: true,
      };
    }

    // Erreur 401 - Non authentifié
    if (error?.status === 401 || error?.code === 'UNAUTHENTICATED') {
      return {
        type: ErrorType.AUTHENTICATION,
        message: 'Votre session a expiré. Veuillez vous reconnecter.',
        originalError: error,
        code: '401',
        retryable: false,
      };
    }

    // Erreur 403 - Non autorisé
    if (error?.status === 403 || error?.code === 'UNAUTHORIZED') {
      return {
        type: ErrorType.AUTHORIZATION,
        message: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
        originalError: error,
        code: '403',
        retryable: false,
      };
    }

    // Erreur 404 - Non trouvé
    if (error?.status === 404 || error?.code === 'NOT_FOUND') {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'La ressource demandée n\'a pas été trouvée.',
        originalError: error,
        code: '404',
        retryable: false,
      };
    }

    // Erreur 500+ - Serveur
    if (error?.status >= 500 || error?.code === 'SERVER_ERROR') {
      return {
        type: ErrorType.SERVER,
        message: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
        originalError: error,
        code: error?.status?.toString(),
        retryable: true,
      };
    }

    // Erreur de validation
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message || 'Les données fournies ne sont pas valides.',
        originalError: error,
        retryable: false,
      };
    }

    // Erreur avec message personnalisé
    if (error?.message) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message,
        originalError: error,
        retryable: false,
      };
    }

    // Erreur inconnue par défaut
    return {
      type: ErrorType.UNKNOWN,
      message: context
        ? `Une erreur est survenue lors de ${context}. Veuillez réessayer.`
        : 'Une erreur inattendue est survenue. Veuillez réessayer.',
      originalError: error,
      retryable: false,
    };
  }

  /**
   * Log une erreur pour le debugging
   */
  static logError(error: AppError, context?: string): void {
    if (__DEV__) {
      console.error(`[ErrorHandler] ${context || 'Erreur'}:`, {
        type: error.type,
        message: error.message,
        code: error.code,
        originalError: error.originalError,
      });
    }
    // En production, envoyer à un service de logging (Sentry, etc.)
  }

  /**
   * Affiche un message d'erreur utilisateur-friendly
   */
  static getUserFriendlyMessage(error: AppError): string {
    return error.message;
  }

  /**
   * Vérifie si une erreur peut être réessayée
   */
  static isRetryable(error: AppError): boolean {
    return error.retryable === true;
  }

  /**
   * Retry une fonction avec gestion d'erreurs
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: AppError | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = this.createError(error, context);
        this.logError(lastError, `${context} - Tentative ${attempt}/${maxRetries}`);

        // Si ce n'est pas une erreur retryable, arrêter immédiatement
        if (!this.isRetryable(lastError)) {
          throw lastError;
        }

        // Si ce n'est pas la dernière tentative, attendre avant de réessayer
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    // Si toutes les tentatives ont échoué
    throw lastError || this.createError(new Error('Toutes les tentatives ont échoué'), context);
  }

  /**
   * Wrapper pour les fonctions async avec gestion d'erreurs automatique
   */
  static async handleAsync<T>(
    fn: () => Promise<T>,
    context?: string,
    onError?: (error: AppError) => void
  ): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (error) {
      const appError = this.createError(error, context);
      this.logError(appError, context);

      if (onError) {
        onError(appError);
      }

      return { success: false, error: appError };
    }
  }
}

// Export d'une instance par défaut pour faciliter l'utilisation
export const errorHandler = ErrorHandler;

