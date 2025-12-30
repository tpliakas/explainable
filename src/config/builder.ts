import { Explained } from '../core/explained'
import { ConfigResolver, type ConfigSource } from './resolver'
import type { Source } from '../core/types'

/**
 * Fluent builder for creating explainable configurations.
 * Provides an ergonomic API for adding sources with precedence.
 */
export class ConfigBuilder<T extends Record<string, any>> {
  private sources: ConfigSource<T>[] = []
  private currentPrecedence = 0

  /**
   * Add default configuration (lowest precedence)
   */
  defaults(data: Partial<T>, reason?: string): this {
    return this.from(data, {
      name: 'defaults',
      precedence: 0,
      reason: reason || 'Default configuration',
    })
  }

  /**
   * Add configuration from environment variables
   */
  env(data: Partial<T>, reason?: string): this {
    return this.from(data, {
      name: 'env',
      precedence: 10,
      reason: reason || 'Environment variables',
    })
  }

  /**
   * Add configuration from a file
   */
  file(data: Partial<T>, filePath?: string, reason?: string): this {
    return this.from(data, {
      name: 'file',
      precedence: 5,
      reason: reason || 'Configuration file',
      location: filePath,
    })
  }

  /**
   * Add configuration from CLI arguments
   */
  cli(data: Partial<T>, reason?: string): this {
    return this.from(data, {
      name: 'cli',
      precedence: 20,
      reason: reason || 'Command-line arguments',
    })
  }

  /**
   * Add configuration from a custom source
   */
  from(data: Partial<T>, source: Source): this {
    this.sources.push({ data, source })
    this.currentPrecedence = Math.max(this.currentPrecedence, source.precedence)
    return this
  }

  /**
   * Add configuration with automatic precedence increment
   */
  add(data: Partial<T>, sourceName: string, reason?: string): this {
    this.currentPrecedence += 1
    return this.from(data, {
      name: sourceName,
      precedence: this.currentPrecedence,
      reason: reason || `From ${sourceName}`,
    })
  }

  /**
   * Build the final Explained configuration
   */
  build(): Explained<T> {
    const resolver = new ConfigResolver<T>()
    
    for (const source of this.sources) {
      resolver.addSource(source.data, source.source)
    }

    return resolver.resolve()
  }

  /**
   * Get the number of sources added
   */
  get sourceCount(): number {
    return this.sources.length
  }

  /**
   * Clear all sources
   */
  clear(): this {
    this.sources = []
    this.currentPrecedence = 0
    return this
  }
}

/**
 * Create a new configuration builder
 * 
 * @example
 * ```ts
 * const config = explainable<AppConfig>()
 *   .defaults({ port: 8080, host: 'localhost' })
 *   .env(process.env)
 *   .cli(cliArgs)
 *   .build()
 * 
 * console.log(config.value.port) // Final port value
 * console.log(config.explain('port')) // Why it's that value
 * ```
 */
export function explainable<T extends Record<string, any>>(): ConfigBuilder<T> {
  return new ConfigBuilder<T>()
}

