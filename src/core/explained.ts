import type {
  Explanation,
  ExplanationResult,
  ExplainOptions,
} from './types'

/**
 * Core class that wraps a value with its decision history.
 * This is the breakthrough abstraction that makes configuration explainable.
 */
export class Explained<T> {
  private _value: T
  private _explanations: Map<string, Explanation[]>

  constructor(value: T, explanations?: Map<string, Explanation[]>) {
    this._value = value
    this._explanations = explanations || new Map()
  }

  /**
   * Get the final resolved value
   */
  get value(): T {
    return this._value
  }

  /**
   * Explain how a specific field (or the entire value) was resolved.
   * 
   * @param path - Optional dot-notation path to a nested field (e.g., "database.port")
   * @param options - Options for formatting the explanation
   * @returns Array of explanations showing the decision chain
   * 
   * @example
   * ```ts
   * const config = explainable({ port: 3000 })
   * config.explain('port') // Shows why port is 3000
   * ```
   */
  explain(path?: string, options?: ExplainOptions): Explanation[] {
    const key = path || '__root__'
    const explanations = this._explanations.get(key) || []

    if (options?.onlyWinners) {
      return explanations.filter(e => e.won)
    }

    return explanations
  }

  /**
   * Get all explanations for all fields
   */
  explainAll(): Record<string, Explanation[]> {
    const result: Record<string, Explanation[]> = {}
    
    for (const [key, explanations] of this._explanations.entries()) {
      if (key !== '__root__') {
        result[key] = explanations
      }
    }

    return result
  }

  /**
   * Format explanations as human-readable text
   * 
   * @param path - Optional path to explain
   * @returns Formatted string showing the decision chain
   */
  explainText(path?: string): string {
    const explanations = this.explain(path)
    
    if (explanations.length === 0) {
      return path ? `No explanations found for: ${path}` : 'No explanations available'
    }

    const winner = explanations.find(e => e.won)
    const finalValue = winner?.value ?? 'undefined'
    const header = path ? `${path} = ${JSON.stringify(finalValue)}` : `value = ${JSON.stringify(finalValue)}`

    const lines = [header, '', 'Decision chain:']
    
    explanations.forEach((exp, index) => {
      const status = exp.won ? '✓' : '✗'
      const valueStr = JSON.stringify(exp.value)
      lines.push(`${index + 1}. ${status} ${exp.source} → ${valueStr} (${exp.reason})`)
    })

    return lines.join('\n')
  }

  /**
   * Convert to a JSON-serializable format
   */
  toJSON(): ExplanationResult<T> {
    const explanations: Record<string, Explanation[]> = {}
    
    for (const [key, exps] of this._explanations.entries()) {
      explanations[key] = exps
    }

    return {
      value: this._value,
      explanations,
      metadata: {
        sourcesCount: this._explanations.size,
        resolvedAt: Date.now(),
      },
    }
  }

  /**
   * Internal method to add an explanation for a specific path
   */
  _addExplanation(path: string, explanation: Explanation): void {
    const existing = this._explanations.get(path) || []
    existing.push(explanation)
    this._explanations.set(path, existing)
  }

  /**
   * Internal method to set explanations for a path
   */
  _setExplanations(path: string, explanations: Explanation[]): void {
    this._explanations.set(path, explanations)
  }

  /**
   * Internal method to get all explanation paths
   */
  _getPaths(): string[] {
    return Array.from(this._explanations.keys())
  }

  /**
   * Create an Explained instance from a plain value with a single source
   */
  static from<T>(
    value: T,
    source: string,
    reason: string,
    precedence: number = 0,
    location?: string
  ): Explained<T> {
    const explained = new Explained(value)
    
    explained._addExplanation('__root__', {
      source,
      value,
      reason,
      precedence,
      location,
      won: true,
      timestamp: Date.now(),
    })

    return explained
  }

  /**
   * Merge multiple Explained instances, respecting precedence
   */
  static merge<T extends Record<string, any>>(
    ...explaineds: Explained<Partial<T>>[]
  ): Explained<T> {
    const mergedValue: any = {}
    const allExplanations = new Map<string, Explanation[]>()

    // Collect all keys from all sources
    const allKeys = new Set<string>()
    for (const explained of explaineds) {
      if (typeof explained.value === 'object' && explained.value !== null) {
        Object.keys(explained.value).forEach(key => allKeys.add(key))
      }
    }

    // For each key, determine the winner based on precedence
    for (const key of allKeys) {
      const explanationsForKey: Explanation[] = []

      for (const explained of explaineds) {
        const value = explained.value as any
        if (value && key in value) {
          const rootExplanations = explained.explain()
          
          if (rootExplanations.length > 0) {
            // Use the precedence from the root explanation
            const rootExp = rootExplanations[0]
            explanationsForKey.push({
              source: rootExp.source,
              value: value[key],
              reason: rootExp.reason,
              precedence: rootExp.precedence,
              location: rootExp.location,
              won: false, // Will be determined below
              timestamp: rootExp.timestamp,
            })
          }
        }
      }

      // Sort by precedence (highest first) and timestamp (earliest first for ties)
      explanationsForKey.sort((a, b) => {
        if (b.precedence !== a.precedence) {
          return b.precedence - a.precedence
        }
        return a.timestamp - b.timestamp
      })

      // Mark the winner
      if (explanationsForKey.length > 0) {
        explanationsForKey[0].won = true
        mergedValue[key] = explanationsForKey[0].value
        allExplanations.set(key, explanationsForKey)
      }
    }

    return new Explained(mergedValue as T, allExplanations)
  }
}

