import { explainable } from '../../src'

/**
 * Basic configuration example
 * Shows how to merge multiple configuration sources with precedence
 */

interface AppConfig {
  port: number
  host: string
  debug: boolean
  database: {
    url: string
    poolSize: number
  }
}

// Simulate different configuration sources
const defaultConfig: Partial<AppConfig> = {
  port: 8080,
  host: 'localhost',
  debug: false,
  database: {
    url: 'localhost:5432',
    poolSize: 10,
  },
}

const fileConfig: Partial<AppConfig> = {
  port: 3000,
  database: {
    url: 'db.example.com:5432',
    poolSize: 20,
  },
}

const envConfig: Partial<AppConfig> = {
  port: 4000,
  debug: true,
}

const cliConfig: Partial<AppConfig> = {
  port: 5000,
}

// Build the configuration with explanations
const config = explainable<AppConfig>()
  .defaults(defaultConfig, 'Built-in defaults')
  .file(fileConfig, 'config.json', 'Configuration file')
  .env(envConfig, 'Environment variables')
  .cli(cliConfig, 'Command-line arguments')
  .build()

console.log('='.repeat(60))
console.log('BASIC CONFIGURATION EXAMPLE')
console.log('='.repeat(60))
console.log()

// Show the final configuration
console.log('Final Configuration:')
console.log(JSON.stringify(config.value, null, 2))
console.log()

// Explain specific fields
console.log('Why is port', config.value.port, '?')
console.log('-'.repeat(60))
console.log(config.explainText('port'))
console.log()

console.log('Why is debug', config.value.debug, '?')
console.log('-'.repeat(60))
console.log(config.explainText('debug'))
console.log()

console.log('Why is host', config.value.host, '?')
console.log('-'.repeat(60))
console.log(config.explainText('host'))
console.log()

// Show all explanations
console.log('All Explanations:')
console.log('-'.repeat(60))
const allExplanations = config.explainAll()
for (const [key, explanations] of Object.entries(allExplanations)) {
  console.log(`\n${key}:`)
  explanations.forEach((exp, i) => {
    const status = exp.won ? '✓ WINNER' : '✗ LOST'
    console.log(
      `  ${i + 1}. ${status} | ${exp.source} (precedence: ${exp.precedence}) → ${JSON.stringify(exp.value)}`
    )
  })
}
console.log()

// Export as JSON
console.log('JSON Export:')
console.log('-'.repeat(60))
console.log(JSON.stringify(config.toJSON(), null, 2))

