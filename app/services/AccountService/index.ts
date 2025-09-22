// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Create a unified AccountService object for easier usage
export const AccountService = {
  // GET methods
  getUserProfile: (userId?: string) => import('./get').then(m => m.getUserProfile(userId)),
  getUserOrders: (page?: number, limit?: number, status?: string) => import('./get').then(m => m.getUserOrders(page, limit, status)),
  getUserDownloads: (page?: number, limit?: number) => import('./get').then(m => m.getUserDownloads(page, limit)),
  getUserSettings: () => import('./get').then(m => m.getUserSettings()),
  getUserStats: () => import('./get').then(m => m.getUserStats()),
  getAccountStats: () => import('./get').then(m => m.getUserStats()), // Alias for compatibility
  getUserWishlist: (page?: number, limit?: number) => import('./get').then(m => m.getUserWishlist(page, limit)),
  getUserAddresses: () => import('./get').then(m => m.getUserAddresses()),
  getOrderDetails: (orderId: string) => import('./get').then(m => m.getOrderDetails(orderId)),
  getDownloadLink: (productId: string, orderId: string) => import('./get').then(m => m.getDownloadLink(productId, orderId)),
  getActivityLog: (page?: number, limit?: number) => import('./get').then(m => m.getActivityLog(page, limit)),

  // POST methods
  updateUserProfile: (data: any) => import('./post').then(m => m.updateUserProfile(data)),
  updateUserSettings: (data: any) => import('./post').then(m => m.updateUserSettings(data)),
  changePassword: (data: any) => import('./post').then(m => m.changePassword(data)),
  addToWishlist: (productId: string) => import('./post').then(m => m.addToWishlist(productId)),
  removeFromWishlist: (productId: string) => import('./post').then(m => m.removeFromWishlist(productId)),
  saveUserAddress: (data: any, addressId?: string) => import('./post').then(m => m.saveUserAddress(data, addressId)),
  deleteUserAddress: (addressId: string) => import('./post').then(m => m.deleteUserAddress(addressId)),
  setDefaultAddress: (addressId: string, type: 'billing' | 'shipping') => import('./post').then(m => m.setDefaultAddress(addressId, type)),
  requestAccountDeletion: (reason?: string) => import('./post').then(m => m.requestAccountDeletion(reason)),
  cancelAccountDeletion: (deletionId: string) => import('./post').then(m => m.cancelAccountDeletion(deletionId)),
  uploadAvatar: (file: File) => import('./post').then(m => m.uploadAvatar(file)),
  exportUserData: (format?: 'json' | 'csv') => import('./post').then(m => m.exportUserData(format))
}