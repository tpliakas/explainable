/**
 * Represents a single decision point in the configuration resolution process.
 * Tracks where a value came from, why it was chosen, and whether it won.
 */
export interface Explanation {
  /** The source of this value (e.g., "defaults", "env", "cli") */
  source: string
  
  /** The actual value from this source */
  value: unknown
  
  /** Human-readable reason for this decision */
  reason: string
  
  /** Precedence level (higher wins) */
  precedence: number
  
  /** Optional location information (file path, line number, etc.) */
  location?: string
  
  /** Whether this value won the resolution */
  won: boolean
  
  /** Timestamp when this decision was recorded */
  timestamp: number
}

/**
 * Configuration for how explanations should be generated
 */
export interface ExplainOptions {
  /** Include only winning decisions */
  onlyWinners?: boolean
  
  /** Format for output */
  format?: 'structured' | 'text'
  
  /** Include timestamps in explanations */
  includeTimestamps?: boolean
}

/**
 * Metadata about a configuration source
 */
export interface Source {
  /** Name of the source */
  name: string
  
  /** Precedence level for this source */
  precedence: number
  
  /** Optional reason/description */
  reason?: string
  
  /** Optional location information */
  location?: string
}

/**
 * The result of an explained configuration resolution.
 * Contains both the final value and the full decision history.
 */
export interface ExplanationResult<T> {
  /** The final resolved value */
  value: T
  
  /** All explanations for how this value was determined */
  explanations: Record<string, Explanation[]>
  
  /** Metadata about the resolution process */
  metadata?: {
    /** Total number of sources considered */
    sourcesCount: number
    
    /** Timestamp of resolution */
    resolvedAt: number
  }
}

/**
 * Utility type for extracting keys from nested objects as dot-notation paths
 */
export type PathKeys<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? K | `${K}.${PathKeys<T[K]>}`
        : K
    }[keyof T & string]
  : never

/**
 * Utility type to get the value type at a given path
 */
export type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : never

