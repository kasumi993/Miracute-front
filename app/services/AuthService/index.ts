import * as getMethods from './get'
import * as patchMethods from './patch'
import * as postMethods from './post'

const getSupabaseClient = () => {
    try {
        return useSupabaseClient()
    } catch (e) {
        console.warn("Could not get Supabase client from composable:", e)
        // For now, just throw the error instead of complex fallbacks
        throw new Error("Unable to access Supabase client - must be called from Vue context")
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
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase?.auth?.signOut()
      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.warn('Could not sign out via Supabase client:', error)
    }
  },
  
  /**
   * Récupère l'utilisateur authentifié actuel (recommandé par Supabase).
   */
  async getUser() {
    try {
      const supabase = getSupabaseClient()
      if (!supabase?.auth) {
        console.warn('Supabase auth client not available for getUser')
        return null
      }

      return await supabase.auth.getUser()
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },

  /**
   * Récupère la session actuelle (pour les tokens uniquement).
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