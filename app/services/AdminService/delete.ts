import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()















/**
 * Delete admin session (logout admin user)
 */
export const deleteAdminSession = async (sessionId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/sessions/${sessionId}`)
}

/**
 * Delete notification
 */
export const deleteNotification = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/notifications/${id}`)
}

/**
 * Delete log entry
 */
export const deleteLogEntry = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/logs/${id}`)
}

/**
 * Clear all logs (with confirmation)
 */
export const clearAllLogs = async (confirm: boolean = false): Promise<ApiResponse<{ cleared: number }>> => {
  return baseService.request<{ cleared: number }>('/admin/logs/clear-all', {
    method: 'DELETE',
    body: { confirm }
  })
}

/**
 * Delete backup file
 */
export const deleteBackup = async (backupId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/backups/${backupId}`)
}

/**
 * Delete cache entry
 */
export const deleteCacheEntry = async (key: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/cache/${encodeURIComponent(key)}`)
}

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>('/admin/cache/clear-all')
}
