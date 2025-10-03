import * as getMethods from './get'
import * as patchMethods from './patch'
import * as postMethods from './post'

const getSupabaseClient = () => {
    try {
        const { $supabase } = useNuxtApp()
        return $supabase
    } catch (e) {
        console.error("Erreur de contexte Nuxt: Impossible d'accéder à $supabase. Assurez-vous que l'appel provient d'un composant, d'un hook, ou d'une action Pinia.", e)
        throw new Error("L'accès au client Supabase a échoué en dehors du contexte Nuxt.")
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
    const supabase = getSupabaseClient()
    console.log("Supabase client:", supabase)  // Debug log
    return supabase?.client.auth?.getSession()
  },

  /**
   * Met en place l'écouteur d'état d'authentification en temps réel (Abstraction de Supabase).
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabaseClient()
    // La méthode onAuthStateChange renvoie une souscription que l'on doit retourner
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(callback)
    return subscription
  },
}