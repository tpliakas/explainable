# Examples

This directory contains working examples demonstrating the capabilities of `explainable`.

## Running Examples

Make sure you've installed dependencies and built the project:

```bash
npm install
npm run build
```

Then run any example:

```bash
npm run example:basic
npm run example:env
```

## Available Examples

### Basic Configuration (`basic-config/`)

Demonstrates the core configuration merging functionality:
- Multiple configuration sources (defaults, file, env, CLI)
- Precedence resolution
- Detailed explanations for each field
- JSON export

**Run it:**
```bash
npm run example:basic
```

### Environment Adapter (`env-adapter/`)

Shows the environment variable parsing adapter:
- Type-safe parsing (string, number, boolean, JSON)
- Default values
- Custom environment variable names
- Error handling for invalid values
- Detailed explanations

**Run it:**
```bash
npm run example:env
```

## What You'll Learn

These examples demonstrate:

1. **Why values are what they are** - See the complete decision chain
2. **Precedence resolution** - Understand which source wins and why
3. **Type safety** - TypeScript inference throughout
4. **Error handling** - Graceful fallbacks when parsing fails
5. **Flexibility** - Multiple ways to configure your application

## Next Steps

- See the main [README](../README.md) for full API documentation
- Check [test files](../src/) for more usage patterns
- Explore [DIAGRAMS.md](../DIAGRAMS.md) for visual explanations

