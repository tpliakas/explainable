# Contributing to explainable

Thank you for your interest in contributing! This project is designed to grow into an ecosystem.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/tpliakas/explainable.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Run tests: `npm test`

## Development Workflow

```bash
# Watch mode for development
npm run dev

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Run examples
npm run example:basic
npm run example:env
```

## Project Structure

```
explainable/
├── src/
│   ├── core/           # Core Explained<T> abstraction
│   ├── config/         # Configuration resolution
│   ├── adapters/       # Adapters (env, etc.)
│   └── index.ts        # Main exports
├── examples/           # Working examples
└── dist/              # Build output
```

## What to Contribute

### High Priority

1. **New Adapters** - Extend the ecosystem
   - `@explainable/dotenv` - Deep .env file integration
   - `@explainable/tsconfig` - Explain TypeScript configuration
   - `@explainable/eslint` - Explain ESLint rule resolution
   - `@explainable/vite` - Explain Vite config

2. **CLI Tool** - Debug config from command line
   - `npx explainable config.json`
   - Interactive mode
   - JSON/text output

3. **Visual UI** - Decision graphs
   - Web-based visualization
   - Decision flowcharts
   - Interactive exploration

4. **IDE Extensions**
   - VSCode extension (explain on hover)
   - WebStorm plugin
   - Vim plugin

### Medium Priority

- Documentation improvements
- More examples
- Performance optimizations
- Better error messages

### Low Priority

- Logo design
- Website
- Blog posts

## Code Style

- TypeScript strict mode
- Meaningful variable names
- JSDoc comments for public APIs
- Tests for new features
- Keep it simple and elegant

## Testing

All new features should include tests:

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFeature', () => {
  it('should do something', () => {
    // Test here
  })
})
```

Run tests: `npm test`

## Pull Request Process

1. Fork and create a feature branch
2. Make your changes with tests
3. Ensure `npm test` and `npm run build` pass
4. Create PR with clear description

## Commit Messages

Use conventional commits:
- `feat: add tsconfig adapter`
- `fix: handle null values in merge`
- `docs: update README examples`
- `test: add tests for env parsing`

## Publishing

**Maintainers only:** Publishing is automated via GitHub Actions. See `.github/PUBLISH_INSTRUCTIONS.md`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

