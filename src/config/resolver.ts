import { Explained } from '../core/explained'
import type { Source } from '../core/types'

/**
 * Options for resolving configuration
 */
export interface ResolveOptions {
  /** Custom merge strategy for specific keys */
  mergeStrategies?: Record<string, MergeStrategy>
  
  /** Whether to deep merge objects (default: true) */
  deepMerge?: boolean
}

/**
 * Strategy for merging values
 */
export type MergeStrategy = 'replace' | 'merge' | 'append' | 'custom'

/**
 * A configuration source with its metadata
 */
export interface ConfigSource<T = any> {
  /** The configuration data */
  data: Partial<T>
  
  /** Source metadata */
  source: Source
}

/**
 * Smart configuration resolver that merges multiple sources
 * while tracking the decision history for each field.
 */
export class ConfigResolver<T extends Record<string, any>> {
  private sources: ConfigSource<T>[] = []

  constructor(_options: ResolveOptions = {}) {
    // Options reserved for future use (custom merge strategies, etc.)
  }

  /**
   * Add a configuration source
   */
  addSource(data: Partial<T>, source: Source): this {
    this.sources.push({ data, source })
    return this
  }

  /**
   * Resolve all sources into a single Explained configuration
   */
  resolve(): Explained<T> {
    if (this.sources.length === 0) {
      return new Explained({} as T)
    }

    // Sort sources by precedence (lowest first, so highest wins in merge)
    const sortedSources = [...this.sources].sort(
      (a, b) => a.source.precedence - b.source.precedence
    )

    // Convert each source to an Explained instance
    const explainedSources = sortedSources.map(({ data, source }) => {
      return Explained.from(
        data,
        source.name,
        source.reason || `From ${source.name}`,
        source.precedence,
        source.location
      )
    })

    // Merge all sources
    return Explained.merge<T>(...explainedSources)
  }

  // Deep merge functionality reserved for future custom merge strategies

  /**
   * Create a resolver from multiple sources at once
   */
  static from<T extends Record<string, any>>(
    sources: ConfigSource<T>[],
    options?: ResolveOptions
  ): ConfigResolver<T> {
    const resolver = new ConfigResolver<T>(options)
    sources.forEach(({ data, source }) => resolver.addSource(data, source))
    return resolver
  }

  /**
   * Quick resolve helper for simple cases
   */
  static resolve<T extends Record<string, any>>(
    sources: ConfigSource<T>[],
    options?: ResolveOptions
  ): Explained<T> {
    return ConfigResolver.from(sources, options).resolve()
  }
}

