import { explainEnv } from '../../src'

/**
 * Environment adapter example
 * Shows how to parse and explain environment variables with type safety
 */

// Define the schema for environment variables
const envSchema = {
  PORT: {
    type: 'number' as const,
    default: 3000,
    description: 'Server port',
  },
  HOST: {
    type: 'string' as const,
    default: 'localhost',
    description: 'Server host',
  },
  DEBUG: {
    type: 'boolean' as const,
    default: false,
    description: 'Enable debug mode',
  },
  NODE_ENV: {
    type: 'string' as const,
    default: 'development',
    description: 'Node environment',
  },
  MAX_CONNECTIONS: {
    type: 'number' as const,
    default: 100,
    description: 'Maximum concurrent connections',
  },
  DATABASE_CONFIG: {
    type: 'json' as const,
    default: { host: 'localhost', port: 5432 },
    description: 'Database configuration as JSON',
  },
}

// Simulate environment variables
const mockEnv = {
  PORT: '8080',
  DEBUG: 'true',
  NODE_ENV: 'production',
  // MAX_CONNECTIONS not set - will use default
  DATABASE_CONFIG: '{"host":"db.example.com","port":5432,"ssl":true}',
}

console.log('='.repeat(60))
console.log('ENVIRONMENT ADAPTER EXAMPLE')
console.log('='.repeat(60))
console.log()

// Parse environment variables with explanations
const config = explainEnv(envSchema, mockEnv)

console.log('Parsed Configuration:')
console.log(JSON.stringify(config.value, null, 2))
console.log()

// Explain each field
console.log('Detailed Explanations:')
console.log('='.repeat(60))
console.log()

console.log(config.explainText('PORT'))
console.log()

console.log(config.explainText('HOST'))
console.log()

console.log(config.explainText('DEBUG'))
console.log()

console.log(config.explainText('NODE_ENV'))
console.log()

console.log(config.explainText('MAX_CONNECTIONS'))
console.log()

console.log(config.explainText('DATABASE_CONFIG'))
console.log()

// Show decision summary
console.log('Decision Summary:')
console.log('-'.repeat(60))
const allExplanations = config.explainAll()
let fromEnv = 0
let fromDefault = 0

for (const explanations of Object.values(allExplanations)) {
  const winner = explanations.find(e => e.won)
  if (winner?.source === 'env') fromEnv++
  if (winner?.source === 'default') fromDefault++
}

console.log(`Values from environment: ${fromEnv}`)
console.log(`Values from defaults: ${fromDefault}`)
console.log()

// Example with parse errors
console.log('='.repeat(60))
console.log('ERROR HANDLING EXAMPLE')
console.log('='.repeat(60))
console.log()

const badEnv = {
  PORT: 'not-a-number',
  DEBUG: 'maybe',
  DATABASE_CONFIG: 'invalid-json',
}

const configWithErrors = explainEnv(envSchema, badEnv)

console.log('Configuration with parse errors:')
console.log(JSON.stringify(configWithErrors.value, null, 2))
console.log()

console.log('PORT explanation (parse error):')
console.log(configWithErrors.explainText('PORT'))
console.log()

console.log('DEBUG explanation (parse error):')
console.log(configWithErrors.explainText('DEBUG'))
console.log()

// Example with custom env var names
console.log('='.repeat(60))
console.log('CUSTOM ENV VAR NAMES')
console.log('='.repeat(60))
console.log()

const customSchema = {
  port: {
    type: 'number' as const,
    default: 3000,
    envVar: 'APP_PORT',
  },
  apiKey: {
    type: 'string' as const,
    default: 'dev-key',
    envVar: 'SECRET_API_KEY',
  },
}

const customEnv = {
  APP_PORT: '9000',
  SECRET_API_KEY: 'prod-key-12345',
}

const customConfig = explainEnv(customSchema, customEnv)

console.log('Custom env var mapping:')
console.log(JSON.stringify(customConfig.value, null, 2))
console.log()

console.log(customConfig.explainText('port'))
console.log()

console.log(customConfig.explainText('apiKey'))

