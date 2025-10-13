import type { RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '~/stores/auth/user' 

/**
 * Require user to have admin role
 */
export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    // Skip on server-side during SSR
    if (process.server) {return}
    const userStore = useUserStore()
    // Ensure auth state is initialized (fallback if plugin failed)
    if (!userStore.isInitialized) {
      await userStore.loadAuthState()
    }
    // 1. Vérification de l'authentification
    if (!userStore.isAuthenticatedAndValid) {
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }

    // 3. Vérification du rôle Admin
    if (!userStore.isAdmin) {
      // Utilisation de la méthode Nuxt pour les erreurs pour afficher une page d'erreur
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required',
        fatal: true // Afficher la page d'erreur Nuxt 403
      })
    }
  }
)