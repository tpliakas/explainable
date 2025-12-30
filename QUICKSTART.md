# Quick Start Guide

Welcome to `explainable`! Here's everything you need to get started.

## Installation

```bash
npm install explainable
```

## Your First Explanation

```typescript
import { explainable } from 'explainable'

interface Config {
  port: number
  debug: boolean
}

const config = explainable<Config>()
  .defaults({ port: 8080, debug: false })
  .env({ port: 3000 })
  .build()

console.log(config.value.port) // 3000
console.log(config.explainText('port'))
// port = 3000
// Decision chain:
// 1. ✗ defaults → 8080 (Default configuration)
// 2. ✓ env → 3000 (Environment variables)
```

That's it! You now know WHY your port is 3000.

## Common Use Cases

### 1. Environment Variables

```typescript
import { explainEnv } from 'explainable'

const config = explainEnv({
  PORT: { type: 'number', default: 3000 },
  DEBUG: { type: 'boolean', default: false },
  API_KEY: { type: 'string', required: true }
})

// Type-safe access
const port: number = config.value.PORT
const debug: boolean = config.value.DEBUG

// Explain any field
console.log(config.explainText('PORT'))
```

### 2. Multiple Config Sources

```typescript
import { explainable } from 'explainable'
import fs from 'fs'

const config = explainable<AppConfig>()
  .defaults(defaultConfig)
  .file(JSON.parse(fs.readFileSync('config.json', 'utf-8')), 'config.json')
  .env(parseEnv(process.env))
  .cli(parseCLI(process.argv))
  .build()

// Higher precedence wins: CLI > env > file > defaults
```

### 3. Custom Sources

```typescript
const config = explainable<Config>()
  .from(remoteConfig, {
    name: 'remote',
    precedence: 15,
    reason: 'Remote config service',
    location: 'https://config.example.com'
  })
  .build()
```

## API Quick Reference

### `explainable<T>()`
Create a builder for type `T`

**Methods:**
- `.defaults(data, reason?)` - Add defaults (precedence: 0)
- `.file(data, path?, reason?)` - Add file config (precedence: 5)
- `.env(data, reason?)` - Add env config (precedence: 10)
- `.cli(data, reason?)` - Add CLI config (precedence: 20)
- `.from(data, source)` - Add custom source
- `.build()` - Build final `Explained<T>`

### `Explained<T>`
The result with explanations

**Properties:**
- `.value` - Final resolved value

**Methods:**
- `.explain(path?)` - Get explanation array
- `.explainText(path?)` - Get formatted text
- `.explainAll()` - Get all explanations
- `.toJSON()` - Serialize to JSON

### `explainEnv(schema, env?)`
Parse environment variables

**Schema fields:**
- `type` - 'string' | 'number' | 'boolean' | 'json'
- `default` - Default value
- `envVar` - Custom env var name
- `required` - Whether required

## Examples

Run the included examples:

```bash
npm run example:basic
npm run example:env
```

## Tips

1. **Use TypeScript** - You get full type inference
2. **Explain liberally** - Call `.explainText()` during debugging
3. **Export explanations** - Use `.toJSON()` for logging/auditing
4. **Custom precedence** - Use `.from()` for fine control

## Learn More

- [README.md](README.md) - Full documentation and API reference
- [examples/](examples/) - Working code examples
- [DIAGRAMS.md](DIAGRAMS.md) - Visual architecture guides
- [CONTRIBUTING.md](CONTRIBUTING.md) - Build adapters and contribute

## Common Patterns

### Pattern: Debug Mode

```typescript
const config = buildConfig()

if (process.env.DEBUG_CONFIG) {
  console.log('=== Config Explanations ===')
  for (const [key] of Object.entries(config.value)) {
    console.log(config.explainText(key))
    console.log()
  }
}
```

### Pattern: Config Validation

```typescript
const config = buildConfig()

// Check if a specific source was used
const portExplanations = config.explain('port')
const usedCLI = portExplanations.some(e => e.source === 'cli' && e.won)

if (usedCLI) {
  console.log('Using CLI-provided port')
}
```

### Pattern: Audit Trail

```typescript
const config = buildConfig()

// Log all decisions for audit
fs.writeFileSync(
  'config-audit.json',
  JSON.stringify(config.toJSON(), null, 2)
)
```

## Need Help?

- 📖 [Full Documentation](README.md)
- 💬 [Open an Issue](https://github.com/tpliakas/explainable/issues)
- 🤝 [Contributing Guide](CONTRIBUTING.md)

---

**Happy explaining!** 🎉

