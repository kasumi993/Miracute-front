// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Export all PATCH methods
export * from './patch'

// Create a unified AuthService object for easier usage
export const AuthService = {
  // GET methods
  getUser: () => import('./get').then(m => m.getUser()),
  checkAdmin: () => import('./get').then(m => m.checkAdmin()),

  // POST methods
  createUserProfile: (userData: any) => import('./post').then(m => m.createUserProfile(userData)),

  // PATCH methods
  updateUser: (updates: any) => import('./patch').then(m => m.updateUser(updates))
}