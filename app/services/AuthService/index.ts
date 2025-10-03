import * as getMethods from './get'
import * as patchMethods from './patch'
import * as postMethods from './post'

const getSupabaseClient = () => {
    try {
        return useSupabaseClient()
    } catch (e) {
        // Fallback to Nuxt app if composable fails
        try {
            const { $supabase } = useNuxtApp()
            return $supabase
        } catch (fallbackError) {
            console.error("Erreur de contexte Nuxt: Impossible d'accéder à Supabase. Assurez-vous que l'appel provient d'un composant, d'un hook, ou d'une action Pinia.", e, fallbackError)
            throw new Error("L'accès au client Supabase a échoué en dehors du contexte Nuxt.")
        }
    }
}


export const authService = {
  // GET
  getCurrentProfile: getMethods.getCurrentProfile,
  checkAdmin: getMethods.checkAdmin,

  // PATCH
  updateProfile: patchMethods.updateProfile,

  // POST
  sendMagicLink: postMethods.sendMagicLink,
  initiateGoogleSignIn: postMethods.initiateGoogleSignIn,
  createUserProfile: postMethods.createUserProfile,

  /**
   * Nettoie la session côté client.
   */
  async signOut(): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase?.auth?.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },
  
  /**
   * Récupère la session actuelle.
   */
  async getSession() {
    try {
      const supabase = getSupabaseClient()
      if (!supabase?.auth) {
        console.warn('Supabase auth client not available for getSession')
        return null
      }

      return await supabase.auth.getSession()
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  },

  /**
   * Met en place l'écouteur d'état d'authentification en temps réel (Abstraction de Supabase).
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    try {
      const supabase = getSupabaseClient()
      if (!supabase?.auth) {
        console.warn('Supabase auth client not available')
        return null
      }

      // La méthode onAuthStateChange renvoie une souscription que l'on doit retourner
      const response = supabase.auth.onAuthStateChange(callback)

      if (!response || !response.data) {
        console.warn('Auth state change subscription failed')
        return null
      }

      return response.data.subscription
    } catch (error) {
      console.error('Error setting up auth state change listener:', error)
      return null
    }
  },
}