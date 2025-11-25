import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a singleton ratelimit instance
// For development without Upstash, we'll use a simple in-memory store
const createRateLimiter = () => {
  // If Upstash credentials are provided, use Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    })
  }

  // Fallback: in-memory rate limiter for development
  const cache = new Map()
  
  return {
    limit: async (identifier: string) => {
      const now = Date.now()
      const windowMs = 10000 // 10 seconds
      const limit = 10
      
      const key = identifier
      const record = cache.get(key) || { count: 0, resetTime: now + windowMs }
      
      if (now > record.resetTime) {
        record.count = 1
        record.resetTime = now + windowMs
      } else {
        record.count++
      }
      
      cache.set(key, record)
      
      const success = record.count <= limit
      const remaining = Math.max(0, limit - record.count)
      
      return {
        success,
        limit,
        remaining,
        reset: record.resetTime,
        pending: Promise.resolve(),
      }
    },
  }
}

export const ratelimit = createRateLimiter()
