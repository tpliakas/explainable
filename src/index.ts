// Core exports
export { Explained } from './core/explained'
export type {
  Explanation,
  ExplanationResult,
  Source,
  ExplainOptions,
} from './core/types'

// Config exports
export { ConfigResolver } from './config/resolver'
export { explainable } from './config/builder'
export type { ConfigBuilder } from './config/builder'

// Adapter exports
export { explainEnv } from './adapters/env'
export type { EnvSchema, EnvSchemaField } from './adapters/env'

export { explainTSConfig, explainCompilerOption } from './adapters/tsconfig'
export type { TSConfig, TSConfigOptions } from './adapters/tsconfig'

