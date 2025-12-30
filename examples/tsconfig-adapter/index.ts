import { explainTSConfig, explainCompilerOption } from '../../src'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

/**
 * TSConfig adapter example
 * Shows how to explain TypeScript configuration with extends chains
 */

console.log('='.repeat(60))
console.log('TSCONFIG ADAPTER EXAMPLE')
console.log('='.repeat(60))
console.log()

// Create example tsconfig files for demonstration
const exampleDir = join(process.cwd(), 'examples/tsconfig-adapter')

try {
  mkdirSync(exampleDir, { recursive: true })
} catch {
  // Directory exists
}

// Create base config (like a shared config in a monorepo)
const baseConfig = {
  compilerOptions: {
    target: 'ES2018',
    module: 'commonjs',
    strict: false,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true
  }
}

writeFileSync(
  join(exampleDir, 'tsconfig.base.json'),
  JSON.stringify(baseConfig, null, 2)
)

// Create project config that extends the base
const projectConfig = {
  extends: './tsconfig.base.json',
  compilerOptions: {
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    outDir: './dist',
    rootDir: './src'
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist']
}

writeFileSync(
  join(exampleDir, 'tsconfig.example.json'),
  JSON.stringify(projectConfig, null, 2)
)

console.log('Created example tsconfig files:')
console.log('- tsconfig.base.json (base configuration)')
console.log('- tsconfig.example.json (extends base)')
console.log()

// Explain the full configuration
const config = explainTSConfig(join(exampleDir, 'tsconfig.example.json'))

console.log('Final Configuration:')
console.log(JSON.stringify(config.value, null, 2))
console.log()

// Explain specific compiler options
console.log('='.repeat(60))
console.log('DETAILED EXPLANATIONS')
console.log('='.repeat(60))
console.log()

console.log(config.explainText('compilerOptions.target'))
console.log()

console.log(config.explainText('compilerOptions.strict'))
console.log()

console.log(config.explainText('compilerOptions.module'))
console.log()

console.log(config.explainText('compilerOptions.esModuleInterop'))
console.log()

// Show helper function
console.log('='.repeat(60))
console.log('USING HELPER FUNCTION')
console.log('='.repeat(60))
console.log()

const targetExplanation = explainCompilerOption(
  join(exampleDir, 'tsconfig.example.json'),
  'target'
)
console.log('Helper function result:')
console.log(targetExplanation)
console.log()

// Show all explanations
console.log('='.repeat(60))
console.log('ALL COMPILER OPTIONS')
console.log('='.repeat(60))
console.log()

const allExplanations = config.explainAll()
const compilerOptionsExplanations = Object.keys(allExplanations)
  .filter(key => key.startsWith('compilerOptions.'))

console.log(`Found ${compilerOptionsExplanations.length} compiler options:`)
compilerOptionsExplanations.forEach(key => {
  const option = key.replace('compilerOptions.', '')
  const explanations = allExplanations[key]
  const winner = explanations.find(e => e.won)
  console.log(`  - ${option}: ${JSON.stringify(winner?.value)}`)
})
console.log()

// Show precedence
console.log('='.repeat(60))
console.log('PRECEDENCE VISUALIZATION')
console.log('='.repeat(60))
console.log()

const targetExplanations = config.explain('compilerOptions.target')
console.log('target option resolution:')
targetExplanations.forEach((exp, index) => {
  const status = exp.won ? '✓ WINNER' : '✗ LOST'
  const source = exp.source.includes('base') ? 'tsconfig.base.json' : 'tsconfig.example.json'
  console.log(`  ${index + 1}. ${status} | ${source} (precedence: ${exp.precedence}) → ${JSON.stringify(exp.value)}`)
})
console.log()

// JSON export
console.log('='.repeat(60))
console.log('JSON EXPORT (for logging/auditing)')
console.log('='.repeat(60))
console.log()

const jsonExport = config.toJSON()
console.log(JSON.stringify({
  value: jsonExport.value,
  metadata: jsonExport.metadata,
  sampleExplanation: jsonExport.explanations['compilerOptions.target']
}, null, 2))

