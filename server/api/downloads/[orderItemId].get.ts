import { createFileManager } from '../../utils/fileManager' 
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server' 
import { createApiError } from '../../utils/apiResponse' 
import type { Database } from '@/types/database' // Assurez-vous d'avoir le type Database


export default defineEventHandler(async (event) => {
  const orderItemId = getRouterParam(event, 'orderItemId')
  
  // 1. Authentification SÉCURISÉE (Récupération de la session utilisateur)
  const user = await serverSupabaseUser(event) 
  if (!user) {
    // Si l'utilisateur n'est pas authentifié, renvoyer une erreur 401
    throw createApiError('Authentication required to access downloads.', 401)
  }
  
  // Remplacement de createError par createApiError pour la cohérence
  if (!orderItemId) {
    throw createApiError('Order item ID is required', 400)
  }

  try {
    // Utilisation du Service Role pour les privilèges élevés (lecture DB et signature Storage)
    const supabase = await serverSupabaseServiceRole<Database>(event)
    const fileManager = createFileManager(supabase)
    
    // Définitions de l'expiration du lien
    const EXPIRY_MINUTES = 10
    const EXPIRY_SECONDS = EXPIRY_MINUTES * 60 // 600 secondes

    // 2. Vérification de la propriété et du statut de paiement
    const { data: orderItem, error } = await supabase
      .from('order_items')
      .select(`
        *,
        order:orders!inner(
          id,
          user_id,
          payment_status
        ),
        product:products!inner(
          name,
          download_files,
          file_size
        )
      `)
      .eq('id', orderItemId)
      // 🔑 Utilisation directe de l'ID utilisateur récupéré
      .eq('order.user_id', user.id) 
      .eq('order.payment_status', 'paid') 
      .single()
      
    if (error || !orderItem) {
      throw createApiError('Download not found or not accessible', 404)
    }

    const downloadFiles = orderItem.product.download_files
    if (!downloadFiles || downloadFiles.length === 0) {
      throw createApiError('No download files available', 404)
    }
    
    const BUCKET_NAME = 'Miracute-templates' // Nom du bucket de stockage
    const filePath = downloadFiles[0] 

    const signedUrl = await fileManager.getSignedDownloadUrl(
      BUCKET_NAME,
      filePath,
      { expiresIn: EXPIRY_SECONDS } 
    )

    return {
      success: true,
      data: {
        downloadUrl: signedUrl,
        fileName: `${orderItem.product.name}.zip`,
        fileSize: orderItem.product.file_size,
        expiresAt: new Date(Date.now() + EXPIRY_SECONDS * 1000), 
      }
    }

  } catch (error: any) {
    console.error('Download error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createApiError('Failed to process download', 500)
  }
})