import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api' })

// Email actions and operations
export const unsubscribeFromEmails = async (token: string) => {
  return await baseService.post('/email/unsubscribe', { token })
}

export const verifyReviewToken = async (token: string) => {
  return await baseService.post('/email/verify-token', { token })
}