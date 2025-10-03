import { useUserStore } from '~/stores/auth/user'

/**
 * Ce plugin s'exécute uniquement côté client.
 * Il assure que le Pinia store d'authentification est initialisé au démarrage de l'application.
 * Cela permet à tout middleware ou composant d'utiliser l'état d'authentification sans
 * avoir à appeler 'initialize()' manuellement.
 */
export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()

  // S'assurer que l'initialisation est bien gérée une seule fois
  if (!userStore.isInitialized) {
    // Si l'initialisation échoue, le store gère l'état d'erreur/non authentifié
    await userStore.initialize()
  }
})