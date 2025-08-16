import { logger } from '../utils/logger.js'
import { performance } from 'node:perf_hooks'

interface MemorySnapshot {
  timestamp: number
  heapUsed: number
  heapTotal: number
  rss: number
  external: number
  arrayBuffers: number
}

export class MemoryGuard {
  private snapshots: MemorySnapshot[] = []
  private readonly maxSnapshots = 100
  private readonly checkInterval = 30000 // 30 seconds
  private readonly leakThreshold = 50 * 1024 * 1024 // 50MB
  private readonly leakGrowthRate = 0.1 // 10% growth
  private timer?: NodeJS.Timer
  private lastGC = 0

  start(): void {
    if (this.timer) {
      return
    }

    this.timer = setInterval(() => {
      this.checkMemory()
    }, this.checkInterval)

    // Take initial snapshot
    this.takeSnapshot()
    
    logger.info('Memory guard started')
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
      logger.info('Memory guard stopped')
    }
  }

  private takeSnapshot(): MemorySnapshot {
    const memUsage = process.memoryUsage()
    
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
    }

    this.snapshots.push(snapshot)

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
    }

    return snapshot
  }

  private checkMemory(): void {
    const snapshot = this.takeSnapshot()
    
    // Check absolute memory usage
    if (snapshot.heapUsed > this.leakThreshold) {
      this.handleHighMemory(snapshot)
    }

    // Check for memory leak pattern (continuous growth)
    if (this.detectMemoryLeak()) {
      this.handleMemoryLeak()
    }

    // Log memory metrics
    logger.debug({
      heapUsed: Math.round(snapshot.heapUsed / 1024 / 1024),
      heapTotal: Math.round(snapshot.heapTotal / 1024 / 1024),
      rss: Math.round(snapshot.rss / 1024 / 1024),
      external: Math.round(snapshot.external / 1024 / 1024),
    }, 'Memory snapshot')
  }

  private detectMemoryLeak(): boolean {
    if (this.snapshots.length < 10) {
      return false
    }

    // Get last 10 snapshots
    const recentSnapshots = this.snapshots.slice(-10)
    
    // Calculate growth rate
    const firstHeap = recentSnapshots[0]!.heapUsed
    const lastHeap = recentSnapshots[recentSnapshots.length - 1]!.heapUsed
    const growthRate = (lastHeap - firstHeap) / firstHeap

    // Check if memory is consistently growing
    let growthCount = 0
    for (let i = 1; i < recentSnapshots.length; i++) {
      if (recentSnapshots[i]!.heapUsed > recentSnapshots[i - 1]!.heapUsed) {
        growthCount++
      }
    }

    // Leak detected if consistent growth and high growth rate
    return growthCount >= 8 && growthRate > this.leakGrowthRate
  }

  private handleHighMemory(snapshot: MemorySnapshot): void {
    logger.warn({
      heapUsed: Math.round(snapshot.heapUsed / 1024 / 1024),
      threshold: Math.round(this.leakThreshold / 1024 / 1024),
    }, 'High memory usage detected')

    // Force garbage collection if available
    if (global.gc && Date.now() - this.lastGC > 60000) {
      logger.info('Forcing garbage collection')
      global.gc()
      this.lastGC = Date.now()
    }
  }

  private handleMemoryLeak(): void {
    const recentSnapshots = this.snapshots.slice(-10)
    const firstHeap = recentSnapshots[0]!.heapUsed
    const lastHeap = recentSnapshots[recentSnapshots.length - 1]!.heapUsed
    const leakRate = Math.round((lastHeap - firstHeap) / 1024 / 1024)

    logger.error({
      leakRate,
      duration: '5 minutes',
      action: 'Consider restarting the application',
    }, 'Potential memory leak detected')

    // Emit event for monitoring systems
    process.emit('warning', new Error(`Memory leak detected: ${leakRate}MB growth`))
  }

  getStats(): {
    current: MemorySnapshot | null
    trend: 'stable' | 'growing' | 'shrinking'
    averageHeap: number
  } {
    if (this.snapshots.length === 0) {
      return {
        current: null,
        trend: 'stable',
        averageHeap: 0,
      }
    }

    const current = this.snapshots[this.snapshots.length - 1]!
    const averageHeap = this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.snapshots.length

    let trend: 'stable' | 'growing' | 'shrinking' = 'stable'
    if (this.snapshots.length >= 3) {
      const recent = this.snapshots.slice(-3)
      const isGrowing = recent[1]!.heapUsed > recent[0]!.heapUsed && 
                       recent[2]!.heapUsed > recent[1]!.heapUsed
      const isShrinking = recent[1]!.heapUsed < recent[0]!.heapUsed && 
                         recent[2]!.heapUsed < recent[1]!.heapUsed
      
      if (isGrowing) trend = 'growing'
      else if (isShrinking) trend = 'shrinking'
    }

    return {
      current,
      trend,
      averageHeap,
    }
  }
}

// Singleton instance
export const memoryGuard = new MemoryGuard()

/**
 * Resource pool to prevent resource leaks
 */
export class ResourcePool<T> {
  private resources: T[] = []
  private inUse = new Set<T>()
  private createCount = 0

  constructor(
    private readonly factory: () => T | Promise<T>,
    private readonly destroyer: (resource: T) => void | Promise<void>,
    private readonly maxSize: number = 10,
    private readonly maxCreatePerMinute: number = 100
  ) {}

  async acquire(): Promise<T> {
    // Check rate limit
    if (this.createCount >= this.maxCreatePerMinute) {
      throw new Error('Resource creation rate limit exceeded')
    }

    // Try to get existing resource
    const available = this.resources.find(r => !this.inUse.has(r))
    
    if (available) {
      this.inUse.add(available)
      return available
    }

    // Create new resource if under limit
    if (this.resources.length < this.maxSize) {
      const resource = await this.factory()
      this.resources.push(resource)
      this.inUse.add(resource)
      this.createCount++
      
      // Reset counter every minute
      setTimeout(() => {
        this.createCount = Math.max(0, this.createCount - 1)
      }, 60000)
      
      return resource
    }

    // Wait for resource to become available
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const available = this.resources.find(r => !this.inUse.has(r))
        if (available) {
          clearInterval(checkInterval)
          this.inUse.add(available)
          resolve(available)
        }
      }, 100)
    })
  }

  release(resource: T): void {
    this.inUse.delete(resource)
  }

  async destroy(resource: T): Promise<void> {
    this.inUse.delete(resource)
    const index = this.resources.indexOf(resource)
    
    if (index !== -1) {
      this.resources.splice(index, 1)
      await this.destroyer(resource)
    }
  }

  async destroyAll(): Promise<void> {
    const promises = this.resources.map(r => this.destroyer(r))
    await Promise.all(promises)
    this.resources = []
    this.inUse.clear()
  }

  getStats(): {
    total: number
    inUse: number
    available: number
    createCount: number
  } {
    return {
      total: this.resources.length,
      inUse: this.inUse.size,
      available: this.resources.length - this.inUse.size,
      createCount: this.createCount,
    }
  }
}