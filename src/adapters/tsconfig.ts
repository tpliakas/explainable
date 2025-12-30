import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { Explained } from '../core/explained'

/**
 * TypeScript configuration object structure
 */
export interface TSConfig {
  extends?: string | string[]
  compilerOptions?: Record<string, any>
  include?: string[]
  exclude?: string[]
  files?: string[]
  references?: Array<{ path: string }>
  [key: string]: any
}

/**
 * Options for TSConfig parsing
 */
export interface TSConfigOptions {
  /** Base directory for resolving relative paths */
  baseDir?: string
  
  /** Whether to follow extends (default: true) */
  followExtends?: boolean
}

/**
 * Result of TSConfig resolution
 */
export interface TSConfigResolution {
  /** Resolved configuration path */
  path: string
  
  /** Raw configuration object */
  config: TSConfig
  
  /** Precedence level */
  precedence: number
}

/**
 * Resolve a TSConfig file path
 */
function resolveTSConfigPath(configPath: string, baseDir: string): string {
  // Handle node_modules packages (e.g., "@tsconfig/node16")
  if (!configPath.startsWith('.') && !configPath.startsWith('/')) {
    try {
      // Try to resolve as a package
      return require.resolve(configPath, { paths: [baseDir] })
    } catch {
      // Try with /tsconfig.json suffix
      try {
        return require.resolve(`${configPath}/tsconfig.json`, { paths: [baseDir] })
      } catch {
        throw new Error(`Cannot resolve tsconfig package: ${configPath}`)
      }
    }
  }
  
  // Handle relative or absolute paths
  const fullPath = resolve(baseDir, configPath)
  
  // Try exact path
  if (existsSync(fullPath)) {
    return fullPath
  }
  
  // Try with .json extension
  if (existsSync(`${fullPath}.json`)) {
    return `${fullPath}.json`
  }
  
  throw new Error(`Cannot find tsconfig file: ${configPath}`)
}

/**
 * Load and parse a TSConfig file
 */
function loadTSConfig(configPath: string): TSConfig {
  try {
    const content = readFileSync(configPath, 'utf-8')
    
    // Remove comments line by line to avoid removing /** inside strings
    const lines = content.split('\n')
    const cleanedLines = lines.map(line => {
      // Remove single-line comments but preserve the line
      let cleaned = line.replace(/\/\/.*$/, '')
      // Don't remove /* if it's inside quotes (simple heuristic)
      const beforeComment = cleaned.split('/*')[0]
      const quoteCount = (beforeComment.match(/"/g) || []).length
      // Only remove /* comment if we're not inside a string (even number of quotes)
      if (quoteCount % 2 === 0) {
        cleaned = cleaned.replace(/\/\*.*?\*\//g, '')
      }
      return cleaned
    }).join('\n')
    
    return JSON.parse(cleanedLines)
  } catch (error) {
    throw new Error(`Failed to parse ${configPath}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Recursively resolve TSConfig with extends
 */
function resolveTSConfigChain(
  configPath: string,
  baseDir: string,
  precedence: number = 0,
  visited: Set<string> = new Set()
): TSConfigResolution[] {
  const fullPath = resolveTSConfigPath(configPath, baseDir)
  
  // Prevent circular references
  if (visited.has(fullPath)) {
    return []
  }
  visited.add(fullPath)
  
  const config = loadTSConfig(fullPath)
  const currentDir = dirname(fullPath)
  
  const chain: TSConfigResolution[] = []
  
  // Process extends first (lower precedence)
  if (config.extends) {
    const extendsArray = Array.isArray(config.extends) ? config.extends : [config.extends]
    
    extendsArray.forEach((extendPath, index) => {
      const extendedChain = resolveTSConfigChain(
        extendPath,
        currentDir,
        precedence - (extendsArray.length - index),
        visited
      )
      chain.push(...extendedChain)
    })
  }
  
  // Add current config (higher precedence)
  chain.push({
    path: fullPath,
    config,
    precedence,
  })
  
  return chain
}

/**
 * Flatten nested object for tracking
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {}
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey))
      } else {
        result[newKey] = obj[key]
      }
    }
  }
  
  return result
}

/**
 * Unflatten object from flat representation
 */
function unflattenObject(flat: Record<string, any>): any {
  const result: any = {}
  
  for (const key in flat) {
    const keys = key.split('.')
    let current = result
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = flat[key]
  }
  
  return result
}

/**
 * Merge TSConfig objects
 */
function mergeTSConfigs(chain: TSConfigResolution[]): Explained<TSConfig> {
  // Create a flat representation for tracking
  const flatExplained = chain.map(({ config, path, precedence }) => {
    // Remove extends from the config to avoid confusion
    const { extends: _, ...configWithoutExtends } = config
    
    // Flatten the config for proper tracking
    const flat = flattenObject(configWithoutExtends)
    
    return Explained.from(
      flat,
      path,
      `From ${path}`,
      precedence,
      path
    )
  })
  
  // Merge flat configs
  const mergedFlat = Explained.merge<Record<string, any>>(...flatExplained)
  
  // Unflatten the value
  const unflattened = unflattenObject(mergedFlat.value)
  
  // Create new Explained with unflattened value but keeping flat explanations
  const result = new Explained<TSConfig>(unflattened)
  
  // Copy over all explanations from the flat version
  for (const path of mergedFlat._getPaths()) {
    const explanations = mergedFlat.explain(path)
    if (explanations.length > 0) {
      result._setExplanations(path, explanations)
    }
  }
  
  return result
}

/**
 * Explain TypeScript configuration resolution.
 * Handles tsconfig.json with extends chains.
 * 
 * @param configPath - Path to tsconfig.json (default: './tsconfig.json')
 * @param options - Options for resolution
 * @returns Explained TSConfig with full decision tracking
 * 
 * @example
 * ```ts
 * const config = explainTSConfig('./tsconfig.json')
 * 
 * console.log(config.value.compilerOptions?.strict) // true
 * console.log(config.explainText('compilerOptions.strict'))
 * // compilerOptions.strict = true
 * // Decision chain:
 * // 1. ✗ tsconfig.base.json → false
 * // 2. ✓ tsconfig.json → true
 * ```
 */
export function explainTSConfig(
  configPath: string = './tsconfig.json',
  options: TSConfigOptions = {}
): Explained<TSConfig> {
  const {
    baseDir = process.cwd(),
    followExtends = true,
  } = options
  
  if (!followExtends) {
    // Simple case: just load the config without following extends
    const fullPath = resolveTSConfigPath(configPath, baseDir)
    const config = loadTSConfig(fullPath)
    
    return Explained.from(
      config,
      fullPath,
      `From ${fullPath}`,
      0,
      fullPath
    )
  }
  
  // Resolve the full chain
  const chain = resolveTSConfigChain(configPath, baseDir, 10)
  
  if (chain.length === 0) {
    throw new Error(`No tsconfig found at: ${configPath}`)
  }
  
  // Merge all configs
  return mergeTSConfigs(chain)
}

/**
 * Helper to explain a specific compiler option
 */
export function explainCompilerOption(
  configPath: string,
  option: string,
  options?: TSConfigOptions
): string {
  const config = explainTSConfig(configPath, options)
  return config.explainText(`compilerOptions.${option}`)
}

