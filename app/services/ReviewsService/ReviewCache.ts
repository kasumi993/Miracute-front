import type { ReviewStats } from '@/types'

export class ReviewCache {
  private reviewStatsCache = new Map<string, { stats: ReviewStats; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Retrieves review stats from cache if not expired.
   */
  public getFromCache(productId: string): ReviewStats | null {
    const cached = this.reviewStatsCache.get(productId)
    if (!cached) { return null }

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL
    if (isExpired) {
      this.reviewStatsCache.delete(productId)
      return null
    }

    return cached.stats
  }

  /**
   * Stores review stats in cache.
   */
  public cacheStats(productId: string, stats: ReviewStats): void {
    this.reviewStatsCache.set(productId, {
      stats,
      timestamp: Date.now()
    })
  }

  /**
   * Clears cache for a specific product ID.
   */
  public clearCache(productId: string): void {
    this.reviewStatsCache.delete(productId)
  }

  /**
   * Clears all cache entries.
   */
  public clearAllCache(): void {
    this.reviewStatsCache.clear()
  }
}