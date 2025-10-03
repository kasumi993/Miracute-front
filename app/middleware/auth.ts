import { useUserStore } from '~/stores/auth/user'
import type { RouteLocationNormalized } from 'vue-router'

/**
 * Exige que l'utilisateur soit authentifié.
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
 */
export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    const userStore = useUserStore()

    // Attendre que le store Pinia ait complété son initialisation (récupération de session/profil).
    await userStore.ensureInitialized()

    // Vérification de l'état d'authentification.
    if (!userStore.isAuthenticatedAndValid) {
      // Si non authentifié, rediriger vers la page de connexion, en conservant la destination.
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
)