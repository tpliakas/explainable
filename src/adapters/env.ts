import { Explained } from '../core/explained'

/**
 * Type of environment variable value
 */
export type EnvType = 'string' | 'number' | 'boolean' | 'json'

/**
 * Schema definition for a single environment variable
 */
export interface EnvSchemaField {
  /** The type to parse the value as */
  type: EnvType
  
  /** Default value if env var is not set */
  default?: any
  
  /** Custom environment variable name (if different from key) */
  envVar?: string
  
  /** Description of this field */
  description?: string
  
  /** Whether this field is required */
  required?: boolean
}

/**
 * Schema for environment variables
 */
export type EnvSchema = Record<string, EnvSchemaField>

/**
 * Result of parsing environment variables
 */
export interface EnvParseResult<T> {
  /** Successfully parsed values */
  parsed: Partial<T>
  
  /** Environment variables that were used */
  used: string[]
  
  /** Environment variables that were ignored */
  ignored: string[]
  
  /** Errors encountered during parsing */
  errors: Array<{ key: string; error: string }>
}

/**
 * Parse a string value according to the specified type
 */
function parseValue(value: string, type: EnvType): any {
  switch (type) {
    case 'string':
      return value
    
    case 'number': {
      const num = Number(value)
      if (isNaN(num)) {
        throw new Error(`Cannot parse "${value}" as number`)
      }
      return num
    }
    
    case 'boolean': {
      const lower = value.toLowerCase()
      if (lower === 'true' || lower === '1' || lower === 'yes') {
        return true
      }
      if (lower === 'false' || lower === '0' || lower === 'no' || lower === '') {
        return false
      }
      throw new Error(`Cannot parse "${value}" as boolean`)
    }
    
    case 'json': {
      try {
        return JSON.parse(value)
      } catch {
        throw new Error(`Cannot parse "${value}" as JSON`)
      }
    }
    
    default:
      return value
  }
}

/**
 * Parse environment variables according to a schema
 */
function parseEnv<T extends Record<string, any>>(
  env: Record<string, string | undefined>,
  schema: EnvSchema
): EnvParseResult<T> {
  const parsed: Partial<T> = {}
  const used: string[] = []
  const ignored: string[] = []
  const errors: Array<{ key: string; error: string }> = []

  for (const [key, field] of Object.entries(schema)) {
    const envVarName = field.envVar || key.toUpperCase()
    const envValue = env[envVarName]

    if (envValue !== undefined) {
      // Empty string is valid for booleans (parsed as false)
      const shouldParse = envValue !== '' || field.type === 'boolean'
      
      if (shouldParse) {
        try {
          parsed[key as keyof T] = parseValue(envValue, field.type)
          used.push(envVarName)
        } catch (error) {
          errors.push({
            key,
            error: error instanceof Error ? error.message : String(error),
          })
          
          // Use default if available
          if (field.default !== undefined) {
            parsed[key as keyof T] = field.default
          }
        }
      } else if (field.required) {
        errors.push({
          key,
          error: `Required environment variable ${envVarName} is not set`,
        })
      } else if (field.default !== undefined) {
        parsed[key as keyof T] = field.default
      }
    } else if (field.required) {
      errors.push({
        key,
        error: `Required environment variable ${envVarName} is not set`,
      })
    } else if (field.default !== undefined) {
      parsed[key as keyof T] = field.default
    }
  }

  // Find ignored env vars (those in env but not in schema)
  const schemaEnvVars = new Set(
    Object.entries(schema).map(([key, field]) => field.envVar || key.toUpperCase())
  )
  
  for (const envVar of Object.keys(env)) {
    if (!schemaEnvVars.has(envVar) && !used.includes(envVar)) {
      ignored.push(envVar)
    }
  }

  return { parsed, used, ignored, errors }
}

/**
 * Create an explainable configuration from environment variables.
 * This is the killer adapter that proves the ecosystem concept.
 * 
 * @param schema - Schema defining expected environment variables
 * @param env - Environment object (defaults to process.env)
 * @returns Explained configuration with full decision tracking
 * 
 * @example
 * ```ts
 * const config = explainEnv({
 *   PORT: { type: 'number', default: 3000 },
 *   HOST: { type: 'string', default: 'localhost' },
 *   DEBUG: { type: 'boolean', default: false }
 * })
 * 
 * console.log(config.value.PORT) // 8080 (from env)
 * console.log(config.explainText('PORT'))
 * // PORT = 8080
 * // Decision chain:
 * // 1. ✓ env → 8080 (PORT env var)
 * // 2. ✗ default → 3000 (lower precedence)
 * ```
 */
export function explainEnv<T extends Record<string, any>>(
  schema: EnvSchema,
  env: Record<string, string | undefined> = process.env
): Explained<T> {
  const result = parseEnv<T>(env, schema)
  
  // Create an Explained instance with detailed tracking
  const explained = new Explained<T>(result.parsed as T)

  // Add explanations for each field
  for (const [key, field] of Object.entries(schema)) {
    const envVarName = field.envVar || key.toUpperCase()
    const envValue = env[envVarName]
    const finalValue = result.parsed[key as keyof T]
    const hasEnvValue = envValue !== undefined && envValue !== ''

    // Add default explanation
    if (field.default !== undefined) {
      explained._addExplanation(key, {
        source: 'default',
        value: field.default,
        reason: `Default value for ${key}`,
        precedence: 0,
        won: !hasEnvValue,
        timestamp: Date.now(),
      })
    }

    // Add env explanation if present
    if (hasEnvValue) {
      const error = result.errors.find(e => e.key === key)
      
      if (error) {
        // Parse error - default won (if available)
        explained._addExplanation(key, {
          source: 'env',
          value: envValue,
          reason: `${envVarName} env var (parse error: ${error.error})`,
          precedence: 10,
          won: false,
          timestamp: Date.now(),
        })
      } else {
        // Successfully parsed
        explained._addExplanation(key, {
          source: 'env',
          value: finalValue,
          reason: `${envVarName} env var`,
          precedence: 10,
          won: true,
          timestamp: Date.now(),
        })
      }
    }
  }

  return explained
}

/**
 * Load and parse a .env file (simple implementation)
 * For production use, consider using a library like 'dotenv'
 */
export function loadEnvFile(_filePath: string): Record<string, string> {
  // This is a placeholder - in a real implementation, you'd read and parse the file
  // For now, we'll just return an empty object
  // Users can use 'dotenv' library and pass the result to explainEnv
  return {}
}

