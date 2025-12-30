# explainable

> **Explain why your configuration behaves the way it does.**

[![npm version](https://img.shields.io/npm/v/explainable.svg)](https://www.npmjs.com/package/explainable)
[![CI](https://github.com/tpliakas/explainable/workflows/CI/badge.svg)](https://github.com/tpliakas/explainable/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is explainable?

`explainable` is a TypeScript-first NPM package that treats configuration values as **results of decisions** with a complete, traceable history. Instead of just showing you the final value, it shows you *why* it has that value — which source won, what lost, and the full decision chain.

**Perfect for:**
- 🔍 Debugging configuration mysteries
- 🎯 Understanding environment variable precedence
- 📝 Explaining TypeScript compiler options with extends chains
- 🧪 Testing configuration resolution
- 🚀 Works with Next.js, Vite, Node.js, Deno, and any TypeScript/JavaScript project

**Key features:**
- Zero runtime dependencies
- TypeScript-first with excellent type inference
- Fluent, intuitive API
- Built-in adapters (env, tsconfig)
- Framework agnostic
- < 10KB gzipped

---

Ever wonder **WHY** your port is 3000? Or why that environment variable was ignored? Or which config file won?

Most tools tell you **WHAT** the final value is. `explainable` tells you **WHY**.

## The Problem

```typescript
// Traditional config
const config = { port: 3000 }

// But WHY is it 3000?
// - Was it from defaults?
// - Did an env var override it?
// - Did a CLI flag get ignored?
// - Which source won?

// You have no idea. 🤷
```

## The Solution

```typescript
import { explainable } from 'explainable'

const config = explainable<AppConfig>()
  .defaults({ port: 8080 })
  .env({ port: 3000 })
  .cli({ port: 5000 })
  .build()

console.log(config.value.port) // 5000

// Now ask WHY
console.log(config.explainText('port'))
```

**Output:**
```
port = 5000

Decision chain:
1. ✗ defaults → 8080 (Built-in defaults)
2. ✗ env → 3000 (Environment variables)
3. ✓ cli → 5000 (Command-line arguments)
```

**Finally, you know WHY.** 🎉

## Features

- 🎯 **First-class explanations** - Every value knows its history
- 🔍 **Decision tracking** - See what won, what lost, and why
- 💪 **TypeScript-first** - Excellent type inference and safety
- 🪶 **Zero dependencies** - Pure TypeScript, no bloat
- 🚀 **Framework agnostic** - Works with Next.js, Vite, Node.js, Deno
- 📦 **Tiny bundle** - < 10KB gzipped
- 🔌 **Built-in adapters** - Env variables, TSConfig (more coming!)
- 🧩 **Extensible** - Build adapters for any config source

## How It Works

<div align="center">
  <img src="svg-images/Precedence Resolution.svg" alt="How Precedence Resolution Works"/>
</div>

**The Process:**
1. **Multiple sources** provide configuration values with different precedence levels
2. **Config Resolver** merges them, tracking every decision
3. **Explained Config** wraps the result with full decision history
4. You get both the **final value** and **why it has that value**

> 📊 See [DIAGRAMS.md](DIAGRAMS.md) for more detailed visual explanations

## Architecture

<div align="center">
  <img src="svg-images/Type System & Data Flow.svg" alt="Architecture and Type System"/>
</div>

## Installation

```bash
npm install explainable
```

```bash
yarn add explainable
```

```bash
pnpm add explainable
```

## Quick Start

### Basic Usage

```typescript
import { explainable } from 'explainable'

interface AppConfig {
  port: number
  host: string
  debug: boolean
}

const config = explainable<AppConfig>()
  .defaults({ port: 8080, host: 'localhost', debug: false })
  .env({ port: 3000, debug: true })
  .build()

// Get the final value
console.log(config.value)
// { port: 3000, host: 'localhost', debug: true }

// Explain any field
console.log(config.explainText('port'))
// port = 3000
// Decision chain:
// 1. ✗ defaults → 8080 (Default configuration)
// 2. ✓ env → 3000 (Environment variables)
```

### Environment Variables

```typescript
import { explainEnv } from 'explainable'

const config = explainEnv({
  PORT: { type: 'number', default: 3000 },
  HOST: { type: 'string', default: 'localhost' },
  DEBUG: { type: 'boolean', default: false },
  DATABASE_CONFIG: { type: 'json', default: {} }
})

// Type-safe, parsed, and explained
console.log(config.value.PORT) // number
console.log(config.explainText('PORT'))
// PORT = 8080
// Decision chain:
// 1. ✗ default → 3000 (Default value for PORT)
// 2. ✓ env → 8080 (PORT env var)
```

### TypeScript Configuration

```typescript
import { explainTSConfig } from 'explainable'

// Explain tsconfig.json with extends chains
const config = explainTSConfig('./tsconfig.json')

console.log(config.value.compilerOptions?.strict) // true
console.log(config.explainText('compilerOptions.strict'))
// compilerOptions.strict = true
// Decision chain:
// 1. ✗ tsconfig.base.json → false
// 2. ✓ tsconfig.json → true
```

## Adapters

### Built-in Adapters

`explainable` comes with powerful adapters out of the box:

- **`explainEnv`** - Environment variable parsing with type safety
- **`explainTSConfig`** - TypeScript configuration with extends resolution

## API

### `explainable<T>()`

Create a configuration builder with fluent API.

```typescript
const config = explainable<MyConfig>()
  .defaults(defaultConfig)      // Precedence: 0
  .file(fileConfig, 'path')     // Precedence: 5
  .env(envConfig)               // Precedence: 10
  .cli(cliConfig)               // Precedence: 20
  .build()
```

**Methods:**
- `.defaults(data, reason?)` - Add default configuration
- `.file(data, path?, reason?)` - Add file-based configuration
- `.env(data, reason?)` - Add environment configuration
- `.cli(data, reason?)` - Add CLI configuration
- `.from(data, source)` - Add custom source with precedence
- `.build()` - Build the final `Explained<T>` instance

### `Explained<T>`

The result of configuration resolution with full explanation support.

```typescript
const config: Explained<MyConfig> = builder.build()

// Access the final value
config.value // MyConfig

// Explain a specific field
config.explain('port') // Explanation[]

// Explain as formatted text
config.explainText('port') // string

// Get all explanations
config.explainAll() // Record<string, Explanation[]>

// Export as JSON
config.toJSON() // ExplanationResult<T>
```

### `explainEnv(schema, env?)`

Parse environment variables with type safety and explanations.

```typescript
const config = explainEnv({
  PORT: {
    type: 'number',           // 'string' | 'number' | 'boolean' | 'json'
    default: 3000,            // Default value
    envVar: 'CUSTOM_PORT',    // Custom env var name (optional)
    description: 'Server port', // Description (optional)
    required: false           // Whether required (optional)
  }
}, process.env)
```

**Supported types:**
- `string` - Raw string value
- `number` - Parsed as number
- `boolean` - Parsed as boolean (`true`, `false`, `1`, `0`, `yes`, `no`)
- `json` - Parsed as JSON

### `explainTSConfig(configPath?, options?)`

Parse and explain TypeScript configuration with extends chains.

```typescript
const config = explainTSConfig('./tsconfig.json', {
  baseDir: process.cwd(),    // Base directory for resolving paths
  followExtends: true        // Whether to follow extends (default: true)
})

// Access resolved config
config.value.compilerOptions?.target // "ES2020"

// Explain specific option
config.explainText('compilerOptions.target')

// Helper to explain single option
import { explainCompilerOption } from 'explainable'
explainCompilerOption('./tsconfig.json', 'strict')
```

**Features:**
- Resolves `extends` chains (including npm packages like `@tsconfig/node16`)
- Handles nested extends
- Tracks which config file set each option
- Removes JSON comments automatically

## Examples

### Complex Configuration

```typescript
interface DatabaseConfig {
  host: string
  port: number
  ssl: boolean
  poolSize: number
}

interface AppConfig {
  server: {
    port: number
    host: string
  }
  database: DatabaseConfig
  debug: boolean
}

const config = explainable<AppConfig>()
  .defaults({
    server: { port: 8080, host: 'localhost' },
    database: { host: 'localhost', port: 5432, ssl: false, poolSize: 10 },
    debug: false
  })
  .file(loadConfigFile('config.json'), 'config.json')
  .env(parseEnvVars(process.env))
  .cli(parseCLIArgs(process.argv))
  .build()

// Explain any nested field
console.log(config.explainText('server.port'))
console.log(config.explainText('database.ssl'))
```

### Custom Sources

```typescript
const config = explainable<Config>()
  .from(remoteConfig, {
    name: 'remote',
    precedence: 15,
    reason: 'Remote configuration service',
    location: 'https://config.example.com'
  })
  .from(secretsConfig, {
    name: 'secrets',
    precedence: 25,
    reason: 'Secrets manager',
    location: 'vault://secrets/app'
  })
  .build()
```

### Error Handling

```typescript
const config = explainEnv({
  PORT: { type: 'number', default: 3000 }
}, {
  PORT: 'not-a-number' // Invalid value
})

// Falls back to default
console.log(config.value.PORT) // 3000

// Explanation shows the error
console.log(config.explainText('PORT'))
// PORT = 3000
// Decision chain:
// 1. ✓ default → 3000 (Default value for PORT)
// 2. ✗ env → "not-a-number" (PORT env var - parse error: Cannot parse "not-a-number" as number)
```

## Why This Will Get Stars ⭐

1. **Solves a real pain point** - Debugging config is frustrating
2. **Novel approach** - First to do config explanation well
3. **Elegant API** - Fluent, type-safe, obvious
4. **Zero dependencies** - No bloat, just pure TypeScript
5. **Great DX** - Excellent TypeScript support and error messages

## Ecosystem Vision

`explainable` is designed to grow into an ecosystem:

**Phase 2:**
- `@explainable/dotenv` - Deep .env file integration
- `@explainable/cli` - CLI tool for config debugging
- `@explainable/vite` - Vite plugin for build-time explanations

**Phase 3:**
- `@explainable/tsconfig` - Explain TypeScript configuration
- `@explainable/eslint` - Explain ESLint rule resolution
- `@explainable/webpack` - Explain Webpack config merging

**Phase 4:**
- Visual explanation UI
- Decision graphs and flowcharts
- IDE integration (explain on hover)

## Use Cases

- **Debugging** - Understand why your config behaves unexpectedly
- **Onboarding** - Help new developers understand configuration precedence
- **Documentation** - Generate config documentation automatically
- **Auditing** - Track which sources are actually being used
- **Testing** - Verify configuration resolution logic

## TypeScript Support

Full TypeScript support with excellent type inference:

```typescript
interface Config {
  port: number
  host: string
}

const config = explainable<Config>()
  .defaults({ port: 8080, host: 'localhost' })
  .build()

// Full type safety
config.value.port // number
config.value.host // string
config.value.invalid // ❌ Type error

// Type-safe explanations
config.explain('port') // ✅
config.explain('invalid') // ❌ Type error (with PathKeys utility type)
```

## Performance

- **Minimal overhead** - Only tracks what you ask for
- **Lazy explanations** - Generated on-demand
- **Tree-shakeable** - Only bundle what you use
- **Zero runtime dependencies** - No external overhead

## Comparison

| Feature | explainable | dotenv | config | convict |
|---------|-------------|--------|--------|---------|
| Explanations | ✅ | ❌ | ❌ | ❌ |
| TypeScript-first | ✅ | ❌ | ❌ | ⚠️ |
| Zero dependencies | ✅ | ✅ | ❌ | ❌ |
| Precedence tracking | ✅ | ❌ | ⚠️ | ⚠️ |
| Decision history | ✅ | ❌ | ❌ | ❌ |
| Type parsing | ✅ | ❌ | ❌ | ✅ |

## Future Adapters

`explainable` is designed to grow into an ecosystem. Planned adapters include:

- `@explainable/dotenv` - Multi-file .env resolution
- `@explainable/vite` - Vite configuration
- `@explainable/webpack` - Webpack configuration
- `@explainable/next` - Next.js configuration
- `@explainable/eslint` - ESLint rule resolution
- `@explainable/prettier` - Prettier configuration
- `@explainable/babel` - Babel configuration
- `@explainable/jest` - Jest configuration

## Contributing

Contributions are welcome! `explainable` is designed to grow into a comprehensive ecosystem.

**Ways to contribute:**
- 🔌 Build new adapters (see [Roadmap](#roadmap--future-adapters) for ideas)
- 🐛 Report bugs and issues
- 📝 Improve documentation
- 💡 Suggest new features
- ⭐ Star the repo and spread the word

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT © [T. Pliakas](https://github.com/tpliakas)

## Star History

If this solves your config debugging pain, give it a star! ⭐

---

**Built with ❤️ for developers tired of config mysteries.**

